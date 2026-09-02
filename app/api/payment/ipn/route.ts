import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTransactionStatus } from "@/lib/payment";
import { deliverGiftCard } from "@/lib/notifications";
import {
  REFERRAL_BONUS_POINTS,
  CONVERSION_MIN_ORDER_KSH,
  MONTHLY_CONVERSION_CAP,
} from "@/lib/points";

// POST /api/payment/ipn — PesaPal sends IPN (Instant Payment Notification)
// when a transaction status changes.
// We verify by querying PesaPal directly — no trust on the POST body alone.

export async function POST(req: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: true });
  }

  const orderTrackingId = payload.order_tracking_id as string | undefined;
  if (!orderTrackingId) {
    return NextResponse.json({ success: true });
  }

  // Always verify status directly with PesaPal — never trust the IPN body alone
  let status;
  try {
    status = await getTransactionStatus(orderTrackingId);
  } catch {
    return NextResponse.json({ success: true });
  }

  const merchantReference = (payload.order_merchant_reference as string) || "";

  if (status.status === "completed") {
    if (merchantReference.startsWith("giftcard-")) {
      await handleGiftCardPayment(merchantReference, status.receiptNumber);
    } else if (merchantReference.startsWith("pool-")) {
      await handlePoolPayment(merchantReference, status.receiptNumber);
    } else if (merchantReference.startsWith("multi-")) {
      const orderIds = merchantReference.replace("multi-", "").split(",");
      for (const oid of orderIds) {
        await handleOrderPayment(oid.trim(), status.receiptNumber);
      }
    } else {
      await handleOrderPayment(merchantReference, status.receiptNumber);
    }
  } else if (status.status === "failed") {
    if (merchantReference.startsWith("giftcard-")) {
      await handleGiftCardFailure(merchantReference);
    } else if (merchantReference.startsWith("pool-")) {
      await handlePoolFailure(merchantReference);
    } else if (merchantReference.startsWith("multi-")) {
      const orderIds = merchantReference.replace("multi-", "").split(",");
      for (const oid of orderIds) {
        await handleOrderFailure(oid.trim());
      }
    } else {
      await handleOrderFailure(merchantReference);
    }
  }

  return NextResponse.json({ success: true });
}

async function handleGiftCardPayment(
  reference: string,
  receiptNumber: string | undefined
) {
  const cardId = reference.replace("giftcard-", "");

  const { data: card } = await supabaseAdmin
    .from("gift_cards")
    .select("id, code, initial_amount, recipient_email, recipient_phone, recipient_name, sender_name, message, is_anonymous, style, status")
    .eq("id", cardId)
    .single();

  if (!card) return;

  const { error: updateError } = await supabaseAdmin
    .from("gift_cards")
    .update({ status: "active", balance: card.initial_amount })
    .eq("id", cardId)
    .eq("status", "pending_payment");

  if (updateError) return;

  // Dispatch delivery via requested channels if record contains recipient contact
  try {
    const methods: string[] = [];
    // Look up desired delivery methods from a delivery_requests table if present,
    // otherwise default to email then sms when available.
    if (card.recipient_email) methods.push("email");
    if (card.recipient_phone) methods.push("sms", "whatsapp");

    if (methods.length > 0) {
      await deliverGiftCard({
        code: card.code,
        recipientEmail: card.recipient_email,
        recipientPhone: card.recipient_phone,
        recipientName: card.recipient_name,
        senderName: card.sender_name,
        alias: card.is_anonymous ? card.sender_name : null,
        message: card.message,
        methods,
      });
    }
  } catch (e) {
    console.error("Failed to deliver gift card after activation:", e);
  }
}
  // If gift card has a send_date in the past or null, deliver now
  try {
    const { data: gc } = await supabaseAdmin
      .from("gift_cards")
      .select("id, code, send_date, recipient_email, recipient_phone, delivery_methods, recipient_name, sender_name, message, is_anonymous")
      .eq("merchant_ref", reference)
      .single();

    if (gc) {
      const sendDate = gc.send_date ? new Date(gc.send_date) : null;
      const now = new Date();
      const shouldDeliverNow = !sendDate || sendDate <= now;

      if (shouldDeliverNow) {
        const methods = Array.isArray(gc.delivery_methods) && gc.delivery_methods.length ? gc.delivery_methods : [];

        if (methods.length === 0) {
          if (gc.recipient_email) methods.push("email");
          if (gc.recipient_phone) methods.push("sms", "whatsapp");
        }

        if (methods.length > 0) {
          await deliverGiftCard({
            code: gc.code,
            recipientEmail: gc.recipient_email,
            recipientPhone: gc.recipient_phone,
            recipientName: gc.recipient_name,
            senderName: gc.sender_name,
            message: gc.message,
            alias: gc.is_anonymous ? gc.sender_name : null,
            methods,
          });
          // mark sent_at
          await supabaseAdmin
            .from("gift_cards")
            .update({ sent_at: new Date().toISOString() })
            .eq("id", gc.id);
        }
      }
    }
  } catch (e) {
    console.error("IPN: error delivering gift card:", e);
  }

async function handleGiftCardFailure(reference: string) {
  const cardId = reference.replace("giftcard-", "");
  await supabaseAdmin
    .from("gift_cards")
    .update({ status: "failed" })
    .eq("id", cardId)
    .eq("status", "pending_payment");
}

async function handleOrderPayment(
  orderId: string,
  receiptNumber: string | undefined
) {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status: "processing",
      mpesa_receipt_number: receiptNumber ?? null,
    })
    .eq("id", orderId)
    .in("status", ["pending_payment", "pending"]);

  if (error) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("user_id, total_amount, points_redeemed, gift_card_code, gift_card_discount")
    .eq("id", orderId)
    .single();

  if (!order?.user_id) return;

  // Redeem gift card AFTER payment is confirmed (prevents balance loss on abandoned checkouts)
  if (order.gift_card_code && order.gift_card_discount && Number(order.gift_card_discount) > 0) {
    try {
      const { data: card } = await supabaseAdmin
        .from("gift_cards")
        .select("id, balance")
        .eq("code", (order.gift_card_code as string).toUpperCase())
        .eq("status", "active")
        .single();

      if (card && Number(card.balance) >= Number(order.gift_card_discount)) {
        const redeemAmount = Math.min(Number(order.gift_card_discount), Number(card.balance));
        await supabaseAdmin
          .from("gift_cards")
          .update({ balance: Number(card.balance) - redeemAmount })
          .eq("id", card.id)
          .gte("balance", redeemAmount);

        await supabaseAdmin.from("gift_card_redemptions").insert({
          gift_card_id: card.id,
          order_id: orderId,
          amount: redeemAmount,
        });
      }
    } catch { /* gift card redemption best-effort */ }
  }

  const points = Math.floor(Number(order.total_amount) / 10);
  if (points > 0) {
    await supabaseAdmin.from("loyalty_points").insert({
      user_id: order.user_id,
      points,
      source: "order_earned",
      order_id: orderId,
    });
  }

  const redeemed = Number((order as { points_redeemed?: number }).points_redeemed ?? 0);
  if (redeemed > 0) {
    await supabaseAdmin.from("loyalty_points").insert({
      user_id: order.user_id,
      points: redeemed,
      source: "redeemed",
      order_id: orderId,
    });
  }

  const { data: referral } = await supabaseAdmin
    .from("referrals")
    .select("id, referrer_id")
    .eq("referred_user_id", order.user_id)
    .eq("status", "pending")
    .maybeSingle();

  if (referral) {
    if (Number(order.total_amount) < CONVERSION_MIN_ORDER_KSH) {
      return;
    }

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const { count: monthConversions } = await supabaseAdmin
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", referral.referrer_id)
      .eq("status", "converted")
      .gte("converted_at", monthStart.toISOString());

    if ((monthConversions ?? 0) >= MONTHLY_CONVERSION_CAP) return;

    await supabaseAdmin
      .from("referrals")
      .update({
        status: "converted",
        converted_at: new Date().toISOString(),
        first_order_id: orderId,
        referrer_bonus_credited: true,
      })
      .eq("id", referral.id);

    await supabaseAdmin.from("loyalty_points").insert([
      {
        user_id: referral.referrer_id,
        points: REFERRAL_BONUS_POINTS,
        source: "referral_bonus",
        order_id: orderId,
      },
      {
        user_id: order.user_id,
        points: REFERRAL_BONUS_POINTS,
        source: "referral_first_order",
        order_id: orderId,
      },
    ]);
  }
}

async function handleOrderFailure(orderId: string) {
  await supabaseAdmin
    .from("orders")
    .update({ status: "failed" })
    .eq("id", orderId)
    .in("status", ["pending_payment", "pending"]);
}

async function handlePoolPayment(
  reference: string,
  receiptNumber: string | undefined
) {
  const contributionId = reference.replace("pool-", "");

  const { data: contribution } = await supabaseAdmin
    .from("pool_contributions")
    .update({
      is_verified: true,
      mpesa_receipt_number: receiptNumber ?? null,
    })
    .eq("id", contributionId)
    .select("amount, pool_id")
    .single();

  if (contribution) {
    const { data: verifiedContribs } = await supabaseAdmin
      .from("pool_contributions")
      .select("amount")
      .eq("pool_id", contribution.pool_id)
      .eq("is_verified", true);

    const recomputedBalance = (verifiedContribs ?? []).reduce(
      (sum, c) => sum + Number(c.amount),
      0
    );

    const { data: pool } = await supabaseAdmin
      .from("group_gifting_pools")
      .select("target_amount")
      .eq("id", contribution.pool_id)
      .single();

    if (pool !== null) {
      const updates: Record<string, unknown> = { current_balance: recomputedBalance };
      if (recomputedBalance >= Number(pool.target_amount)) {
        updates.status = "completed";
      }
      await supabaseAdmin
        .from("group_gifting_pools")
        .update(updates)
        .eq("id", contribution.pool_id);
    }
  }
}

async function handlePoolFailure(reference: string) {
  const contributionId = reference.replace("pool-", "");
  await supabaseAdmin
    .from("pool_contributions")
    .delete()
    .eq("id", contributionId);
}
