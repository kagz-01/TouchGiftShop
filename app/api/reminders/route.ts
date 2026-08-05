import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase-server";

const ReminderInput = z.object({
  recipientName: z.string().min(1).max(100),
  relationship: z.string().optional(),
  occasionDate: z.string(),
  occasionType: z.string().optional(),
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
    .order("occasion_date", { ascending: true });

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

  const { recipientName, relationship, occasionDate, occasionType } =
    parsed.data;

  const { data: reminder, error } = await supabase
    .from("reminders")
    .insert({
      user_id: user.id,
      recipient_name: recipientName,
      relationship: relationship ?? null,
      occasion_date: occasionDate,
      occasion_type: occasionType ?? null,
    })
    .select()
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
