import { NextResponse } from "next/server";
import { createPaymentOrder } from "@/lib/payment";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Stores the PesaPal tracking id against the order it pays for. PesaPal's
 * RefundRequest needs this id as its confirmation code, so without it an order
 * can never be refunded. Recorded here rather than only in the IPN, which can
 * be lost.
 *
 * `multi-` references cover several orders against one payment, so the id is
 * written to all of them.
 */
async function rememberTrackingId(merchantReference: string, trackingId: string) {
  try {
    const ids = merchantReference.startsWith("multi-")
      ? merchantReference
          .replace("multi-", "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
      : [merchantReference];

    await supabaseAdmin
      .from("orders")
      .update({ pesapal_tracking_id: trackingId })
      .in("id", ids);
  } catch (e) {
    // Never fail the checkout over bookkeeping — the payment itself is fine.
    console.error("Failed to store pesapal_tracking_id:", e);
  }
}

// POST /api/payment/create-order — creates a PesaPal checkout session.
// Called by the client after the order/contribution is saved to our DB.
export async function POST(req: Request) {
  const { amount, merchantReference, description, phoneNumber, email, callbackUrl, name } =
    await req.json();

  if (!amount || !merchantReference) {
    return NextResponse.json(
      { error: "amount and merchantReference required" },
      { status: 400 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";

  // Use custom callback URL if provided, otherwise default to /payment-success
  const finalCallbackUrl = callbackUrl || `${siteUrl}/payment-success?ref=${merchantReference}`;

  try {
    const result = await createPaymentOrder({
      amount,
      merchantReference,
      description: description || "TouchGift payment",
      callbackUrl: finalCallbackUrl,
      phoneNumber,
      email,
      name,
    });

    await rememberTrackingId(merchantReference, result.orderTrackingId);

    return NextResponse.json(result);
  } catch (err) {
    console.error("PesaPal create-order error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment init failed" },
      { status: 502 }
    );
  }
}
