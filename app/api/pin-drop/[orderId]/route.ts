import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/pin-drop/[orderId] — fetch order info for the pin drop page
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
    .select("id, recipient_name, recipient_pin_requested, delivery_lat, delivery_lng, delivery_landmark, delivery_time_window, pin_drop_token")
    .eq("id", params.orderId)
    .eq("pin_drop_token", token)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    recipientName: order.recipient_name,
    alreadyPinned: order.delivery_lat !== null,
    deliveryLat: order.delivery_lat,
    deliveryLng: order.delivery_lng,
    deliveryLandmark: order.delivery_landmark,
    deliveryTimeWindow: order.delivery_time_window,
  });
}

const SavePinInput = z.object({
  token: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  landmark: z.string().max(200).optional(),
  timeWindow: z.string().min(1),
});

// POST /api/pin-drop/[orderId] — save the recipient's pin
export async function POST(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  const body = await req.json();
  const parsed = SavePinInput.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { token, lat, lng, landmark, timeWindow } = parsed.data;

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, pin_drop_token, delivery_lat")
    .eq("id", params.orderId)
    .eq("pin_drop_token", token)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Invalid link" }, { status: 404 });
  }

  // Check if pin was already set — don't allow overwriting
  if (order.delivery_lat) {
    return NextResponse.json({ error: "Delivery location already set" }, { status: 409 });
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      delivery_lat: lat,
      delivery_lng: lng,
      delivery_landmark: landmark || null,
      delivery_time_window: timeWindow,
      pin_drop_token: null, // Invalidate token after use
      pin_drop_token_expires_at: null,
    })
    .eq("id", params.orderId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
