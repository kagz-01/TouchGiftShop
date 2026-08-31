import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { createPaymentOrder } from "@/lib/payment";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TG-";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const PurchaseInput = z.object({
  amount: z.number().min(500, "Minimum amount is KSh 500"),
  senderName: z.string().min(1).optional(),
  recipientName: z.string().min(1),
  recipientPhone: z.string().optional(),
  message: z.string().optional(),
  isAnonymous: z.boolean().optional(),
});

// POST /api/gift-cards — purchase a gift card (creates pending card + PesaPal payment)
export async function POST(req: Request) {
  const parsed = PurchaseInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { amount, senderName, recipientName, recipientPhone, message, isAnonymous } =
    parsed.data;

  // Anonymous cards don't store sender name
  const effectiveSenderName = isAnonymous ? null : senderName ?? null;

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

  // Create gift card with pending_payment status
  const { data: card, error } = await supabaseAdmin
    .from("gift_cards")
    .insert({
      code,
      initial_amount: amount,
      balance: 0, // Will be set to amount on payment success
      sender_name: effectiveSenderName,
      recipient_name: recipientName,
      recipient_phone: recipientPhone ?? null,
      message: message ?? null,
      is_anonymous: isAnonymous ?? false,
      expires_at: expiresAt.toISOString(),
      status: "pending_payment",
    })
    .select()
    .single();

  if (error || !card) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to create gift card" },
      { status: 500 }
    );
  }

  // Create PesaPal payment order
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
  try {
    const payment = await createPaymentOrder({
      amount,
      merchantReference: `giftcard-${card.id}`,
      description: `TouchGift Gift Card KSh ${amount.toLocaleString()} for ${recipientName}`,
      callbackUrl: `${siteUrl}/payment-success?ref=giftcard-${card.id}`,
      name: effectiveSenderName ?? "Anonymous",
    });

    return NextResponse.json({
      card,
      redirectUrl: payment.redirectUrl,
      orderTrackingId: payment.orderTrackingId,
    });
  } catch (payErr: any) {
    // Payment failed — clean up the pending card
    await supabaseAdmin.from("gift_cards").delete().eq("id", card.id);
    return NextResponse.json(
      { error: payErr?.message ?? "Failed to start payment" },
      { status: 500 }
    );
  }
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
    .select("code, balance, initial_amount, expires_at, recipient_name, sender_name, is_anonymous, status")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !card) {
    return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
  }

  const isExpired = card.expires_at && new Date(card.expires_at) < new Date();

  return NextResponse.json({
    card: {
      ...card,
      // Hide sender name for anonymous cards
      sender_name: card.is_anonymous ? null : card.sender_name,
      is_expired: isExpired,
      is_usable: card.status === "active" && !isExpired && card.balance > 0,
    },
  });
}
