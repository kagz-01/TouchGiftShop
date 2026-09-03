import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { createPaymentOrder } from "@/lib/payment";

/** Generates a cryptographically secure TG-XXXX-XXXX code */
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0,O,I,1 for clarity
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const part1 = Array.from(bytes.slice(0, 4)).map((b) => chars[b % chars.length]).join("");
  const part2 = Array.from(bytes.slice(4)).map((b) => chars[b % chars.length]).join("");
  return `TG-${part1}-${part2}`;
}

const PurchaseInput = z.object({
  amount: z.number().min(500, "Minimum amount is KSh 500"),
  senderName: z.string().min(1).optional(),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientPhone: z
    .string()
    .regex(/^(\+?254|0)(7|1)\d{8}$/, "Invalid Kenyan phone number")
    .optional()
    .or(z.literal("")),
  message: z.string().max(160, "Message cannot exceed 160 characters").optional(),
  isAnonymous: z.boolean().optional(),
  sendDate: z.string().optional(),
  style: z.object({
    theme: z.string(),
    font: z.string(),
  }).optional(),
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

  const { amount, senderName, recipientName, recipientPhone, message, isAnonymous, sendDate, style } =
    parsed.data;

  const effectiveSenderName = isAnonymous ? null : senderName ?? null;

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

  // Expires in 3 months from the send date (or today)
  const baseDate = sendDate ? new Date(sendDate) : new Date();
  const expiresAt = new Date(baseDate);
  expiresAt.setMonth(expiresAt.getMonth() + 3);

  const isScheduled = sendDate && new Date(sendDate) > new Date();

  let { data: card, error } = await supabaseAdmin
    .from("gift_cards")
    .insert({
      code,
      initial_amount: amount,
      balance: 0,
      sender_name: effectiveSenderName,
      recipient_name: recipientName,
      recipient_phone: recipientPhone || null,
      message: message || null,
      expires_at: expiresAt.toISOString(),
      send_date: sendDate || null,
      style: style || null,
      status: isScheduled ? "scheduled" : "pending_payment",
    })
    .select()
    .single();

  if (error || !card) {
    const msg = error?.message ?? "Failed to create gift card";
    if (msg.includes("send_date") || msg.includes("Could not find the 'send_date'") || msg.includes("column \"send_date\"")) {
      try {
        const { data: fallbackCard, error: fallbackErr } = await supabaseAdmin
          .from("gift_cards")
          .insert({
            code,
            initial_amount: amount,
            balance: 0,
            sender_name: effectiveSenderName,
            recipient_name: recipientName,
            recipient_phone: recipientPhone || null,
            message: message || null,
            expires_at: expiresAt.toISOString(),
            status: isScheduled ? "scheduled" : "pending_payment",
          })
          .select()
          .single();

        if (fallbackErr || !fallbackCard) {
          return NextResponse.json({ error: fallbackErr?.message ?? msg }, { status: 500 });
        }

        card = fallbackCard;
      } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? msg }, { status: 500 });
      }
    } else {
      return NextResponse.json(
        { error: msg },
        { status: 500 }
      );
    }
  }

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
    .select("code, balance, initial_amount, expires_at, recipient_name, sender_name, status, style")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !card) {
    return NextResponse.json({ error: "Gift card not found" }, { status: 404 });
  }

  const isExpired = card.expires_at && new Date(card.expires_at) < new Date();

  return NextResponse.json({
    card: {
      ...card,
      is_anonymous: card.sender_name === null,
      is_expired: isExpired,
      is_usable: card.status === "active" && !isExpired && card.balance > 0,
    },
  });
}
