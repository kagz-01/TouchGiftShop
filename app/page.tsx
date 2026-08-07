import { Suspense } from "react";
import HeroCarousel from "@/components/home/HeroCarousel";
import TrendingNow from "@/components/home/TrendingNow";
import OccasionFilter from "@/components/home/OccasionFilter";
import ProductGrid from "@/components/home/ProductGrid";
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

      {/* 4. Product grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-10 md:pb-14 space-y-6">
        <div className="text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Popular Gifts</h2>
          <p className="text-sm text-brand-muted mt-1">Curated picks for every occasion</p>
        </div>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={Promise.resolve(params)} />
        </Suspense>
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
