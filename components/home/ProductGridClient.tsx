"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import { getProductBadges } from "@/lib/product-badges";
import type { Product } from "@/lib/types";
import CategorySuggestions from "./CategorySuggestions";
import { Loader2 } from "lucide-react";

export function ProductCard({ product, index, categorySlug }: { product: Product; index: number; categorySlug?: string }) {
  const badges = getProductBadges(product, index, categorySlug);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${Math.min((index % 24) * 50, 400)}ms` }}
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

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={`${badge.color} text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm flex items-center gap-1`}
              >
                <span>{badge.emoji}</span>
                {badge.label}
              </span>
            ))}
          </div>

          {/* Stock badge */}
          {!product.in_stock && (
            <div className="absolute top-3 right-3 bg-brand-deep/80 text-white text-xs px-2 py-1 rounded-lg">
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

export default function ProductGridClient({
  initialProducts,
  initialHasMore,
  totalCount,
  category,
  budget,
  heading
}: {
  initialProducts: Product[];
  initialHasMore: boolean;
  totalCount: number;
  category?: string;
  budget?: string;
  heading: string;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (budget) params.set("budget", budget);
      params.set("page", nextPage.toString());
      params.set("limit", "24");
      
      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts((prev) => [...prev, ...(data.products || [])]);
        setHasMore(data.hasMore);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Failed to load more products:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{heading}</h2>
        <span className="text-sm text-brand-muted">{totalCount} items</span>
      </div>

      {/* Cross-category suggestions */}
      {category && <CategorySuggestions category={category} />}

      {/* Masonry-style Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {products.map((product, i) => (
          <ProductCard key={`${product.id}-${i}`} product={product} index={i} categorySlug={category} />
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-8 pb-12">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="group px-8 py-3 bg-white border-2 border-surface-border text-brand-deep font-semibold rounded-full hover:border-brand hover:text-brand hover:shadow-soft transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-brand" />
                Loading...
              </>
            ) : (
              "Load More Gifts"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
