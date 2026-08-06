import { NextResponse } from "next/server";
import { createPaymentOrder } from "@/lib/payment";

// POST /api/payment/create-order — creates a PesaPal checkout session.
// Called by the client after the order/contribution is saved to our DB.
export async function POST(req: Request) {
  const { amount, merchantReference, description, phoneNumber, email, callbackUrl } =
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
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("PesaPal create-order error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment init failed" },
      { status: 502 }
    );
  }
}
