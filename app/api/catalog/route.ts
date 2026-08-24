import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET /api/catalog?category=liquor&budget=under-5k&page=1&limit=24
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const budget = searchParams.get("budget");
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);

  let query = supabaseAdmin
    .from("products")
    .select(
      "*, product_categories!inner(categories!inner(slug, name)), product_specs(spec_key, spec_value, icon, sort_order)",
      { count: "exact" }
    )
    .eq("status", "published")
    .eq("in_stock", true);

  if (category && category !== "all") {
    query = query.eq("product_categories.categories.slug", category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`);
  }

  // Budget filtering
  if (budget) {
    if (budget === "under-1k") {
      query = query.lte("price", 1000);
    } else if (budget === "1k-3k") {
      query = query.gte("price", 1000).lte("price", 3000);
    } else if (budget === "3k-5k") {
      query = query.gte("price", 3000).lte("price", 5000);
    } else if (budget === "5k-10k") {
      query = query.gte("price", 5000).lte("price", 10000);
    } else if (budget === "above-10k") {
      query = query.gte("price", 10000);
    }
  }

  query = query.order("created_at", { ascending: false });

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const products = data ?? [];
  const hasMore = products.length === limit;

  return NextResponse.json({ products, total: count ?? 0, hasMore, page });
}
