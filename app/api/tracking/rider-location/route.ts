import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const InputSchema = z.object({
  orderId: z.string().uuid(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  token: z.string().min(1), // rider auth token or admin key
});

// POST /api/tracking/rider-location — rider updates their GPS position
export async function POST(req: Request) {
  const body = await req.json();
  const parsed = InputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { orderId, lat, lng, token } = parsed.data;

  // Verify the rider is assigned to this order
  // Token can be: admin API key, or a rider-specific token
  const isValidToken =
    token === process.env.RIDER_API_KEY ||
    token === process.env.ADMIN_API_KEY;

  if (!isValidToken) {
    // Also check if token matches the order's pin_drop_token (rider access)
    const { data: order } = await supabase
      .from("orders")
      .select("id, pin_drop_token")
      .eq("id", orderId)
      .single();

    if (!order || order.pin_drop_token !== token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { error } = await supabase
    .from("orders")
    .update({
      rider_lat: lat,
      rider_lng: lng,
      rider_updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Broadcast via Supabase Realtime
  const channel = supabase.channel(`rider-location:${orderId}`);
  await channel.send({
    type: "broadcast",
    event: "rider-moved",
    payload: { lat, lng, timestamp: Date.now() },
  });

  return NextResponse.json({ success: true });
}
