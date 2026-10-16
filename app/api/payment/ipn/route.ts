import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTransactionStatus } from "@/lib/payment";
import { deliverGiftCard, sendPoolMilestoneAlert } from "@/lib/notifications";
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
    } else if (merchantReference.startsWith("corp-")) {
      await handleCorporateOrderPayment(merchantReference.replace("corp-", ""), status.receiptNumber);
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
    } else if (merchantReference.startsWith("corp-")) {
      await handleCorporateOrderPayment(merchantReference.replace("corp-", ""), status.receiptNumber);
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

async function handleGiftCardFailure(reference: string) {
  const cardId = reference.replace("giftcard-", "");
  await supabaseAdmin
    .from("gift_cards")
    .update({ status: "failed" })
    .eq("id", cardId)
    .eq("status", "pending_payment");
}

/**
 * Deducts a gift card balance after payment is confirmed.
 *
 * Runs for guest orders too — it depends only on the order, never on the user.
 * Uses an optimistic compare-and-set (`.eq("balance", <value we read>)`) plus a
 * `.gte()` floor so two concurrent orders can never overdraw the same card,
 * and re-reads with `.select()` so a deduction that matched zero rows is
 * reported as a failure instead of silently vanishing.
 */
async function redeemGiftCardBalance(
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

    // Audit trail. A failure here must not undo a completed deduction, but it
    // has to be visible rather than swallowed.
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

/**
 * `orders.status` is an enum (`pending_payment, processing, wrapped, dispatched,
 * delivered, failed, refunded, cancelled`). Every filter here used to include
 * "pending" as well, which is not a member of it — so the UPDATE was rejected
 * wholesale with `invalid input value for enum order_status_enum: "pending"`,
 * the error was swallowed by an early `return`, and **no order ever moved off
 * pending_payment when payment completed.** The parent and its children now
 * filter on the one state that actually means "not paid yet".
 */

/**
 * A corporate order is paid as ONE transaction covering a parent
 * `corporate_orders` row and every fulfilment `orders` row under it.
 *
 * Both corporate intake routes used to send references this handler could not
 * route — "CORP-xxxxxxxx-TIMESTAMP" and a bare corporate_orders uuid both fell
 * through to the consumer branch, which updated `orders` by that id and matched
 * nothing. With bank transfer removed, PesaPal is the only way money arrives,
 * so a paid corporate order would have sat at pending_payment forever.
 */
async function handleCorporateOrderPayment(
  corporateOrderId: string,
  receiptNumber: string | undefined
) {
  if (!/^[0-9a-f-]{36}$/i.test(corporateOrderId)) {
    console.error(`[ipn] malformed corporate order reference: ${corporateOrderId}`);
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
    console.error(`[ipn] corporate order update failed (${corporateOrderId}):`, parentErr.message);
    return;
  }
  if (!parent) {
    // Already handled, or never existed. Either way there is nothing left to do
    // and re-running must not be destructive — PesaPal retries IPNs.
    console.log(`[ipn] corporate order ${corporateOrderId} already past pending`);
  }

  /* The child rows are what fulfilment works from, so they move with the parent.
     Scoped to pending states so a retry cannot knock an order that is already
     wrapped back into production. */
  const { error: childErr } = await supabaseAdmin
    .from("orders")
    .update({
      status: "processing",
      mpesa_receipt_number: receiptNumber ?? null,
    })
    .eq("corporate_order_id", corporateOrderId)
    .in("status", ["pending_payment"]);

  if (childErr) {
    console.error(`[ipn] corporate fulfilment rows failed (${corporateOrderId}):`, childErr.message);
  }
}

async function handleCorporateOrderFailure(corporateOrderId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(corporateOrderId)) return;

  await supabaseAdmin
    .from("corporate_orders")
    .update({ status: "cancelled", notes: "Payment failed at PesaPal" })
    .eq("id", corporateOrderId)
    .in("status", ["draft", "pending_payment"]);

  await supabaseAdmin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("corporate_order_id", corporateOrderId)
    .in("status", ["pending_payment"]);
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
    .in("status", ["pending_payment"]);

  if (error) return;

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("user_id, total_amount, points_redeemed, gift_card_code, gift_card_discount")
    .eq("id", orderId)
    .single();

  if (!order) return;

  // Redeem gift card AFTER payment is confirmed (prevents balance loss on
  // abandoned checkouts). This deliberately runs before the user_id guard:
  // guest orders are real orders and their discount was already applied to the
  // total, so skipping them let a single card be redeemed repeatedly.
  if (order.gift_card_code && Number(order.gift_card_discount) > 0) {
    const result = await redeemGiftCardBalance(
      order.gift_card_code as string,
      orderId,
      Number(order.gift_card_discount)
    );

    if (!result.ok) {
      // The customer received a discount that we could not debit. Surface it
      // loudly so it can be reconciled rather than quietly lost.
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

  // Everything below this point is members-only.
  if (!order.user_id) return;

  const { data: pastOrders } = await supabaseAdmin
    .from("orders")
    .select("total_amount")
    .eq("user_id", order.user_id)
    .eq("status", "PAID");

  const totalOrders = pastOrders?.length ?? 0;
  const totalSpend = (pastOrders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);

  const { getLoyaltyTier } = await import("@/lib/loyalty");
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

async function handleOrderFailure(orderId: string) {
  await supabaseAdmin
    .from("orders")
    .update({ status: "failed" })
    .eq("id", orderId)
    .in("status", ["pending_payment"]);
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
      .select("target_amount, current_balance, title, slug, organizer_id")
      .eq("id", contribution.pool_id)
      .single();

    if (pool !== null) {
      const target = Number(pool.target_amount);
      const prevBalance = Number(pool.current_balance);
      const updates: Record<string, unknown> = { current_balance: recomputedBalance };
      
      if (recomputedBalance >= target) {
        updates.status = "completed";
      }

      await supabaseAdmin
        .from("group_gifting_pools")
        .update(updates)
        .eq("id", contribution.pool_id);

      // Check milestones
      const oldPct = Math.floor((prevBalance / target) * 100);
      const newPct = Math.floor((recomputedBalance / target) * 100);
      const milestones = [25, 50, 75, 100];
      const crossedMilestones = milestones.filter(m => oldPct < m && newPct >= m);

      if (crossedMilestones.length > 0) {
        const highestMilestone = Math.max(...crossedMilestones);
        
        // Fetch organizer info to send alert
        const { data: organizer } = await supabaseAdmin
          .from("users")
          .select("email, phone")
          .eq("id", pool.organizer_id)
          .maybeSingle();

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
        await sendPoolMilestoneAlert({
          poolTitle: pool.title,
          milestonePct: highestMilestone,
          organizerEmail: organizer?.email,
          organizerPhone: organizer?.phone,
          poolUrl: `${siteUrl}/pool/${pool.slug}`,
        }).catch(console.error);
      }
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
