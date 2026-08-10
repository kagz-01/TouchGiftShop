import { Suspense } from "react";
import Link from "next/link";
import ProductGrid from "@/components/home/ProductGrid";
import OccasionPills from "@/components/home/OccasionPills";
import TrustSignals from "@/components/home/TrustSignals";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; budget?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="bg-white border-b border-surface-border px-4 py-4">
        <div className="w-full max-w-7xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors mb-3">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="font-display text-2xl md:text-3xl font-bold">All Gifts</h1>
          <p className="text-sm text-brand-muted mt-1">Browse our full collection of 700+ products</p>
        </div>
      </div>

      {/* Occasion pills */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <Suspense fallback={null}>
          <OccasionPills />
        </Suspense>
      </div>

      {/* Full product grid */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={Promise.resolve(params)} />
        </Suspense>

        <TrustSignals />
      </div>
    </div>
  );
}
