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
  productIds: z.array(z.string().uuid()).optional(),
  deliveryDay: z.string().optional(),
  deliveryAddress: z.string().optional(),
  googleMapsLink: z.string().optional(),
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
    .select("*")
    .eq("user_id", user.id)
    .order("occasion_date", { ascending: true, nullsFirst: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Manually fetch products for JSONB product_ids
  const productIds = reminders
    .flatMap((r) => r.product_ids || [])
    .filter(Boolean);

  let productsMap: Record<string, any> = {};
  if (productIds.length > 0) {
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, price, image_url")
      .in("id", productIds);
      
    if (productsData) {
      productsMap = productsData.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {} as Record<string, any>);
    }
  }

  const enrichedReminders = reminders.map(r => {
    if (r.is_subscription && r.product_ids?.length > 0) {
      return {
        ...r,
        products: r.product_ids.map((id: string) => productsMap[id]).filter(Boolean)
      };
    }
    return r;
  });

  return NextResponse.json({ reminders: enrichedReminders });
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
      product_ids: input.productIds ?? [],
      delivery_day: input.deliveryDay ?? null,
      delivery_address: input.deliveryAddress ?? null,
      google_maps_link: input.googleMapsLink ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let enrichedReminder = { ...reminder };
  if (reminder.product_ids?.length > 0) {
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, price, image_url")
      .in("id", reminder.product_ids);
    enrichedReminder.products = productsData ?? [];
  }

  return NextResponse.json({ reminder: enrichedReminder });
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
