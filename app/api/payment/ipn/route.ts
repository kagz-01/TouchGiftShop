import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTransactionStatus } from "@/lib/payment";

// POST /api/payment/ipn — PesaPal sends IPN (Instant Payment Notification)
// when a transaction status changes.

export async function POST(req: Request) {
  const payload = await req.json();

  const orderTrackingId = payload.order_tracking_id;
  if (!orderTrackingId) {
    console.error("Malformed PesaPal IPN payload", payload);
    return NextResponse.json({ success: true });
  }

  let status;
  try {
    status = await getTransactionStatus(orderTrackingId);
  } catch (err) {
    console.error("Failed to query PesaPal status:", err);
    return NextResponse.json({ success: true });
  }

  const merchantReference = payload.order_merchant_reference || "";

  if (status.status === "completed") {
    if (merchantReference.startsWith("giftcard-")) {
      await handleGiftCardPayment(merchantReference, status.receiptNumber);
    } else if (merchantReference.startsWith("pool-")) {
      await handlePoolPayment(merchantReference, status.receiptNumber);
    } else if (merchantReference.startsWith("multi-")) {
      // Multi-item cart order
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
    .select("initial_amount")
    .eq("id", cardId)
    .single();

  if (!card) {
    console.error("Gift card not found for IPN:", cardId);
    return;
  }

  const { error } = await supabaseAdmin
    .from("gift_cards")
    .update({ status: "active", balance: card.initial_amount })
    .eq("id", cardId)
    .eq("status", "pending_payment");

  if (error) {
    console.error("Failed to activate gift card from IPN:", error);
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

  if (error) {
    console.error("Failed to update order from IPN:", error);
    return;
  }

  // Fetch order details for loyalty + referral processing
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("user_id, total_amount")
    .eq("id", orderId)
    .single();

  if (!order?.user_id) return;

  // ── Loyalty points: earn 1 point per KSh 10 spent ──
  const points = Math.floor(Number(order.total_amount) / 10);
  if (points > 0) {
    await supabaseAdmin.from("loyalty_points").insert({
      user_id: order.user_id,
      points,
      source: "order_earned",
      order_id: orderId,
    });
  }

  // ── Referral conversion: credit referrer on referred user's first order ──
  const { data: referral } = await supabaseAdmin
    .from("referrals")
    .select("id, referrer_id")
    .eq("referred_user_id", order.user_id)
    .eq("status", "pending")
    .maybeSingle();

  if (referral) {
    // Mark referral as converted
    await supabaseAdmin
      .from("referrals")
      .update({
        status: "converted",
        converted_at: new Date().toISOString(),
        first_order_id: orderId,
        referrer_bonus_credited: true,
      })
      .eq("id", referral.id);

    // Credit referrer with KSh 500
    await supabaseAdmin.from("referral_credits").insert({
      user_id: referral.referrer_id,
      amount: 500.00,
      source: "referral_conversion",
      referral_id: referral.id,
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Also credit the referred user with KSh 500 (their signup bonus was already given, this is their first-order bonus)
    await supabaseAdmin.from("referral_credits").insert({
      user_id: order.user_id,
      amount: 500.00,
      source: "referral_first_order",
      referral_id: referral.id,
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    });
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
