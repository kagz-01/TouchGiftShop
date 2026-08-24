import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/delivery-slots — get available delivery slots for a date
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const deliveryDate = dateParam || new Date().toISOString().split("T")[0];

  // Get all active slots
  const { data: slots, error } = await supabaseAdmin
    .from("delivery_slots")
    .select("*")
    .eq("is_active", true)
    .order("start_hour", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get bookings for the date
  const { data: bookings } = await supabaseAdmin
    .from("delivery_slot_bookings")
    .select("slot_id")
    .eq("delivery_date", deliveryDate);

  // Count bookings per slot
  const bookingCounts: Record<string, number> = {};
  bookings?.forEach((b) => {
    bookingCounts[b.slot_id] = (bookingCounts[b.slot_id] || 0) + 1;
  });

  // Mark slots as available/full
  const enrichedSlots = (slots ?? []).map((slot) => ({
    id: slot.id,
    name: slot.slot_name,
    key: slot.slot_key,
    description: slot.description,
    startHour: slot.start_hour,
    endHour: slot.end_hour,
    extraFee: Number(slot.extra_fee),
    maxOrders: slot.max_orders_per_day,
    bookedCount: bookingCounts[slot.id] || 0,
    isAvailable: (bookingCounts[slot.id] || 0) < slot.max_orders_per_day,
    remainingSlots: Math.max(0, slot.max_orders_per_day - (bookingCounts[slot.id] || 0)),
  }));

  return NextResponse.json({ date: deliveryDate, slots: enrichedSlots });
}
