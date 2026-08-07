import { Suspense } from "react";
import Link from "next/link";
import HeroCarousel from "@/components/home/HeroCarousel";
import TrendingNow from "@/components/home/TrendingNow";
import OccasionPills from "@/components/home/OccasionPills";
import FeaturedRow from "@/components/home/FeaturedRow";
import TrustSignals from "@/components/home/TrustSignals";
import HowItWorks from "@/components/home/HowItWorks";
import SurpriseSomeone from "@/components/home/SurpriseSomeone";
import Testimonials from "@/components/home/Testimonials";
import { createClient } from "@supabase/supabase-js";

async function getFeaturedProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch in parallel: trending, under 2k, for her, for him
  const [trending, under2k, forHer, forHim] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("in_stock", true)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select("*")
      .eq("in_stock", true)
      .lte("price", 2000)
      .order("price", { ascending: true })
      .limit(10),
    supabase
      .from("products")
      .select("*")
      .eq("in_stock", true)
      .order("price", { ascending: false })
      .limit(10),
    supabase
      .from("products")
      .select("*")
      .eq("in_stock", true)
      .order("price", { ascending: false })
      .limit(10),
  ]);

  return {
    trending: trending.data ?? [],
    under2k: under2k.data ?? [],
    forHer: forHer.data ?? [],
    forHim: forHim.data ?? [],
  };
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <div>
      {/* 1. Hero carousel */}
      <HeroCarousel />

      {/* 2. Occasion pills — horizontal scroll, always visible */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 md:pt-8">
        <Suspense fallback={null}>
          <OccasionPills />
        </Suspense>
      </div>

      {/* 3. How it works — move up so users see value prop early */}
      <HowItWorks />

      {/* 4. Featured product rows — curated, not overwhelming */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-2">
        <FeaturedRow
          title="Trending Now"
          subtitle="Most-loved gifts this week"
          products={featured.trending}
          viewAllHref="/?category= birthdays"
          viewAllLabel="See all"
        />

        <FeaturedRow
          title="Under KSh 2,000"
          subtitle="Thoughtful gifts, friendly prices"
          products={featured.under2k}
          viewAllHref="/?budget=under-5k"
          viewAllLabel="See all"
        />

        <FeaturedRow
          title="For Her"
          subtitle="She deserves something special"
          products={featured.forHer}
          viewAllHref="/?category=for-her"
          viewAllLabel="See all"
        />

        <FeaturedRow
          title="For Him"
          subtitle="He\'ll love these"
          products={featured.forHim}
          viewAllHref="/?category=for-him"
          viewAllLabel="See all"
        />
      </div>

      {/* 5. View Full Catalog CTA */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <Link
          href="/shop"
          className="block bg-white border-2 border-surface-border hover:border-brand/30 rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-card group"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">🛍️</span>
            <div>
              <p className="font-display text-lg font-bold group-hover:text-brand transition-colors">
                Browse All Gifts
              </p>
              <p className="text-xs text-brand-muted">
                700+ products across 30+ categories
              </p>
            </div>
            <svg className="w-5 h-5 text-brand-muted group-hover:text-brand group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* 6. Gift Quiz CTA */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-8">
        <a
          href="/gift-quiz"
          className="block bg-gradient-to-r from-brand to-brand-deep rounded-2xl p-6 md:p-8 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shrink-0">
              🎯
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="font-display text-lg md:text-xl font-bold mb-1">
                Not sure what to gift?
              </h3>
              <p className="text-white/80 text-sm">
                Take our 30-second quiz and get personalized gift recommendations
              </p>
            </div>
            <div className="bg-white text-brand px-5 py-2.5 rounded-xl font-semibold text-sm shrink-0 hover:bg-white/90 transition-colors">
              Find a Gift →
            </div>
          </div>
        </a>
      </div>

      {/* 7. Surprise Someone CTA */}
      <SurpriseSomeone />

      {/* 8. Trust signals */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <TrustSignals />
      </div>

      {/* 9. Testimonials */}
      <Testimonials />
    </div>
  );
}
