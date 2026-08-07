import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDbSlugs } from "@/lib/category-map";
import { getBudgetRange } from "@/lib/budget-tiers";
import { getDefaultSort } from "@/lib/smart-sort";

// GET /api/products?category=birthdays&budget=under-5k — reads the real products table.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const budget = searchParams.get("budget");

  let query = supabaseAdmin.from("products").select(
    category
      ? "*, product_categories!inner(categories!inner(slug))"
      : "*"
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

  // Smart sorting by category context
  const sort = getDefaultSort(category);
  if (sort) {
    query = query.order(sort.field, { ascending: sort.ascending });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.eq("in_stock", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data, count: data?.length ?? 0 });
}
