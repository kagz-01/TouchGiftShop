import { Suspense } from "react";
import Link from "next/link";
import { ShoppingBag, Target } from "lucide-react";
import {
  HeroCinematic,
  ProblemSection,
  SolutionSection,
  SocialProof,
  StoryHowItWorks,
  FinalCTA,
} from "@/components/home/StorytellingHome";
import OccasionPills from "@/components/home/OccasionPills";
import FeaturedRow from "@/components/home/FeaturedRow";
import VerticalProductColumns from "@/components/home/VerticalProductColumns";
import SuperpowersStrip from "@/components/home/SuperpowersStrip";
import SeasonalPromptBar from "@/components/home/SeasonalPromptBar";
import SmartReorderBanner from "@/components/discovery/SmartReorderBanner";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { createClient } from "@supabase/supabase-js";
import type { Product } from "@/lib/types";

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
  return (data ?? []) as unknown as Product[];
}

async function getFeaturedProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [trending, lastMinute, edible, selfCare, personalised, under2k] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .order("created_at", { ascending: false })
        .limit(10)
        .then((r) => (r.data ?? []) as Product[]),

      supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .lte("price", 3000)
        .order("price", { ascending: true })
        .limit(10)
        .then((r) => (r.data ?? []) as Product[]),

      getByCategory("chocolates-sweets-gifts", 10),
      getByCategory("wellness-self-care-hampers", 10),
      getByCategory("personalized-gifts", 10),

      supabase
        .from("products")
        .select("*")
        .eq("in_stock", true)
        .lte("price", 2000)
        .order("price", { ascending: true })
        .limit(10)
        .then((r) => (r.data ?? []) as Product[]),
    ]);

  return { trending, lastMinute, edible, selfCare, personalised, under2k };
}

export default async function HomePage() {
  const { trending, lastMinute, edible, selfCare, personalised, under2k } =
    await getFeaturedProducts();

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════
          CHAPTER 1: The Emotional Hook
          ═══════════════════════════════════════════ */}
      <HeroCinematic />
      <ProblemSection />
      <SolutionSection />

      {/* ═══════════════════════════════════════════
          CHAPTER 1.5: TouchGift Superpowers (USPs)
          ═══════════════════════════════════════════ */}
      <SuperpowersStrip />

      {/* ═══════════════════════════════════════════
          CHAPTER 2: Trust — Social Proof
          ═══════════════════════════════════════════ */}
      <SocialProof />

      {/* Vertical Marquee block — FULL BLEED (removed max-w) */}
      <div className="w-full mx-auto pt-6 flex flex-col sm:flex-row gap-3 px-0">
        <div className="flex-1"><SeasonalPromptBar /></div>
        <div className="flex-1"><SmartReorderBanner /></div>
      </div>

      {/* ═══════════════════════════════════════════
          CHAPTER 3A: Discovery — Occasion Pills + Vertical Columns
          Trending ↓  |  Last Minute ↑  |  Edible ↓
          ═══════════════════════════════════════════ */}
      <ScrollReveal className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-10" delay={0}>
        <Suspense fallback={null}>
          <OccasionPills />
        </Suspense>
      </ScrollReveal>

      <VerticalProductColumns
        sectionTitle="Gifts for every mood"
        sectionSubtitle="Explore"
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
            title: "Edible Gifts",
            viewAllHref: "/shop?category=chocolates-sweets-gifts",
            products: edible,
            direction: "down",
            speed: 36,
          },
        ]}
        height={520}
      />

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

      {/* ═══════════════════════════════════════════
          CHAPTER 3B: Discovery — Horizontal Rows
          Self Care ←  |  Hampers →  |  Personal + Under 2K ←
          ═══════════════════════════════════════════ */}
      <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 pb-4 space-y-0">
        <FeaturedRow
          title="The Self-Care Collection"
          subtitle="Wellness hampers & spa sets"
          products={selfCare}
          viewAllHref="/shop?category=wellness-self-care-hampers"
          viewAllLabel="See all"
          tint="cool"
          marqueeDirection="left"
        />
        <FeaturedRow
          title="Make it Personal · Under KSh 2,000"
          subtitle="Engraved, printed & budget-friendly gifts"
          products={[...personalised, ...under2k].slice(0, 10)}
          viewAllHref="/shop?category=personalized-gifts"
          viewAllLabel="See all"
          tint="warm"
          marqueeDirection="right"
        />
      </div>

      {/* Browse All CTA */}
      <ScrollReveal className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-10" delay={0}>
        <Link
          href="/shop"
          className="group block bg-white border-2 border-surface-border hover:border-brand/30 rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-card"
        >
          <div className="flex items-center justify-center gap-3">
            <ShoppingBag className="w-6 h-6 text-brand group-hover:scale-110 transition-transform duration-300" />
            <div>
              <p className="font-display text-lg font-bold group-hover:text-brand transition-colors">Browse All 200+ Gifts</p>
              <p className="text-xs text-brand-muted">Across 30+ curated categories — something for everyone</p>
            </div>
            <svg className="w-5 h-5 text-brand-muted group-hover:text-brand group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════
          CHAPTER 6: Final Conversion
          ═══════════════════════════════════════════ */}
      <StoryHowItWorks />
      <FinalCTA />
    </div>
  );
}
