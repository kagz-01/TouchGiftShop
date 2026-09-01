import { supabaseAdmin } from "@/lib/supabase";
import { getDbSlugs } from "@/lib/category-map";
import { getBudgetRange } from "@/lib/budget-tiers";
import type { Product } from "@/lib/types";
import ProductGridClient from "./ProductGridClient";

/** Params the shop understands — every MegaMenu link resolves to one of these. */
export interface ShopParams {
  category?: string;
  audience?: string;
  holiday?: string;
  cultural?: string;
  community?: string;
  budget?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
  sort?: string;
  newArrivals?: string;
  onSale?: string;
  personalizable?: string;
  color?: string;
  size?: string;
  tag?: string;
  minRating?: string;
  delivery?: string;
}

/** First filter-type param wins — they're alternative ways to slice the catalog. */
function getEffectiveCategory(p: ShopParams): string | undefined {
  return p.category || p.audience || p.holiday || p.cultural || p.community || undefined;
}

async function getProducts(params: ShopParams): Promise<{
  products: Product[];
  hasMore: boolean;
  count: number;
  availableColors?: string[];
  availableSizes?: string[];
  availableTags?: string[];
}> {
  const effectiveCategory = getEffectiveCategory(params);

  // Always select specs for display
  let selectCols = "*, product_specs(spec_key, spec_value, icon, sort_order)";
  if (effectiveCategory) {
    selectCols = "*, product_categories!inner(categories!inner(slug)), product_specs(spec_key, spec_value, icon, sort_order)";
  }

  let query = supabaseAdmin.from("products").select(selectCols, { count: "exact" });

  if (effectiveCategory) {
    const dbSlugs = getDbSlugs(effectiveCategory);
    query = query.in("product_categories.categories.slug", dbSlugs);
  }

  // Budget tier
  if (params.budget) {
    const tier = getBudgetRange(params.budget);
    if (tier) {
      query = query.gte("price", tier.min);
      if (tier.max !== null) {
        query = query.lte("price", tier.max);
      }
    }
  }

  // Custom price range
  if (params.minPrice) {
    const min = parseFloat(params.minPrice);
    if (!isNaN(min)) query = query.gte("price", min);
  }
  if (params.maxPrice) {
    const max = parseFloat(params.maxPrice);
    if (!isNaN(max)) query = query.lte("price", max);
  }

  // Text search
  if (params.q) {
    const term = params.q.trim().replace(/[%,()]/g, "");
    if (term) {
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  // New arrivals
  if (params.newArrivals === "7d" || params.newArrivals === "30d") {
    const days = params.newArrivals === "7d" ? 7 : 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", cutoff);
  }

  // Personalizable
  if (params.personalizable === "1") {
    query = query.eq("is_personalizable", true);
  }

  // Color filter
  if (params.color) {
    query = query.contains("color_variants", [{ name: params.color }]);
  }

  // Size filter
  if (params.size) {
    query = query.contains("size_variants", [{ name: params.size }]);
  }

  // Tag filter
  if (params.tag) {
    query = query.contains("tags", [params.tag]);
  }

  // Hard filters
  query = query.eq("in_stock", true);
  query = query.eq("status", "published");

  // Sort
  if (params.sort) {
    switch (params.sort) {
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
    query = query.order("created_at", { ascending: false });
  }

  const limit = 24;
  const { data, count, error } = await query.range(0, limit);

  if (error || !data) return { products: [], hasMore: false, count: 0 };

  let allProducts = data as unknown as (Product & { sale_price?: number | null })[];

  // Post-filter: on sale
  if (params.onSale === "1") {
    allProducts = allProducts.filter(
      (p) => p.sale_price != null && Number(p.sale_price) < Number(p.price)
    );
  }

  // Post-filter: min rating
  if (params.minRating) {
    const minR = parseFloat(params.minRating);
    if (!isNaN(minR) && minR > 0) {
      const { data: ratingData } = await supabaseAdmin
        .from("reviews")
        .select("product_id, rating")
        .eq("status", "approved");

      if (ratingData && ratingData.length > 0) {
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
        allProducts = allProducts.filter((p) => qualifyingIds.has(p.id));
      } else {
        allProducts = [];
      }
    }
  }

  // Collect available filter values from the full result set (before slice)
  const colorSet = new Set<string>();
  const sizeSet = new Set<string>();
  const tagSet = new Set<string>();
  for (const p of allProducts) {
    const pAny = p as any;
    if (Array.isArray(pAny.color_variants)) {
      for (const cv of pAny.color_variants) {
        if (cv.name) colorSet.add(cv.name);
      }
    }
    if (Array.isArray(pAny.size_variants)) {
      for (const sv of pAny.size_variants) {
        if (sv.name) sizeSet.add(sv.name);
      }
    }
    if (Array.isArray(pAny.tags)) {
      for (const t of pAny.tags) {
        if (typeof t === "string") tagSet.add(t);
      }
    }
  }

  const hasMore = allProducts.length > limit;
  const products = hasMore ? allProducts.slice(0, limit) : allProducts;

  return {
    products,
    hasMore,
    count: count ?? 0,
    availableColors: colorSet.size > 0 ? [...colorSet].sort() : undefined,
    availableSizes: sizeSet.size > 0 ? [...sizeSet].sort() : undefined,
    availableTags: tagSet.size > 0 ? [...tagSet].sort() : undefined,
  };
}

export default async function ProductGrid({
  searchParams,
}: {
  searchParams?: Promise<ShopParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const { products, hasMore, count } = await getProducts(params);

  const effectiveCategory = getEffectiveCategory(params);
  const pretty = (s: string) =>
    s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const headingParts: string[] = [];
  if (params?.q) headingParts.push(`Results for \u201c${params.q}\u201d`);
  else if (effectiveCategory) headingParts.push(`${pretty(effectiveCategory)} Gifts`);
  else headingParts.push("All Gifts");

  if (params?.onSale === "1") headingParts.push(" — On Sale");
  if (params?.newArrivals) headingParts.push(` — New (${params.newArrivals === "7d" ? "7 days" : "30 days"})`);
  if (params?.delivery === "same-day") headingParts.push(" — Same-Day Nairobi");

  return (
    <ProductGridClient
      initialProducts={products}
      initialHasMore={hasMore}
      totalCount={count}
      category={effectiveCategory}
      budget={params?.budget}
      search={params?.q}
      heading={headingParts.join("")}
      sort={params?.sort}
      newArrivals={params?.newArrivals}
      onSale={params?.onSale}
      personalizable={params?.personalizable}
      color={params?.color}
      size={params?.size}
      tag={params?.tag}
      minRating={params?.minRating}
      minPrice={params?.minPrice}
      maxPrice={params?.maxPrice}
    />
  );
}
