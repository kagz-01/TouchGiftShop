import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendEmail } from "@/lib/notifications";

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
    }).catch((e) => console.error("[quote-request] notify failed:", e));

    return NextResponse.json({ success: true, id: insertedId, enrichmentPending });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("quote-request:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
