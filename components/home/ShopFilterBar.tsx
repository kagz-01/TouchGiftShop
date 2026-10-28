"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { categoryIcon } from "@/components/shop/CategoryIcons";
import { useShopCategories } from "@/components/shop/useShopCategories";
import {
  SORT_OPTIONS,
  QUICK_FILTERS,
  BUDGET_PRESETS,
  formatPrice,
  buildCategoryTabs,
} from "@/components/shop/filter-constants";
import {
  ArrowUpDown, Star,
  ChevronDown, X, SlidersHorizontal, Banknote,
} from "lucide-react";

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
    // Category pills change width when the live list loads or the window resizes.
    window.addEventListener("resize", checkScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, categories]);

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
    searchParams.get("minRating") ? "1" : "",
  ].filter(Boolean).length;

  return (
    <div
      className="hidden lg:block rounded-3xl p-3 relative z-20 backdrop-blur-xl"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* ── CATEGORY PILLS — compact scroll row (was tall icon tiles) ── */}
      <div className="relative mb-3 pb-3" style={{ borderBottom: "1px solid var(--surface-border)" }}>
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide snap-x -mx-3 px-3"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {buildCategoryTabs(categories).map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug || 'all'}
                onClick={() => setCategory(cat.slug)}
                className={cn(
                  "relative flex items-center gap-2 shrink-0 h-10 pl-1.5 pr-4 rounded-full text-xs font-semibold transition-all duration-300 border snap-start",
                  isActive ? "bg-brand border-brand text-white shadow-ribbon" : "bg-white/60 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 border-black/10 dark:border-white/10 hover:border-brand/40",
                )}
                style={!isActive ? {
                  color: "var(--heading-color)",
                } : undefined}
              >
                <span className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full [&>svg]:w-3.5 [&>svg]:h-3.5",
                  isActive ? "bg-white/20" : "bg-brand/5 text-brand"
                )}>
                  {categoryIcon(cat.slug)}
                </span>
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ONE ROW: budget + quick filters + sort (was three stacked blocks) ── */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <Banknote className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Budget</h3>
            {hasPriceFilter && (
              <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                {activeMinPrice && !activeMaxPrice
                  ? `${formatPrice(Number(activeMinPrice))}+`
                  : !activeMinPrice && activeMaxPrice
                  ? `Up to ${formatPrice(Number(activeMaxPrice))}`
                  : `${formatPrice(Number(activeMinPrice))} – ${formatPrice(Number(activeMaxPrice))}`}
              </span>
            )}
            {hasPriceFilter && (
              <button onClick={resetPrice} className="text-[10px] text-brand hover:underline font-semibold">
                Clear
              </button>
            )}
          </div>

          {BUDGET_PRESETS.map((preset) => {
            const active = isPresetActive(preset.min, preset.max);
            return (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.min, preset.max)}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all duration-200",
                  active ? "bg-brand text-white shadow-sm" : "hover:border-brand/40 hover:text-brand"
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
              "px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all duration-200",
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

        <div className="hidden xl:block h-5 w-px shrink-0" style={{ background: "var(--surface-border)" }} />

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Filters</h3>
          </div>
          {QUICK_FILTERS.map((f) => {
            const isActive = searchParams.get(f.param) === f.value;
            return (
              <button
                key={f.param + f.value}
                onClick={() => toggleParam(f.param, f.value)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all duration-200 [&>svg]:w-3 [&>svg]:h-3",
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
              "flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all duration-200",
              showAdvanced ? "bg-brand-deep text-white shadow-sm" : "hover:border-brand/40 hover:text-brand"
            )}
            style={!showAdvanced ? {
              background: "var(--surface)",
              color: "var(--text-muted)",
              border: "1px solid var(--card-border)",
            } : undefined}
          >
            <SlidersHorizontal className="w-3 h-3" />
            More
            <ChevronDown className={cn("w-3 h-3 transition-transform", showAdvanced && "rotate-180")} />
          </button>
        </div>

        {/* Right cluster: active count + sort */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
              {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
            </span>
          )}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all",
                activeSort ? "bg-brand text-white shadow-sm" : ""
              )}
              style={!activeSort ? {
                background: "var(--surface)",
                color: "var(--text-muted)",
                border: "1px solid var(--card-border)",
              } : undefined}
            >
              <ArrowUpDown className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="max-w-[90px] truncate">
                {activeSort ? SORT_OPTIONS.find(o => o.value === activeSort)?.label : "Sort"}
              </span>
              <ChevronDown className={cn("w-3 h-3 flex-shrink-0 transition-transform", sortOpen && "rotate-180")} />
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

      {/* Custom price inputs */}
      {showCustom && (
        <div className="flex flex-wrap items-center gap-2 mt-3 px-1">
          <div className="flex-1 min-w-[100px] relative">
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
          <div className="flex-1 min-w-[100px] relative">
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

      {/* ── ADVANCED FILTERS ── */}
      {showAdvanced && (
        <div className="px-1 pt-3 mt-3 space-y-3" style={{ borderTop: "1px solid var(--surface-border)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <Star className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Min Rating:</h3>
            </div>
            <div className="flex gap-2">
              {[4, 3, 2].map((r) => {
                const isActive = searchParams.get("minRating") === String(r);
                return (
                  <button
                    key={r}
                    onClick={() => toggleParam("minRating", String(r))}
                    className={cn(
                      "flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200",
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
