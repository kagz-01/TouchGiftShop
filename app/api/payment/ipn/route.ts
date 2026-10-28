import { NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/payment";
import { processSuccessfulPayment, processFailedPayment } from "@/lib/payment-settlement";

// POST /api/payment/ipn — Legacy / IPN handler
// Verifies transaction status before processing
export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: true });
  }

  const orderTrackingId = (payload.order_tracking_id || payload.reference) as string | undefined;
  if (!orderTrackingId) {
    return NextResponse.json({ success: true });
  }

  // Always verify status directly — never trust the IPN body alone
  let status;
  try {
    status = await getTransactionStatus(orderTrackingId);
  } catch {
    return NextResponse.json({ success: true });
  }

  const merchantReference =
    (payload.order_merchant_reference as string) ||
    (payload.reference as string) ||
    orderTrackingId;

  if (status.status === "completed") {
    await processSuccessfulPayment({
      merchantReference,
      receiptNumber: status.receiptNumber,
      amount: status.amount,
    });
  } else if (status.status === "failed") {
    await processFailedPayment(merchantReference);
  }

  return NextResponse.json({ success: true });
}
