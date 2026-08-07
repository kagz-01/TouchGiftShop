import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/webhooks/reviews
 *
 * Called by Supabase database webhook when a review is inserted.
 * Use this to trigger notifications (email, WhatsApp, admin alerts).
 *
 * Setup in Supabase Dashboard → Database → Webhooks:
 *   Table: reviews
 *   Events: INSERT
 *   URL: https://your-site.com/api/webhooks/reviews
 *   Secret: (set SUPABASE_WEBHOOK_SECRET in .env.local)
 */

const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  // Verify webhook secret
  const authHeader = req.headers.get("authorization");
  if (WEBHOOK_SECRET && authHeader !== `Bearer ${WEBHOOK_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Supabase webhook sends the record in body.record
  const review = body.record;
  if (!review) {
    return NextResponse.json({ ok: true });
  }

  console.log(`[Webhook] New review: ${review.id} — ${review.rating}★ by ${review.reviewer_name}`);

  // Fetch the product name for notifications
  let productName = "a product";
  if (review.product_id) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("name")
      .eq("id", review.product_id)
      .single();
    if (product) productName = product.name;
  }

  // ──────────────────────────────────────────────
  // TODO: Add your notification logic here
  // ──────────────────────────────────────────────
  // Examples:
  //
  // 1. Email notification to admin:
  //    await sendEmail({ to: "admin@touchgift.co.ke", subject: `New ${review.rating}★ review for ${productName}`, ... })
  //
  // 2. WhatsApp notification via Twilio/Pesasoft:
  //    await sendWhatsApp({ to: "+254700000000", message: `New review: ${review.rating}★ for ${productName}` })
  //
  // 3. Slack/Discord alert:
  //    await fetch(SLACK_WEBHOOK_URL, { method: "POST", body: JSON.stringify({ text: `New review: ${review.rating}★` }) })
  //
  // 4. If verified purchase, send thank-you to reviewer:
  //    if (review.is_verified_purchase) { ... }

  return NextResponse.json({
    ok: true,
    reviewId: review.id,
    rating: review.rating,
    productName,
  });
}
