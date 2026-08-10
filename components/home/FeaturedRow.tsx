"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Gift } from "lucide-react";
import { formatKsh, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface FeaturedRowProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  /** tint the section background for chapter alternation */
  tint?: "warm" | "cool" | "none";
}

export default function FeaturedRow({
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel = "View all",
  tint = "none",
}: FeaturedRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [visible, setVisible] = useState(false);

  // Scroll shadow state
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

  // IntersectionObserver for reveal
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  const tintClass =
    tint === "warm"
      ? "bg-blush/30"
      : tint === "cool"
      ? "bg-surface-secondary"
      : "";

  return (
    <section
      ref={sectionRef}
      className={cn("py-8 md:py-10 rounded-3xl transition-colors", tintClass)}
    >
      {/* Header — slides in from left */}
      <div
        className="flex items-center justify-between mb-5"
        style={{
          transitionDelay: "0ms",
          transitionProperty: "opacity, transform",
          transitionDuration: "500ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-18px)",
        }}
      >
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold">{title}</h2>
          {subtitle && (
            <p className="text-xs text-brand-muted mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors mr-2"
            >
              {viewAllLabel} →
            </Link>
          )}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "w-8 h-8 rounded-full border border-surface-border flex items-center justify-center transition-all",
              canScrollLeft
                ? "text-brand hover:bg-brand/5 hover:border-brand/30"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "w-8 h-8 rounded-full border border-surface-border flex items-center justify-center transition-all",
              canScrollRight
                ? "text-brand hover:bg-brand/5 hover:border-brand/30"
                : "text-gray-300 cursor-not-allowed"
            )}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Product strip — cards stagger in */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, i) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="flex-shrink-0 w-[160px] md:w-[200px] group"
            style={{
              transitionDelay: `${80 + i * 60}ms`,
              transitionProperty: "opacity, transform",
              transitionDuration: "500ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(22px)",
            }}
          >
            <div className="relative aspect-[4/5] bg-blush rounded-2xl overflow-hidden mb-2 shadow-sm group-hover:shadow-card transition-shadow duration-300">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="200px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-warm">
                  <Gift className="w-10 h-10 text-brand/40" />
                </div>
              )}

              {/* Quick view on hover */}
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center text-xs font-semibold text-brand shadow-soft">
                  Quick View
                </div>
              </div>
            </div>

            <h3 className="font-display font-semibold text-xs md:text-sm line-clamp-2 group-hover:text-brand transition-colors mb-0.5">
              {product.name}
            </h3>
            <p className="text-gold font-bold text-xs md:text-sm">{formatKsh(product.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
