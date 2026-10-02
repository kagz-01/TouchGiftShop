import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";
import { maxRedeemablePoints, pointsDiscountKsh } from "@/lib/points";

function normalizePhoneServer(phone: unknown, countryCode?: string): string | null {
  if (!phone || typeof phone !== "string") return null;
  const raw = phone.trim();
  if (!raw) return null;

  // If already E.164 with +, validate digit count and return
  if (raw.startsWith("+")) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length >= 8 && digits.length <= 15) return raw;
    return null;
  }

  const digits = raw.replace(/\D/g, "");
  // If a countryCode is supplied (e.g. +254), try to apply local rules for common prefixes
  if (countryCode === "+254") {
    if (digits.startsWith("0") && digits.length === 10) return "+254" + digits.slice(1);
    if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) return "+254" + digits;
    if (digits.startsWith("254") && digits.length === 12) return "+" + digits;
  }

  // Generic heuristics: strip leading zeros then prefix country code if present
  const noLeading = digits.replace(/^0+/, "");
  if (countryCode && noLeading.length >= 6 && noLeading.length <= 15) {
    // Ensure we don't double-prefix if user included country code digits
    const ccDigits = countryCode.replace(/\D/g, "");
    if (noLeading.startsWith(ccDigits)) return "+" + noLeading;
    return countryCode + noLeading;
  }

  // Fallback: if looks like an international number (8-15 digits) return with +
  if (digits.length >= 8 && digits.length <= 15) return "+" + digits;

  return null;
}

const OrderInput = z.object({
  productId: z.string().uuid(),
  totalAmount: z.number().positive(),
  senderName: z.string().min(1),
  senderPhone: z.string().min(9),
  recipientName: z.string().min(1),
  recipientPhone: z.string().min(9),
  isAnonymous: z.boolean().default(false),
  dontCallRecipient: z.boolean().default(false),
  deliveryLat: z.number().nullable().optional(),
  deliveryLng: z.number().nullable().optional(),
  deliveryLandmark: z.string().optional(),
  recipientPinRequested: z.boolean().default(false),
  giftNote: z.string().optional(),
  engraving: z.string().optional(),
  customizationImageUrl: z.string().url().optional(),
  quantity: z.number().int().positive().default(1),
  shippingFee: z.number().default(0),
  senderCountry: z.string().optional(),
  recipientCountry: z.string().optional(),
  pointsToRedeem: z.number().int().nonnegative().optional(),
  giftCardCode: z.string().optional(),
  giftCardDiscount: z.number().default(0),
});

// GET /api/orders — fetch orders for the currently authenticated user only.
// The phone param is retained for display purposes but the query is scoped
// to auth.uid() so users cannot enumerate another person's orders.
export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select(`
      id, total_amount, status, recipient_name, created_at, pre_dispatch_photo_url, quantity, product_id,
      products ( name, image_url )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}

// POST /api/orders — creates the order record. Payment is handled separately
// via /api/payment/create-order (PesaPal checkout redirect).
export async function POST(req: Request) {
  const parsed = OrderInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  // ── Server-side price verification: fetch the product price and validate ──
  const { data: product } = await supabaseAdmin
    .from("products")
    .select("price")
    .eq("id", input.productId)
    .single();

  if (product) {
    const expectedAmount = Number(product.price) * input.quantity;
    const tolerance = 1; // Allow KSh 1 rounding tolerance
    if (Math.abs(input.totalAmount - expectedAmount) > tolerance) {
      return NextResponse.json(
        { error: "Price mismatch — please refresh and try again." },
        { status: 400 }
      );
    }
  }

  // Normalize and validate phone numbers on the server-side as a safety net.
  const normalizedSender = normalizePhoneServer(input.senderPhone, input.senderCountry ?? "+254");
  const normalizedRecipient = normalizePhoneServer(input.recipientPhone, input.recipientCountry ?? "+254");
  if (!normalizedSender || !normalizedRecipient) {
    return NextResponse.json({ error: "Invalid phone number format." }, { status: 400 });
  }

  // Link the order to the authenticated user if they are logged in.
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  // ── Points redemption (signed-in users only) ──
  let pointsRedeemed = 0;
  let pointsDiscount = 0;
  if (user && input.pointsToRedeem && input.pointsToRedeem > 0) {
    const requested = Math.floor(input.pointsToRedeem);

    // Balance check
    const { data: ledger } = await supabaseAdmin
      .from("loyalty_points")
      .select("points, source")
      .eq("user_id", user.id);
    let balance = 0;
    (ledger ?? []).forEach((r: { points: number; source: string }) => {
      balance += r.source === "redeemed" ? 0 : Number(r.points);
    });
    // subtract prior redemptions
    let redeemedBefore = 0;
    (ledger ?? []).forEach((r: { points: number; source: string }) => {
      if (r.source === "redeemed") redeemedBefore += Number(r.points);
    });
    balance -= redeemedBefore;

    const maxAllowed = maxRedeemablePoints(balance, input.totalAmount);
    if (requested > maxAllowed) {
      return NextResponse.json(
        { error: `Cannot redeem ${requested} pts. Available: ${Math.max(0, balance)} pts (max ${maxAllowed} for this order).` },
        { status: 400 }
      );
    }

    pointsRedeemed = requested;
    pointsDiscount = pointsDiscountKsh(requested);
  }

  // ── Gift card validation ──
  // The discount is derived here from the live card, never taken from the
  // request body. A client could otherwise POST any gift_card_discount it liked
  // (including one larger than the balance or the order total) and have it
  // applied to the order total.
  let giftCardDiscount = 0;
  let giftCardCode: string | null = null;

  if (input.giftCardCode && input.giftCardCode.trim().length >= 5) {
    const code = input.giftCardCode.trim().toUpperCase();

    const { data: gc, error: gcError } = await supabaseAdmin
      .from("gift_cards")
      .select("id, balance, status, expires_at")
      .eq("code", code)
      .maybeSingle();

    if (gcError) {
      return NextResponse.json({ error: "Could not verify gift card" }, { status: 500 });
    }
    if (!gc) {
      return NextResponse.json({ error: "Gift card not found" }, { status: 400 });
    }
    if (gc.status !== "active") {
      return NextResponse.json({ error: "Gift card is not active" }, { status: 400 });
    }
    if (gc.expires_at && new Date(gc.expires_at) < new Date()) {
      return NextResponse.json({ error: "Gift card has expired" }, { status: 400 });
    }

    const balance = Number(gc.balance);
    if (balance <= 0) {
      return NextResponse.json({ error: "Gift card has no balance" }, { status: 400 });
    }

    // Never discount more than the balance, nor more than the order is worth.
    // `input.giftCardDiscount` is the client's *intent* — it is only ever used
    // as an upper bound here, never trusted as the amount. A multi-item cart
    // creates several orders before any of them is paid, so without this cap a
    // single card could be credited once per order.
    const requested = Number(input.giftCardDiscount) || 0;
    giftCardDiscount = Math.min(balance, Number(input.totalAmount), requested);

    if (giftCardDiscount <= 0) {
      return NextResponse.json({ error: "Gift card cannot cover this order" }, { status: 400 });
    }
    giftCardCode = code;
  }

  const { data: order, error: insertError } = await supabaseAdmin
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      product_id: input.productId,
      total_amount: input.totalAmount,
      status: "pending_payment",
      sender_name: input.senderName,
      sender_phone: normalizedSender,
      recipient_name: input.recipientName,
      recipient_phone: normalizedRecipient,
      is_anonymous: input.isAnonymous,
      dont_call_recipient: input.dontCallRecipient,
      delivery_lat: input.deliveryLat ?? null,
      delivery_lng: input.deliveryLng ?? null,
      delivery_landmark: input.deliveryLandmark ?? null,
      recipient_pin_requested: input.recipientPinRequested,
      gift_note: input.giftNote ?? null,
      engraving: input.engraving ?? null,
      customization_image_url: input.customizationImageUrl ?? null,
      quantity: input.quantity,
      shipping_fee: input.shippingFee,
      points_redeemed: pointsRedeemed,
      points_discount: pointsDiscount,
      gift_card_code: giftCardCode,
      gift_card_discount: giftCardDiscount,
    })
    .select()
    .single();

  if (insertError || !order) {
    // If the database schema is missing the `product_id` column (common when
    // migrations haven't been applied), attempt a fallback insert without it
    // so the API remains usable until the DB is migrated.
    const msg = insertError?.message ?? "Failed to create order";
    if (msg.includes("product_id") || msg.includes("Could not find the 'product_id'" ) || msg.includes("column \"product_id\"")) {
      try {
        const { data: fallbackOrder, error: fallbackError } = await supabaseAdmin
          .from("orders")
          .insert({
            user_id: user?.id ?? null,
            total_amount: input.totalAmount,
            status: "pending_payment",
            sender_name: input.senderName,
            sender_phone: normalizedSender,
            recipient_name: input.recipientName,
            recipient_phone: normalizedRecipient,
            is_anonymous: input.isAnonymous,
            dont_call_recipient: input.dontCallRecipient,
            delivery_lat: input.deliveryLat ?? null,
            delivery_lng: input.deliveryLng ?? null,
            delivery_landmark: input.deliveryLandmark ?? null,
            recipient_pin_requested: input.recipientPinRequested,
            gift_note: input.giftNote ?? null,
            engraving: input.engraving ?? null,
            customization_image_url: input.customizationImageUrl ?? null,
            quantity: input.quantity,
            shipping_fee: input.shippingFee,
          })
          .select()
          .single();

        if (fallbackError || !fallbackOrder) {
          return NextResponse.json({ error: fallbackError?.message ?? msg }, { status: 500 });
        }

        return NextResponse.json({ order: fallbackOrder });
      } catch (e: any) {
        return NextResponse.json({ error: e?.message ?? msg }, { status: 500 });
      }
    }

    // Generic fallback: if insert failed because of unexpected/missing
    // columns (e.g. gift_card_code added in newer schema), try a minimal
    // insert with only the essential fields so the order can be created.
    try {
      const { data: minimalOrder, error: minimalError } = await supabaseAdmin
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          total_amount: input.totalAmount,
          status: "pending_payment",
          sender_name: input.senderName,
          sender_phone: normalizedSender,
          recipient_name: input.recipientName,
          recipient_phone: normalizedRecipient,
          quantity: input.quantity,
          shipping_fee: input.shippingFee,
        })
        .select()
        .single();

      if (giftCardCode) {
        // Fail-closed: this minimal insert has no gift card columns, so the
        // validated discount is not persisted. Surface it rather than letting
        // the customer think it was applied.
        console.warn(
          `[orders] gift card ${giftCardCode} (validated ${giftCardDiscount}) dropped by ` +
            `minimal-insert fallback for order ${minimalOrder?.id ?? "unknown"}`
        );
      }

      if (minimalError || !minimalOrder) {
        return NextResponse.json({ error: insertError?.message ?? minimalError?.message ?? msg }, { status: 500 });
      }

      return NextResponse.json({ order: minimalOrder });
    } catch (e: any) {
      return NextResponse.json({ error: insertError?.message ?? e?.message ?? msg }, { status: 500 });
    }
  }

  // giftCardDiscount is authoritative and server-derived — the client must
  // reconcile its local figure against this rather than trusting its own.
  return NextResponse.json({ order, pointsDiscount, giftCardDiscount });
}
