import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/orders/[id]/recipient — generate a secure token for recipient view
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { recipientPhone } = await req.json();

  if (!recipientPhone) {
    return NextResponse.json({ error: "recipientPhone required" }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, recipient_phone, recipient_name")
    .eq("id", params.id)
    .eq("recipient_phone", recipientPhone)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found for this phone number" }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("hex");

  const { error: updateError } = await supabase
    .from("orders")
    .update({ pin_drop_token: token })
    .eq("id", params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ token, orderId: order.id });
}

// GET /api/orders/[id]/recipient?token=... — fetch order for recipient view
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, recipient_name, is_anonymous, status, gift_note, pre_dispatch_photo_url, recipient_pin_requested, delivery_time_window, created_at, total_amount")
    .eq("id", params.id)
    .eq("pin_drop_token", token)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  // Build recipient-safe response — strip sensitive data based on anonymous mode
  const recipientView = {
    orderId: order.id,
    recipientName: order.recipient_name,
    status: order.status,
    giftNote: order.gift_note,
    preDispatchPhotoUrl: order.pre_dispatch_photo_url,
    pinDropRequested: order.recipient_pin_requested,
    deliveryTimeWindow: order.delivery_time_window,
    createdAt: order.created_at,
    // Only show sender info and price if NOT anonymous
    senderName: order.is_anonymous ? null : undefined,
    amount: order.is_anonymous ? null : order.total_amount,
    isAnonymous: order.is_anonymous,
  };

  return NextResponse.json(recipientView);
}
