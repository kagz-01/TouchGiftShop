import { Suspense } from "react";
import Link from "next/link";
import ProductGrid from "@/components/home/ProductGrid";
import ShopFilterBar from "@/components/home/ShopFilterBar";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";
import { Sparkles, ArrowLeft, Zap, Users, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Gifts | TouchGift — Same-Day Delivery Kenya",
  description:
    "Browse 700+ curated gifts. Filter by occasion, budget, or let our AI find the perfect match. Same-day delivery across Nairobi.",
};



export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; budget?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen section-theme-f">
      {/* ── Sticky header ── */}
      <div className="backdrop-blur-md border-b sticky top-0 z-30" style={{ background: 'var(--surface)', borderColor: 'var(--surface-border)' }}>
        <div className="page-container-capped py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm transition-colors flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <div className="flex-1 max-w-lg mx-auto hidden md:block">
            <div className="relative">
              <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Link
                href="/gift-finder"
                className="flex items-center w-full backdrop-blur-sm rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--surface-border)",
                  color: "var(--text-muted)",
                }}
              >
                Ask AI to find the perfect gift…
              </Link>
            </div>
          </div>

          <Link
            href="/gift-finder"
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-brand/8 text-brand rounded-xl text-xs font-bold hover:bg-brand hover:text-white transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Match
          </Link>
        </div>
      </div>

      <div className="page-container-capped pt-8 pb-4">
        {/* Hero heading */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1
              className="font-display text-2xl md:text-3xl font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {params.category
                ? params.category.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                : "All Gifts"}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              Browse our curated collection · Same-day Nairobi delivery
            </p>
          </div>

          {/* Quick feature links */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/gift-lab/build-hamper"
              className="flex items-center gap-1.5 px-3 py-2 backdrop-blur-md border rounded-xl text-xs font-semibold transition-all shadow-sm"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Build Hamper
            </Link>
            <Link
              href="/pool/create"
              className="flex items-center gap-1.5 px-3 py-2 backdrop-blur-md border rounded-xl text-xs font-semibold transition-all shadow-sm"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            >
              <Users className="w-3.5 h-3.5" />
              Pool a Gift
            </Link>
            <Link
              href="/surprise"
              className="flex items-center gap-1.5 px-3 py-2 backdrop-blur-md border rounded-xl text-xs font-semibold transition-all shadow-sm"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            >
              <Zap className="w-3.5 h-3.5" />
              Send Anonymously
            </Link>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="mt-6 sticky top-20 z-20">
          <Suspense fallback={null}>
            <ShopFilterBar />
          </Suspense>
        </div>
      </div>

      {/* ── Product grid ── */}
      <div className="page-container-capped pb-16">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={Promise.resolve(params)} />
        </Suspense>
      </div>

      {/* ── Bottom AI nudge ── */}
      <div className="page-container-capped pb-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-light rounded-3xl p-8 flex items-center justify-between gap-6 flex-wrap">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-16 -translate-y-16" />
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1">Can't decide?</p>
            <h3 className="font-display text-xl font-bold text-white mb-1">Let AI find the perfect gift.</h3>
            <p className="text-white/60 text-sm">Answer 3 quick questions — get a personalised list in seconds.</p>
          </div>
          <Link
            href="/gift-finder"
            className="relative z-10 flex-shrink-0 flex items-center gap-2 px-6 py-3.5 bg-gold text-brand-deep font-bold rounded-2xl hover:shadow-gold hover:-translate-y-0.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Try AI Gift Match
          </Link>
        </div>
      </div>
    </div>
  );
}
