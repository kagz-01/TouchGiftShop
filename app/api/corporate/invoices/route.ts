import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { guard } from "@/lib/portal-guard";
import { issueInvoiceForOrder, sellerReadiness } from "@/lib/invoicing";
import { sendEmail } from "@/lib/notifications";
import { auditPortal } from "@/lib/portal-audit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const issueSchema = z.object({
  payment_terms_days: z.number().int().min(0).max(180).optional(),
  buyer_override: z
    .object({
      name: z.string().max(200).optional(),
      taxId: z.string().max(50).optional(),
      address: z.string().max(500).optional(),
      email: z.string().email().optional(),
    })
    .optional(),
  psp_reference: z.string().max(100).nullish(),
  mark_paid: z.boolean().default(false),
  email_to: z.string().email().optional(),
});

/**
 * GET /api/corporate/invoices?order_id=… — ops view of what has been issued.
 * POST                            — issue one.
 *
 * Issuing is staff-only and deliberately awkward: the seller details have to be
 * configured first. An invoice carrying the wrong registered entity name, or a
 * VAT line for a business that is not registered for VAT, is worse than no
 * invoice — the client's finance team files it, and then we have a tax document
 * we cannot stand behind.
 */
export async function GET(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const orderId = req.nextUrl.searchParams.get("order_id");

  let query = supabase
    .from("corporate_invoices")
    .select("*, corporate_invoice_lines(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (orderId) query = query.eq("corporate_order_id", orderId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ invoices: data ?? [], seller: sellerReadiness() });
}

export async function POST(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const orderId = typeof body.order_id === "string" ? body.order_id : "";
  if (!orderId) {
    return NextResponse.json({ error: "order_id is required" }, { status: 400 });
  }

  const parsed = issueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { missing, config } = sellerReadiness();

  /* Drafts are fine without a PIN — they are a working document. Anything that
     goes out to a client has to be filed, so it needs the registered entity. */
  const wantsIssued = true;
  if (wantsIssued && missing.length > 0) {
    return NextResponse.json(
      {
        error: `Invoice cannot be issued until these are set: ${missing.join(", ")}`,
        missing,
        hint: "These are the registered entity details on a tax document — the trading brand on the website is not enough.",
      },
      { status: 409 }
    );
  }

  const result = await issueInvoiceForOrder(orderId, {
    paymentTermsDays: parsed.data.payment_terms_days,
    buyerOverride: parsed.data.buyer_override,
    pspReference: parsed.data.psp_reference ?? null,
    markPaid: parsed.data.mark_paid,
  });

  if (!result.ok) {
    const status =
      result.code === "already_issued" ? 409 : result.code === "not_found" ? 404 : 503;
    return NextResponse.json(
      {
        error:
          result.code === "already_issued"
            ? `This order already has invoice ${result.invoice.invoice_number}. Void it first if it needs replacing.`
            : result.code === "untenanted"
            ? "This order is not linked to a company account yet, so there is nobody to invoice."
            : result.code === "numbering_unavailable"
            ? "Invoice numbering is unavailable right now."
            : "Order not found.",
        code: result.code,
      },
      { status }
    );
  }

  await auditPortal({
    req,
    action: "invoices.issue",
    corporateAccountId: result.invoice.corporate_account_id,
    resource: "corporate_invoices",
    resourceRef: result.invoice.invoice_number,
  });

  /* Email is best-effort: the document exists whether or not the mail sends,
     and the portal is the record of truth. */
  const to = parsed.data.email_to ?? result.invoice.buyer_email;
  let emailed = false;
  if (to && process.env.NOTIFY_EMAIL) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const emailed$ = await sendEmail(
      to,
      `Invoice ${result.invoice.invoice_number} — ${result.invoice.buyer_name}`,
      `<div style="font-family:system-ui,sans-serif;color:#1A000A">
         <p>Your invoice <strong>${result.invoice.invoice_number}</strong> is ready.</p>
         <p>Total due: <strong>KES ${Number(result.invoice.total_amount).toLocaleString("en-KE")}</strong>${
           result.invoice.due_at
             ? `, due ${new Date(result.invoice.due_at).toLocaleDateString("en-GB")}`
             : ""
         }</p>
         <p><a href="${site}/corporate/portal/invoices/${encodeURIComponent(result.invoice.invoice_number)}">
           View and download the invoice →
         </a></p>
       </div>`,
      `Invoice ${result.invoice.invoice_number} from ${config.name}\n` +
        `KES ${Number(result.invoice.total_amount).toLocaleString("en-KE")}\n` +
        `${site}/corporate/portal/invoices/${result.invoice.invoice_number}`
    );
    emailed = emailed$.success;
    if (emailed) {
      await supabase
        .from("corporate_invoices")
        .update({ sent_at: new Date().toISOString(), sent_to: to })
        .eq("id", result.invoice.id);
    } else {
      console.warn("[invoices] email not sent:", emailed$.reason);
    }
  }

  return NextResponse.json({ invoice: result.invoice, emailed, emailedTo: emailed ? to : null }, { status: 201 });
}