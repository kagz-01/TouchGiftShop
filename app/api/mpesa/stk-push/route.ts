import { NextResponse } from "next/server";
import { initiateStkPush } from "@/lib/mpesa";

// POST /api/mpesa/stk-push — used by both checkout and pool contributions.
export async function POST(req: Request) {
  const { phoneNumber, amount, accountReference, transactionDesc } =
    await req.json();
  try {
    const result = await initiateStkPush({
      phoneNumber,
      amount,
      accountReference,
      transactionDesc,
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment failed";
    console.error("STK push error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
