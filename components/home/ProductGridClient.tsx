"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import { getProductBadges } from "@/lib/product-badges";
import type { Product } from "@/lib/types";
import CategorySuggestions from "./CategorySuggestions";
import { Loader2, Sparkles, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { MotionCard } from "@/components/motion/MotionCard";

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
      <MotionCard className="bg-white/95 rounded-3xl border border-black/6 overflow-hidden hover:shadow-card transition-shadow duration-300">
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

          {/* Specs row */}
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
      </MotionCard>
    </Link>
  );
}

export default function ProductGridClient({
  initialProducts,
  initialHasMore,
  totalCount,
  category,
  budget,
  search,
  heading,
  sort,
  newArrivals,
  onSale,
  personalizable,
  color,
  size,
  tag,
  minRating,
  minPrice,
  maxPrice,
}: {
  initialProducts: Product[];
  initialHasMore: boolean;
  totalCount: number;
  category?: string;
  budget?: string;
  search?: string;
  heading?: string;
  sort?: string;
  newArrivals?: string;
  onSale?: string;
  personalizable?: string;
  color?: string;
  size?: string;
  tag?: string;
  minRating?: string;
  minPrice?: string;
  maxPrice?: string;
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Real-time: refresh when admin changes anything in the catalog
  useEffect(() => {
    if (typeof window === "undefined" || !("WebSocket" in window)) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
        .channel("shop-products-live")
        .on("broadcast", { event: "product-created" }, () => window.location.reload())
        .on("broadcast", { event: "product-updated" }, () => window.location.reload())
        .on("broadcast", { event: "product-deleted" }, () => window.location.reload())
        .on("broadcast", { event: "products-imported" }, () => window.location.reload())
        .on("broadcast", { event: "specs-changed" }, () => window.location.reload())
        .subscribe();
    } catch {
      // WebSocket not available — skip real-time
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const loadMore = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page + 1), limit: "24" });
      if (category) params.set("category", category);
      if (budget) params.set("budget", budget);
      if (search) params.set("q", search);
      if (sort) params.set("sort", sort);
      if (newArrivals) params.set("newArrivals", newArrivals);
      if (onSale) params.set("onSale", onSale);
      if (personalizable) params.set("personalizable", personalizable);
      if (color) params.set("color", color);
      if (size) params.set("size", size);
      if (tag) params.set("tag", tag);
      if (minRating) params.set("minRating", minRating);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
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

  // Count active filters
  const activeFilters: { label: string; param: string; value: string }[] = [];
  if (category) activeFilters.push({ label: heading?.replace(" Gifts", "") || category, param: "category", value: category });
  if (budget) activeFilters.push({ label: budget.replace(/-/g, " "), param: "budget", value: budget });
  if (sort) activeFilters.push({ label: `Sort: ${sort}`, param: "sort", value: sort });
  if (onSale === "1") activeFilters.push({ label: "On Sale", param: "onSale", value: "1" });
  if (newArrivals) activeFilters.push({ label: `New (${newArrivals})`, param: "newArrivals", value: newArrivals });
  if (personalizable === "1") activeFilters.push({ label: "Customizable", param: "personalizable", value: "1" });
  if (color) activeFilters.push({ label: color, param: "color", value: color });
  if (size) activeFilters.push({ label: `Size: ${size}`, param: "size", value: size });
  if (tag) activeFilters.push({ label: tag, param: "tag", value: tag });
  if (minRating) activeFilters.push({ label: `${minRating}+ stars`, param: "minRating", value: minRating });
  if (minPrice) activeFilters.push({ label: `Min KSh ${minPrice}`, param: "minPrice", value: minPrice });
  if (maxPrice) activeFilters.push({ label: `Max KSh ${maxPrice}`, param: "maxPrice", value: maxPrice });

  function removeFilter(param: string) {
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.location.href = url.toString();
  }

  return (
    <section className="py-8">
      <div className="page-container-capped">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-deep text-center mb-4 animate-fade-in-up">
          {heading || "All Gifts"}
          <span className="block text-sm font-normal text-brand-muted mt-1">
            Showing {products.length} of {totalCount} gifts
          </span>
        </h2>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {activeFilters.map((f) => (
              <button
                key={f.param}
                onClick={() => removeFilter(f.param)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 text-brand text-xs font-semibold rounded-full hover:bg-brand/20 transition-colors"
              >
                {f.label}
                <X className="w-3 h-3" />
              </button>
            ))}
            <button
              onClick={() => { window.location.href = "/shop"; }}
              className="text-xs font-semibold text-brand-muted hover:text-brand underline transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {!category && !budget && products.length === 0 ? null : (
          <CategorySuggestions category={category ?? ""} />
        )}

        {products.length === 0 ? (
          <div className="text-center py-16 max-w-md mx-auto">
            <span className="text-6xl block mb-4">🫣</span>
            <p className="font-display text-xl font-bold text-brand-deep mb-2">Nothing here yet!</p>
            <p className="text-sm text-brand-muted leading-relaxed mb-6">
              We&apos;re working on getting more gifts for this category. In the meantime, our gifting squad is out there hunting for the perfect items. Check back soon — or browse something else while you wait!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-2xl hover:bg-brand-dark transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Browse All Gifts
            </Link>
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
