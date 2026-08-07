import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { CATEGORY_MAP } from "@/lib/category-map";
import { BUDGET_TIERS } from "@/lib/budget-tiers";

// GET /api/categories — returns all available categories with product counts.
export async function GET() {
  // Fetch all DB categories with product counts
  const { data: dbCategories, error: catError } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug, kind");

  if (catError || !dbCategories) {
    return NextResponse.json(
      { error: catError?.message ?? "Failed to fetch categories" },
      { status: 500 }
    );
  }

  // Build UI category list from CATEGORY_MAP with counts
  const uiCategories = await Promise.all(
    Object.entries(CATEGORY_MAP).map(async ([uiSlug, dbSlugs]) => {
      // Find matching DB category IDs
      const matchingIds = dbCategories
        .filter((c) => dbSlugs.includes(c.slug))
        .map((c) => c.id);

      // Count products in these categories
      const { count } = await supabaseAdmin
        .from("product_categories")
        .select("category_id", { count: "exact", head: true })
        .in("category_id", matchingIds);

      return {
        slug: uiSlug,
        name: uiSlug
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        productCount: count ?? 0,
        dbSlugs,
      };
    })
  );

  return NextResponse.json({
    categories: uiCategories,
    budgetTiers: BUDGET_TIERS,
  });
}
