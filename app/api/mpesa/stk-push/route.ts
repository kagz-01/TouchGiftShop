import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizeKenyanPhone } from "@/lib/payment";

export async function POST(req: Request) {
  try {
    const { amount, phone, reference, description } = await req.json();

    if (!amount || !phone || !reference) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const normalizedPhone = normalizeKenyanPhone(phone);

    // 1. Authenticate with Daraja
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE;

    if (!consumerKey || !consumerSecret || !passkey || !shortcode) {
      console.warn("M-Pesa STK push not fully configured, returning dummy success.");
      return NextResponse.json({ success: true, message: "Dummy STK push sent" });
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
    const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` },
    });
    
    if (!tokenRes.ok) throw new Error("M-Pesa auth failed");
    const { access_token } = await tokenRes.json();

    // 2. Trigger STK Push
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";

    const stkRes = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: normalizedPhone,
        PartyB: shortcode,
        PhoneNumber: normalizedPhone,
        CallBackURL: `${siteUrl}/api/mpesa/callback`,
        AccountReference: reference,
        TransactionDesc: description || "TouchGift Payment",
      }),
    });

    const stkData = await stkRes.json();
    if (!stkRes.ok) throw new Error(`STK Push failed: ${JSON.stringify(stkData)}`);

    return NextResponse.json({ success: true, ...stkData });
  } catch (error: any) {
    console.error("STK Push error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
