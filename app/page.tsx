import { Suspense } from "react";
import StorytellingHome from "@/components/home/StorytellingHome";
import OccasionFilter from "@/components/home/OccasionFilter";
import ProductGrid from "@/components/home/ProductGrid";
import Testimonials from "@/components/home/Testimonials";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const hasCategory = !!params.category;

  return (
    <div>
      <StorytellingHome />

      {!hasCategory && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-8">
          <Suspense fallback={null}>
            <OccasionFilter />
          </Suspense>

          <h2 className="font-display text-3xl md:text-4xl font-bold text-center">
            Popular Gifts
          </h2>
          <p className="text-brand-muted text-center max-w-xl mx-auto -mt-4">
            Our most-loved picks, curated for every occasion
          </p>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={Promise.resolve(params)} />
          </Suspense>
        </div>
      )}

      {hasCategory && (
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-8">
          <Suspense fallback={null}>
            <OccasionFilter />
          </Suspense>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid searchParams={Promise.resolve(params)} />
          </Suspense>
        </div>
      )}

      {/* Testimonials */}
      <Testimonials />
    </div>
  );
}
