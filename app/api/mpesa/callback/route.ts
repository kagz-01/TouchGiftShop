import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/mpesa/callback — Tuma calls this once the STK push
// resolves (paid, cancelled, or timed out).
//
// Tuma callback payload (flat structure):
// {
//   "status": "completed" | "failed" | "cancelled",
//   "checkout_request_id": "ws_CO_...",
//   "merchant_request_id": "...",
//   "result_code": 0,
//   "result_desc": "...",
//   "mpesa_receipt_number": "ABC123DEF",
//   "amount": 100
// }
//
// Handles both:
//   1. Order payments
//   2. Pool contributions

export async function POST(req: Request) {
  const payload = await req.json();

  const checkoutRequestId = payload.checkout_request_id;
  if (!checkoutRequestId) {
    console.error("Malformed Tuma callback payload", payload);
    return NextResponse.json({ success: true, message: "Accepted" });
  }

  const resultCode = payload.result_code;
  const receipt = payload.mpesa_receipt_number;

  // Try to find a matching order first
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id")
    .eq("mpesa_checkout_request_id", checkoutRequestId)
    .maybeSingle();

  if (order) {
    return handleOrderCallback(checkoutRequestId, resultCode, receipt);
  }

  // Try to find a matching pool contribution
  const { data: contribution } = await supabaseAdmin
    .from("pool_contributions")
    .select("id, pool_id")
    .eq("mpesa_checkout_request_id", checkoutRequestId)
    .maybeSingle();

  if (contribution) {
    return handleContributionCallback(
      checkoutRequestId,
      resultCode,
      receipt,
      contribution.pool_id
    );
  }

  console.error(
    "Tuma callback for unknown checkout_request_id:",
    checkoutRequestId
  );
  return NextResponse.json({ success: true, message: "Accepted" });
}

async function handleOrderCallback(
  checkoutRequestId: string,
  resultCode: number,
  receipt: string | undefined
) {
  if (resultCode !== 0) {
    await supabaseAdmin
      .from("orders")
      .update({ status: "failed" })
      .eq("mpesa_checkout_request_id", checkoutRequestId);

    return NextResponse.json({ success: true, message: "Accepted" });
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      status: "processing",
      mpesa_receipt_number: receipt ?? null,
    })
    .eq("mpesa_checkout_request_id", checkoutRequestId);

  if (error) {
    console.error("Failed to update order from Tuma callback:", error);
  }

  return NextResponse.json({ success: true, message: "Accepted" });
}

async function handleContributionCallback(
  checkoutRequestId: string,
  resultCode: number,
  receipt: string | undefined,
  poolId: string
) {
  if (resultCode !== 0) {
    await supabaseAdmin
      .from("pool_contributions")
      .delete()
      .eq("mpesa_checkout_request_id", checkoutRequestId);

    return NextResponse.json({ success: true, message: "Accepted" });
  }

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

      if (newBalance >= pool.target_amount) {
        updates.status = "completed";
      }

      await supabaseAdmin
        .from("group_gifting_pools")
        .update(updates)
        .eq("id", poolId);
    }
  }

  return NextResponse.json({ success: true, message: "Accepted" });
}
