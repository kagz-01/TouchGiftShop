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
    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
  }
}
