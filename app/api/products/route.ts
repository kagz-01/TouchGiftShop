import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDbSlugs } from "@/lib/category-map";
import { getBudgetRange } from "@/lib/budget-tiers";
import { getDefaultSort } from "@/lib/smart-sort";

// GET /api/products?category=birthdays&budget=under-5k&q=coffee&page=1&limit=24
// Filter-type params (category/audience/holiday/cultural/community) are
// alternative slices of the same catalog — the first one provided wins.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category =
    searchParams.get("category") ||
    searchParams.get("audience") ||
    searchParams.get("holiday") ||
    searchParams.get("cultural") ||
    searchParams.get("community") ||
    undefined;
  const budget = searchParams.get("budget");
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);

  let query = supabaseAdmin.from("products").select(
    category
      ? "*, product_categories!inner(categories!inner(slug)), product_specs(spec_key, spec_value, icon, sort_order)"
      : "*, product_specs(spec_key, spec_value, icon, sort_order)"
  );

  if (category) {
    const dbSlugs = getDbSlugs(category);
    query = query.in("product_categories.categories.slug", dbSlugs);
  }

  // Budget filtering
  if (budget) {
    const tier = getBudgetRange(budget);
    if (tier) {
      query = query.gte("price", tier.min);
      if (tier.max !== null) {
        query = query.lte("price", tier.max);
      }
    }
  }

  // Search — matches name and description
  if (q) {
    const term = q.trim().replace(/[%,()]/g, "");
    if (term) {
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  // Smart sorting by category context
  const sort = getDefaultSort(category ?? null);
  if (sort) {
    query = query.order(sort.field, { ascending: sort.ascending });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Apply in_stock filter
  query = query.eq("in_stock", true);

  // Only show published products in the shop
  query = query.eq("status", "published");

  // Apply pagination: fetch `limit + 1` to determine if there's a next page
  const from = (page - 1) * limit;
  const fetchLimit = limit + 1;
  const fetchTo = from + fetchLimit - 1;

  const { data, error } = await query.range(from, fetchTo);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allProducts = data ?? [];
  const hasMore = allProducts.length > limit;
  const products = hasMore ? allProducts.slice(0, limit) : allProducts;

  const response: {
    products: typeof products;
    hasMore: boolean;
    count: number;
    category?: string;
    emptyReason?: string;
  } = {
    products,
    hasMore,
    count: products.length,
  };

  // Add helpful context for empty results
  if (category && products.length === 0) {
    response.category = category;
    response.emptyReason = `No in-stock products found for "${category}". The category may not have products assigned yet, or the WooCommerce slugs may need updating.`;
  }

  return NextResponse.json(response);
}
