import { supabaseAdmin } from "@/lib/supabase";
import { getDbSlugs } from "@/lib/category-map";
import { getBudgetRange } from "@/lib/budget-tiers";
import { getOnSaleProductIds, getRatedProductIds } from "@/lib/product-filters";
import type { Product } from "@/lib/types";
import { optimizeProductImagesList } from "@/lib/image-url";
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
  subcat?: string;  // subcategory filter (e.g. wines, whiskies) — uses tag/name filter
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

  // Empty = unresolved/legacy slug, so leave the catalog unfiltered rather
  // than rendering an empty grid (see lib/category-map.ts).
  const dbSlugs = effectiveCategory ? getDbSlugs(effectiveCategory) : [];

  // Always select specs for display
  let selectCols = "*, product_specs(spec_key, spec_value, icon, sort_order)";
  if (dbSlugs.length) {
    selectCols = "*, product_categories!inner(categories!inner(slug)), product_specs(spec_key, spec_value, icon, sort_order)";
  }

  // "estimated" — count only feeds the "Showing X of Y" label (hasMore comes
  // from the row count of range(0, limit)), so skip the exact aggregate.
  let query = supabaseAdmin.from("products").select(selectCols, { count: "estimated" });

  if (effectiveCategory === "corporate") {
    query = query.contains("tags", JSON.stringify(["corporate"]));
  } else if (dbSlugs.length) {
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

  // Text search (free-form, from search bar)
  if (params.q) {
    const term = params.q.trim().replace(/[%,()]/g, "");
    if (term) {
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  // Subcategory filter (from pills like Wines, Whiskies, For Him, etc.)
  // Uses tag matching first, then falls back to name/description search
  if (params.subcat) {
    const term = params.subcat.trim().replace(/[%,()]/g, "");
    if (term) {
      // Try tag match first (most precise), fall back to name search
      query = query.or(
        `tags.cs.["${term.toLowerCase()}"],name.ilike.%${term}%,description.ilike.%${term}%`
      );
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
    query = query.contains("color_variants", JSON.stringify([{ name: params.color }]));
  }

  // Size filter
  if (params.size) {
    query = query.contains("size_variants", JSON.stringify([{ name: params.size }]));
  }

  // Tag filter
  if (params.tag) {
    query = query.contains("tags", JSON.stringify([params.tag]));
  }

  // Hard filters
  query = query.eq("in_stock", true);
  query = query.eq("status", "published");

  // ── Id-based pre-filters — MUST run before range(): a JS filter after the
  //    window shows "0 of N" while stock exists. Resolved as id sets because
  //    PostgREST can't compare two columns (sale_price < price).
  if (params.onSale === "1") {
    const saleIds = await getOnSaleProductIds();
    if (saleIds.length === 0) return { products: [], hasMore: false, count: 0 };
    query = query.in("id", saleIds);
  }

  if (params.minRating) {
    const minR = parseFloat(params.minRating);
    if (!isNaN(minR) && minR > 0) {
      const ratedIds = await getRatedProductIds(minR);
      if (ratedIds.length === 0) return { products: [], hasMore: false, count: 0 };
      query = query.in("id", ratedIds);
    }
  }

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
    // If no specific sort is requested, and we are viewing "All Gifts"
    // sort by ID (UUID v4) to perfectly interleave/shuffle the products
    // instead of grouping them by created_at which clusters imports.
    if (!effectiveCategory && !params.q) {
      query = query.order("id", { ascending: true });
    } else {
      query = query.order("created_at", { ascending: false });
    }
  }

  const limit = 24;
  const { data, count, error } = await query.range(0, limit);

  if (error || !data) return { products: [], hasMore: false, count: 0 };

  const allProducts = data as unknown as (Product & { sale_price?: number | null })[];

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
  optimizeProductImagesList(products);

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
  hideHeading,
}: {
  searchParams?: Promise<ShopParams>;
  /** The shop page's h1 already names the category — skip the big grid h2. */
  hideHeading?: boolean;
}) {
  const params = searchParams ? await searchParams : {};
  const { products, hasMore, count } = await getProducts(params);

  const effectiveCategory = getEffectiveCategory(params);
  const pretty = (s: string) =>
    s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const headingParts: string[] = [];
  if (params?.q) headingParts.push(`Results for \u201c${params.q}\u201d`);
  else if (params?.subcat && effectiveCategory) {
    headingParts.push(`${pretty(params.subcat)} in ${pretty(effectiveCategory)}`);
  } else if (effectiveCategory) headingParts.push(`${pretty(effectiveCategory)} Gifts`);
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
      subcat={params?.subcat}
      heading={headingParts.join("")}
      hideHeading={hideHeading}
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
