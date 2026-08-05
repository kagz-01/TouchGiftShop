import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/mpesa/callback — Safaricom calls this once the STK push
// resolves (paid, cancelled, or timed out). This is the ONLY place an
// order should ever move out of "pending_payment".
//
// Payload shape (Daraja STK callback):
// { Body: { stkCallback: { CheckoutRequestID, ResultCode, ResultDesc,
//     CallbackMetadata: { Item: [{Name:"MpesaReceiptNumber", Value:...}, ...] } } } }
export async function POST(req: Request) {
  const payload = await req.json();
  const callback = payload?.Body?.stkCallback;

  if (!callback?.CheckoutRequestID) {
    console.error("Malformed M-Pesa callback payload", payload);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Bad payload" });
  }

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

  if (ResultCode !== 0) {
    // Payment failed or was cancelled by the user — leave order retryable.
    await supabaseAdmin
      .from("orders")
      .update({ status: "failed" })
      .eq("mpesa_checkout_request_id", CheckoutRequestID);

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const items: { Name: string; Value: string | number }[] =
    CallbackMetadata?.Item ?? [];
  const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status: "processing", // paid, now queued for packing/wrapping
      mpesa_receipt_number: receipt ?? null,
    })
    .eq("mpesa_checkout_request_id", CheckoutRequestID);

  if (error) {
    console.error("Failed to update order from M-Pesa callback:", error);
  }

  // TODO: trigger a WhatsApp order-confirmation message here once the
  // WhatsApp Business API integration exists.

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
