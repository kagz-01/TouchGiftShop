import { BUDGET_TIERS } from "@/lib/budget-tiers";
import type { Product } from "@/lib/types";
import ProductGridClient from "./ProductGridClient";

async function getProducts(category?: string, budget?: string): Promise<{ products: Product[], hasMore: boolean, count: number }> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (budget) params.set("budget", budget);
  
  // Explicitly request page 1 to use the paginated API
  params.set("page", "1");
  params.set("limit", "24");
  
  const qs = params.toString();
  const url = qs ? `${base}/api/products?${qs}` : `${base}/api/products`;
  const res = await fetch(url, { cache: "no-store" });
  
  if (!res.ok) return { products: [], hasMore: false, count: 0 };
  
  const data = await res.json();
  return {
    products: data.products ?? [],
    hasMore: data.hasMore ?? false,
    count: data.count ?? 0,
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
