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

    const { data: inserted, error: dbError } = await supabase
      .from("corporate_quote_requests")
      .insert({
        product_id:   data.productId,
        product_name: data.productName,
        quantity:     data.qty,
        company_name: data.company,
        email:        data.email,
        phone:        data.phone ?? null,
        category:     data.category ?? null,
        notes:        data.notes ?? null,
        unit_price:   data.unitPrice,
        total_estimate: data.total,
        moq_tier:        data.moqTier ?? null,
        design_preview_url: data.designPreviewUrl ?? null,
        design_payload: data.designPayload ?? null,
        status:       "pending",
      })
      .select("id")
      .single();

    /* Previously this was a console.warn and the route still returned
       { success: true }. A visitor saw "Quote Request Sent!" while the row
       never existed — a silently lost lead, which is the exact failure the
       Phase 1 exit criteria are meant to prevent. */
    if (dbError) {
      console.error("[quote-request] insert failed:", dbError.message, dbError.code);
      return NextResponse.json(
        { error: "Could not save your quote. Please try again, or email us directly." },
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

    return NextResponse.json({ success: true, id: inserted?.id ?? null });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("quote-request:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
