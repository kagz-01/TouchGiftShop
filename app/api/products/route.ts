import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDbSlugs } from "@/lib/category-map";
import { getBudgetRange } from "@/lib/budget-tiers";
import { getDefaultSort } from "@/lib/smart-sort";

// GET /api/products?category=birthdays&budget=under-5k&page=1&limit=24
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const budget = searchParams.get("budget");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);

  let query = supabaseAdmin.from("products").select(
    category
      ? "*, product_categories!inner(categories!inner(slug))"
      : "*"
  );

  if (category) {
    const dbSlugs = getDbSlugs(category);
    // Validate that the category has a mapping (or falls back to direct lookup)
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

  // Smart sorting by category context
  const sort = getDefaultSort(category);
  if (sort) {
    query = query.order(sort.field, { ascending: sort.ascending });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Apply in_stock filter
  query = query.eq("in_stock", true);

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
