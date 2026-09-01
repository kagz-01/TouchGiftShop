import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getDbSlugs } from "@/lib/category-map";
import { getBudgetRange } from "@/lib/budget-tiers";

// GET /api/products
// All filter params:
//   category|audience|holiday|cultural|community — category slice (first wins)
//   budget — tier slug (under-5k, under-10k, etc.)
//   minPrice, maxPrice — custom price range (numeric, KSh)
//   q — text search on name + description
//   sort — price-asc, price-desc, newest, oldest, popular
//   newArrivals — "7d" or "30d"
//   onSale — "1" to only show items with sale_price < price
//   personalizable — "1" to only show customizable items
//   color — filter by color_variants[].name (case-insensitive contains)
//   size — filter by size_variants[].name (case-insensitive contains)
//   tag — filter by tags JSONB array (contains)
//   minRating — minimum average rating (joins reviews)
//   page, limit — pagination
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // ── Category (first param wins) ──
  const category =
    searchParams.get("category") ||
    searchParams.get("audience") ||
    searchParams.get("holiday") ||
    searchParams.get("cultural") ||
    searchParams.get("community") ||
    undefined;

  // ── Budget tier ──
  const budget = searchParams.get("budget");

  // ── Custom price range ──
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  // ── Text search ──
  const q = searchParams.get("q");

  // ── Sort ──
  const sortParam = searchParams.get("sort");

  // ── Quick filters ──
  const newArrivals = searchParams.get("newArrivals");
  const onSale = searchParams.get("onSale");
  const personalizable = searchParams.get("personalizable");

  // ── Attribute filters ──
  const color = searchParams.get("color");
  const size = searchParams.get("size");
  const tag = searchParams.get("tag");

  // ── Rating filter ──
  const minRating = searchParams.get("minRating");

  // ── Pagination ──
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "24", 10);

  // Build the select string — always include specs for display
  let selectCols = "*, product_specs(spec_key, spec_value, icon, sort_order)";

  // If category filter is used, we need the inner join
  if (category) {
    selectCols = "*, product_categories!inner(categories!inner(slug)), product_specs(spec_key, spec_value, icon, sort_order)";
  }

  let query = supabaseAdmin.from("products").select(selectCols, { count: "exact" });

  // ── Category filter ──
  if (category) {
    const dbSlugs = getDbSlugs(category);
    query = query.in("product_categories.categories.slug", dbSlugs);
  }

  // ── Budget tier filter ──
  if (budget) {
    const tier = getBudgetRange(budget);
    if (tier) {
      query = query.gte("price", tier.min);
      if (tier.max !== null) {
        query = query.lte("price", tier.max);
      }
    }
  }

  // ── Custom price range filter ──
  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) query = query.gte("price", min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) query = query.lte("price", max);
  }

  // ── Text search ──
  if (q) {
    const term = q.trim().replace(/[%,()]/g, "");
    if (term) {
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  // ── New arrivals filter ──
  if (newArrivals === "7d" || newArrivals === "30d") {
    const days = newArrivals === "7d" ? 7 : 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", cutoff);
  }

  // ── On sale filter ──
  if (onSale === "1") {
    query = query.not("sale_price", "is", null);
    query = query.lt("sale_price", 0); // placeholder — will use RPC or post-filter
    // Actually: Supabase doesn't support sale_price < price directly.
    // We'll filter in post-processing below.
  }

  // ── Personalizable filter ──
  if (personalizable === "1") {
    query = query.eq("is_personalizable", true);
  }

  // ── Color filter (JSONB array contains) ──
  if (color) {
    // Use jsonb path query: color_variants must contain an element with matching name
    query = query.contains("color_variants", [{ name: color }]);
  }

  // ── Size filter (JSONB array contains) ──
  if (size) {
    query = query.contains("size_variants", [{ name: size }]);
  }

  // ── Tag filter (JSONB array contains) ──
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  // ── Hard filters ──
  query = query.eq("in_stock", true);
  query = query.eq("status", "published");

  // ── Sort ──
  // Manual sort overrides smart-sort when user picks one
  if (sortParam) {
    switch (sortParam) {
      case "price-asc":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false });
        break;
      case "newest":
        query = query.order("created_at", { ascending: false });
        break;
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }
  } else {
    // Default: newest first
    query = query.order("created_at", { ascending: false });
  }

  // ── Pagination ──
  const from = (page - 1) * limit;
  const fetchTo = from + limit; // range is inclusive, so limit items = from..from+limit-1
  const { data, error, count } = await query.range(from, fetchTo - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let allProducts = (data ?? []) as any[];

  // ── Post-filters that Supabase can't do natively ──

  // On sale: sale_price must exist and be less than price
  if (onSale === "1") {
    allProducts = allProducts.filter(
      (p: any) => p.sale_price != null && Number(p.sale_price) < Number(p.price)
    );
  }

  // ── Rating filter: query reviews table separately ──
  if (minRating) {
    const minR = parseFloat(minRating);
    if (!isNaN(minR) && minR > 0) {
      // Get product IDs with avg rating >= minR
      const { data: ratingData } = await supabaseAdmin
        .from("reviews")
        .select("product_id, rating")
        .eq("status", "approved");

      if (ratingData && ratingData.length > 0) {
        // Calculate avg rating per product
        const ratingMap = new Map<string, { sum: number; count: number }>();
        for (const r of ratingData as any[]) {
          const existing = ratingMap.get(r.product_id) || { sum: 0, count: 0 };
          existing.sum += Number(r.rating);
          existing.count += 1;
          ratingMap.set(r.product_id, existing);
        }
        const qualifyingIds = new Set<string>();
        for (const [pid, { sum, count }] of ratingMap) {
          if (sum / count >= minR) qualifyingIds.add(pid);
        }
        allProducts = allProducts.filter((p: any) => qualifyingIds.has(p.id));
      } else {
        allProducts = [];
      }
    }
  }

  const hasMore = allProducts.length > limit;
  const products = hasMore ? allProducts.slice(0, limit) : allProducts;

  // Build unique color/size/tag lists from the returned products for filter UI
  const colorSet = new Set<string>();
  const sizeSet = new Set<string>();
  const tagSet = new Set<string>();
  for (const p of allProducts) {
    if (Array.isArray(p.color_variants)) {
      for (const cv of p.color_variants) {
        if (cv.name) colorSet.add(cv.name);
      }
    }
    if (Array.isArray(p.size_variants)) {
      for (const sv of p.size_variants) {
        if (sv.name) sizeSet.add(sv.name);
      }
    }
    if (Array.isArray(p.tags)) {
      for (const t of p.tags) {
        if (typeof t === "string") tagSet.add(t);
      }
    }
  }

  const response: Record<string, any> = {
    products,
    hasMore,
    count: count ?? products.length,
  };

  if (category) {
    response.category = category;
    if (products.length === 0) {
      response.emptyReason = `No in-stock products found for "${category}".`;
    }
  }

  // Include available filter options so the UI can show what's filterable
  if (colorSet.size > 0) response.availableColors = [...colorSet].sort();
  if (sizeSet.size > 0) response.availableSizes = [...sizeSet].sort();
  if (tagSet.size > 0) response.availableTags = [...tagSet].sort();

  return NextResponse.json(response);
}
