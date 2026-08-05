import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TG-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const PurchaseInput = z.object({
  amount: z.number().positive(),
  senderName: z.string().min(1),
  recipientName: z.string().min(1),
  recipientPhone: z.string().optional(),
  message: z.string().optional(),
});

// POST /api/gift-cards — purchase a gift card
export async function POST(req: Request) {
  const parsed = PurchaseInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { amount, senderName, recipientName, recipientPhone, message } =
    parsed.data;

  // Generate a unique code
  let code = generateCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabaseAdmin
      .from("gift_cards")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  // Expires in 12 months
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 12);

  const { data: card, error } = await supabaseAdmin
    .from("gift_cards")
    .insert({
      code,
      initial_amount: amount,
      balance: amount,
      sender_name: senderName,
      recipient_name: recipientName,
      recipient_phone: recipientPhone ?? null,
      message: message ?? null,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error || !card) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create gift card" },
      { status: 500 }
    );
  }

  return NextResponse.json({ card });
}

// GET /api/gift-cards?code=TG-XXXXXXXX — check balance
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "code required" }, { status: 400 });
  }

  const { data: card, error } = await supabaseAdmin
    .from("gift_cards")
    .select("code, balance, initial_amount, expires_at, recipient_name")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !card) {
    return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
  }

  const isExpired = card.expires_at && new Date(card.expires_at) < new Date();

  return NextResponse.json({
    card: {
      ...card,
      is_expired: isExpired,
      is_usable: !isExpired && card.balance > 0,
    },
  });
}
