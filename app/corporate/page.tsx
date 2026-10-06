import CorporateLanding from "@/components/corporate/CorporateLanding";
import ProductGrid from "@/components/home/ProductGrid";
import { Suspense } from "react";

export default function CorporatePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <CorporateLanding
      products={
        <Suspense fallback={<div className="h-96 animate-pulse bg-white/5 rounded-2xl mx-10" />}>
          <ProductGrid category="corporate" searchParams={searchParams} limit={12} />
        </Suspense>
      }
    />
  );
}
