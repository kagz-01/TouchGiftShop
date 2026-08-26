import { NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/payment";

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
    const status = await getTransactionStatus(trackingId);
    return NextResponse.json(status);
  } catch {
    return NextResponse.json(
      { error: "Failed to query payment status" },
      { status: 502 }
    );
  }
}
