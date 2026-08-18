import { Suspense } from "react";
import PoolPageClient from "@/components/gift-lab/PoolPageClient";

export default function PoolPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="page-container py-6 max-w-lg mx-auto">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <PoolPageClient slug={params.slug} />
    </Suspense>
  );
}
