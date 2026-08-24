import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/delivery-slots/book — book a delivery slot for an order
export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { slotId, deliveryDate, orderId } = await req.json();

  if (!slotId || !deliveryDate || !orderId) {
    return NextResponse.json(
      { error: "slotId, deliveryDate, and orderId are required" },
      { status: 400 }
    );
  }

  // Check slot exists and is active
  const { data: slot } = await supabaseAdmin
    .from("delivery_slots")
    .select("id, max_orders_per_day, slot_name")
    .eq("id", slotId)
    .eq("is_active", true)
    .single();

  if (!slot) {
    return NextResponse.json({ error: "Delivery slot not found or inactive" }, { status: 404 });
  }

  // Check availability
  const { count } = await supabaseAdmin
    .from("delivery_slot_bookings")
    .select("id", { count: "exact", head: true })
    .eq("slot_id", slotId)
    .eq("delivery_date", deliveryDate);

  if (count !== null && count >= slot.max_orders_per_day) {
    return NextResponse.json(
      { error: `Slot "${slot.slot_name}" is full for ${deliveryDate}` },
      { status: 409 }
    );
  }

  // Create booking
  const { data: booking, error } = await supabaseAdmin
    .from("delivery_slot_bookings")
    .insert({
      slot_id: slotId,
      order_id: orderId,
      delivery_date: deliveryDate,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Update the order with the delivery time window
  await supabaseAdmin
    .from("orders")
    .update({ delivery_time_window: `${slot.slot_name} (${deliveryDate})` })
    .eq("id", orderId);

  return NextResponse.json({ booking, slotName: slot.slot_name });
}
