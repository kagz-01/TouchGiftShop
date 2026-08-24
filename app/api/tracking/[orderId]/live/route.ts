import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/tracking/[orderId]/live?token=... — fetch rider location + delivery pin
export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, status, rider_lat, rider_lng, rider_updated_at, delivery_lat, delivery_lng, delivery_landmark, delivery_time_window, recipient_name"
    )
    .eq("id", params.orderId)
    .eq("track_token", token)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  const riderLocation =
    order.rider_lat != null && order.rider_lng != null
      ? {
          lat: Number(order.rider_lat),
          lng: Number(order.rider_lng),
          updatedAt: order.rider_updated_at,
        }
      : null;

  const deliveryPin =
    order.delivery_lat != null && order.delivery_lng != null
      ? {
          lat: Number(order.delivery_lat),
          lng: Number(order.delivery_lng),
          landmark: order.delivery_landmark,
        }
      : null;

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    recipientName: order.recipient_name,
    timeWindow: order.delivery_time_window,
    riderLocation,
    deliveryPin,
  });
}
