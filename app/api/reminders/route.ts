import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase-server";

const ReminderInput = z.object({
  recipientName: z.string().min(1).max(100),
  relationship: z.string().optional(),
  occasionDate: z.string().optional(),
  occasionType: z.string().optional(),
  isSubscription: z.boolean().default(false),
  frequency: z.string().optional(),
  productId: z.string().uuid().optional(),
  deliveryDay: z.string().optional(),
  deliveryAddress: z.string().optional(),
});

// GET /api/reminders — fetch reminders for logged-in user
export async function GET() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: reminders, error } = await supabase
    .from("reminders")
    .select(`
      *,
      products (
        name,
        price,
        image_url
      )
    `)
    .eq("user_id", user.id)
    .order("occasion_date", { ascending: true, nullsFirst: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminders: reminders ?? [] });
}

// POST /api/reminders — create a reminder
export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = ReminderInput.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const { data: reminder, error } = await supabase
    .from("reminders")
    .insert({
      user_id: user.id,
      recipient_name: input.recipientName,
      relationship: input.relationship ?? null,
      occasion_date: input.occasionDate ?? null,
      occasion_type: input.occasionType ?? null,
      is_subscription: input.isSubscription,
      frequency: input.frequency ?? null,
      product_id: input.productId ?? null,
      delivery_day: input.deliveryDay ?? null,
      delivery_address: input.deliveryAddress ?? null,
    })
    .select(`
      *,
      products (
        name,
        price,
        image_url
      )
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reminder });
}

// DELETE /api/reminders?id=xxx — delete a reminder
export async function DELETE(req: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
