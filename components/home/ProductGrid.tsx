import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import { BUDGET_TIERS } from "@/lib/budget-tiers";
import type { Product } from "@/lib/types";

async function getProducts(category?: string, budget?: string): Promise<Product[]> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (budget) params.set("budget", budget);
  const qs = params.toString();
  const url = qs ? `${base}/api/products?${qs}` : `${base}/api/products`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const { products } = await res.json();
  return products ?? [];
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const isPopular = index < 4;

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}
    >
      <div className="gift-card">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-blush overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🎁
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick view button */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 text-center text-sm font-semibold text-brand shadow-soft">
              Quick View
            </div>
          </div>

          {/* Gift tag for popular items */}
          {isPopular && (
            <div className="gift-tag">
              <span className="flex items-center gap-1">
                <span className="animate-wiggle inline-block">🎁</span>
                Popular
              </span>
            </div>
          )}

          {/* Stock badge */}
          {!product.in_stock && (
            <div className="absolute top-3 left-3 bg-brand-deep/80 text-white text-xs px-2 py-1 rounded-lg">
              Out of stock
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-sm mb-1 line-clamp-2 group-hover:text-brand transition-colors">
            {product.name}
          </h3>
          <p className="text-gold font-bold">{formatKsh(product.price)}</p>

          {product.is_personalizable && (
            <div className="mt-2 flex items-center gap-1 text-xs text-brand-muted">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Personalizable</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function ProductGrid({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; budget?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const products = await getProducts(params?.category, params?.budget);

  const budgetLabel = params?.budget
    ? BUDGET_TIERS.find((t) => t.slug === params.budget)?.label
    : null;

  const heading = [
    params?.category
      ? `${params.category.charAt(0).toUpperCase() + params.category.slice(1).replace("-", " ")} Gifts`
      : "All Gifts",
    budgetLabel ? ` — ${budgetLabel}` : "",
  ].join("");

  if (products.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <span className="text-6xl mb-4 block">🔍</span>
        <p className="font-display text-lg font-semibold mb-2">No products found</p>
        <p className="text-sm text-brand-muted">
          Try a different category or browse all gifts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{heading}</h2>
        <span className="text-sm text-brand-muted">{products.length} items</span>
      </div>

      {/* Masonry-style Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
}
