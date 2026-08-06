import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import OccasionFilter from "@/components/home/OccasionFilter";
import ProductGrid from "@/components/home/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;

  return (
    <div>
      <HeroSection />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <Suspense fallback={null}>
          <OccasionFilter />
        </Suspense>

        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={Promise.resolve(params)} />
        </Suspense>
      </div>
    </div>
  );
}
