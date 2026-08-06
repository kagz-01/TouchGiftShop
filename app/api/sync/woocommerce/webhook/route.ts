import { NextResponse } from "next/server";
import crypto from "crypto";
import { syncProductToSupabase } from "@/lib/sync-product";
import { fetchWcProduct } from "@/lib/woocommerce";

export async function POST(req: Request) {
  try {
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

    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ ok: true, skipped: "invalid JSON" });
    }

    if (!payload.id) {
      return NextResponse.json({ ok: true, skipped: "no product id" });
    }

    const wcProduct = await fetchWcProduct(payload.id as number);
    await syncProductToSupabase(wcProduct);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
