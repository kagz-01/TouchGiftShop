import { NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/payment";
import { getMockPayment } from "@/lib/mockPaymentStore";

// GET /api/payment/status?trackingId=xxx — query PesaPal for transaction status.
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
    // Development mock: if the trackingId starts with `mock-` return the in-memory mock
    const mock = getMockPayment(trackingId);
    if (mock) {
      return NextResponse.json({ status: mock.status, receiptNumber: mock.receiptNumber, amount: mock.amount });
    }
    const status = await getTransactionStatus(trackingId);
    return NextResponse.json(status);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Query failed" },
      { status: 502 }
    );
  }
}
