import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { z } from "zod";

export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notifications });
}

const MarkReadInput = z.object({
  id: z.string().uuid().optional(), // If not provided, marks all as read
});

export async function PATCH(request: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const { id } = MarkReadInput.parse(json);

    let query = supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);

    if (id) {
      query = query.eq("id", id);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Invalid input" }, { status: 400 });
  }
}
