"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Gift } from "lucide-react";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ColumnConfig {
  title: string;
  viewAllHref: string;
  products: Product[];
  /** "down" = normal, "up" = reverse */
  direction: "down" | "up";
  speed?: number; // seconds, default 35
}

interface VerticalProductColumnsProps {
  columns: ColumnConfig[];
  /** Height of the scrolling viewport in px */
  height?: number;
  sectionTitle?: string;
  sectionSubtitle?: string;
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex items-center gap-4 md:gap-5 p-3 md:p-4 pr-6 bg-white border border-surface-border hover:border-brand/30 rounded-[1.5rem] hover:shadow-lg hover:shadow-brand/5 transition-all duration-300 hover:-translate-y-1 w-full shrink-0"
    >
      {/* Image */}
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
          <div className="w-full h-full flex items-center justify-center">
            <Gift className="w-8 h-8 text-brand/30" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-2">
        <h3 className="font-display font-bold text-base md:text-lg text-brand-deep leading-tight mb-2 group-hover:text-brand transition-colors line-clamp-2">
          {product.name}
        </h3>
        <p className="text-gold font-bold text-sm md:text-base">{formatKsh(product.price)}</p>
      </div>
    </Link>
  );
}

export default function VerticalProductColumns({
  columns,
  height = 560,
  sectionTitle,
  sectionSubtitle,
}: VerticalProductColumnsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="py-16 md:py-20 bg-[#FDFCFA] relative overflow-hidden">
      {/* Subtle warm gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blush/20 via-transparent to-blush/10 pointer-events-none" />

      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 relative z-10">
        {/* Section heading */}
        {sectionTitle && (
          <div className="text-center mb-14">
            <p className="text-brand font-bold text-xs uppercase tracking-[0.2em] mb-3">
              {sectionSubtitle || "Discover"}
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
              {sectionTitle}
            </h2>
          </div>
        )}

        {/* Responsive vertical marquee grid */}
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {columns.map((col, colIdx) => {
            const speed = col.speed ?? 35;
            // Double the products for seamless loop
            const loopItems = [...col.products, ...col.products];
            const animClass =
              col.direction === "up"
                ? "animate-marquee-vertical-reverse"
                : "animate-marquee-vertical";

            return (
              <div key={colIdx} className="flex flex-col gap-4 bg-[#FAF8F9] border border-surface-border rounded-[2rem] p-5 md:p-6 shadow-sm">
                {/* Column header */}
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-base md:text-xl text-brand-deep">
                    {col.title}
                  </span>
                  <Link
                    href={col.viewAllHref}
                    className="text-xs font-semibold text-brand hover:text-gold transition-colors bg-white px-3 py-1.5 rounded-full border border-surface-border shadow-sm hover:shadow-md"
                  >
                    See all →
                  </Link>
                </div>

                {/* Scrolling column */}
                <div
                  className="relative overflow-hidden -mx-2 px-2"
                  style={{ height }}
                >
                  {/* Top fade */}
                  <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#FAF8F9] to-transparent z-10 pointer-events-none" />
                  {/* Bottom fade */}
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#FAF8F9] to-transparent z-10 pointer-events-none" />

                  {/* Marquee track */}
                  {mounted && (
                    <div
                      className={`flex flex-col gap-3 ${animClass} hover:[animation-play-state:paused]`}
                      style={{
                        animationDuration: `${speed}s`,
                        // Reverse animation initial position
                        ...(col.direction === "up"
                          ? {}
                          : {}),
                      }}
                    >
                      {loopItems.map((product, i) => (
                        <ProductCard key={`${product.id}-${i}`} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
