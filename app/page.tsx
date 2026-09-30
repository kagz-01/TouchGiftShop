import { Suspense } from "react";
import Link from "next/link";
import { ShoppingBag, Target } from "lucide-react";
import type { Metadata } from "next";
import {
  HeroCinematic,
  ProblemSection,
  SocialProof,
  StoryHowItWorks,
} from "@/components/home/StorytellingHome";
import FeaturedRow from "@/components/home/FeaturedRow";
import VerticalProductColumns from "@/components/home/VerticalProductColumns";
import SuperpowersStrip from "@/components/home/SuperpowersStrip";
import VisitUs from "@/components/home/VisitUs";
import SmartReorderBanner from "@/components/discovery/SmartReorderBanner";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/types";
import { optimizeProductImagesList } from "@/lib/image-url";
import { formatKsh } from "@/lib/utils";
import AuthErrorRedirect from "@/components/auth/AuthErrorRedirect";

/**
 * The homepage is prerendered — without this it is frozen at build time and
 * keeps showing products that have since been deleted from the catalog.
 * 60s keeps the edge copy fresh while still absorbing bursts of traffic.
 */
export const revalidate = 60;

/**
 * Homepage SEO metadata.
 * Strategy: title = Kenya (broad reach) + description anchors Nairobi (high-intent local).
 * Covers: "gift delivery Kenya", "gifts in Nairobi", "same-day gift delivery Nairobi",
 *         "gift hampers Kenya", "birthday gifts Nairobi", "corporate gifts Kenya".
 */
export const metadata: Metadata = {
  title: "TouchGift — Kenya's Premium Gift Delivery | Same-Day Nairobi",
  description:
    "Order curated gifts, hampers & perfumes online. Same-day delivery in Nairobi, next-day across Kenya. Free gift wrapping, corporate gifting & group orders. Trusted by 5,000+ happy customers.",
  openGraph: {
    title: "TouchGift — Kenya's Premium Gift Delivery",
    description:
      "Curated gifts & hampers delivered same-day in Nairobi and nationwide across Kenya. Beautiful wrapping included. Order in minutes.",
    images: [{ url: "/logo/logo.webp", width: 1200, height: 630, alt: "TouchGift — Gift Delivery Kenya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TouchGift — Kenya's Premium Gift Delivery",
    description:
      "Same-day gift delivery in Nairobi, next-day across Kenya. Beautiful wrapping. Group gifting. Corporate orders.",
    images: ["/logo/logo.webp"],
  },
  keywords: [
    "gift delivery Kenya",
    "gifts in Nairobi",
    "same-day gift delivery Nairobi",
    "gift hampers Kenya",
    "birthday gifts Nairobi",
    "anniversary gifts Kenya",
    "corporate gifts Nairobi",
    "perfume gifts Kenya",
    "gift shop Nairobi",
    "online gift shop Kenya",
    "group gifting Kenya",
    "gift wrapping Nairobi",
  ],
};

async function getByCategory(categorySlug: string, limit = 10): Promise<Product[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("products")
    .select("*, product_categories!inner(categories!inner(slug))")
    .eq("in_stock", true)
    .eq("product_categories.categories.slug", categorySlug)
    .limit(limit);
  return optimizeProductImagesList((data ?? []) as unknown as Product[]) ?? [];
}
type CorpRow = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  product_categories: { categories: { slug: string } | null }[];
};

export type CorporateShot = {
  id: string;
  label: string;
  price: number;
  image: string;
  t: "corporate" | "bulk" | "solo";
};

/** Picks six real, in-stock products and tags each to a corporate route, so the
 *  intro shows actual catalogue photography instead of stock imagery. */
function buildCorporateShots(rows: CorpRow[]): CorporateShot[] {
  const slugs = (r: CorpRow) =>
    (r.product_categories ?? []).map((c) => c.categories?.slug).filter(Boolean) as string[];
  const usable = rows.filter((r) => r.image_url);
  const take = (slug: string, t: CorporateShot["t"], n: number) =>
    usable
      .filter((r) => slugs(r).includes(slug))
      .slice(0, n)
      .map((r) => ({ id: r.id, label: r.name, price: r.price, image: r.image_url!, t }));

  return [
    ...take("gift-sets", "corporate", 2),
    ...take("drinkware", "bulk", 2),
    ...take("awards-trophies", "solo", 1),
    ...take("stationery-office", "solo", 1),
  ];
}

async function getFeaturedProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [trending, lastMinute, perfume, giftSets, corporateShots, perfumeStats] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .order("created_at", { ascending: false })
        .limit(10)
        .then((r) => (r.data ?? []) as Product[]),

      // "Last Minute" reads as "the most gift you can get inside the budget,
      // today" — so rank by value, not by cheapest-first.
      supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .lte("price", 3000)
        .order("price", { ascending: false })
        .limit(10)
        .then((r) => (r.data ?? []) as Product[]),

      // Perfumes are 51% of the in-stock catalogue, so they get a column in the
      // first product moment under the hero rather than a slot further down.
      getByCategory("perfumes", 10),
      getByCategory("gift-sets", 10),

      // Count + price floor drive the sub-headline, so the copy can't go stale
      // when stock or pricing changes.
      // Real stock for the corporate intro instead of stock photography:
      // hampers (team), drinkware (bulk), awards + stationery (branded solo).
      supabase
        .from("products")
        .select("id,name,price,image_url,product_categories!inner(categories!inner(slug))")
        .eq("in_stock", true)
        .in("product_categories.categories.slug", [
          "gift-sets", "drinkware", "stationery-office", "awards-trophies",
        ])
        .then((r) => buildCorporateShots(((r.data ?? []) as unknown as CorpRow[]) ?? [])),

      supabase
        .from("products")
        .select("price, product_categories!inner(categories!inner(slug))")
        .eq("in_stock", true)
        .eq("product_categories.categories.slug", "perfumes")
        .then((r) => {
          const prices = ((r.data ?? []) as unknown as { price: number }[]).map((p) => p.price);
          return {
            count: prices.length,
            from: prices.length ? Math.min(...prices) : 0,
          };
        }),
    ]);

  [trending, lastMinute, perfume, giftSets].forEach((list) =>
    optimizeProductImagesList(list)
  );

  return { trending, lastMinute, perfume, giftSets, corporateShots, perfumeStats };
}

export default async function HomePage() {
  const { trending, lastMinute, perfume, giftSets, corporateShots, perfumeStats } =
    await getFeaturedProducts();

  return (
    <div className="overflow-x-hidden">
      {/* Catch Supabase auth errors that land on the homepage (e.g. expired magic links) */}
      <Suspense fallback={null}>
        <AuthErrorRedirect />
      </Suspense>

      {/* ═══════════════════════════════════════════
          CHAPTER 1: The Emotional Hook
          ═══════════════════════════════════════════ */}
      <HeroCinematic />

      {/* ═══════════════════════════════════════════
          CHAPTER 1.25: Discovery, immediately
          Answers the hero's "pick a mood" prompt with
          buyable stock instead of more narrative.
          Trending ↓  |  Last Minute ↑  |  Drinkware ↓
          ═══════════════════════════════════════════ */}
      <VerticalProductColumns
        sectionEyebrow="You picked a mood"
        sectionTitle="We already did the work."
        sectionSub="Live stock, ready to send. Same-day across Nairobi."
        columns={[
          {
            title: "Trending Now",
            viewAllHref: "/shop",
            products: trending,
            direction: "down",
            speed: 32,
          },
          {
            title: "Last Minute",
            viewAllHref: "/shop?budget=under-5k",
            products: lastMinute,
            direction: "up",
            speed: 28,
          },
          {
            title: "Perfumes",
            viewAllHref: "/shop?category=perfumes",
            products: perfume,
            direction: "down",
            speed: 36,
          },
        ]}
        height={520}
      />

      {/* Second door: business buyers fork off here, before the consumer
          narrative starts. Also where the hero's corporate mood tab lands. */}

      <ProblemSection />

      {/* ═══════════════════════════════════════════
          CHAPTER 1.5: TouchGift Superpowers (USPs)
          ═══════════════════════════════════════════ */}
      <SuperpowersStrip />

      {/* ═══════════════════════════════════════════
          CHAPTER 3B: Discovery — Horizontal Rows
          Hampers ←  |  Perfumes →
          Perfumes floor at KSh 6,075, so the old "Under KSh 2,000" row
          could never carry them; the keyring edit went to /shop only.
          ═══════════════════════════════════════════ */}
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 pb-4 space-y-0">
        <FeaturedRow
          title="Gift Sets & Hampers"
          subtitle="Hand-packed hampers & curated sets"
          products={giftSets}
          viewAllHref="/shop?category=gift-sets"
          viewAllLabel="See all"
          tint="cool"
          marqueeDirection="left"
        />
        <FeaturedRow
          title="The one they'll wear on you."
          subtitle={
            perfumeStats.count > 0
              ? `${perfumeStats.count} authentic fragrances, from ${formatKsh(perfumeStats.from)}`
              : "Authentic designer and niche scents"
          }
          products={perfume}
          viewAllHref="/shop?category=perfumes"
          viewAllLabel="See all"
          tint="warm"
          marqueeDirection="right"
        />
      </div>

      {/* Vertical Marquee block — FULL BLEED (removed max-w) */}
      <div className="w-full mx-auto pt-6 flex flex-col sm:flex-row gap-3 px-0">
        <div className="flex-1"><SmartReorderBanner /></div>
      </div>

      {/* ═══════════════════════════════════════════
          INTERSTITIAL — AI Gift Finder CTA break
          ═══════════════════════════════════════════ */}
      <ScrollReveal className="w-full py-4 md:py-6" delay={0}>
        <a
          href="/gift-finder"
          className="group block relative overflow-hidden bg-gradient-to-r from-brand to-brand-deep py-6 md:py-8 px-4 md:px-6 text-white shadow-lg hover:shadow-2xl transition-all duration-500"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full animate-pulse-soft" />
          <div className="absolute -right-4 -bottom-8 w-28 h-28 bg-gold/10 rounded-full animate-pulse-soft" style={{ animationDelay: "1s" }} />
          <div className="relative z-10 w-full max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-left max-w-md">
                <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-1">30-Second Quiz</p>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">Not sure what to gift?</h3>
                <p className="text-white/70 text-sm">
                  Tell us who it&apos;s for and your budget. Our AI finds the perfect match in seconds — no browsing required.
                </p>
              </div>
            </div>
            <div className="bg-white text-brand px-8 py-4 rounded-full font-bold text-base shrink-0 group-hover:bg-gold group-hover:text-white transition-all duration-300 shadow-lg group-hover:-translate-y-1">
              Find a Gift →
            </div>
          </div>
        </a>
      </ScrollReveal>

      {/* Browse All CTA */}
      <ScrollReveal className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-4 pb-10" delay={0}>
        <Link
          href="/shop"
          className="group block bg-white dark:bg-white/[0.04] border-2 border-surface-border dark:border-white/10 hover:border-brand/30 rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-card"
        >
          <div className="flex items-center justify-center gap-3">
            <ShoppingBag className="w-6 h-6 text-brand group-hover:scale-110 transition-transform duration-300" />
            <div>
              <p className="font-display text-lg font-bold group-hover:text-brand transition-colors">Browse All 200+ Gifts</p>
              <p className="text-xs text-brand-muted dark:text-white/60">Across 30+ curated categories — something for everyone</p>
            </div>
            <svg className="w-5 h-5 text-brand-muted dark:text-white/60 group-hover:text-brand group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════
          CHAPTER 2: Trust — Social Proof
          ═══════════════════════════════════════════ */}
      <SocialProof />

      {/* ═══════════════════════════════════════════
          CHAPTER 6: Final Conversion
          ═══════════════════════════════════════════ */}
      <StoryHowItWorks />

      {/* Visit us — shop location map */}
      <VisitUs />
    </div>
  );
}
