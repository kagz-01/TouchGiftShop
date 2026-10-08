import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("254")) return digits;
  return digits;
}

// GET /api/wallet?phone=07XXXXXXXX
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawPhone = searchParams.get("phone");
  if (!rawPhone) return NextResponse.json({ error: "phone required" }, { status: 400 });

  const phone = normalizePhone(rawPhone);

  const { data: wallet } = await supabaseAdmin
    .from("user_wallets")
    .select("id, balance, phone, created_at")
    .eq("phone", phone)
    .maybeSingle();

  if (!wallet) return NextResponse.json({ wallet: null, transactions: [] });

  const { data: transactions } = await supabaseAdmin
    .from("wallet_transactions")
    .select("id, amount, type, reference_type, reference_id, created_at")
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

  const normalized = normalizePhone(phone);

  const { data: wallet } = await supabaseAdmin
    .from("user_wallets")
    .select("id, balance")
    .eq("phone", normalized)
    .single();

  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  if (Number(wallet.balance) < Number(amount)) {
    return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
  }

  const newBalance = Number(wallet.balance) - Number(amount);
  await supabaseAdmin.from("user_wallets").update({ balance: newBalance }).eq("id", wallet.id);

  await supabaseAdmin.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    amount,
    type: "debit",
    reference_type: "order_payment",
    reference_id: orderId,
  });

  return NextResponse.json({ success: true, newBalance, deducted: amount });
}
