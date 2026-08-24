import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";

function requireAdmin() {
  const cookieStore = cookies();
  const session = cookieStore.get("tg_admin_session")?.value;
  if (!session || session !== process.env.ADMIN_API_KEY) {
    return false;
  }
  return true;
}

// GET /api/admin/bundles
export async function GET() {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("hamper_bundles")
    .select("*, hamper_bundle_items(product_name, quantity)")
    .order("sort_order", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bundles: data ?? [] });
}

// POST /api/admin/bundles
export async function POST(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, slug, description, image_url, regular_price, bundle_price, category, occasions, item_count, is_active, is_featured } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug required" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("hamper_bundles")
    .insert({
      name,
      slug,
      description: description || "",
      image_url: image_url || null,
      regular_price,
      bundle_price,
      category: category || "general",
      occasions: occasions || [],
      item_count: item_count ?? 0,
      is_active: is_active ?? true,
      is_featured: is_featured ?? false,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bundle: data }, { status: 201 });
}

// DELETE /api/admin/bundles?id=...
export async function DELETE(req: Request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Bundle ID required" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("hamper_bundles")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}