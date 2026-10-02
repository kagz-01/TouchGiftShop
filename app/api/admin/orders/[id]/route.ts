import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-auth";
import { reverseGiftCardRedemption } from "@/lib/gift-cards";

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
  }

  return NextResponse.json({ success: true, giftCardRestored: restored });
}
