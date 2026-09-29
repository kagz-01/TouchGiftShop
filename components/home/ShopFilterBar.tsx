"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { categoryIcon } from "@/components/shop/CategoryIcons";
import { useShopCategories } from "@/components/shop/useShopCategories";
import {
  Sparkles, Filter, ArrowUpDown, Tag,
  Percent, Clock, Star, ChevronDown, X, SlidersHorizontal, Banknote,
} from "lucide-react";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
];

const QUICK_FILTERS = [
  { label: "On Sale", icon: <Percent className="w-3.5 h-3.5" />, param: "onSale", value: "1" },
  { label: "New (7d)", icon: <Clock className="w-3.5 h-3.5" />, param: "newArrivals", value: "7d" },
  { label: "New (30d)", icon: <Clock className="w-3.5 h-3.5" />, param: "newArrivals", value: "30d" },
  { label: "Customizable", icon: <Tag className="w-3.5 h-3.5" />, param: "personalizable", value: "1" },
];

// Budget presets — clear, human-readable ranges
const BUDGET_PRESETS = [
  { label: "Under KSh 2K",       min: 0,     max: 2000  },
  { label: "KSh 2K – 5K",        min: 2000,  max: 5000  },
  { label: "KSh 5K – 10K",       min: 5000,  max: 10000 },
  { label: "KSh 10K – 25K",      min: 10000, max: 25000 },
  { label: "KSh 25K+",           min: 25000, max: null  },
];

function formatPrice(v: number) {
  if (v >= 1000) return `KSh ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K`;
  return `KSh ${v}`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ShopFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sort") ?? "";
  const activeOnSale = searchParams.get("onSale") ?? "";
  const activeNewArrivals = searchParams.get("newArrivals") ?? "";
  const activePersonalizable = searchParams.get("personalizable") ?? "";
  const activeMinPrice = searchParams.get("minPrice") ?? "";
  const activeMaxPrice = searchParams.get("maxPrice") ?? "";

  const categories = useShopCategories();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Custom price input state
  const [customMin, setCustomMin] = useState("");
  const [customMax, setCustomMax] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  function pushParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  function toggleParam(key: string, value: string) {
    const current = searchParams.get(key);
    pushParams({ [key]: current === value ? null : value });
  }

  function setCategory(slug: string) {
    pushParams({ category: slug || null });
  }

  function setSort(value: string) {
    pushParams({ sort: value });
    setSortOpen(false);
  }

  // Apply a budget preset
  function applyPreset(min: number, max: number | null) {
    setShowCustom(false);
    setCustomMin("");
    setCustomMax("");
    pushParams({
      minPrice: min > 0 ? String(min) : null,
      maxPrice: max !== null ? String(max) : null,
    });
  }

  // Check if a preset is currently active
  function isPresetActive(min: number, max: number | null) {
    const curMin = activeMinPrice ? Number(activeMinPrice) : 0;
    const curMax = activeMaxPrice ? Number(activeMaxPrice) : null;
    return curMin === min && curMax === max;
  }

  // Apply custom price range
  function applyCustomPrice() {
    const min = customMin ? Number(customMin) : null;
    const max = customMax ? Number(customMax) : null;
    pushParams({
      minPrice: min && min > 0 ? String(min) : null,
      maxPrice: max ? String(max) : null,
    });
  }

  function resetPrice() {
    setCustomMin("");
    setCustomMax("");
    setShowCustom(false);
    pushParams({ minPrice: null, maxPrice: null });
  }

  const hasPriceFilter = activeMinPrice || activeMaxPrice;
  // True if current filter doesn't match any preset (user set a custom one)
  const hasCustomPrice = hasPriceFilter && !BUDGET_PRESETS.some(p =>
    isPresetActive(p.min, p.max)
  );

  const activeFilterCount = [
    activeOnSale, activeNewArrivals, activePersonalizable,
    activeSort,
    activeMinPrice ? "1" : "",
    activeMaxPrice ? "1" : "",
  ].filter(Boolean).length;

  return (
    <div
      className="rounded-[2rem] p-4 relative z-20 backdrop-blur-xl"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* ── CATEGORY TABS (Premium Cards) ── */}
      <div className="relative mb-6 pb-6" style={{ borderBottom: "1px solid var(--surface-border)" }}>
        <div className="flex items-center gap-2 mb-4 px-1">
          <Sparkles className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Shop by Category</h3>
        </div>

        {canScrollLeft && (
          <div className="absolute left-0 top-10 bottom-0 w-16 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-10 bottom-0 w-16 bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Inject focus categories. If count is 0, they say Coming Soon */}
          {[
            { slug: "", name: "All Gifts", count: 1 },
            ...categories.filter(c => ["perfumes", "gift-sets"].includes(c.slug)),
            { slug: "flowers", name: "Flowers", count: categories.find(c => c.slug === "flowers")?.count || 0 },
            { slug: "drinks", name: "Drinks & Spirits", count: categories.find(c => c.slug === "drinks")?.count || 0 },
            { slug: "fruits", name: "Fruit Hampers", count: categories.find(c => c.slug === "fruits")?.count || 0 },
            { slug: "apparel", name: "Wearables", count: categories.find(c => c.slug === "apparel")?.count || 0 },
            ...categories.filter(c => !["perfumes", "gift-sets", "flowers", "drinks", "fruits", "apparel"].includes(c.slug)),
          ].map((cat) => {
            const isComingSoon = cat.count === 0 && cat.slug !== "";
            const isActive = activeCategory === cat.slug;
            
            return (
              <button
                key={cat.slug || 'all'}
                onClick={() => !isComingSoon && setCategory(cat.slug)}
                disabled={isComingSoon}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-2 w-[100px] h-[90px] rounded-2xl text-sm font-semibold transition-all duration-300 shrink-0 border",
                  isActive ? "bg-brand border-brand text-white shadow-ribbon scale-105" : "bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 border-black/10 dark:border-white/10 hover:border-brand/40",
                  isComingSoon ? "opacity-60 grayscale cursor-not-allowed" : ""
                )}
                style={(!isActive && !isComingSoon) ? {
                  color: "var(--heading-color)",
                } : undefined}
              >
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full",
                  isActive ? "bg-white/20" : "bg-brand/5 text-brand"
                )}>
                  {categoryIcon(cat.slug)}
                </div>
                <span className="text-[11px] text-center leading-tight px-1">
                  {cat.name}
                </span>
                
                {isComingSoon && (
                  <span className="absolute -top-2 bg-black text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BUDGET FILTER ── */}
      <div className="px-1 mb-4 pb-4" style={{ borderBottom: "1px solid var(--surface-border)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Budget</h3>
            {hasPriceFilter && (
              <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                {activeMinPrice && !activeMaxPrice
                  ? `${formatPrice(Number(activeMinPrice))}+`
                  : !activeMinPrice && activeMaxPrice
                  ? `Up to ${formatPrice(Number(activeMaxPrice))}`
                  : `${formatPrice(Number(activeMinPrice))} – ${formatPrice(Number(activeMaxPrice))}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasPriceFilter && (
              <button onClick={resetPrice} className="text-[10px] text-brand hover:underline font-semibold">
                Clear
              </button>
            )}
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                  activeSort ? "bg-brand text-white shadow-sm" : ""
                )}
                style={!activeSort ? {
                  background: "var(--surface)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--card-border)",
                } : undefined}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {activeSort ? SORT_OPTIONS.find(o => o.value === activeSort)?.label : "Sort"}
                <ChevronDown className={cn("w-3 h-3 transition-transform", sortOpen && "rotate-180")} />
              </button>
              {sortOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-black/10 dark:border-white/10 py-1 z-40 min-w-[180px]">
                    <button
                      onClick={() => { pushParams({ sort: null }); setSortOpen(false); }}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                        !activeSort ? "text-brand" : "text-gray-700 dark:text-gray-300"
                      )}
                    >
                      Default
                    </button>
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSort(opt.value)}
                        className={cn(
                          "w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                          activeSort === opt.value ? "text-brand" : "text-gray-700 dark:text-gray-300"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Budget preset pills */}
        <div className="flex flex-wrap gap-2">
          {BUDGET_PRESETS.map((preset) => {
            const active = isPresetActive(preset.min, preset.max);
            return (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.min, preset.max)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
                  active ? "bg-brand text-white shadow-sm scale-105" : "hover:border-brand/40 hover:text-brand"
                )}
                style={!active ? {
                  background: "var(--surface)",
                  color: "var(--text-muted)",
                  border: "1px solid var(--card-border)",
                } : undefined}
              >
                {preset.label}
              </button>
            );
          })}

          {/* Custom range toggle */}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
              (showCustom || hasCustomPrice) ? "bg-brand/10 text-brand border border-brand/30" : "hover:border-brand/40 hover:text-brand"
            )}
            style={!(showCustom || hasCustomPrice) ? {
              background: "var(--surface)",
              color: "var(--text-muted)",
              border: "1px solid var(--card-border)",
            } : undefined}
          >
            Custom Range
            <ChevronDown className={cn("inline-block w-3 h-3 ml-1 transition-transform", showCustom && "rotate-180")} />
          </button>
        </div>

        {/* Custom price inputs */}
        {showCustom && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: "var(--text-muted)" }}>KSh</span>
              <input
                type="number"
                placeholder="Min"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/40"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--card-border)",
                  color: "var(--heading-color)",
                }}
              />
            </div>
            <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>—</span>
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: "var(--text-muted)" }}>KSh</span>
              <input
                type="number"
                placeholder="Max"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand/40"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--card-border)",
                  color: "var(--heading-color)",
                }}
              />
            </div>
            <button
              onClick={applyCustomPrice}
              disabled={!customMin && !customMax}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-dark transition-all"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* ── QUICK FILTERS ROW ── */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Filters:</h3>
        </div>
        {QUICK_FILTERS.map((f) => {
          const isActive = searchParams.get(f.param) === f.value;
          return (
            <button
              key={f.param + f.value}
              onClick={() => toggleParam(f.param, f.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
                isActive ? "bg-brand text-white shadow-sm" : "hover:border-brand/40 hover:text-brand"
              )}
              style={!isActive ? {
                background: "var(--surface)",
                color: "var(--text-muted)",
                border: "1px solid var(--card-border)",
              } : undefined}
            >
              {f.icon}
              {f.label}
              {isActive && <X className="w-3 h-3 ml-0.5" />}
            </button>
          );
        })}

        {/* More / Advanced */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
            showAdvanced ? "bg-brand-deep text-white shadow-sm" : "hover:border-brand/40 hover:text-brand"
          )}
          style={!showAdvanced ? {
            background: "var(--surface)",
            color: "var(--text-muted)",
            border: "1px solid var(--card-border)",
          } : undefined}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          More
          <ChevronDown className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-180")} />
        </button>

        {activeFilterCount > 0 && (
          <span className="ml-auto text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
          </span>
        )}
      </div>

      {/* ── ADVANCED FILTERS ── */}
      {showAdvanced && (
        <div className="px-1 pt-3 mt-3 space-y-3" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <Star className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Min Rating:</h3>
            </div>
            <div className="flex gap-2">
              {[4, 3, 2].map((r) => {
                const isActive = searchParams.get("minRating") === String(r);
                return (
                  <button
                    key={r}
                    onClick={() => toggleParam("minRating", String(r))}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200",
                      isActive ? "bg-yellow-400 text-white shadow-sm" : "hover:border-yellow-300"
                    )}
                    style={!isActive ? {
                      background: "var(--surface)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--card-border)",
                    } : undefined}
                  >
                    {r}+ <Star className="w-3 h-3 fill-current" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
