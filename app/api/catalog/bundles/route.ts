import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/catalog/bundles?category=liquor&featured=true
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");

  let query = supabaseAdmin
    .from("hamper_bundles")
    .select("*, hamper_bundle_items(product_name, quantity, product_id)")
    .eq("is_active", true);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (featured === "true") {
    query = query.eq("is_featured", true);
  }

  query = query.order("sort_order").order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bundles: data ?? [] });
}
