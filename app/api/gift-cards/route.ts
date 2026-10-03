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

/** 3- or 6-digit hex colour. */
const HEX = z
  .string()
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex colour");

const PurchaseInput = z.object({
  amount: z.number().min(500, "Minimum amount is KSh 500"),
  senderName: z.string().min(1).optional(),
  recipientName: z.string().min(1, "Recipient name is required"),
  recipientPhone: z
    .string()
    .regex(/^(\+?254|0)(7|1)\d{8}$/, "Invalid Kenyan phone number")
    .optional()
    .or(z.literal("")),
  recipientEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  message: z.string().max(200, "Message cannot exceed 200 characters").optional(),
  isAnonymous: z.boolean().optional(),
  sendDate: z.string().optional(),
  // Card appearance. Colours are validated so a crafted payload cannot inject
  // arbitrary CSS (the values are inlined into the card's style attribute).
  style: z
    .object({
      theme: z.string().max(40).optional(),
      bg: HEX.optional(),
      accent: HEX.optional(),
      textPrimary: HEX.optional(),
      textSecondary: HEX.optional(),
    })
    .strict()
    .optional(),
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

  const { amount, senderName, recipientName, recipientPhone, recipientEmail, message, isAnonymous, sendDate, style } =
    parsed.data;

  // "Send to recipient" accepts an email or a phone; store each in its own column.
  const trimmedEmail = (recipientEmail ?? "").trim();
  const trimmedPhone = (recipientPhone ?? "").trim();

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

  // The live gift_cards table is missing some optional columns (e.g. `style`,
  // and on older deployments `send_date`). Build the fullest payload we can and
  // progressively drop any column PostgREST reports as absent, so a purchase is
  // never blocked by an optional column that was never migrated.
  const insertPayload: Record<string, unknown> = {
    code,
    initial_amount: amount,
    balance: 0,
    sender_name: effectiveSenderName,
    recipient_name: recipientName,
    recipient_phone: trimmedPhone || null,
    recipient_email: trimmedEmail || null,
    message: message || null,
    expires_at: expiresAt.toISOString(),
    send_date: sendDate || null,
    style: style || null,
    status: isScheduled ? "scheduled" : "pending_payment",
  };

  /** Pulls the column name out of a PostgREST "missing column" error. */
  const missingColumn = (msg: string): string | null => {
    const m =
      msg.match(/Could not find the '([^']+)' column/i) ??
      msg.match(/column "([^"]+)" does not exist/i) ??
      msg.match(/column ([a-z_]+) does not exist/i);
    return m ? m[1] : null;
  };

  let card: any = null;
  let lastError = "Failed to create gift card";
  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data, error } = await supabaseAdmin
        .from("gift_cards")
        .insert(insertPayload)
        .select()
        .single();

      if (!error && data) {
        card = data;
        break;
      }

      lastError = error?.message ?? lastError;
      const col = error?.message ? missingColumn(error.message) : null;
      if (!col || !(col in insertPayload)) {
        return NextResponse.json({ error: lastError }, { status: 500 });
      }
      // Column isn't in the deployed schema — drop it and retry.
      delete insertPayload[col];
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? lastError }, { status: 500 });
  }

  if (!card) {
    return NextResponse.json({ error: lastError }, { status: 500 });
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
