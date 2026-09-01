"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles, Cake, Gem, Heart, Baby, Building2, Feather,
  GraduationCap, Flower2, HeartPulse, Gift, Dumbbell,
  Gamepad2, Home, ChefHat, Filter, ArrowUpDown, Tag,
  Percent, Clock, Palette, Ruler, Star, ChevronDown, X, SlidersHorizontal,
} from "lucide-react";

const CATEGORIES = [
  { label: "All Gifts", icon: <Sparkles className="w-4 h-4" />, slug: "" },
  { label: "Birthdays", icon: <Cake className="w-4 h-4" />, slug: "birthdays" },
  { label: "Anniversaries", icon: <Gem className="w-4 h-4" />, slug: "anniversaries" },
  { label: "Weddings", icon: <Heart className="w-4 h-4" />, slug: "weddings" },
  { label: "Baby", icon: <Baby className="w-4 h-4" />, slug: "baby" },
  { label: "Graduation", icon: <GraduationCap className="w-4 h-4" />, slug: "graduation" },
  { label: "Condolences", icon: <Feather className="w-4 h-4" />, slug: "condolences" },
  { label: "Just Because", icon: <HeartPulse className="w-4 h-4" />, slug: "just-because" },
  { label: "Apology", icon: <Flower2 className="w-4 h-4" />, slug: "apology" },
  { label: "Milestone", icon: <GraduationCap className="w-4 h-4" />, slug: "milestone" },
  { label: "For Her", icon: <HeartPulse className="w-4 h-4" />, slug: "for-her" },
  { label: "For Him", icon: <Gift className="w-4 h-4" />, slug: "for-him" },
  { label: "Fitness", icon: <Dumbbell className="w-4 h-4" />, slug: "fitness" },
  { label: "Gaming", icon: <Gamepad2 className="w-4 h-4" />, slug: "gaming" },
  { label: "Home", icon: <Home className="w-4 h-4" />, slug: "home-decor" },
  { label: "Kitchen", icon: <ChefHat className="w-4 h-4" />, slug: "kitchen" },
  { label: "Corporate", icon: <Building2 className="w-4 h-4" />, slug: "corporate" },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Oldest", value: "oldest" },
];

const QUICK_FILTERS = [
  { label: "On Sale", icon: <Percent className="w-3.5 h-3.5" />, param: "onSale", value: "1" },
  { label: "New (7d)", icon: <Clock className="w-3.5 h-3.5" />, param: "newArrivals", value: "7d" },
  { label: "New (30d)", icon: <Clock className="w-3.5 h-3.5" />, param: "newArrivals", value: "30d" },
  { label: "Customizable", icon: <Tag className="w-3.5 h-3.5" />, param: "personalizable", value: "1" },
];

// Color name → hex mapping for dot display
const COLOR_HEX: Record<string, string> = {
  red: "#ef4444", blue: "#3b82f6", green: "#22c55e", black: "#171717",
  white: "#f5f5f5", gold: "#eab308", pink: "#ec4899", purple: "#a855f7",
  orange: "#f97316", yellow: "#eab308", brown: "#92400e", grey: "#9ca3af",
  gray: "#9ca3af", silver: "#c0c0c0", rose: "#f43f5e", navy: "#1e3a5f",
  beige: "#d4c5a9", coral: "#ff7f50", teal: "#14b8a6", maroon: "#7f1d1d",
};

export default function ShopFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const activeCategory = searchParams.get("category") ?? "";
  const activeBudget = searchParams.get("budget") ?? "";
  const activeSort = searchParams.get("sort") ?? "";
  const activeOnSale = searchParams.get("onSale") ?? "";
  const activeNewArrivals = searchParams.get("newArrivals") ?? "";
  const activePersonalizable = searchParams.get("personalizable") ?? "";
  const activeColor = searchParams.get("color") ?? "";
  const activeSize = searchParams.get("size") ?? "";
  const activeMinPrice = searchParams.get("minPrice") ?? "";
  const activeMaxPrice = searchParams.get("maxPrice") ?? "";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Price range state (local, applied on change/end)
  const [minPriceInput, setMinPriceInput] = useState(activeMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(activeMaxPrice);

  useEffect(() => {
    setMinPriceInput(activeMinPrice);
    setMaxPriceInput(activeMaxPrice);
  }, [activeMinPrice, activeMaxPrice]);

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

  function pushParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  function toggleParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  function setCategory(slug: string) {
    pushParam("category", slug);
  }

  function setSort(value: string) {
    pushParam("sort", value);
    setSortOpen(false);
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPriceInput) params.set("minPrice", minPriceInput);
    else params.delete("minPrice");
    if (maxPriceInput) params.set("maxPrice", maxPriceInput);
    else params.delete("maxPrice");
    // Also clear budget tier when custom range is used
    if (minPriceInput || maxPriceInput) params.delete("budget");
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  function setColor(c: string) {
    toggleParam("color", c);
  }

  function setSize(s: string) {
    toggleParam("size", s);
  }

  const activeFilterCount = [activeOnSale, activeNewArrivals, activePersonalizable, activeColor, activeSize, activeMinPrice, activeMaxPrice, activeSort].filter(Boolean).length;

  return (
    <div
      className="rounded-[2rem] p-4 relative z-20 backdrop-blur-xl"
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* ── Occasions ── */}
      <div className="relative mb-4 pb-4" style={{ borderBottom: "1px solid var(--surface-border)" }}>
        <div className="flex items-center gap-2 mb-2 px-1">
          <Sparkles className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Occasion / Theme</h3>
        </div>

        {canScrollLeft && (
          <div className="absolute left-0 top-6 bottom-0 w-12 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-6 bottom-0 w-12 bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0",
                activeCategory === cat.slug ? "bg-brand text-white shadow-ribbon" : ""
              )}
              style={activeCategory !== cat.slug ? {
                background: "var(--surface)",
                color: "var(--text-muted)",
                border: "1px solid var(--card-border)",
              } : undefined}
            >
              <div className="flex items-center justify-center shrink-0">{cat.icon}</div>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Budget + Sort Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-1 mb-3">
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Budget:</h3>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 flex-1">
          {[
            { label: "All", slug: "" },
            { label: "Under 5K", slug: "under-5k" },
            { label: "Under 10K", slug: "under-10k" },
            { label: "Under 20K", slug: "under-20k" },
            { label: "Under 50K", slug: "under-50k" },
            { label: "Premium", slug: "premium" },
          ].map((tier) => (
            <button
              key={tier.slug}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                if (tier.slug) {
                  if (activeBudget === tier.slug) {
                    params.delete("budget");
                  } else {
                    params.set("budget", tier.slug);
                  }
                } else {
                  params.delete("budget");
                }
                params.delete("minPrice");
                params.delete("maxPrice");
                const qs = params.toString();
                router.push(qs ? `/shop?${qs}` : "/shop");
              }}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                activeBudget === tier.slug ? "bg-brand text-white shadow-sm" : ""
              )}
              style={activeBudget !== tier.slug ? {
                background: "var(--surface)",
                color: "var(--text-muted)",
                border: "1px solid var(--card-border)",
              } : undefined}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0">
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
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-black/10 py-1 z-40 min-w-[180px]">
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("sort");
                    const qs = params.toString();
                    router.push(qs ? `/shop?${qs}` : "/shop");
                    setSortOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors",
                    !activeSort ? "text-brand" : "text-gray-700"
                  )}
                >
                  Default
                </button>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors",
                      activeSort === opt.value ? "text-brand" : "text-gray-700"
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

      {/* ── Quick Filters Row ── */}
      <div className="flex flex-wrap items-center gap-2 px-1 mb-3">
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
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                isActive ? "bg-brand text-white shadow-sm" : ""
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

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
            showAdvanced ? "bg-brand-deep text-white shadow-sm" : ""
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
      </div>

      {/* ── Advanced Filters (collapsible) ── */}
      {showAdvanced && (
        <div className="px-1 pt-3 space-y-3" style={{ borderTop: "1px solid var(--surface-border)" }}>
          {/* Price Range */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Price Range (KSh):</h3>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-black/10 focus:outline-none focus:border-brand"
              />
              <span className="text-xs text-gray-400">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-24 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-black/10 focus:outline-none focus:border-brand"
              />
              <button
                onClick={applyPriceRange}
                className="px-3 py-1.5 bg-brand text-white text-xs font-bold rounded-lg hover:bg-brand-dark transition-colors"
              >
                Apply
              </button>
              {(activeMinPrice || activeMaxPrice) && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("minPrice");
                    params.delete("maxPrice");
                    const qs = params.toString();
                    router.push(qs ? `/shop?${qs}` : "/shop");
                  }}
                  className="text-xs text-brand-muted hover:text-brand underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Rating filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <Star className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Rating:</h3>
            </div>
            <div className="flex gap-2">
              {[4, 3, 2].map((r) => {
                const isActive = searchParams.get("minRating") === String(r);
                return (
                  <button
                    key={r}
                    onClick={() => toggleParam("minRating", String(r))}
                    className={cn(
                      "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                      isActive ? "bg-yellow-400 text-white shadow-sm" : ""
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

      {/* ── Active filter count indicator ── */}
      {activeFilterCount > 0 && !showAdvanced && (
        <div className="px-1 pt-2">
          <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
          </span>
        </div>
      )}
    </div>
  );
}
