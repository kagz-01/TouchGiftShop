import { NextResponse } from "next/server";
import { setMockPayment, listMockPayments, deleteMockPayment } from "@/lib/mockPaymentStore";

// Simple dev-only API to manipulate mock payments.
// POST body: { trackingId: string, status: 'pending'|'completed'|'failed', receiptNumber?: string, amount?: number }
export async function POST(req: Request) {
  const body = await req.json();
  if (!body?.trackingId || !body?.status) {
    return NextResponse.json({ error: "trackingId and status required" }, { status: 400 });
  }
  setMockPayment(body.trackingId, { status: body.status, receiptNumber: body.receiptNumber, amount: body.amount });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(listMockPayments());
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("trackingId");
  if (!id) return NextResponse.json({ error: "trackingId required" }, { status: 400 });
  deleteMockPayment(id);
  return NextResponse.json({ ok: true });
}
