import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

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
  notes:       z.string().optional(),
  unitPrice:   z.number().min(0),
  total:       z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = quoteSchema.parse(body);

    // Save to Supabase
    const { error: dbError } = await supabase
      .from("corporate_quote_requests")
      .insert({
        product_id:   data.productId,
        product_name: data.productName,
        quantity:     data.qty,
        company_name: data.company,
        email:        data.email,
        notes:        data.notes ?? null,
        unit_price:   data.unitPrice,
        total_estimate: data.total,
        status:       "pending",
      });

    // Non-fatal if table doesn't exist yet — still send notification
    if (dbError) console.warn("Quote DB insert:", dbError.message);

    // WhatsApp / email notification (best-effort via existing endpoint)
    try {
      const waMsg = encodeURIComponent(
        `🏢 *New Quote Request*\n` +
        `Product: ${data.productName}\n` +
        `Qty: ${data.qty} units\n` +
        `Company: ${data.company}\n` +
        `Email: ${data.email}\n` +
        `Est. Total: KES ${data.total.toLocaleString()}\n` +
        (data.notes ? `Notes: ${data.notes}` : "")
      );
      // Fire-and-forget to internal notify endpoint if present
      fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "whatsapp", message: decodeURIComponent(waMsg) }),
      }).catch(() => {});
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("quote-request:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
