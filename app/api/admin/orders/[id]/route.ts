import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { reverseGiftCardRedemption } from "@/lib/gift-cards";
import { refundPayment } from "@/lib/payment";

type PaymentOutcome =
  | { state: "completed"; message: string }
  | { state: "failed" | "not_supported" | "skipped"; message: string };

/**
 * Returns the money to the customer through PesaPal.
 *
 * PesaPal allows a single refund per payment, and mobile payments can only be
 * refunded in full — so a basket paid as one `multi-` payment cannot have one
 * order's worth returned on its own. Those are reported as unsupported rather
 * than attempted, because a partial request would be rejected and would burn
 * the one refund the payment is allowed.
 *
 * The gift card credit is deliberately independent of this: cancelling an order
 * should return the card balance whether or not the money move succeeded, and a
 * failed refund is reported to the admin rather than silently swallowed.
 */
async function refundOrderPayment(
  orderId: string,
  status: string
): Promise<PaymentOutcome> {
  const record = async (
    state: PaymentOutcome["state"],
    message: string
  ): Promise<PaymentOutcome> => {
    await supabase
      .from("orders")
      .update({
        refund_status: state,
        refund_message: message.slice(0, 300),
        ...(state === "completed" ? { refunded_at: new Date().toISOString() } : {}),
      })
      .eq("id", orderId);
    return { state, message };
  };

  const { data: order } = await supabase
    .from("orders")
    .select("total_amount, pesapal_tracking_id, refund_status")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { state: "skipped", message: "Order not found" };

  if (order.refund_status === "completed") {
    return { state: "skipped", message: "Already refunded" };
  }

  if (!order.pesapal_tracking_id) {
    return record(
      "not_supported",
      "No PesaPal tracking id on this order, so it cannot be refunded automatically. Reconcile manually."
    );
  }

  // One payment can cover a whole basket. PesaPal refunds mobile payments in
  // full or not at all, so returning a single order's worth would be rejected
  // and would use up the payment's only refund.
  const { data: sharing } = await supabase
    .from("orders")
    .select("id")
    .eq("pesapal_tracking_id", order.pesapal_tracking_id)
    .neq("id", orderId);
  if (sharing && sharing.length > 0) {
    return record(
      "not_supported",
      `This order shares one payment with ${sharing.length} other ` +
        `order${sharing.length === 1 ? "" : "s"}. PesaPal refunds that payment in full, ` +
        `so reverse the whole basket rather than this order alone.`
    );
  }

  const amount = Number(order.total_amount);
  if (!(amount > 0)) {
    return record("not_supported", "Order total is zero; nothing to refund.");
  }

  try {
    const result = await refundPayment(
      order.pesapal_tracking_id,
      amount,
      "touchgift-admin",
      `Order ${orderId.slice(0, 8)} ${status}`
    );

    if (result.success) {
      console.log(`[admin] PesaPal refund submitted for order ${orderId}: ${amount}`);
      return await record("completed", result.message);
    }

    console.error(`[admin] PesaPal refund rejected for order ${orderId}: ${result.message}`);
    return await record("failed", result.message);
  } catch (e: any) {
    console.error(`[admin] PesaPal refund error for order ${orderId}:`, e);
    return await record("failed", e?.message ?? "Refund request failed");
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/orders/[id] — fetch single order
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, products(name, image_url)")
    .eq("id", params.id)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

// PATCH /api/admin/orders/[id] — update order status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json();

  const validStatuses = [
    "pending_payment",
    "processing",
    "wrapped",
    "dispatched",
    "delivered",
    "failed",
    "cancelled",
    "refunded",
  ];

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { data: previous, error: previousError } = await supabase
    .from("orders")
    .select("status, gift_card_code")
    .eq("id", params.id)
    .maybeSingle();

  if (previousError) {
    return NextResponse.json({ error: previousError.message }, { status: 500 });
  }
  if (!previous) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // An order that reverses must give back any gift card value it consumed,
  // otherwise the customer loses the balance for goods they never received.
  const isReversal = status === "refunded" || status === "cancelled" || status === "failed";
  let restored = 0;
  let payment: PaymentOutcome | undefined;

  if (isReversal) {
    const result = await reverseGiftCardRedemption(params.id, `order ${status}`);
    restored = result.restored;

    if (result.restored > 0) {
      console.log(
        `[admin] order ${params.id} -> ${status}: restored ${result.restored} to ` +
          `gift card ${previous.gift_card_code ?? "unknown"} (balance ${result.balance})`
      );
    } else {
      console.log(
        `[admin] order ${params.id} -> ${status}: no gift card to restore (${result.reason})`
      );
    }

    payment = await refundOrderPayment(params.id, status);
  }

  return NextResponse.json({ success: true, giftCardRestored: restored, payment });
}
