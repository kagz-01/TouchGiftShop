import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const result = payload?.Body?.stkCallback;

    if (!result) return NextResponse.json({ success: true });

    const merchantRequestID = result.MerchantRequestID;
    const resultCode = result.ResultCode;

    // TODO: Ideally we should look up the order/pool by merchantRequestID 
    // which we would have saved in the database during the STK push.
    // For now, if ResultCode === 0, it means payment was successful.

    if (resultCode === 0) {
      // Find the payment metadata from the callback items
      const items = result.CallbackMetadata?.Item || [];
      const receipt = items.find((i: any) => i.Name === "MpesaReceiptNumber")?.Value;
      const amount = items.find((i: any) => i.Name === "Amount")?.Value;

      console.log(`M-Pesa payment successful: Receipt ${receipt} for KES ${amount}`);
      
      // Real implementation would look up the pool contribution or order
      // and call handlePoolPayment or handleOrderPayment similarly to IPN.
    } else {
      console.error(`M-Pesa STK Push failed: ${result.ResultDesc}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("M-Pesa Callback Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
