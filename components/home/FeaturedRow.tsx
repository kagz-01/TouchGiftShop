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
  /** direction for automatic marquee scroll */
  marqueeDirection?: "left" | "right";
  /** tint the section background for chapter alternation */
  tint?: "warm" | "cool" | "none";
}

export default function FeaturedRow({
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel = "View all",
  marqueeDirection,
  tint = "none",
}: FeaturedRowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

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
        </div>
      </div>

      {/* Product strip — marquee */}
      <div className="relative flex overflow-x-hidden group w-full -mx-4 px-4 md:mx-0 md:px-0">
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        
        {/* Render products multiple times if marquee is active */}
        <div className={cn(
          "flex gap-3 pb-2 w-full",
          marqueeDirection ? "whitespace-nowrap min-w-full shrink-0 group-hover:[animation-play-state:paused]" : "overflow-x-auto scrollbar-hide",
          marqueeDirection === "right" ? "animate-marquee-reverse" : marqueeDirection === "left" ? "animate-marquee" : ""
        )}>
          {products.map((product, i) => (
            <Link
              key={`${product.id}-1`}
              href={`/product/${product.id}`}
              className="flex-shrink-0 w-[160px] md:w-[200px] group/card whitespace-normal"
              style={marqueeDirection ? {} : {
                transitionDelay: `${80 + i * 60}ms`,
                transitionProperty: "opacity, transform",
                transitionDuration: "500ms",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(22px)",
              }}
            >
              <div className="relative aspect-[4/5] bg-blush rounded-2xl overflow-hidden mb-2 shadow-sm group-hover/card:shadow-card transition-shadow duration-300">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-warm">
                    <Gift className="w-10 h-10 text-brand/40" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-2 group-hover/card:translate-y-0">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center text-xs font-semibold text-brand shadow-soft">
                    Quick View
                  </div>
                </div>
              </div>
              <h3 className="font-display font-semibold text-xs md:text-sm line-clamp-2 group-hover/card:text-brand transition-colors mb-0.5">
                {product.name}
              </h3>
              <p className="text-gold font-bold text-xs md:text-sm">{formatKsh(product.price)}</p>
            </Link>
          ))}
        </div>

        {marqueeDirection && (
          <div className={cn(
            "flex gap-3 pb-2 ml-3",
            "whitespace-nowrap min-w-full shrink-0 group-hover:[animation-play-state:paused]",
            marqueeDirection === "right" ? "animate-marquee-reverse" : "animate-marquee"
          )} aria-hidden="true">
            {products.map((product) => (
              <Link
                key={`${product.id}-2`}
                href={`/product/${product.id}`}
                className="flex-shrink-0 w-[160px] md:w-[200px] group/card whitespace-normal"
              >
                <div className="relative aspect-[4/5] bg-blush rounded-2xl overflow-hidden mb-2 shadow-sm group-hover/card:shadow-card transition-shadow duration-300">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-warm">
                      <Gift className="w-10 h-10 text-brand/40" />
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-2 group-hover/card:translate-y-0">
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 text-center text-xs font-semibold text-brand shadow-soft">
                      Quick View
                    </div>
                  </div>
                </div>
                <h3 className="font-display font-semibold text-xs md:text-sm line-clamp-2 group-hover/card:text-brand transition-colors mb-0.5">
                  {product.name}
                </h3>
                <p className="text-gold font-bold text-xs md:text-sm">{formatKsh(product.price)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
