import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendEmail } from "@/lib/notifications";
import { resolveCorporateAccount, assignQuoteReference } from "@/lib/corporate-accounts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const quoteSchema = z.object({
  productId:   z.string().min(1),
  productName: z.string().min(1),
  qty:         z.number().int().min(1),
  company:     z.string().min(1, "Company name required"),
  email:       z.string().email("Valid email required"),
  phone:       z.string().optional(),
  category:    z.string().optional(),
  notes:       z.string().optional(),
  unitPrice:   z.number().min(0),
  total:       z.number().min(0),
  designPreviewUrl: z.string().optional(),
  designPayload:    z.record(z.unknown()).optional(),
  moqTier:     z.string().optional(),
});

/* Roadmap §3 Phase 1.2 — tell ops a quote landed. This previously fired a
   fetch to /api/notify, which does not exist anywhere in the repo, wrapped in
   try/catch and .catch(() => {}) — so it had never once delivered a
   notification. It also built a URL-encoded message and then decoded it again
   before sending. */

/**
 * Codes that mean "a column I asked for does not exist", not "the write was
 * rejected for a business reason". Only these trigger the core-column retry.
 *
 * PGRST204 is PostgREST's schema-cache miss and is what you actually get
 * through the Supabase client. 42703 is Postgres' own undefined_column and
 * shows up on direct connections. Checking only one is how this fallback
 * shipped broken the first time — the dev server goes through PostgREST, so
 * only PGRST204 ever appears.
 */
const MISSING_COLUMN_CODES = new Set(["42703", "PGRST204"]);

async function notifyOps(args: {
  productName: string;
  qty: number;
  company: string;
  email: string;
  phone?: string;
  total: number;
  notes?: string;
  dashboardUrl: string;
  reference?: string | null;
}) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) {
    // No ops inbox configured — expected in local dev, not an error.
    console.warn("[quote-request] NOTIFY_EMAIL not set; ops not notified");
    return;
  }

  const rows = [
    ["Product", args.productName],
    ["Quantity", `${args.qty} units`],
    ["Company", args.company],
    ["Email", args.email],
    ["Phone", args.phone ?? "—"],
    ["Estimate", `KES ${args.total.toLocaleString("en-KE")}`],
    ["Reference", args.reference ?? "—"],
    ["Notes", args.notes || "—"],
  ];

  const result = await sendEmail(
    to,
    `New corporate quote — ${args.company} (${args.qty} × ${args.productName})`,
    `<div style="font-family:system-ui,sans-serif">
       <h2>New quote request</h2>
       <table cellpadding="6" style="border-collapse:collapse">
         ${rows
           .map(
             ([k, v]) =>
               `<tr><td style="color:#666">${k}</td><td><strong>${v}</strong></td></tr>`
           )
           .join("")}
       </table>
       <p><a href="${args.dashboardUrl}">Open in Ops Dashboard →</a></p>
     </div>`,
    rows.map(([k, v]) => `${k}: ${v}`).join("\n")
  );

  if (!result.success) {
    console.warn("[quote-request] ops email not sent:", result.reason);
  }
}

/**
 * The client-side confirmation. Sent with the reference because a buyer needs
 * something to quote back before they have any way to track a request — and a
 * request they cannot name is a request they have to phone about.
 */
async function notifyClient(args: {
  to: string;
  company: string;
  productName: string;
  qty: number;
  total: number;
  reference: string;
  portalUrl: string;
}) {
  if (!process.env.NOTIFY_EMAIL) return; // no mail transport configured locally

  const result = await sendEmail(
    args.to,
    `We have your quote request ${args.reference}`,
    `<div style="font-family:system-ui,sans-serif;color:#1A000A;max-width:560px">
       <p style="font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#9B1B5A">Quote request received</p>
       <h1 style="font-size:22px;margin:8px 0 16px">${args.reference}</h1>
       <p>Hello,</p>
       <p>Thank you for your interest in TouchGift. Your request is with our team and
          someone will come back to you with pricing shortly.</p>
       <table cellpadding="6" style="border-collapse:collapse;margin:16px 0">
         <tr><td style="color:#6D5B64">Item</td><td><strong>${args.productName}</strong></td></tr>
         <tr><td style="color:#6D5B64">Quantity</td><td>${args.qty} units</td></tr>
         <tr><td style="color:#6D5B64">Indicative total</td><td>KES ${args.total.toLocaleString("en-KE")}</td></tr>
       </table>
       <p style="color:#6D5B64;font-size:13px">
         Quote your reference when you speak to us. If your company already has a
         TouchGift account, <a href="${args.portalUrl}">sign in to the client portal</a>
         to follow this and every other request in one place.
       </p>
     </div>`,
    `Quote ${args.reference} — ${args.productName} × ${args.qty} for ${args.company}
` +
      `Indicative total KES ${args.total.toLocaleString("en-KE")}
` +
      `Track it at ${args.portalUrl}`
  );

  if (!result.success) {
    console.warn("[quote-request] client email not sent:", result.reason);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = quoteSchema.parse(body);

    /* Core columns — present since the table was created. This is the lead,
       and it must never be lost. */
    const core = {
      product_id:     data.productId,
      product_name:   data.productName,
      quantity:       data.qty,
      company_name:   data.company,
      email:          data.email,
      notes:          data.notes ?? null,
      unit_price:     data.unitPrice,
      total_estimate: data.total,
      status:         "pending",
    };

    /* Phase 1 enrichment — added by
       supabase/migrations/corporate_quote_requests_phase1.sql. */
    const enriched = {
      ...core,
      phone:              data.phone ?? null,
      category:           data.category ?? null,
      moq_tier:           data.moqTier ?? null,
      design_preview_url: data.designPreviewUrl ?? null,
      design_payload:     data.designPayload ?? null,
    };

    /* Two-phase insert.
     *
     * This route was reading and writing columns that only exist once that
     * migration has been applied. Until it is, every single insert fails with
     * Postgres 42703 (undefined_column) — which means the very first real
     * corporate enquiry is silently unsaveable. That is a production outage
     * caused by a schema/code mismatch, so we degrade instead: capture the
     * lead on the core columns, then re-try the enrichment separately. Ops
     * never loses a company over a missing optional field.
     */
    let insertedId: string | null = null;
    let enrichmentPending = false;

    const full = await supabase
      .from("corporate_quote_requests")
      .insert(enriched)
      .select("id")
      .single();

    if (!full.error) {
      insertedId = (full.data as { id?: string } | null)?.id ?? null;
    } else if (MISSING_COLUMN_CODES.has(full.error.code ?? "")) {
      /* Two different codes for the same fault depending on which layer
         rejects the write:
           42703   — undefined_column, when the statement reaches Postgres
           PGRST204 — "Could not find the 'x' column ... in the schema cache",
                      raised by PostgREST before it ever gets there.
         Checking only one of them is how this fallback shipped broken: the
         dev server runs through PostgREST, so only PGRST204 ever appears. */
      console.error(
        "[quote-request] Phase 1 migration not applied — falling back to core columns:",
        full.error.message
      );
      enrichmentPending = true;
      const fallback = await supabase
        .from("corporate_quote_requests")
        .insert(core)
        .select("id")
        .single();
      if (fallback.error) {
        console.error("[quote-request] insert failed:", fallback.error.message, fallback.error.code);
        return NextResponse.json(
          { error: "Could not save your quote. Please try again, or email us directly." },
          { status: 500 }
        );
      }
      insertedId = (fallback.data as { id?: string } | null)?.id ?? null;
    } else {
      console.error("[quote-request] insert failed:", full.error.message, full.error.code);
      /* Dev only: surface the PostgREST code so a schema mismatch is
         diagnosable from the response instead of a log nobody can reach in
         a container. Never rendered in production. */
      const detail =
        process.env.NODE_ENV !== "production"
          ? { debug: { code: full.error.code, message: full.error.message, hint: full.error.hint } }
          : {};
      return NextResponse.json(
        {
          error: "Could not save your quote. Please try again, or email us directly.",
          ...detail,
        },
        { status: 500 }
      );
    }

    /* File the quote against a company and give it a reference the client can
       read back. Both are best-effort: the lead is already saved, and neither
       grants anyone access — access is a membership, issued by ops. */
    let reference: string | null = null;
    let accountCreated = false;

    if (insertedId) {
      const account = await resolveCorporateAccount({
        company: data.company,
        email: data.email,
        phone: data.phone ?? null,
      }).catch((e) => {
        console.error("[quote-request] account resolution failed:", e);
        return null;
      });

      if (account?.id) {
        accountCreated = account.created;
        await supabase
          .from("corporate_quote_requests")
          .update({ corporate_account_id: account.id })
          .eq("id", insertedId);
      }

      reference = await assignQuoteReference(insertedId).catch((e) => {
        console.error("[quote-request] reference assignment failed:", e);
        return null;
      });
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const dashboardUrl = `${site}/corporate/dashboard`;

    // Best-effort. The quote is safely in the DB by this point, so a mail
    // failure must not turn a successful submission into an error for the user.
    void notifyOps({
      productName: data.productName,
      qty: data.qty,
      company: data.company,
      email: data.email,
      phone: data.phone,
      total: data.total,
      notes: data.notes,
      dashboardUrl,
      reference,
    }).catch((e) => console.error("[quote-request] notify failed:", e));

    /* Tell the client their reference. They have to be able to name the quote
       before they have an account to log into, which is most of the time. */
    if (reference) {
      void notifyClient({
        to: data.email,
        company: data.company,
        productName: data.productName,
        qty: data.qty,
        total: data.total,
        reference,
        portalUrl: `${site}/corporate/portal`,
      }).catch((e) => console.error("[quote-request] client email failed:", e));
    }

    return NextResponse.json({
      success: true,
      id: insertedId,
      reference,
      accountCreated,
      enrichmentPending,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("quote-request:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
