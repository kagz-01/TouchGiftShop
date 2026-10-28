import { Suspense } from "react";
import Link from "next/link";
import ProductGrid from "@/components/home/ProductGrid";
import ShopFilterBar from "@/components/home/ShopFilterBar";
import { ShopRefineRail, ShopBottomBar } from "@/components/shop/ShopMobileFilters";
import { ProductGridSkeleton } from "@/components/ui/Skeletons";
import { Sparkles, ArrowLeft, Zap, Users, ShoppingBag, ChevronRight, X, Layers } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Gifts | TouchGift — Same-Day Delivery Kenya",
  description:
    "Browse 700+ curated gifts. Filter by occasion, budget, or let our AI find the perfect match. Same-day delivery across Nairobi.",
};

const SUB_META: Record<string, { title: string; subtitle: string; parent: string }> = {
  birthday: {
    title: "Birthdays",
    subtitle: "Make their milestone count with curated gift sets, designer scents, and luxury treats.",
    parent: "Occasions",
  },
  anniversary: {
    title: "Anniversaries",
    subtitle: "Celebrate years of shared love and memories with romantic, timeless luxury keepsakes.",
    parent: "Occasions",
  },
  wedding: {
    title: "Weddings",
    subtitle: "Exquisite celebratory hampers and elegant homeware for the newly-weds.",
    parent: "Occasions",
  },
  valentines: {
    title: "Valentine's Day",
    subtitle: "Curated romantic selections, artisanal chocolates, and luxury gifts for your special someone.",
    parent: "Occasions",
  },
  "mothers-day": {
    title: "Mother's Day",
    subtitle: "Spoil the remarkable mothers with pampering wellness sets and floral elegance.",
    parent: "Occasions",
  },
  "fathers-day": {
    title: "Father's Day",
    subtitle: "Executive essentials, fine leather, and premium spirits tailored for him.",
    parent: "Occasions",
  },
  "end-of-year": {
    title: "End of Year & Holidays",
    subtitle: "Thoughtful holiday appreciation hampers for valued clients and dedicated teams.",
    parent: "Occasions",
  },
  workiversary: {
    title: "Workiversaries",
    subtitle: "Celebrate employee loyalty and career milestones with distinction.",
    parent: "Occasions",
  },
  onboarding: {
    title: "Client & Staff Onboarding",
    subtitle: "Start new relationships with premium welcome kits and branded executive gifts.",
    parent: "Occasions",
  },
  "gift-sets": {
    title: "Gift Sets & Hampers",
    subtitle: "Signature handcrafted boxes packed with gourmet treats and memorable surprises.",
    parent: "Categories",
  },
  perfumes: {
    title: "Luxury Fragrances",
    subtitle: "Authentic designer scents for him & her, elegantly boxed for same-day delivery.",
    parent: "Categories",
  },
  flowers: {
    title: "Fresh Flowers",
    subtitle: "Hand-tied bouquets sourced daily and delivered fresh across Nairobi.",
    parent: "Categories",
  },
  drinks: {
    title: "Wine & Spirits",
    subtitle: "Celebratory champagne, vintage wines, and premium whiskeys for every toast.",
    parent: "Categories",
  },
  "fruits-edibles": {
    title: "Fruit Hampers & Edibles",
    subtitle: "Vibrant gourmet fruits, artisanal chocolates, and wholesome indulgence.",
    parent: "Categories",
  },
  apparel: {
    title: "Wearables & Apparel",
    subtitle: "Branded jackets, executive polo shirts, and custom merch.",
    parent: "Categories",
  },
  drinkware: {
    title: "Drinkware",
    subtitle: "Double-walled thermal flasks, custom travel mugs, and artisan tumblers.",
    parent: "Categories",
  },
  "stationery-office": {
    title: "Stationery & Executive",
    subtitle: "Fine journals, engraved pens, and bespoke desk organizers.",
    parent: "Categories",
  },
  "awards-trophies": {
    title: "Awards & Trophies",
    subtitle: "Crystal trophies and personalized plaques celebrating excellence.",
    parent: "Categories",
  },
  premium: {
    title: "The Platinum Edit",
    subtitle: "Our most exclusive luxury creations for moments that demand perfection.",
    parent: "Collections",
  },
  corporate: {
    title: "Corporate Essentials",
    subtitle: "Professional branded gift sets and bulk merchandise for enterprise partners.",
    parent: "Collections",
  },
  sustainable: {
    title: "Eco-Friendly & Sustainable",
    subtitle: "Consciously crafted gifts using organic, renewable, and biodegradable materials.",
    parent: "Collections",
  },
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    occasion?: string;
    audience?: string;
    holiday?: string;
    cultural?: string;
    community?: string;
    budget?: string;
    tag?: string;
    minPrice?: string;
    maxPrice?: string;
    personalizable?: string;
    q?: string;
    delivery?: string;
  }>;
}) {
  const params = await searchParams;
  const filterKey =
    params.category ||
    params.occasion ||
    params.tag ||
    params.audience ||
    params.holiday ||
    params.cultural ||
    params.community;

  const meta = filterKey ? SUB_META[filterKey] : null;
  const parentCategory = meta?.parent || (params.occasion ? "Occasions" : params.tag ? "Collections" : "Categories");

  let displayTitle = meta?.title;
  if (!displayTitle) {
    if (params.q) {
      displayTitle = `Results for “${params.q}”`;
    } else if (params.budget) {
      displayTitle = `Budget: ${params.budget}`;
    } else if (params.minPrice || params.maxPrice) {
      displayTitle = `Price KSh ${params.minPrice ?? "0"} - ${params.maxPrice ?? "10,000+"}`;
    } else if (params.personalizable) {
      displayTitle = "Personalized Gifts";
    } else if (filterKey) {
      displayTitle = filterKey.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    } else {
      displayTitle = "All Gifts";
    }
  }

  const displaySubtitle =
    meta?.subtitle ||
    (params.q
      ? "Showing all matching gifts from our Nairobi catalog."
      : "Browse our curated collection · Same-day Nairobi delivery");

  const hasActiveFilter = Boolean(
    filterKey || params.q || params.budget || params.minPrice || params.maxPrice || params.personalizable
  );

  return (
    <div className="min-h-screen section-theme-f">
      {/* ── Sticky header (+ mobile category rail) ── */}
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
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 bg-brand/8 text-brand rounded-xl text-xs font-bold hover:bg-brand hover:text-white transition-all mr-11 md:mr-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Match
          </Link>
        </div>

        {/* Mobile: universal refine chips glued under the bar (categories moved
            to the thumb zone — ShopBottomBar) */}
        <div className="lg:hidden">
          <Suspense fallback={null}>
            <ShopRefineRail />
          </Suspense>
        </div>
      </div>

      <div className="page-container-capped pt-5 pb-4">
        {/* Dedicated Category Breadcrumbs & Back Navigation */}
        {hasActiveFilter && (
          <div className="mb-4 space-y-2">
            <nav className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              <Link href="/" className="hover:text-brand transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <Link href="/shop" className="hover:text-brand transition-colors">{parentCategory}</Link>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <span className="font-bold" style={{ color: "var(--text-primary)" }}>{displayTitle}</span>
            </nav>

            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand/10 hover:bg-brand/15 text-brand rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Back to All Gifts</span>
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
              >
                <span>Filter: {displayTitle}</span>
                <X className="w-3 h-3 hover:text-brand" />
              </Link>
            </div>
          </div>
        )}

        {/* Hero heading */}
        <div className="flex items-end justify-between flex-wrap gap-3 md:gap-4 mb-3">
          <div>
            <h1
              className="font-display text-xl md:text-3xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {displayTitle}
            </h1>
            <p className="text-xs md:text-sm mt-1 max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {displaySubtitle}
            </p>
          </div>

          {/* Quick feature links — one scrollable row on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1 w-full lg:w-auto lg:flex-wrap lg:overflow-visible lg:pb-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            <Link
              href="/gift-lab/build-hamper"
              className="flex items-center gap-1.5 px-3 py-2 backdrop-blur-md border rounded-xl text-xs font-semibold transition-all shadow-sm whitespace-nowrap shrink-0"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Build Hamper
            </Link>
            <Link
              href="/pool/create"
              className="flex items-center gap-1.5 px-3 py-2 backdrop-blur-md border rounded-xl text-xs font-semibold transition-all shadow-sm whitespace-nowrap shrink-0"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            >
              <Users className="w-3.5 h-3.5" />
              Pool a Gift
            </Link>
            <Link
              href="/surprise"
              className="flex items-center gap-1.5 px-3 py-2 backdrop-blur-md border rounded-xl text-xs font-semibold transition-all shadow-sm whitespace-nowrap shrink-0"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--surface-border)', color: 'var(--text-muted)' }}
            >
              <Zap className="w-3.5 h-3.5" />
              Send Anonymously
            </Link>
          </div>
        </div>

        {/* ── Filter Bar (desktop card) ── */}
        <div className="mt-4 sticky top-20 z-20 hidden lg:block">
          <Suspense fallback={null}>
            <ShopFilterBar />
          </Suspense>
        </div>
      </div>

      {/* ── Product grid ── */}
      <div className="page-container-capped pb-16">
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={Promise.resolve(params)} hideHeading />
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

      {/* Mobile: floating filter bar — replaces the tab bar while shopping */}
      <Suspense fallback={null}>
        <ShopBottomBar />
      </Suspense>
    </div>
  );
}
