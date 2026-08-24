import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/delivery-moments — get public delivery moments
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "20");

  const { data: moments, error } = await supabaseAdmin
    .from("delivery_moments")
    .select(`
      *,
      orders (id, recipient_name, products (name, image_url)),
      auth.users (id, user_metadata)
    `)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ moments: moments ?? [] });
}

// POST /api/delivery-moments — create a delivery moment
export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { orderId, photoUrl, videoUrl, caption, isPublic } = await req.json();

  const { data: moment, error } = await supabaseAdmin
    .from("delivery_moments")
    .insert({
      order_id: orderId || null,
      user_id: user.id,
      photo_url: photoUrl || null,
      video_url: videoUrl || null,
      caption: caption || null,
      is_public: isPublic ?? false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ moment });
}
