import { NextResponse } from "next/server";
import crypto from "crypto";
import { processSuccessfulPayment, processFailedPayment } from "@/lib/payment-settlement";

/**
 * POST /api/payment/webhook
 *
 * Official webhook endpoint for Paystack event notifications.
 * Configured in Paystack Dashboard: Settings -> API Keys & Webhooks -> Webhook URL
 *
 * Paystack signs all webhook payloads with HMAC-SHA512 using your Secret Key.
 */
export async function POST(req: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("[paystack-webhook] PAYSTACK_SECRET_KEY is not configured.");
    return NextResponse.json({ error: "Gateway not configured" }, { status: 500 });
  }

  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    console.warn("[paystack-webhook] Missing x-paystack-signature header");
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err) {
    console.error("[paystack-webhook] Failed to read raw body:", err);
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Cryptographically verify HMAC-SHA512 signature
  const calculatedSignature = crypto
    .createHmac("sha512", secretKey)
    .update(rawBody)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature, "utf8");
  const calculatedBuffer = Buffer.from(calculatedSignature, "utf8");

  if (
    signatureBuffer.length !== calculatedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, calculatedBuffer)
  ) {
    console.warn("[paystack-webhook] Invalid signature verification failed.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let eventPayload: any;
  try {
    eventPayload = JSON.parse(rawBody);
  } catch (err) {
    console.error("[paystack-webhook] JSON parse error:", err);
    return NextResponse.json({ error: "Malformed JSON" }, { status: 400 });
  }

  const { event, data } = eventPayload;
  console.log(`[paystack-webhook] Received event: ${event} for ref: ${data?.reference}`);

  try {
    if (event === "charge.success") {
      const reference = data?.reference;
      if (!reference) {
        return NextResponse.json({ received: true });
      }

      const amount = typeof data.amount === "number" ? data.amount / 100 : undefined;
      const receiptNumber =
        data.receipt_number ||
        data.reference ||
        (data.id ? String(data.id) : undefined);

      await processSuccessfulPayment({
        merchantReference: reference,
        receiptNumber,
        amount,
      });
    } else if (event === "charge.failed") {
      const reference = data?.reference;
      if (reference) {
        await processFailedPayment(reference);
      }
    }
  } catch (err) {
    console.error(`[paystack-webhook] Error processing event ${event}:`, err);
    // Return 200 to acknowledge receipt so Paystack does not flood retries on application errors
    return NextResponse.json({ received: true, error: "Processing failed" });
  }

  return NextResponse.json({ received: true });
}

