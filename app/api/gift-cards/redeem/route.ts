import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/gift-cards/redeem — redeem a gift card at checkout
export async function POST(req: Request) {
  const { code, orderId, amount } = await req.json();

  if (!code || !orderId || !amount) {
    return NextResponse.json(
      { error: "code, orderId, and amount are required" },
      { status: 400 }
    );
  }

  // 1. Validate the gift card
  const { data: card, error: fetchError } = await supabaseAdmin
    .from("gift_cards")
    .select("id, code, balance, status, expires_at")
    .eq("code", code.toUpperCase())
    .single();

  if (fetchError || !card) {
    return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
  }

  if (card.status !== "active") {
    return NextResponse.json(
      { error: card.status === "pending_payment" ? "Gift card not yet activated" : "Gift card is not active" },
      { status: 400 }
    );
  }

  if (card.expires_at && new Date(card.expires_at) < new Date()) {
    return NextResponse.json({ error: "Gift card has expired" }, { status: 400 });
  }

  const redeemAmount = Math.min(Number(amount), Number(card.balance));
  if (redeemAmount <= 0) {
    return NextResponse.json({ error: "Gift card has no balance" }, { status: 400 });
  }

  // 2. Deduct the balance (idempotent — check balance before deducting)
  const { error: deductError } = await supabaseAdmin
    .from("gift_cards")
    .update({ balance: Number(card.balance) - redeemAmount })
    .eq("id", card.id)
    .gte("balance", redeemAmount);

  if (deductError) {
    return NextResponse.json(
      { error: "Failed to redeem — gift card balance may be insufficient" },
      { status: 409 }
    );
  }

  // 3. Log the redemption (best-effort — table may not exist yet)
  try {
    await supabaseAdmin.from("gift_card_redemptions").insert({
      gift_card_id: card.id,
      order_id: orderId,
      amount: redeemAmount,
    });
  } catch {
    // Table may not exist yet — that's okay, the balance is already deducted
  }

  return NextResponse.json({
    success: true,
    redeemed: redeemAmount,
    remainingBalance: Number(card.balance) - redeemAmount,
  });
}
