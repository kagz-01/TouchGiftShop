import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/mpesa/callback — Safaricom calls this once the STK push
// resolves (paid, cancelled, or timed out).
//
// Handles both:
//   1. Order payments (AccountReference starts with order id)
//   2. Pool contributions (AccountReference starts with "pool-")
//
// Payload shape (Daraja STK callback):
// { Body: { stkCallback: { CheckoutRequestID, ResultCode, ResultDesc,
//     CallbackMetadata: { Item: [{Name:"MpesaReceiptNumber", Value:...}, ...] } } } }
export async function POST(req: Request) {
  const payload = await req.json();
  const callback = payload?.Body?.stkCallback;

  if (!callback?.CheckoutRequestID) {
    console.error("Malformed M-Pesa callback payload", payload);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Bad payload" });
  }

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

  // Extract receipt number from metadata
  const items: { Name: string; Value: string | number }[] =
    CallbackMetadata?.Item ?? [];
  const receipt = items.find((i) => i.Name === "MpesaReceiptNumber")?.Value;

  // Determine if this is a pool contribution or an order payment
  // Pool contributions use "pool-{slug}" as the AccountReference
  // We stored the checkout_request_id on both orders and pool_contributions

  // Try to find a matching order first
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("mpesa_checkout_request_id", CheckoutRequestID)
    .maybeSingle();

  if (order) {
    return handleOrderCallback(CheckoutRequestID, ResultCode, receipt);
  }

  // Try to find a matching pool contribution
  const { data: contribution } = await supabaseAdmin
    .from("pool_contributions")
    .select("id, pool_id")
    .eq("mpesa_checkout_request_id", CheckoutRequestID)
    .maybeSingle();

  if (contribution) {
    return handleContributionCallback(
      CheckoutRequestID,
      ResultCode,
      receipt,
      contribution.pool_id
    );
  }

  console.error(
    "M-Pesa callback for unknown CheckoutRequestID:",
    CheckoutRequestID
  );
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}

async function handleOrderCallback(
  checkoutRequestId: string,
  resultCode: number,
  receipt: string | number | undefined
) {
  if (resultCode !== 0) {
    await supabaseAdmin
      .from("orders")
      .update({ status: "failed" })
      .eq("mpesa_checkout_request_id", checkoutRequestId);

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status: "processing",
      mpesa_receipt_number: receipt ?? null,
    })
    .eq("mpesa_checkout_request_id", checkoutRequestId);

  if (error) {
    console.error("Failed to update order from M-Pesa callback:", error);
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}

async function handleContributionCallback(
  checkoutRequestId: string,
  resultCode: number,
  receipt: string | number | undefined,
  poolId: string
) {
  if (resultCode !== 0) {
    // Delete the pending contribution on failure
    await supabaseAdmin
      .from("pool_contributions")
      .delete()
      .eq("mpesa_checkout_request_id", checkoutRequestId);

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  // Mark contribution as verified
  const { data: contribution } = await supabaseAdmin
    .from("pool_contributions")
    .update({
      is_verified: true,
      mpesa_receipt_number: receipt ?? null,
    })
    .eq("mpesa_checkout_request_id", checkoutRequestId)
    .select("amount")
    .single();

  if (contribution) {
    // Update pool current_balance
    const { data: pool } = await supabaseAdmin
      .from("group_gifting_pools")
      .select("current_balance, target_amount")
      .eq("id", poolId)
      .single();

    if (pool) {
      const newBalance = pool.current_balance + contribution.amount;
      const updates: Record<string, unknown> = {
        current_balance: newBalance,
      };

      // Auto-complete pool if target reached
      if (newBalance >= pool.target_amount) {
        updates.status = "completed";
      }

      await supabaseAdmin
        .from("group_gifting_pools")
        .update(updates)
        .eq("id", poolId);
    }
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
