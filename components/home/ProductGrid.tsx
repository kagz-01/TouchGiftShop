import { supabaseAdmin } from "@/lib/supabase";
import { getDbSlugs } from "@/lib/category-map";
import { getBudgetRange, BUDGET_TIERS } from "@/lib/budget-tiers";
import { getDefaultSort } from "@/lib/smart-sort";
import type { Product } from "@/lib/types";
import ProductGridClient from "./ProductGridClient";

async function getProducts(category?: string, budget?: string): Promise<{ products: Product[], hasMore: boolean, count: number }> {
  let query = supabaseAdmin.from("products").select(
    category ? "*, product_categories!inner(categories!inner(slug))" : "*",
    { count: "exact" }
  );

  if (category) {
    const dbSlugs = getDbSlugs(category);
    query = query.in("product_categories.categories.slug", dbSlugs);
  }

  if (budget) {
    const tier = getBudgetRange(budget);
    if (tier) {
      query = query.gte("price", tier.min);
      if (tier.max !== null) {
        query = query.lte("price", tier.max);
      }
    }
  }

  const sort = getDefaultSort(category ?? null);
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
  searchParams?: Promise<{ category?: string; budget?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const { products, hasMore, count } = await getProducts(params?.category, params?.budget);

  const budgetLabel = params?.budget
    ? BUDGET_TIERS.find((t) => t.slug === params.budget)?.label
    : null;

  const heading = [
    params?.category
      ? `${params.category.charAt(0).toUpperCase() + params.category.slice(1).replace("-", " ")} Gifts`
      : "All Gifts",
    budgetLabel ? ` — ${budgetLabel}` : "",
  ].join("");

  return (
    <ProductGridClient 
      initialProducts={products} 
      initialHasMore={hasMore}
      totalCount={count}
      category={params?.category}
      budget={params?.budget}
      heading={heading}
    />
  );
}
