import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizePhone, validatePhone } from "@/lib/phone";

// POST /api/wallet/claim — Claim a stored-value gift card (TG-XXXX-XXXX) directly into a user's TouchGift wallet
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, phone } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Gift card code is required" }, { status: 400 });
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json({ error: "Phone number is required to credit your wallet" }, { status: 400 });
    }

    const phoneValidation = validatePhone(phone);
    if (!phoneValidation.isValid) {
      return NextResponse.json({ error: phoneValidation.error || "Invalid phone number" }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const normalizedPhone = phoneValidation.normalized;
    const digits = phone.replace(/\D/g, "");
    const canonical254 = digits.startsWith("0") ? "254" + digits.slice(1) : digits;
    const canonicalPlus = "+" + canonical254;

    // 1. Look up the gift card
    const { data: card, error: cardError } = await supabaseAdmin
      .from("gift_cards")
      .select("id, code, balance, initial_amount, status, expires_at, recipient_name, sender_name")
      .eq("code", cleanCode)
      .single();

    if (cardError || !card) {
      return NextResponse.json({ error: "Gift card code not found" }, { status: 404 });
    }

    if (card.status !== "active") {
      return NextResponse.json(
        { error: card.status === "claimed" ? "This gift card has already been claimed" : `Gift card is not active (status: ${card.status})` },
        { status: 400 }
      );
    }

    const isExpired = card.expires_at && new Date(card.expires_at) < new Date();
    if (isExpired) {
      return NextResponse.json({ error: "This gift card has expired" }, { status: 400 });
    }

    const claimAmount = Number(card.balance);
    if (claimAmount <= 0) {
      return NextResponse.json({ error: "This gift card has zero remaining balance" }, { status: 400 });
    }

    // 2. Find or create the user wallet (matching either canonical variant)
    let { data: wallet } = await supabaseAdmin
      .from("user_wallets")
      .select("id, balance, phone")
      .or(`phone.eq.${canonicalPlus},phone.eq.${canonical254}`)
      .maybeSingle();

    if (!wallet) {
      const { data: newWallet, error: createError } = await supabaseAdmin
        .from("user_wallets")
        .insert({ phone: canonicalPlus, balance: 0 })
        .select("id, balance, phone")
        .single();

      if (createError || !newWallet) {
        return NextResponse.json({ error: "Failed to initialize wallet" }, { status: 500 });
      }
      wallet = newWallet;
    }

    const newBalance = Number(wallet.balance) + claimAmount;

    // 3. Atomically update wallet balance
    const { error: walletUpdateErr } = await supabaseAdmin
      .from("user_wallets")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    if (walletUpdateErr) {
      return NextResponse.json({ error: "Failed to credit wallet balance" }, { status: 500 });
    }

    // 4. Mark gift card as claimed
    await supabaseAdmin
      .from("gift_cards")
      .update({
        balance: 0,
        status: "claimed",
      })
      .eq("id", card.id);

    // 5. Insert transaction ledger entry
    await supabaseAdmin.from("wallet_transactions").insert({
      wallet_id: wallet.id,
      amount: claimAmount,
      type: "credit",
      description: `Gift card ${cleanCode} claimed into wallet`,
      reference_type: "gift_card_claim",
      reference_id: card.id,
    });

    return NextResponse.json({
      success: true,
      code: cleanCode,
      claimedAmount: claimAmount,
      newBalance,
      phone: normalizedPhone,
    });
  } catch (err: any) {
    console.error("Wallet claim error:", err);
    return NextResponse.json({ error: err?.message || "Failed to claim gift card" }, { status: 500 });
  }
}

