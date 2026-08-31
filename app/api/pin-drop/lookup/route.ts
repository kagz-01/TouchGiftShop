import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/pin-drop/lookup?phone=... — find pin-drop orders by recipient phone
// Does NOT expose tokens — only returns order status.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  const normalized = phone.replace(/[\s\-+]/g, "");

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, recipient_name, delivery_lat, recipient_pin_requested, created_at")
    .or(`recipient_phone.eq.${normalized},recipient_phone.eq.+${normalized},recipient_phone.eq.254${normalized.slice(1)}`)
    .eq("recipient_pin_requested", true)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: "Failed to lookup orders" }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ error: "No pin-drop orders found for this number." }, { status: 404 });
  }

  const result = orders.map((o) => ({
    id: o.id,
    recipient_name: o.recipient_name,
    already_pinned: o.delivery_lat !== null,
  }));

  return NextResponse.json({ orders: result });
}
