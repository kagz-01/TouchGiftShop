import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSms } from "@/lib/notifications";

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("254")) return digits;
  return digits;
}

// POST /api/wallet/otp/send  { phone }
export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

  const normalized = normalizePhone(phone);
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  // Invalidate any previous unused OTPs for this phone
  await supabaseAdmin
    .from("otp_sessions")
    .update({ verified: true })
    .eq("phone", normalized)
    .eq("verified", false);

  const { error } = await supabaseAdmin.from("otp_sessions").insert({
    phone: normalized,
    code,
    expires_at: expiresAt,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send via SMS
  try {
    await sendSms(
      `+${normalized}`,
      `Your TouchGift verification code is: ${code}. It expires in 10 minutes.`
    );
  } catch (smsErr) {
    console.error("[OTP SMS Error]", smsErr);
    // Don't fail the request — just log; allows testing without live SMS
  }

  return NextResponse.json({ success: true });
}
