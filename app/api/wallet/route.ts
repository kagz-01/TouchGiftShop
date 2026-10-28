import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function getPhoneVariants(raw: string): { canonical254: string; canonicalPlus: string } {
  const digits = raw.replace(/\D/g, "");
  const canonical254 = digits.startsWith("0") ? "254" + digits.slice(1) : digits;
  const canonicalPlus = "+" + canonical254;
  return { canonical254, canonicalPlus };
}

// GET /api/wallet?phone=07XXXXXXXX
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawPhone = searchParams.get("phone");
  if (!rawPhone) return NextResponse.json({ error: "phone required" }, { status: 400 });

  const { canonical254, canonicalPlus } = getPhoneVariants(rawPhone);

  const { data: wallet } = await supabaseAdmin
    .from("user_wallets")
    .select("id, balance, phone, created_at")
    .or(`phone.eq.${canonicalPlus},phone.eq.${canonical254}`)
    .maybeSingle();

  if (!wallet) return NextResponse.json({ wallet: null, transactions: [] });

  const { data: transactions } = await supabaseAdmin
    .from("wallet_transactions")
    .select("id, amount, type, description, reference_type, reference_id, created_at")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ wallet, transactions: transactions ?? [] });
}

// POST /api/wallet/debit  — internal use: deduct from wallet at checkout
// Body: { phone, amount, orderId }
export async function POST(req: NextRequest) {
  const { phone, amount, orderId } = await req.json();
  if (!phone || !amount || !orderId) {
    return NextResponse.json({ error: "phone, amount, orderId required" }, { status: 400 });
  }

  const { canonical254, canonicalPlus } = getPhoneVariants(phone);

  const { data: wallet } = await supabaseAdmin
    .from("user_wallets")
    .select("id, balance")
    .or(`phone.eq.${canonicalPlus},phone.eq.${canonical254}`)
    .maybeSingle();

  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  if (Number(wallet.balance) < Number(amount)) {
    return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
  }

  const newBalance = Number(wallet.balance) - Number(amount);
  await supabaseAdmin.from("user_wallets").update({ balance: newBalance, updated_at: new Date().toISOString() }).eq("id", wallet.id);

  await supabaseAdmin.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    amount,
    type: "debit",
    description: `Order ${orderId} payment deduction`,
    reference_type: "order_payment",
    reference_id: orderId,
  });

  return NextResponse.json({ success: true, newBalance, deducted: amount });
}
