import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createPaymentOrder, normalizeKenyanPhone } from "@/lib/payment";

function makeCode() {
  const s = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `TG${s}`;
}

function makePin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      amount,
      recipientName,
      recipientPhone,
      senderName,
      isAnonymous,
      alias,
      message,
      delivery,
      template,
    } = body;

    if (!amount || Number(amount) < 500) {
      return NextResponse.json({ error: "Amount must be at least KSh 500" }, { status: 400 });
    }

    if (!recipientName || !recipientPhone) {
      return NextResponse.json({ error: "recipientName and recipientPhone required" }, { status: 400 });
    }

    let normalizedPhone = recipientPhone;
    try {
      normalizedPhone = normalizeKenyanPhone(recipientPhone);
    } catch (e) {
      // keep as-is if normalization fails
    }

    const code = makeCode();
    const pin = makePin();

    // Insert a pending gift card record
    const { data: giftCard, error: insertError } = await supabaseAdmin
      .from("gift_cards")
      .insert({
        code,
        initial_amount: amount,
        balance: amount,
        sender_name: isAnonymous ? null : senderName,
        recipient_name: recipientName,
        recipient_phone: normalizedPhone,
        recipient_email: body.recipientEmail || null,
        delivery_methods: Array.isArray(body.delivery) ? body.delivery : null,
        message: message || null,
        is_anonymous: !!isAnonymous,
        style: { template: template || "premium" },
        status: "pending",
        pin,
      })
      .select()
      .single();

    if (insertError || !giftCard) {
      const msg = insertError?.message ?? "Could not create gift card";
      console.error("Gift card insert error:", insertError);
      // Defensive fallback: some production DBs may be missing newer columns
      // (e.g. send_date). Try a minimal insert without optional fields.
      if (msg.includes("send_date") || msg.includes("Could not find the 'send_date'") || msg.includes("column \"send_date\"")) {
        try {
          const { data: fallback, error: fallbackError } = await supabaseAdmin
            .from("gift_cards")
            .insert({
              code,
              initial_amount: amount,
              balance: amount,
              sender_name: isAnonymous ? null : senderName,
              recipient_name: recipientName,
              recipient_phone: normalizedPhone,
              message: message || null,
              is_anonymous: !!isAnonymous,
              status: "pending",
              pin,
            })
            .select()
            .single();

          if (fallbackError || !fallback) {
            return NextResponse.json({ error: fallbackError?.message ?? msg }, { status: 500 });
          }

          giftCard = fallback;
        } catch (e: any) {
          return NextResponse.json({ error: e?.message ?? msg }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";

    // Start payment via PesaPal
    try {
      const merchantRef = `giftcard-${giftCard.id}`;
      const { orderTrackingId, redirectUrl } = await createPaymentOrder({
        amount: Number(amount),
        merchantReference: merchantRef,
        description: `TouchGift gift card ${code}`,
        callbackUrl: `${siteUrl}/payment-success?ref=${giftCard.id}`,
        phoneNumber: normalizedPhone,
        name: isAnonymous ? alias || "TouchGift" : senderName || "TouchGift",
      });

      return NextResponse.json({ redirectUrl, orderTrackingId, giftCard });
    } catch (e: any) {
      console.error("Payment init failed:", e);
      return NextResponse.json({ error: e?.message || "Payment init failed" }, { status: 502 });
    }
  } catch (err: any) {
    console.error("Gift-cards route error:", err);
    return NextResponse.json({ error: err?.message ?? "Invalid request" }, { status: 400 });
  }
}
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
  sendDate: z.string().optional(), // ISO date string, e.g. "2026-09-10"
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

  // Expires in 12 months from the send date (or today)
  const baseDate = sendDate ? new Date(sendDate) : new Date();
  const expiresAt = new Date(baseDate);
  expiresAt.setMonth(expiresAt.getMonth() + 12);

  // Schedule: if sendDate is in the future, card starts as "scheduled"
  const isScheduled = sendDate && new Date(sendDate) > new Date();

  // Create gift card
  let { data: card, error } = await supabaseAdmin
    .from("gift_cards")
    .insert({
      code,
      initial_amount: amount,
      balance: 0,
      sender_name: effectiveSenderName,   // null = anonymous
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
    // Defensive fallback when production DB is missing optional columns (e.g., send_date)
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
      // null sender_name = anonymous
      is_anonymous: card.sender_name === null,
      is_expired: isExpired,
      is_usable: card.status === "active" && !isExpired && card.balance > 0,
    },
  });
}
