"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Sparkles, Zap, Users, Gift, ChevronRight, ArrowRight } from "lucide-react";

/*
  MobileGiftRail
  ─────────────────────────────────────────────────────────────────────────────
  HCI Principles applied:
  • Fitts's Law  — large thumb-zone cards (min-h-[88px]) anchored to natural
    thumb reach range (bottom 40% of content area, not toolbar).
  • Hick's Law   — 4 curated pathways only: by urgency, by person, by budget,
    by occasion.  Avoids decision paralysis from 50+ category links.
  • Show, Don't Tell — visual gradient tiles with emoji + live stock label,
    not text lists.
  • Scroll Elimination — horizontal snap rail so the entire category shelf is
    1 swipe wide; no vertical scroll required to reach all entries.
  • Zero-Scroll Gifting CTA — a sticky "Quick Gift" pill floats above the
    bottom nav after the user scrolls past the hero (IntersectionObserver).
  ─────────────────────────────────────────────────────────────────────────────
*/

type GiftTile = {
  id: string;
  emoji: string;
  title: string;
  sub: string;
  href: string;
  badge?: string;
  from: string; // gradient from
  to: string;   // gradient to
};

const GIFT_TILES: GiftTile[] = [
  {
    id: "same-day",
    emoji: "⚡",
    title: "Same-Day Gifts",
    sub: "Order before 2 PM",
    href: "/shop?fast_delivery=1",
    badge: "Today",
    from: "#FF6B6B",
    to: "#9B1B5A",
  },
  {
    id: "hampers",
    emoji: "🎁",
    title: "Gift Hampers",
    sub: "Curated & hand-packed",
    href: "/shop?category=gift-sets",
    badge: "Popular",
    from: "#9B1B5A",
    to: "#D4A853",
  },
  {
    id: "perfumes",
    emoji: "✨",
    title: "Luxury Perfumes",
    sub: "Designer & authentic",
    href: "/shop?category=perfumes",
    from: "#D4A853",
    to: "#B08A3A",
  },
  {
    id: "group",
    emoji: "👥",
    title: "Pool a Gift",
    sub: "Chip in together",
    href: "/pool/create",
    badge: "Group",
    from: "#1A1A2E",
    to: "#9B1B5A",
  },
  {
    id: "under3k",
    emoji: "💳",
    title: "Under KSh 3,000",
    sub: "Great gifts, any budget",
    href: "/shop?budget=under-3k",
    from: "#22C55E",
    to: "#16A34A",
  },
  {
    id: "corporate",
    emoji: "🏢",
    title: "Corporate Gifts",
    sub: "Branded, invoiced, bulk",
    href: "/corporate/catalog",
    badge: "B2B",
    from: "#0F172A",
    to: "#334155",
  },
];

type OccasionChip = { label: string; emoji: string; href: string };
const OCCASION_CHIPS: OccasionChip[] = [
  { label: "Birthday", emoji: "🎂", href: "/shop?occasion=birthday" },
  { label: "Romance", emoji: "💕", href: "/shop?occasion=romance" },
  { label: "Apology", emoji: "🙏", href: "/shop?occasion=apology" },
  { label: "New Baby", emoji: "👶", href: "/shop?occasion=new-baby" },
  { label: "Promotion", emoji: "🏆", href: "/shop?occasion=promotion" },
  { label: "Get Well", emoji: "💐", href: "/shop?occasion=get-well" },
  { label: "Graduation", emoji: "🎓", href: "/shop?occasion=graduation" },
  { label: "Wedding", emoji: "💍", href: "/shop?occasion=wedding" },
];

export function MobileGiftRail() {
  return (
    <section className="md:hidden py-4" aria-label="Quick gift pathways">
      {/* Section Label */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div>
          <h2 className="font-display font-bold text-base text-gray-900 dark:text-white">
            Quick Gift by Mood
          </h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Same-day delivery across Nairobi</p>
        </div>
        <Link
          href="/shop"
          className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          All gifts <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Horizontal Snap Tiles */}
      <div
        className="flex gap-3 overflow-x-auto no-scrollbar pl-4 pr-6 pb-2 snap-x-scroll"
        role="list"
      >
        {GIFT_TILES.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            role="listitem"
            className="snap-start shrink-0 w-[150px] min-h-[108px] rounded-2xl flex flex-col justify-between p-3.5 relative overflow-hidden active:scale-[0.97] transition-transform"
            style={{
              background: `linear-gradient(135deg, ${tile.from}, ${tile.to})`,
            }}
            aria-label={tile.title}
          >
            {/* Badge */}
            {tile.badge && (
              <span className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/25 text-white backdrop-blur-sm">
                {tile.badge}
              </span>
            )}
            {/* Emoji */}
            <span className="text-2xl leading-none" aria-hidden="true">
              {tile.emoji}
            </span>
            {/* Text */}
            <div>
              <h3 className="font-bold text-xs text-white leading-tight">{tile.title}</h3>
              <p className="text-[10px] text-white/75 mt-0.5 leading-snug">{tile.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Occasion Chips — horizontal scrollable */}
      <div className="mt-4 px-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 mb-2">
          Shop by Occasion
        </p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {OCCASION_CHIPS.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 border border-transparent hover:border-brand/30 text-xs font-semibold whitespace-nowrap text-gray-800 dark:text-zinc-200 min-h-[44px] transition-colors"
            >
              <span aria-hidden="true">{chip.emoji}</span>
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/*
  QuickGiftFAB — Floating Action Button
  Appears on mobile only after user scrolls past the hero (using IntersectionObserver).
  Gives instant access to the AI gift finder without navigating away.
  Respects the bottom nav clearance (bottom-20).
*/
export function QuickGiftFAB({ sentinelId = "hero-sentinel" }: { sentinelId?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-24 right-4 z-[200] md:hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Link
        href="/gift-finder"
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-brand text-white font-bold text-sm shadow-[0_8px_30px_rgba(155,27,90,0.4)] hover:bg-brand-light active:scale-95 transition-all"
        aria-label="Open AI Gift Finder"
      >
        <Sparkles className="w-4 h-4 text-gold shrink-0" />
        Find a Gift
        <ArrowRight className="w-3.5 h-3.5 opacity-80" />
      </Link>
    </div>
  );
}

/*
  MobileHomeTabs — collapses 9 desktop storytelling chapters into 3 visual tabs:
  "Trending", "Build", "Corporate".
  Each tab swap is instant with no vertical scroll. Desktop sees all chapters as-is.
*/
type TabKey = "trending" | "build" | "corporate";

const MOBILE_TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: "trending", label: "Trending", emoji: "🔥" },
  { key: "build", label: "Build a Gift", emoji: "🎁" },
  { key: "corporate", label: "Corporate", emoji: "🏢" },
];

export function MobileHomeTabs({
  trendingSlot,
  buildSlot,
  corporateSlot,
}: {
  trendingSlot: React.ReactNode;
  buildSlot: React.ReactNode;
  corporateSlot: React.ReactNode;
}) {
  const [active, setActive] = useState<TabKey>("trending");
  const contentMap: Record<TabKey, React.ReactNode> = {
    trending: trendingSlot,
    build: buildSlot,
    corporate: corporateSlot,
  };

  return (
    <section className="md:hidden" aria-label="Gift sections">
      {/* Sticky Tab Bar — stays within content (not fixed, so it scrolls with the page until it hits the top of the viewport) */}
      <div className="sticky top-14 z-30 bg-white/90 dark:bg-[#12121a]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center px-4 gap-1 overflow-x-auto no-scrollbar">
          {MOBILE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all min-h-[48px] ${
                active === tab.key
                  ? "border-brand text-brand dark:text-brand-light"
                  : "border-transparent text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              aria-selected={active === tab.key}
              role="tab"
            >
              <span aria-hidden="true">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content — instant swap (no transition delay so no perceived lag) */}
      <div role="tabpanel" aria-label={active}>
        {contentMap[active]}
      </div>
    </section>
  );
}

