"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface TrendingNowProps {
  products: Product[];
}

export default function TrendingNow({ products }: TrendingNowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll, products]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Trending Now</h2>
            <p className="text-sm text-brand-muted mt-1">Most-loved gifts this week</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "w-9 h-9 rounded-full border border-surface-border flex items-center justify-center transition-all",
                canScrollLeft
                  ? "text-brand hover:bg-brand/5 hover:border-brand/30"
                  : "text-gray-300 cursor-not-allowed"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "w-9 h-9 rounded-full border border-surface-border flex items-center justify-center transition-all",
                canScrollRight
                  ? "text-brand hover:bg-brand/5 hover:border-brand/30"
                  : "text-gray-300 cursor-not-allowed"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable products */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product, i) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="flex-shrink-0 w-[200px] md:w-[240px] group"
            >
              <div className="relative aspect-[4/5] bg-blush rounded-2xl overflow-hidden mb-3">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-warm">
                    🎁
                  </div>
                )}

                {/* Trending badge */}
                {i < 3 && (
                  <div className="absolute top-2.5 left-2.5 bg-gold/90 backdrop-blur-sm text-brand-deep text-[10px] font-bold px-2 py-1 rounded-lg">
                    #{i + 1} Trending
                  </div>
                )}

                {/* Quick add on hover */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 text-center text-xs font-semibold text-brand shadow-soft">
                    Quick View
                  </div>
                </div>
              </div>

              <h3 className="font-display font-semibold text-sm line-clamp-2 group-hover:text-brand transition-colors mb-1">
                {product.name}
              </h3>
              <p className="text-gold font-bold text-sm">{formatKsh(product.price)}</p>
            </Link>
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
          >
            View all gifts
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
