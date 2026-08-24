import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getTransactionStatus } from "@/lib/payment";

// POST /api/payment/ipn — PesaPal sends IPN (Instant Payment Notification)
// when a transaction status changes.
//
// PesaPal IPN payload:
// { order_tracking_id, order_merchant_reference, status }
//
// We query PesaPal for full details, then update our order or pool contribution.

export async function POST(req: Request) {
  const payload = await req.json();

  const orderTrackingId = payload.order_tracking_id;
  if (!orderTrackingId) {
    console.error("Malformed PesaPal IPN payload", payload);
    return NextResponse.json({ success: true });
  }

  // Query PesaPal for full transaction details
  let status;
  try {
    status = await getTransactionStatus(orderTrackingId);
  } catch (err) {
    console.error("Failed to query PesaPal status:", err);
    // Still return 200 so PesaPal doesn't retry aggressively
    return NextResponse.json({ success: true });
  }

  const merchantReference = payload.order_merchant_reference || "";

  if (status.status === "completed") {
    // Check if this is a gift card purchase
    if (merchantReference.startsWith("giftcard-")) {
      await handleGiftCardPayment(merchantReference, status.receiptNumber);
    } else if (merchantReference.startsWith("pool-")) {
      await handlePoolPayment(merchantReference, status.receiptNumber);
    } else {
      await handleOrderPayment(merchantReference, status.receiptNumber);
    }
  } else if (status.status === "failed") {
    if (merchantReference.startsWith("giftcard-")) {
      await handleGiftCardFailure(merchantReference);
    } else if (merchantReference.startsWith("pool-")) {
      await handlePoolFailure(merchantReference);
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

  // Get the card to find the initial_amount
  const { data: card } = await supabaseAdmin
    .from("gift_cards")
    .select("initial_amount")
    .eq("id", cardId)
    .single();

  if (!card) {
    console.error("Gift card not found for IPN:", cardId);
    return;
  }

  // Activate the card — set balance to initial_amount and status to active
  const { error } = await supabaseAdmin
    .from("gift_cards")
    .update({
      status: "active",
      balance: card.initial_amount,
    })
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
  // reference format: "pool-{contributionId}"
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
    // Re-compute the pool balance from ALL verified contributions rather than
    // incrementing by contribution.amount. This makes IPN handling idempotent:
    // if PesaPal fires the same event twice, the balance is the same both times.
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
