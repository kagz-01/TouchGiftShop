import { NextResponse } from "next/server";
import crypto from "crypto";
import { syncProductToSupabase } from "@/lib/sync-product";
import { fetchWcProduct } from "@/lib/woocommerce";

/**
 * WooCommerce webhook target — set this up in wp-admin under
 * WooCommerce > Settings > Advanced > Webhooks:
 *   Topic: Product created / Product updated
 *   Delivery URL: https://touchgift.co.ke/api/sync/woocommerce/webhook
 *   Secret: same value as WOOCOMMERCE_WEBHOOK_SECRET
 *
 * WooCommerce signs the payload with the secret; we verify it before
 * trusting anything in the body. This means staff editing a product in
 * wp-admin shows up on the live TouchGift site within seconds, with no
 * manual re-sync needed.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-wc-webhook-signature") ?? "";

  const webhookSecret = process.env.WOOCOMMERCE_WEBHOOK_SECRET;
  if (webhookSecret && webhookSecret !== "your-webhook-secret") {
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("base64");

    if (signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const payload = JSON.parse(rawBody);

  if (!payload.id) {
    return NextResponse.json({ ok: true, skipped: "no product id" });
  }

  try {
    // Re-fetch by ID to get the full product with categories
    const wcProduct = await fetchWcProduct(payload.id);
    await syncProductToSupabase(wcProduct);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook sync error:", err);
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
      wcUrl: process.env.WOOCOMMERCE_URL,
      hasKey: !!process.env.WOOCOMMERCE_CONSUMER_KEY,
    });
  }
}
