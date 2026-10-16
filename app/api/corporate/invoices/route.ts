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
  draft: z.boolean().default(false),
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

  /* A draft is a working document — ops can see the layout and the arithmetic
     before the registered entity details are settled. Anything that goes to a
     client has to be filed, so it needs them. */
  if (!parsed.data.draft && missing.length > 0) {
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
    draft: parsed.data.draft,
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

  /* A draft never leaves the building. Emailing one would put an unfiled
     document in a client's inbox with a DRAFT number on it. */
  if (parsed.data.draft) {
    return NextResponse.json({ invoice: result.invoice, draft: true, emailed: false }, { status: 201 });
  }

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
         <p><a href="${site}/corporate/portal/invoices/${result.invoice.invoice_slug}">
           View and download the invoice →
         </a></p>
       </div>`,
      `Invoice ${result.invoice.invoice_number} from ${config.name}\n` +
        `KES ${Number(result.invoice.total_amount).toLocaleString("en-KE")}\n` +
        `${site}/corporate/portal/invoices/${result.invoice.invoice_slug}`
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
const creditNoteSchema = z.object({
  invoice_id: z.string().uuid(),
  reason: z.enum([
    "duplicate",
    "incorrect_amount",
    "goods_returned",
    "service_not_delivered",
    "other",
  ]),
  reason_note: z.string().max(500).optional(),
  /** Omit to credit the full remaining amount — the common case. */
  amount: z.number().positive().optional(),
  line_refs: z.array(z.number().int()).optional(),
});

const voidSchema = z.object({
  invoice_id: z.string().uuid(),
  reason: z.string().min(3).max(200),
  note: z.string().max(500).optional(),
});

/**
 * Withdraw an invoice, or credit it back.
 *
 * Voiding is for an invoice that has not been paid — it keeps its number and
 * records why. A paid invoice cannot be voided; it needs a credit note and a
 * refund, because retracting the charge while the money sits in the account
 * leaves the client owed nothing and us holding cash they never asked to pay.
 */
export async function PUT(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = voidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "A reason is required to void an invoice" },
      { status: 400 }
    );
  }

  const { voidInvoice } = await import("@/lib/invoicing");
  const result = await voidInvoice({
    invoiceId: parsed.data.invoice_id,
    reason: parsed.data.reason,
    note: parsed.data.note,
    actor: "ops",
  });

  if (!result.ok) {
    const errors: Record<string, string> = {
      not_found: "No such invoice",
      already_void: "This invoice has already been voided",
      is_paid: "This invoice is paid. Raise a credit note instead of voiding it.",
      already_credited: "A credit note has already been raised against this invoice",
      no_reason: "A reason is required to void an invoice",
    };
    return NextResponse.json({ error: errors[result.code] }, { status: 409 });
  }

  return NextResponse.json({ invoice: result.invoice, voided: true });
}

export async function PATCH(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = creditNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid credit note" },
      { status: 400 }
    );
  }

  const { issueCreditNote, recordInvoiceEvent } = await import("@/lib/invoicing");
  const result = await issueCreditNote({
    invoiceId: parsed.data.invoice_id,
    reason: parsed.data.reason,
    reasonNote: parsed.data.reason_note,
    amount: parsed.data.amount,
    lineRefs: parsed.data.line_refs,
    actor: "ops",
  });

  if (!result.ok) {
    const errors: Record<string, string> = {
      not_found: "No such invoice",
      no_lines: "That invoice has no line items to credit",
      amount_exceeds_invoice: "That is more than the invoice has left to credit",
      already_fully_credited: "This invoice has already been credited in full",
      bad_reason: "Choose a reason for the credit note",
    };
    return NextResponse.json({ error: errors[result.code] }, { status: 409 });
  }

  await auditPortal({
    req,
    action: "invoices.credit",
    corporateAccountId: (result.creditNote as { corporate_account_id?: string }).corporate_account_id ?? null,
    resource: "corporate_credit_notes",
    resourceRef: String((result.creditNote as { credit_note_number?: string }).credit_note_number ?? ""),
  });
  void recordInvoiceEvent;

  return NextResponse.json({ creditNote: result.creditNote }, { status: 201 });
}
