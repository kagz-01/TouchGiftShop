"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import { getProductBadges } from "@/lib/product-badges";
import type { Product } from "@/lib/types";
import CategorySuggestions from "./CategorySuggestions";
import { Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function ProductCard({ product, index, categorySlug }: { product: Product; index: number; categorySlug?: string }) {
  const badges = getProductBadges(product, index, categorySlug);
  const hasSale = product.sale_price && product.sale_price < product.price;
  const hasColors = product.color_variants && product.color_variants.length > 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${Math.min((index % 24) * 50, 400)}ms` }}
    >
      <div className="bg-white/95 rounded-3xl border border-black/6 overflow-hidden hover:shadow-card hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-blush overflow-hidden">
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-108"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick view */}
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 text-center text-xs font-bold text-brand shadow-sm">
              View Gift →
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasSale && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                SALE
              </span>
            )}
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

          {/* Coming soon */}
          {product.is_coming_soon && (
            <div className="absolute top-3 right-3 bg-brand-deep text-gold text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
              Coming soon
            </div>
          )}

          {/* Out of stock */}
          {!product.in_stock && !product.is_coming_soon && (
            <div className="absolute top-3 right-3 bg-brand-deep/80 text-white text-xs px-2 py-1 rounded-lg font-medium">
              Sold out
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-sm mb-1.5 line-clamp-2 text-brand-deep group-hover:text-brand transition-colors leading-snug min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 mb-1.5">
            {hasSale ? (
              <>
                <p className="text-red-500 font-bold text-base">{formatKsh(product.sale_price!)}</p>
                <p className="text-gray-400 text-sm line-through">{formatKsh(product.price)}</p>
              </>
            ) : (
              <p className="text-gold font-bold text-base">{formatKsh(product.price)}</p>
            )}
          </div>

          {/* Specs row — PDF-style attribute chips */}
          {product.product_specs && product.product_specs.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {product.product_specs.slice(0, 3).map((spec) => (
                <span
                  key={spec.spec_key}
                  className="inline-flex items-center gap-0.5 text-[10px] bg-gray-50 border border-black/5 text-gray-500 rounded-full px-1.5 py-0.5"
                  title={`${spec.spec_key}: ${spec.spec_value}`}
                >
                  {spec.icon && <span>{spec.icon}</span>}
                  {spec.spec_value}
                </span>
              ))}
            </div>
          )}

          {/* Color dots */}
          {hasColors && (
            <div className="flex items-center gap-1 mb-1.5">
              {product.color_variants!.slice(0, 5).map((cv, i) => (
                <span
                  key={i}
                  className="w-3.5 h-3.5 rounded-full border border-gray-200"
                  style={{ backgroundColor: cv.name.toLowerCase() }}
                  title={cv.name}
                />
              ))}
              {product.color_variants!.length > 5 && (
                <span className="text-[10px] text-gray-400 ml-0.5">+{product.color_variants!.length - 5}</span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            {product.is_personalizable && (
              <span className="text-[9px] font-bold bg-brand/8 text-brand px-1.5 py-0.5 rounded-full flex-shrink-0">
                ✏️ Custom
              </span>
            )}
            {product.size_variants && product.size_variants.length > 0 && (
              <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
                {product.size_variants.length} sizes
              </span>
            )}
          </div>
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
  heading,
}: {
  initialProducts: Product[];
  initialHasMore: boolean;
  totalCount: number;
  category?: string;
  budget?: string;
  heading?: string;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time: refresh when admin changes anything in the catalog
  useEffect(() => {
    const channel = supabase
      .channel("shop-products-live")
      .on("broadcast", { event: "product-created" }, () => window.location.reload())
      .on("broadcast", { event: "product-updated" }, () => window.location.reload())
      .on("broadcast", { event: "product-deleted" }, () => window.location.reload())
      .on("broadcast", { event: "products-imported" }, () => window.location.reload())
      .on("broadcast", { event: "specs-changed" }, () => window.location.reload())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page + 1), limit: "24" });
      if (category) params.set("category", category);
      if (budget) params.set("budget", budget);
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts((prev) => [...prev, ...(data.products ?? [])]);
      setHasMore(data.hasMore ?? false);
      setPage((p) => p + 1);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-8">
      <div className="page-container-capped">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-deep text-center mb-8 animate-fade-in-up">
          {heading || "All Gifts"}
          <span className="block text-sm font-normal text-brand-muted mt-1">
            Showing {products.length} of {totalCount} gifts
          </span>
        </h2>

        {!category && !budget && products.length === 0 ? null : (
          <CategorySuggestions category={category ?? ""} />
        )}

        {products.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🎁</span>
            <p className="font-display text-lg font-semibold text-brand-deep">No gifts found</p>
            <p className="text-sm text-brand-muted mt-1">Try a different category or budget</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-5">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} categorySlug={category} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="px-8 py-3.5 bg-white border-2 border-brand text-brand font-bold rounded-2xl hover:bg-blush transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Load More Gifts
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
