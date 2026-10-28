import { supabaseAdmin } from "@/lib/supabase";
import { deliverGiftCard } from "@/lib/notifications";
import { settlePoolContribution } from "@/lib/pool-money";
import {
  REFERRAL_BONUS_POINTS,
  CONVERSION_MIN_ORDER_KSH,
  MONTHLY_CONVERSION_CAP,
} from "@/lib/points";
import { getLoyaltyTier } from "@/lib/loyalty";

export interface SettlementResult {
  merchantReference: string;
  receiptNumber?: string;
  amount?: number;
}

export async function processSuccessfulPayment(data: SettlementResult): Promise<void> {
  const { merchantReference, receiptNumber, amount } = data;

  if (merchantReference.startsWith("giftcard-")) {
    await handleGiftCardPayment(merchantReference, receiptNumber);
  } else if (merchantReference.startsWith("pool-")) {
    await handlePoolPayment(merchantReference, { status: "completed", receiptNumber, amount });
  } else if (merchantReference.startsWith("corp-")) {
    await handleCorporateOrderPayment(merchantReference.replace("corp-", ""), receiptNumber);
  } else if (merchantReference.startsWith("multi-")) {
    const orderIds = merchantReference.replace("multi-", "").split(",");
    for (const oid of orderIds) {
      await handleOrderPayment(oid.trim(), receiptNumber);
    }
  } else {
    await handleOrderPayment(merchantReference, receiptNumber);
  }
}

export async function processFailedPayment(merchantReference: string): Promise<void> {
  if (merchantReference.startsWith("giftcard-")) {
    await handleGiftCardFailure(merchantReference);
  } else if (merchantReference.startsWith("pool-")) {
    await handlePoolFailure(merchantReference);
  } else if (merchantReference.startsWith("corp-")) {
    await handleCorporateOrderFailure(merchantReference.replace("corp-", ""));
  } else if (merchantReference.startsWith("multi-")) {
    const orderIds = merchantReference.replace("multi-", "").split(",");
    for (const oid of orderIds) {
      await handleOrderFailure(oid.trim());
    }
  } else {
    await handleOrderFailure(merchantReference);
  }
}

export async function handleGiftCardPayment(
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

export async function handleGiftCardFailure(reference: string) {
  const cardId = reference.replace("giftcard-", "");
  await supabaseAdmin
    .from("gift_cards")
    .update({ status: "failed" })
    .eq("id", cardId)
    .eq("status", "pending_payment");
}

/**
 * Deducts a gift card balance after payment is confirmed.
 */
export async function redeemGiftCardBalance(
  code: string,
  orderId: string,
  requestedAmount: number
): Promise<{ ok: boolean; redeemed: number; remaining: number; reason?: string }> {
  const fail = (reason: string) => ({ ok: false, redeemed: 0, remaining: 0, reason });

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: card, error: fetchError } = await supabaseAdmin
      .from("gift_cards")
      .select("id, code, balance, status, expires_at")
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (fetchError) return fail(fetchError.message);
    if (!card) return fail("Gift card not found");
    if (card.status !== "active") return fail(`Gift card is ${card.status}`);
    if (card.expires_at && new Date(card.expires_at) < new Date()) {
      return fail("Gift card has expired");
    }

    const balance = Number(card.balance);
    const redeemAmount = Math.min(requestedAmount, balance);
    if (redeemAmount <= 0) return fail("Gift card has no balance");

    // Optimistic lock: only applies while the balance is still what we read.
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("gift_cards")
      .update({ balance: balance - redeemAmount })
      .eq("id", card.id)
      .eq("balance", balance)
      .gte("balance", redeemAmount)
      .select("id, balance")
      .maybeSingle();

    if (updateError) return fail(updateError.message);
    if (!updated) continue; // balance moved under us — re-read and retry

    const remaining = Number(updated.balance);

    const { error: logError } = await supabaseAdmin.from("gift_card_redemptions").insert({
      gift_card_id: card.id,
      order_id: orderId,
      amount: redeemAmount,
    });
    if (logError) {
      console.error(
        `[gift-cards] redemption of ${code} for order ${orderId} was deducted ` +
          `(${redeemAmount}) but NOT logged to gift_card_redemptions:`,
        logError.message
      );
    }

    return { ok: true, redeemed: redeemAmount, remaining };
  }

  return fail("Could not deduct balance (concurrent redemption)");
}

export async function handleCorporateOrderPayment(
  corporateOrderId: string,
  receiptNumber: string | undefined
) {
  if (!/^[0-9a-f-]{36}$/i.test(corporateOrderId)) {
    console.error(`[payment-settlement] malformed corporate order reference: ${corporateOrderId}`);
    return;
  }

  const { data: parent, error: parentErr } = await supabaseAdmin
    .from("corporate_orders")
    .update({ status: "processing" })
    .eq("id", corporateOrderId)
    .in("status", ["draft", "pending_payment"])
    .select("id")
    .maybeSingle();

  if (parentErr) {
    console.error(`[payment-settlement] corporate order update failed (${corporateOrderId}):`, parentErr.message);
    return;
  }
  if (!parent) {
    console.log(`[payment-settlement] corporate order ${corporateOrderId} already past pending`);
  }

  const { error: childErr } = await supabaseAdmin
    .from("orders")
    .update({
      status: "processing",
      mpesa_receipt_number: receiptNumber ?? null,
    })
    .eq("corporate_order_id", corporateOrderId)
    .in("status", ["pending_payment"]);

  if (childErr) {
    console.error(`[payment-settlement] corporate fulfilment rows failed (${corporateOrderId}):`, childErr.message);
  }
}

export async function handleCorporateOrderFailure(corporateOrderId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(corporateOrderId)) return;

  await supabaseAdmin
    .from("corporate_orders")
    .update({ status: "cancelled", notes: "Payment failed" })
    .eq("id", corporateOrderId)
    .in("status", ["draft", "pending_payment"]);

  await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("corporate_order_id", corporateOrderId)
    .in("status", ["pending_payment"]);
}

export async function handleOrderPayment(
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
    .in("status", ["pending_payment"]);

  if (error) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("user_id, total_amount, points_redeemed, gift_card_code, gift_card_discount")
    .eq("id", orderId)
    .single();

  if (!order) return;

  if (order.gift_card_code && Number(order.gift_card_discount) > 0) {
    const result = await redeemGiftCardBalance(
      order.gift_card_code as string,
      orderId,
      Number(order.gift_card_discount)
    );

    if (!result.ok) {
      console.error(
        `[gift-cards] FAILED to debit ${order.gift_card_code} for order ${orderId} ` +
          `(discount ${order.gift_card_discount}): ${result.reason}`
      );
    } else {
      console.log(
        `[gift-cards] debited ${result.redeemed} from ${order.gift_card_code} ` +
          `for order ${orderId}; remaining ${result.remaining}`
      );
    }
  }

  if (!order.user_id) return;

  const { data: pastOrders } = await supabaseAdmin
    .from("orders")
    .select("total_amount")
    .eq("user_id", order.user_id)
    .eq("status", "PAID");

  const totalOrders = pastOrders?.length ?? 0;
  const totalSpend = (pastOrders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

  const tier = getLoyaltyTier(totalOrders, totalSpend);

  const points = Math.floor((Number(order.total_amount) / 10) * tier.pointsMultiplier);
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

export async function handleOrderFailure(orderId: string) {
  await supabaseAdmin
    .from("orders")
    .update({ status: "failed" })
    .eq("id", orderId)
    .in("status", ["pending_payment"]);
}

export async function handlePoolPayment(
  reference: string,
  psp: { status: string; receiptNumber?: string; amount?: number }
) {
  const contributionId = reference.replace("pool-", "");

  const result = await settlePoolContribution(contributionId, {
    trusted: { paidAmount: psp.amount ?? null, receiptNumber: psp.receiptNumber ?? null },
  });

  if (!result.ok) {
    console.error(`[payment-settlement] pool contribution ${contributionId} not settled:`, result.reason, result.detail ?? "");
  } else if (result.mismatch) {
    console.error(`[payment-settlement] pool contribution ${contributionId} settled with an amount mismatch`);
  }
}

export async function handlePoolFailure(reference: string) {
  const contributionId = reference.replace("pool-", "");
  await supabaseAdmin
    .from("pool_contributions")
    .delete()
    .eq("id", contributionId);
}

