import { NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/payment";
import { processSuccessfulPayment, processFailedPayment } from "@/lib/payment-settlement";

// GET /api/payment/status?trackingId=xxx — query Paystack for transaction status.
// Also performs idempotent settlement if completed, so buyer sees immediate confirmation
// even before webhook arrives.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackingId = searchParams.get("trackingId");

  if (!trackingId) {
    return NextResponse.json(
      { error: "trackingId required" },
      { status: 400 }
    );
  }

  try {
    const status = await getTransactionStatus(trackingId);

    if (status.status === "completed") {
      await processSuccessfulPayment({
        merchantReference: trackingId,
        receiptNumber: status.receiptNumber,
        amount: status.amount,
      });
    } else if (status.status === "failed") {
      await processFailedPayment(trackingId);
    }

    return NextResponse.json(status);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to query payment status" },
      { status: 502 }
    );
  }
}
