import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase-server";

// GET /api/corporate/brand-config — fetch the current user's brand config
export async function GET() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("corporate_brand_configs")
    .select("id, logo_url, brand_color, company_name, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ config: data ?? null });
}

// POST /api/corporate/brand-config — save or update brand config
export async function POST(req: Request) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { logoUrl, brandColor, companyName } = await req.json();

  // Upsert: check if config exists for this user
  const { data: existing } = await supabaseAdmin
    .from("corporate_brand_configs")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from("corporate_brand_configs")
      .update({
        logo_url: logoUrl ?? null,
        brand_color: brandColor ?? "#9B1B5A",
        company_name: companyName ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ config: data });
  }

  const { data, error } = await supabaseAdmin
    .from("corporate_brand_configs")
    .insert({
      user_id: user.id,
      logo_url: logoUrl ?? null,
      brand_color: brandColor ?? "#9B1B5A",
      company_name: companyName ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ config: data });
}
