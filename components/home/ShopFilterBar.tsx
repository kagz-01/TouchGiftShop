"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Sparkles, Cake, Gem, Heart, Baby, Building2, Feather,
  GraduationCap, Flower2, HeartPulse, Gift, Dumbbell,
  Gamepad2, Home, ChefHat, Filter, ArrowUpDown, Tag,
  Percent, Clock, Star, ChevronDown, X, SlidersHorizontal,
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

const PRICE_MIN = 0;
const PRICE_MAX = 100000;
const PRICE_STEP = 500;

function formatPrice(v: number) {
  if (v >= 1000) return `${Math.round(v / 1000)}K`;
  return String(v);
}

// ── Dual Range Slider ─────────────────────────────────────────────────────────
function DualRangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
  onDragEnd,
}: {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  onDragEnd?: () => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  const getValFromX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return valueMin;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + ratio * (max - min);
      return Math.round(raw / step) * step;
    },
    [min, max, step, valueMin]
  );

  useEffect(() => {
    if (!dragging) return;

    function onMove(e: MouseEvent | TouchEvent) {
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const val = getValFromX(clientX);
      if (dragging === "min") {
        onChange(Math.min(val, valueMax - step), valueMax);
      } else {
        onChange(valueMin, Math.max(val, valueMin + step));
      }
    }

    function onEnd() {
      setDragging(null);
      onDragEnd?.();
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [dragging, valueMin, valueMax, getValFromX, onChange, onDragEnd, step]);

  const leftPct = pct(valueMin);
  const rightPct = pct(valueMax);

  return (
    <div className="relative w-full h-8 select-none" ref={trackRef}>
      <div
        className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full"
        style={{ background: "var(--surface-border, #e5e7eb)" }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-brand"
        style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-brand shadow-md cursor-grab active:cursor-grabbing z-10 touch-none"
        style={{ left: `${leftPct}%` }}
        onMouseDown={(e) => { e.preventDefault(); setDragging("min"); }}
        onTouchStart={() => { setDragging("min"); }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-brand shadow-md cursor-grab active:cursor-grabbing z-10 touch-none"
        style={{ left: `${rightPct}%` }}
        onMouseDown={(e) => { e.preventDefault(); setDragging("max"); }}
        onTouchStart={() => { setDragging("max"); }}
      />
      <div
        className="absolute -top-6 -translate-x-1/2 text-[10px] font-bold text-brand-deep whitespace-nowrap"
        style={{ left: `${leftPct}%` }}
      >
        KSh {formatPrice(valueMin)}
      </div>
      <div
        className="absolute -top-6 -translate-x-1/2 text-[10px] font-bold text-brand-deep whitespace-nowrap"
        style={{ left: `${rightPct}%` }}
      >
        KSh {formatPrice(valueMax)}
      </div>
    </div>
  );
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
  const activeColor = searchParams.get("color") ?? "";
  const activeSize = searchParams.get("size") ?? "";
  const activeMinPrice = searchParams.get("minPrice") ?? "";
  const activeMaxPrice = searchParams.get("maxPrice") ?? "";

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Slider local state
  const [sliderMin, setSliderMin] = useState(activeMinPrice ? Number(activeMinPrice) : PRICE_MIN);
  const [sliderMax, setSliderMax] = useState(activeMaxPrice ? Number(activeMaxPrice) : PRICE_MAX);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSliderMin(activeMinPrice ? Number(activeMinPrice) : PRICE_MIN);
    setSliderMax(activeMaxPrice ? Number(activeMaxPrice) : PRICE_MAX);
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

  // Debounced slider commit — fires 400ms after the user stops dragging
  const commitSlider = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const updates: Record<string, string | null> = {};
      if (sliderMin > PRICE_MIN) updates.minPrice = String(sliderMin);
      else updates.minPrice = null;
      if (sliderMax < PRICE_MAX) updates.maxPrice = String(sliderMax);
      else updates.maxPrice = null;
      pushParams(updates);
    }, 400);
  }, [sliderMin, sliderMax, searchParams, router]);

  function resetPrice() {
    setSliderMin(PRICE_MIN);
    setSliderMax(PRICE_MAX);
    pushParams({ minPrice: null, maxPrice: null });
  }

  const hasPriceFilter = activeMinPrice || activeMaxPrice;

  const activeFilterCount = [
    activeOnSale, activeNewArrivals, activePersonalizable,
    activeColor, activeSize, activeSort,
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

      {/* ── Price Range Slider + Sort ── */}
      <div className="px-1 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Price Range</h3>
            {hasPriceFilter && (
              <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                KSh {sliderMin > 0 ? formatPrice(sliderMin) : "0"} — {sliderMax < PRICE_MAX ? formatPrice(sliderMax) : "Any"}
              </span>
            )}
            {hasPriceFilter && (
              <button onClick={resetPrice} className="text-[10px] text-brand-muted hover:text-brand underline font-semibold">
                Reset
              </button>
            )}
          </div>

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
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-black/10 py-1 z-40 min-w-[180px]">
                  <button
                    onClick={() => { pushParams({ sort: null }); setSortOpen(false); }}
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

        {/* Dual range slider */}
        <div className="px-2 pt-4 pb-1">
          <DualRangeSlider
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            valueMin={sliderMin}
            valueMax={sliderMax}
            onChange={(min, max) => {
              setSliderMin(min);
              setSliderMax(max);
            }}
            onDragEnd={commitSlider}
          />
        </div>
      </div>

      {/* ── Quick Filters Row ── */}
      <div className="flex flex-wrap items-center gap-2 px-1 mb-3" style={{ borderTop: "1px solid var(--surface-border)", paddingTop: "0.75rem" }}>
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

      {/* ── Advanced Filters ── */}
      {showAdvanced && (
        <div className="px-1 pt-3 space-y-3" style={{ borderTop: "1px solid var(--surface-border)" }}>
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
