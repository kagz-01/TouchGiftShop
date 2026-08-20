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
      className={cn("p-6 md:p-8 shape-premium-card border border-surface-border shadow-sm mb-6 transition-colors", tintClass)}
    >
      {/* Header — slides in from left */}
      <div
        className="flex items-center justify-between mb-6 md:mb-8"
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
          <h2 className="font-display text-xl md:text-3xl font-bold">{title}</h2>
          {subtitle && (
            <p className="text-sm text-brand-muted mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs font-semibold text-brand hover:text-gold transition-colors bg-white px-4 py-2 shape-premium-button border border-surface-border shadow-sm hover:shadow-md"
            >
              {viewAllLabel} →
            </Link>
          )}
        </div>
      </div>

      {/* Product strip — marquee */}
      <div className="relative flex overflow-x-hidden group w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] -ml-6 md:-ml-8 px-6 md:px-8 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        {/* Render products multiple times if marquee is active */}
        <div className={cn(
          "flex gap-4 md:gap-5 pb-4 w-full",
          marqueeDirection ? "whitespace-nowrap min-w-full shrink-0 group-hover:[animation-play-state:paused]" : "overflow-x-auto scrollbar-hide",
          marqueeDirection === "right" ? "animate-marquee-reverse" : marqueeDirection === "left" ? "animate-marquee" : ""
        )}>
          {products.map((product, i) => (
            <Link
              key={`${product.id}-1`}
              href={`/product/${product.id}`}
              className="group flex items-center gap-4 md:gap-5 p-3 md:p-4 pr-6 card-theme rounded-[1.5rem] hover:-translate-y-1 shrink-0 w-[300px] md:w-[380px]"
              style={marqueeDirection ? {} : {
                transitionDelay: `${80 + i * 60}ms`,
                transitionProperty: "opacity, transform",
                transitionDuration: "500ms",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(22px)",
              }}
            >
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-[1.2rem] overflow-hidden shrink-0 bg-blush shadow-inner">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(min-width: 768px) 144px, 112px"
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-warm">
                    <Gift className="w-8 h-8 text-brand/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 py-2 whitespace-normal">
                <h3 className="font-display font-bold text-base md:text-lg text-theme-heading leading-tight mb-2 group-hover:text-brand transition-colors line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gold font-bold text-sm md:text-base">{formatKsh(product.price)}</p>
              </div>
            </Link>
          ))}
        </div>

        {marqueeDirection && (
          <div className={cn(
            "flex gap-4 md:gap-5 pb-4 ml-4 md:ml-5",
            "whitespace-nowrap min-w-full shrink-0 group-hover:[animation-play-state:paused]",
            marqueeDirection === "right" ? "animate-marquee-reverse" : "animate-marquee"
          )} aria-hidden="true">
            {products.map((product) => (
              <Link
                key={`${product.id}-2`}
                href={`/product/${product.id}`}
                className="group flex items-center gap-4 md:gap-5 p-3 md:p-4 pr-6 card-theme rounded-[1.5rem] hover:-translate-y-1 shrink-0 w-[300px] md:w-[380px]"
              >
                <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-[1.2rem] overflow-hidden shrink-0 bg-blush shadow-inner">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(min-width: 768px) 144px, 112px"
                      className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-warm">
                      <Gift className="w-8 h-8 text-brand/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 py-2 whitespace-normal">
                  <h3 className="font-display font-bold text-base md:text-lg text-theme-heading leading-tight mb-2 group-hover:text-brand transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-gold font-bold text-sm md:text-base">{formatKsh(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
