import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/orders/[id]/dispatch — assign rider, generate rider_token, set status to dispatched
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { adminKey } = await req.json();

  if (adminKey !== process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check order exists and is in a dispatchable state
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, status, rider_token")
    .eq("id", params.id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.status === "delivered") {
    return NextResponse.json({ error: "Order already delivered" }, { status: 400 });
  }

  // Generate rider token (or reuse existing)
  const riderToken = order.rider_token || `rider_${crypto.randomBytes(24).toString("hex")}`;

  // Update order: set status to dispatched + assign rider token
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "dispatched",
      rider_token: riderToken,
    })
    .eq("id", params.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://touch-gift-shop.vercel.app";
  const riderUrl = `${siteUrl}/rider?orderId=${params.id}&token=${riderToken}`;

  return NextResponse.json({
    success: true,
    riderToken,
    riderUrl,
    orderId: params.id,
  });
}
