import { Suspense } from "react";
import CountdownBanner from "@/components/home/CountdownBanner";
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
    <div className="px-4 md:px-8 py-4 space-y-6">
      <CountdownBanner />
      <Suspense fallback={null}>
        <OccasionFilter />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid searchParams={Promise.resolve(params)} />
      </Suspense>
    </div>
  );
}
