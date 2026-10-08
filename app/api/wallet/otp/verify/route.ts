import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("254")) return digits;
  return digits;
}

// POST /api/wallet/otp/verify  { phone, code, giftCardId? }
export async function POST(req: NextRequest) {
  const { phone, code, giftCardId } = await req.json();
  if (!phone || !code) {
    return NextResponse.json({ error: "phone and code required" }, { status: 400 });
  }

  const normalized = normalizePhone(phone);

  // Find the most recent valid OTP
  const { data: session } = await supabaseAdmin
    .from("otp_sessions")
    .select("id, code, expires_at, verified")
    .eq("phone", normalized)
    .eq("verified", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!session) {
    return NextResponse.json({ error: "No active OTP found. Please request a new one." }, { status: 400 });
  }

  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
  }

  if (session.code !== String(code)) {
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 });
  }

  // Mark OTP as verified
  await supabaseAdmin.from("otp_sessions").update({ verified: true }).eq("id", session.id);

  // Upsert wallet
  let wallet: { id: string; balance: number } | null = null;

  const { data: existing } = await supabaseAdmin
    .from("user_wallets")
    .select("id, balance")
    .eq("phone", normalized)
    .maybeSingle();

  if (existing) {
    wallet = existing;
  } else {
    const { data: created, error: createErr } = await supabaseAdmin
      .from("user_wallets")
      .insert({ phone: normalized, balance: 0 })
      .select("id, balance")
      .single();
    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
    wallet = created;
  }

  // If claiming a gift card, credit the wallet
  if (giftCardId && wallet) {
    const { data: card } = await supabaseAdmin
      .from("digital_gift_cards")
      .select("id, amount, status")
      .eq("id", giftCardId)
      .single();

    if (!card) return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
    if (card.status === "claimed") return NextResponse.json({ error: "This gift card has already been claimed." }, { status: 400 });

    const newBalance = Number(wallet.balance) + Number(card.amount);

    await supabaseAdmin.from("user_wallets").update({ balance: newBalance }).eq("id", wallet.id);

    await supabaseAdmin.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      amount: card.amount,
      type: "credit",
      reference_type: "gift_card_claim",
      reference_id: card.id,
    });

    await supabaseAdmin
      .from("digital_gift_cards")
      .update({ status: "claimed", claimed_by_phone: normalized, claimed_at: new Date().toISOString() })
      .eq("id", card.id);

    wallet.balance = newBalance;
  }

  return NextResponse.json({ success: true, wallet });
}
