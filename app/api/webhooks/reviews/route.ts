import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/webhooks/reviews
 *
 * Called by Supabase database webhook when a review is inserted.
 * Logs structured review data for admin monitoring.
 *
 * Setup in Supabase Dashboard → Database → Webhooks:
 *   Table: reviews
 *   Events: INSERT
 *   URL: https://your-site.com/api/webhooks/reviews
 *   Secret: (set SUPABASE_WEBHOOK_SECRET in .env.local)
 *
 * To add email/WhatsApp notifications:
 *   - Install a transactional email service (e.g. Resend, SendGrid)
 *   - Add notification logic below the logging section
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

  // Fetch the product name for context
  let productName = "Unknown product";
  if (review.product_id) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("name")
      .eq("id", review.product_id)
      .single();
    if (product) productName = product.name;
  }

  // Structured log for admin monitoring
  console.log(JSON.stringify({
    event: "new_review",
    reviewId: review.id,
    rating: review.rating,
    reviewer: review.reviewer_name,
    product: productName,
    verified: review.is_verified_purchase,
    hasMedia: (review.media_urls?.length ?? 0) > 0,
    timestamp: new Date().toISOString(),
  }));

  return NextResponse.json({
    ok: true,
    reviewId: review.id,
    rating: review.rating,
    productName,
  });
}
