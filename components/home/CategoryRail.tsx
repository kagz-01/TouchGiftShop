"use client";

import { useState } from "react";
import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategoryTileData = {
  slug: string;
  name: string;
  count: number;
  heroImage: string | null;
  heroName: string;
  href?: string;
  badge?: string;
  is18Plus?: boolean;
};

function Tile({ tile }: { tile: CategoryTileData }) {
  return (
    <Link
      href={tile.href ?? `/shop?category=${tile.slug}`}
      className={cn(
        "group relative w-[230px] sm:w-[260px] shrink-0 overflow-hidden rounded-[1.5rem]",
        "border border-surface-border card-theme transition-all duration-500 hover:-translate-y-1.5",
        "hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-brand/10 to-brand/20">
        {tile.heroImage ? (
          <img
            src={tile.heroImage}
            alt={tile.heroName || tile.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : null}

        {/* 18+ or Special Badge */}
        {tile.is18Plus && (
          <div className="absolute top-3 right-3 z-10 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-amber-400/40">
            18+ Only
          </div>
        )}
        {tile.badge && !tile.is18Plus && (
          <div className="absolute top-3 right-3 z-10 px-2.5 py-0.5 rounded-full bg-brand/85 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
            {tile.badge}
          </div>
        )}

        {/* Keeps the label legible over any photograph */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-4">
          <p className="font-display font-bold text-lg text-white leading-tight mb-1 group-hover:text-gold transition-colors">
            {tile.name}
          </p>
          <p className="text-xs text-white/75">
            {tile.count} {tile.count === 1 ? "gift" : "gifts"}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function CategoryRail({
  tiles,
  totalCount,
}: {
  tiles: CategoryTileData[];
  totalCount: number;
}) {
  const [isPaused, setIsPaused] = useState(false);

  if (!tiles.length) return null;

  // 3 copies to ensure smooth infinite loop across ultra-wide viewports
  const loop = [...tiles, ...tiles, ...tiles];

  return (
    <section className="py-8 md:py-10 section-theme-a relative overflow-hidden" aria-label="Gifting Categories">
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 relative z-10">
        <div className="flex items-end justify-between gap-6 mb-6 md:mb-8">
          <div>
            <p className="text-brand font-bold text-xs uppercase tracking-[0.2em] mb-2">
              Browse by category
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-theme-heading heading-elegant">
              Or start from the shelf.
            </h2>
            <p className="text-theme-body text-sm md:text-base mt-2 max-w-lg">
              {totalCount.toLocaleString()} curated gifts across {tiles.length} categories.
              All in stock, same-day dispatch available across Nairobi.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* WCAG 2.2 Carousel Pause Toggle */}
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? "Play category marquee" : "Pause category marquee"}
              className="p-2 rounded-full border border-surface-border bg-white dark:bg-white/[0.06] text-theme-body hover:text-brand transition-colors shadow-sm"
              title={isPaused ? "Play marquee" : "Pause marquee"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <Link
              href="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-gold transition-colors bg-white dark:bg-white/[0.06] px-4 py-2 rounded-full border border-surface-border shadow-sm flex-shrink-0"
            >
              Browse all →
            </Link>
          </div>
        </div>
      </div>

      <div
        className="relative overflow-x-hidden group w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] -ml-6 md:-ml-8 px-6 md:px-8 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
      >
        <div
          className={cn(
            "flex gap-4 md:gap-5 pb-4 w-max whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]",
            isPaused && "[animation-play-state:paused]"
          )}
        >
          {loop.map((tile, i) => (
            <Tile key={`${tile.slug}-${i}`} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  );
}
