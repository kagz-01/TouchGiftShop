import { Suspense } from "react";
import Link from "next/link";
import { ShoppingBag, Target, Sparkles } from "lucide-react";
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
import SurpriseSomeone from "@/components/home/SurpriseSomeone";
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

  const [trending, lastMinute, edible, selfCare, hampers, personalised, under2k] =
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
      getByCategory("hampers-gift-sets", 10),
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

  return { trending, lastMinute, edible, selfCare, hampers, personalised, under2k };
}

export default async function HomePage() {
  const { trending, lastMinute, edible, selfCare, hampers, personalised, under2k } =
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
          CHAPTER 2: Trust — Social Proof
          ═══════════════════════════════════════════ */}
      <SocialProof />

      {/* Seasonal & Smart Reorder — in one row */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SeasonalPromptBar />
        </div>
        <div className="flex-1">
          <SmartReorderBanner />
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          CHAPTER 3: Discovery — First wave
          ═══════════════════════════════════════════ */}

      {/* Occasion pills — primary discovery */}
      <ScrollReveal className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-10" delay={0}>
        <Suspense fallback={null}>
          <OccasionPills />
        </Suspense>
      </ScrollReveal>

      {/* Row group 1 — Trending, Last Minute, Edible (plain bg) */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-6 space-y-0">
        <FeaturedRow
          title="Trending This Week"
          subtitle="Most-loved gifts right now"
          products={trending}
          viewAllHref="/shop"
          viewAllLabel="See all"
        />
        <FeaturedRow
          title="Last Minute? We Got You"
          subtitle="In stock, same-day ready · Under KSh 3,000"
          products={lastMinute}
          viewAllHref="/shop?budget=under-5k"
          viewAllLabel="See all"
          tint="warm"
        />
        <FeaturedRow
          title="Edible Gifts They'll Love"
          subtitle="Chocolates, sweets & gourmet treats"
          products={edible}
          viewAllHref="/shop?category=chocolates-sweets-gifts"
          viewAllLabel="See all"
        />
      </div>

      {/* ═══════════════════════════════════════════
          INTERSTITIAL A — Gift Quiz mid-page break
          ═══════════════════════════════════════════ */}
      <ScrollReveal className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10" delay={0}>
        <a
          href="/gift-quiz"
          className="group block relative overflow-hidden bg-gradient-to-r from-brand to-brand-deep rounded-3xl p-8 md:p-10 text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
        >
          {/* Animated orb */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full animate-pulse-soft" />
          <div className="absolute -right-4 -bottom-8 w-28 h-28 bg-gold/10 rounded-full animate-pulse-soft" style={{ animationDelay: "1s" }} />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors duration-300">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div className="text-center md:text-left flex-1">
              <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-1">30-Second Quiz</p>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Not sure what to gift?
              </h3>
              <p className="text-white/70 text-sm max-w-md">
                Tell us who it's for and your budget. Our AI finds the perfect match in seconds — no browsing required.
              </p>
            </div>
            <div className="bg-white text-brand px-6 py-3 rounded-2xl font-bold text-sm shrink-0 group-hover:bg-gold group-hover:text-white transition-all duration-300 shadow-lg">
              Find a Gift →
            </div>
          </div>
        </a>
      </ScrollReveal>

      {/* ═══════════════════════════════════════════
          CHAPTER 4: Discovery — Second wave
          ═══════════════════════════════════════════ */}

      {/* Row group 2 — Self Care, Hampers, Personalised (tinted bg for chapter feel) */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-4 space-y-0">
        <FeaturedRow
          title="The Self-Care Collection"
          subtitle="Wellness hampers & spa sets"
          products={selfCare}
          viewAllHref="/shop?category=wellness-self-care-hampers"
          viewAllLabel="See all"
          tint="cool"
        />
        <FeaturedRow
          title="Hampers & Gift Sets"
          subtitle="When one gift isn't enough"
          products={hampers}
          viewAllHref="/shop?category=hampers-gift-sets"
          viewAllLabel="See all"
        />
        <FeaturedRow
          title="Make it Personal"
          subtitle="Engraved, printed & one-of-a-kind gifts"
          products={personalised}
          viewAllHref="/shop?category=personalized-gifts"
          viewAllLabel="See all"
          tint="warm"
        />
      </div>

      {/* ═══════════════════════════════════════════
          INTERSTITIAL B — Surprise Someone feature
          ═══════════════════════════════════════════ */}
      <SurpriseSomeone />

      {/* ═══════════════════════════════════════════
          CHAPTER 5: The Budget Closer
          ═══════════════════════════════════════════ */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <FeaturedRow
          title="Under KSh 2,000"
          subtitle="Thoughtful gifts, friendly prices"
          products={under2k}
          viewAllHref="/shop?budget=under-5k"
          viewAllLabel="See all"
        />
      </div>

      {/* Browse All CTA */}
      <ScrollReveal className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10" delay={0}>
        <Link
          href="/shop"
          className="group block bg-white border-2 border-surface-border hover:border-brand/30 rounded-3xl p-6 text-center transition-all duration-300 hover:shadow-card"
        >
          <div className="flex items-center justify-center gap-3">
            <ShoppingBag className="w-6 h-6 text-brand group-hover:scale-110 transition-transform duration-300" />
            <div>
              <p className="font-display text-lg font-bold group-hover:text-brand transition-colors">
                Browse All 200+ Gifts
              </p>
              <p className="text-xs text-brand-muted">
                Across 30+ curated categories — something for everyone
              </p>
            </div>
            <svg
              className="w-5 h-5 text-brand-muted group-hover:text-brand group-hover:translate-x-1 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
