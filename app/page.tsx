import { Suspense } from "react";
import HeroCarousel from "@/components/home/HeroCarousel";
import TrendingNow from "@/components/home/TrendingNow";
import OccasionFilter from "@/components/home/OccasionFilter";
import ProductGrid from "@/components/home/ProductGrid";
import TrustSignals from "@/components/home/TrustSignals";
import HowItWorks from "@/components/home/HowItWorks";
import SurpriseSomeone from "@/components/home/SurpriseSomeone";
import Testimonials from "@/components/home/Testimonials";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";
import { createClient } from "@supabase/supabase-js";

async function getTrendingProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("in_stock", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return data ?? [];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; budget?: string }>;
}) {
  const params = await searchParams;
  const hasCategory = !!params.category;
  const trendingProducts = await getTrendingProducts();

  return (
    <div>
      {/* 1. Hero carousel */}
      <HeroCarousel />

      {/* 2. Trending products */}
      <TrendingNow products={trendingProducts} />

      {/* 3. Occasion grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14">
        <Suspense fallback={null}>
          <OccasionFilter />
        </Suspense>
      </div>

      {/* 3.5 Gift Quiz CTA */}
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

      {/* 4. Product grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-10 md:pb-14 space-y-6">
        <div className="text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Popular Gifts</h2>
          <p className="text-sm text-brand-muted mt-1">Curated picks for every occasion</p>
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={Promise.resolve(params)} />
        </Suspense>

        {/* Trust signals */}
        <TrustSignals />
      </div>

      {/* 5. Surprise Someone CTA */}
      <SurpriseSomeone />

      {/* 6. How it works */}
      <HowItWorks />

      {/* 7. Testimonials */}
      <Testimonials />
    </div>
  );
}
