import { supabaseAdmin } from "@/lib/supabase";
import { getDbSlugs } from "@/lib/category-map";
import { getBudgetRange, BUDGET_TIERS } from "@/lib/budget-tiers";
import { getDefaultSort } from "@/lib/smart-sort";
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
  q?: string;
  delivery?: string;
}

/** First filter-type param wins — they're alternative ways to slice the catalog. */
function getEffectiveCategory(p: ShopParams): string | undefined {
  return p.category || p.audience || p.holiday || p.cultural || p.community || undefined;
}

async function getProducts(params: ShopParams): Promise<{ products: Product[], hasMore: boolean, count: number }> {
  const effectiveCategory = getEffectiveCategory(params);

  let query = supabaseAdmin.from("products").select(
    effectiveCategory
      ? "*, product_categories!inner(categories!inner(slug)), product_specs(spec_key, spec_value, icon, sort_order)"
      : "*, product_specs(spec_key, spec_value, icon, sort_order)",
    { count: "exact" }
  );

  if (effectiveCategory) {
    const dbSlugs = getDbSlugs(effectiveCategory);
    query = query.in("product_categories.categories.slug", dbSlugs);
  }

  if (params.budget) {
    const tier = getBudgetRange(params.budget);
    if (tier) {
      query = query.gte("price", tier.min);
      if (tier.max !== null) {
        query = query.lte("price", tier.max);
      }
    }
  }

  // Header search — matches name and description
  if (params.q) {
    const term = params.q.trim().replace(/[%,()]/g, "");
    if (term) {
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }

  const sort = getDefaultSort(effectiveCategory ?? null);
  if (sort) {
    query = query.order(sort.field, { ascending: sort.ascending });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.eq("in_stock", true);
  query = query.eq("status", "published");

  const limit = 24;
  const { data, count, error } = await query.range(0, limit);
  
  if (error || !data) return { products: [], hasMore: false, count: 0 };
  
  const allProducts = data as unknown as Product[];
  const hasMore = allProducts.length > limit;
  const products = hasMore ? allProducts.slice(0, limit) : allProducts;

  return {
    products,
    hasMore,
    count: count ?? 0,
  };
}

export default async function ProductGrid({
  searchParams,
}: {
  searchParams?: Promise<ShopParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const { products, hasMore, count } = await getProducts(params);

  const budgetLabel = params?.budget
    ? BUDGET_TIERS.find((t) => t.slug === params.budget)?.label
    : null;

  const pretty = (s: string) =>
    s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const effectiveCategory = getEffectiveCategory(params);

  const headingParts: string[] = [];
  if (params?.q) headingParts.push(`Results for “${params.q}”`);
  else if (effectiveCategory) headingParts.push(`${pretty(effectiveCategory)} Gifts`);
  else headingParts.push("All Gifts");
  if (budgetLabel) headingParts.push(` — ${budgetLabel}`);
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
    />
  );
}
