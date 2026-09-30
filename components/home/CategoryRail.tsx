import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * A scrolling rail of category tiles.
 *
 * The homepage showed perfumes and gift sets and nothing else, which left
 * ~266 in-stock SKUs across seven categories invisible. This surfaces them
 * without adding a fourth product marquee — the other three strips all
 * re-show products from categories the visitor has already seen.
 *
 * Marquee mechanics match FeaturedRow: one `w-max` track holding two copies,
 * so the -50% keyframe lands exactly on the copy boundary. No JS required.
 */

export type CategoryTileData = {
  slug: string;
  name: string;
  count: number;
  heroImage: string | null;
  heroName: string;
};

function Tile({ tile }: { tile: CategoryTileData }) {
  return (
    <Link
      href={`/shop?category=${tile.slug}`}
      className={cn(
        "group relative w-[230px] sm:w-[260px] shrink-0 overflow-hidden rounded-[1.5rem]",
        "border border-surface-border card-theme transition-all duration-500 hover:-translate-y-1.5",
        "hover:shadow-card-hover"
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-brand/10 to-brand/20">
        {tile.heroImage ? (
          <img
            src={tile.heroImage}
            alt={tile.heroName}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : null}
        {/* Keeps the label legible over any photograph */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 p-4">
          <p className="font-display font-bold text-lg text-white leading-tight mb-1">
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
  if (!tiles.length) return null;
  // Two copies so the -50% translate loops seamlessly.
  const loop = [...tiles, ...tiles];

  return (
    <section className="py-8 md:py-10 section-theme-a relative overflow-hidden">
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
              {totalCount.toLocaleString()} more gifts across {tiles.length} categories.
              All in stock, all same-day eligible across Nairobi.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-gold transition-colors bg-white dark:bg-white/[0.06] px-4 py-2 rounded-full border border-surface-border shadow-sm flex-shrink-0"
          >
            Browse all →
          </Link>
        </div>
      </div>

      <div
        className="relative overflow-x-hidden group w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] -ml-6 md:-ml-8 px-6 md:px-8 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]"
      >
        <div className="flex gap-4 md:gap-5 pb-4 w-max whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
          {loop.map((tile, i) => (
            <Tile key={`${tile.slug}-${i}`} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  );
}