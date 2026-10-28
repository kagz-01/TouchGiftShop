"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { categoryIcon } from "@/components/shop/CategoryIcons";
import { useShopCategories } from "@/components/shop/useShopCategories";
import { getSubFilters, groupSubFilters } from "@/components/shop/subfilter-registry";
import { useCart } from "@/lib/cart";
import { useTheme } from "@/components/ui/ThemeProvider";
import {
  SORT_OPTIONS,
  BUDGET_PRESETS,
  formatPrice,
  buildCategoryTabs,
} from "@/components/shop/filter-constants";
import {
  ArrowUpDown,
  Banknote,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Percent,
  Tag,
  Clock,
  X,
  Check,
  ChevronDown,
} from "lucide-react";

function useShopParamNav() {
  const router = useRouter();
  const searchParams = useSearchParams()!;

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

  return { searchParams, pushParams, toggleParam };
}

/* ── Bottom sheet primitive ────────────────────────────────────────────────── */

function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label={title}
        className="fixed left-0 right-0 bottom-0 z-[70] max-h-[78vh] flex flex-col bg-white dark:bg-[#12121a] border-t border-gray-100 dark:border-white/8 rounded-t-3xl shadow-[0_-24px_48px_rgba(0,0,0,0.18)]"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/8">
          <h2 className="font-display font-bold text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 -mr-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 pb-8">{children}</div>
      </div>
    </>,
    document.body
  );
}

function SheetOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors",
        active
          ? "bg-brand/10 text-brand"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
      )}
    >
      {label}
      {active && <Check className="w-4 h-4" />}
    </button>
  );
}

function BarChip({
  active,
  className,
  children,
  ...props
}: {
  active?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={cn(
        "shrink-0 flex items-center gap-1 px-3 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand",
        active
          ? "bg-gradient-brand text-white shadow-ribbon"
          : "bg-gray-100/80 dark:bg-white/[0.06] text-brand-muted hover:text-brand hover:bg-brand/5",
        className
      )}
    >
      {children}
    </button>
  );
}

/* ── Top refine rail — universal filters (Sort/Budget/On Sale/New/Custom) ────
   Category sub-types are NOT here: tapping a bottom category chip drops down
   its own chooser (see ShopBottomBar). */

type SheetKind = "sort" | "budget" | "new" | "more" | null;

export function ShopRefineRail() {
  const { searchParams, pushParams, toggleParam } = useShopParamNav();
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [customMin, setCustomMin] = useState("");
  const [customMax, setCustomMax] = useState("");

  const activeSort = searchParams.get("sort") ?? "";
  const activeOnSale = searchParams.get("onSale") ?? "";
  const activePersonalizable = searchParams.get("personalizable") ?? "";
  const activeNew = searchParams.get("newArrivals") ?? "";
  const activeMinPrice = searchParams.get("minPrice") ?? "";
  const activeMaxPrice = searchParams.get("maxPrice") ?? "";
  const activeMinRating = searchParams.get("minRating") ?? "";

  const hasPriceFilter = activeMinPrice || activeMaxPrice;
  const budgetLabel = hasPriceFilter
    ? activeMinPrice && !activeMaxPrice
      ? `${formatPrice(Number(activeMinPrice))}+`
      : !activeMinPrice && activeMaxPrice
      ? `Up to ${formatPrice(Number(activeMaxPrice))}`
      : `${formatPrice(Number(activeMinPrice))} – ${formatPrice(Number(activeMaxPrice))}`
    : "Budget";
  const sortLabel = activeSort
    ? SORT_OPTIONS.find((o) => o.value === activeSort)?.label ?? "Sort"
    : "Sort";
  const moreCount = activeMinRating ? 1 : 0;

  function isPresetActive(min: number, max: number | null) {
    const curMin = activeMinPrice ? Number(activeMinPrice) : 0;
    const curMax = activeMaxPrice ? Number(activeMaxPrice) : null;
    return curMin === min && curMax === max;
  }

  return (
    <div
      className="border-t"
      style={{ background: "var(--surface)", borderColor: "var(--surface-border)" }}
    >
      <div
        className="flex gap-1.5 overflow-x-auto scrollbar-hide px-4 py-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        aria-label="Refine products"
      >
        <BarChip
          active={!!activeSort}
          onClick={() => setSheet("sort")}
          aria-label={`Sort: ${sortLabel}`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span className="max-w-[84px] truncate">{sortLabel}</span>
          <ChevronDown className="w-3 h-3" />
        </BarChip>

        <BarChip
          active={!!hasPriceFilter}
          onClick={() => setSheet("budget")}
          aria-label={`Budget: ${budgetLabel}`}
        >
          <Banknote className="w-3.5 h-3.5" />
          <span className="max-w-[110px] truncate">{budgetLabel}</span>
          <ChevronDown className="w-3 h-3" />
        </BarChip>

        <BarChip
          active={activeOnSale === "1"}
          onClick={() => toggleParam("onSale", "1")}
          aria-pressed={activeOnSale === "1"}
        >
          <Percent className="w-3.5 h-3.5" />
          On Sale
        </BarChip>

        <BarChip
          active={!!activeNew}
          onClick={() => setSheet("new")}
          aria-label={`New arrivals: ${activeNew || "off"}`}
        >
          <Clock className="w-3.5 h-3.5" />
          {activeNew === "30d" ? "New 30d" : activeNew === "7d" ? "New 7d" : "New"}
          <ChevronDown className="w-3 h-3" />
        </BarChip>

        <BarChip
          active={activePersonalizable === "1"}
          onClick={() => toggleParam("personalizable", "1")}
          aria-pressed={activePersonalizable === "1"}
        >
          <Tag className="w-3.5 h-3.5" />
          Custom
        </BarChip>

        <BarChip
          active={moreCount > 0}
          onClick={() => setSheet("more")}
          aria-label={`More filters${moreCount > 0 ? `, ${moreCount} active` : ""}`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          More
          {moreCount > 0 && (
            <span className="ml-0.5 min-w-4 h-4 px-0.5 bg-white text-brand text-[9px] font-bold rounded-full flex items-center justify-center">
              {moreCount}
            </span>
          )}
        </BarChip>
      </div>

      {/* ── Sheets ── */}
      <Sheet open={sheet === "sort"} onClose={() => setSheet(null)} title="Sort by">
        <div className="space-y-1">
          {[{ label: "Default", value: "" }, ...SORT_OPTIONS].map((o) => (
            <SheetOption
              key={o.value || "default"}
              active={activeSort === o.value}
              label={o.label}
              onClick={() => {
                pushParams({ sort: o.value || null });
                setSheet(null);
              }}
            />
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === "budget"} onClose={() => setSheet(null)} title="Budget">
        <div className="grid grid-cols-2 gap-2">
          {BUDGET_PRESETS.map((preset) => {
            const isActive = isPresetActive(preset.min, preset.max);
            return (
              <button
                key={preset.label}
                onClick={() => {
                  pushParams({
                    minPrice: preset.min > 0 ? String(preset.min) : null,
                    maxPrice: preset.max !== null ? String(preset.max) : null,
                  });
                  setSheet(null);
                }}
                className={cn(
                  "px-3 py-2.5 rounded-xl text-xs font-bold transition-all border",
                  isActive
                    ? "bg-brand border-brand text-white shadow-sm"
                    : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-700 dark:text-gray-300 hover:border-brand/40"
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              KSh
            </span>
            <input
              type="number"
              placeholder="Min"
              value={customMin}
              onChange={(e) => setCustomMin(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
          <span className="text-xs font-bold text-gray-400">—</span>
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
              KSh
            </span>
            <input
              type="number"
              placeholder="Max"
              value={customMax}
              onChange={(e) => setCustomMax(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
          <button
            onClick={() => {
              pushParams({
                minPrice: customMin ? String(customMin) : null,
                maxPrice: customMax ? String(customMax) : null,
              });
              setCustomMin("");
              setCustomMax("");
              setSheet(null);
            }}
            disabled={!customMin && !customMax}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-brand text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-dark transition-all"
          >
            Apply
          </button>
        </div>

        {hasPriceFilter && (
          <button
            onClick={() => {
              pushParams({ minPrice: null, maxPrice: null });
              setSheet(null);
            }}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-brand bg-brand/10 hover:bg-brand/20 transition-colors"
          >
            Clear budget
          </button>
        )}
      </Sheet>

      <Sheet open={sheet === "new"} onClose={() => setSheet(null)} title="New arrivals">
        <div className="space-y-1">
          {[
            { label: "Off", value: "" },
            { label: "Last 7 days", value: "7d" },
            { label: "Last 30 days", value: "30d" },
          ].map((o) => (
            <SheetOption
              key={o.value || "off"}
              active={activeNew === o.value}
              label={o.label}
              onClick={() => {
                pushParams({ newArrivals: o.value || null });
                setSheet(null);
              }}
            />
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === "more"} onClose={() => setSheet(null)} title="More filters">
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
          Minimum rating
        </p>
        <div className="flex gap-2">
          {[4, 3, 2].map((r) => {
            const isActive = activeMinRating === String(r);
            return (
              <button
                key={r}
                onClick={() => toggleParam("minRating", String(r))}
                className={cn(
                  "flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border",
                  isActive
                    ? "bg-yellow-400 border-yellow-400 text-white shadow-sm"
                    : "bg-gray-50 dark:bg-white/5 border-transparent text-gray-700 dark:text-gray-300 hover:border-yellow-300"
                )}
              >
                {r}+ <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            pushParams({
              sort: null,
              onSale: null,
              newArrivals: null,
              personalizable: null,
              minPrice: null,
              maxPrice: null,
              minRating: null,
              subcat: null,
              tag: null,
            });
            setSheet(null);
          }}
          className="mt-5 w-full py-2.5 rounded-xl text-xs font-bold text-brand bg-brand/10 hover:bg-brand/20 transition-colors"
        >
          Reset all filters
        </button>
      </Sheet>
    </div>
  );
}

/* ── Bottom bar — primary categories in the thumb zone + pinned cart ─────────
   Categories with registry entries (see subfilter-registry.ts) drop down a
   chooser on tap — "All Fragrances" / "For Him" / … — and the category
   applies only when an option is picked. Sub-less categories filter directly. */

export function ShopBottomBar() {
  const { searchParams, pushParams } = useShopParamNav();
  const categories = useShopCategories();
  const { itemCount } = useCart();
  const { theme } = useTheme();
  const rowRef = useRef<HTMLDivElement>(null);
  const [pickerSlug, setPickerSlug] = useState<string | null>(null);

  const activeCategory = searchParams.get("category") ?? "";
  const activeSubValue = searchParams.get("subcat") || searchParams.get("tag") || "";
  const tabs = buildCategoryTabs(categories);

  const pickerTab = pickerSlug !== null ? tabs.find((t) => t.slug === pickerSlug) : undefined;
  const pickerGroups = groupSubFilters(getSubFilters(pickerSlug));
  // Options only highlight when the sheet is for the category already applied.
  const subsMatchCategory = pickerSlug !== null && activeCategory === pickerSlug;

  // Keep the active category chip in view — the row scrolls as stock grows.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const el = row.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeCategory]);

  function chooseCategory(slug: string) {
    // A sub-filter from the previous category must not leak into the new one
    // (?category=flowers&subcat=wine is an empty grid).
    pushParams({ category: slug || null, subcat: null, tag: null });
  }

  return (
    <div className="lg:hidden fixed bottom-3 inset-x-3 z-40">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-[26px] p-1.5 border backdrop-blur-xl transition-all duration-500",
          theme === "dark"
            ? "bg-[rgba(12,12,26,0.88)] border-white/10 shadow-[0_8px_32px_rgba(155,27,90,0.3)]"
            : "bg-white/90 border-[rgba(155,27,90,0.1)] shadow-card"
        )}
      >
        <div
          ref={rowRef}
          className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-1 py-0.5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          aria-label="Shop categories"
        >
          {tabs.map((cat) => {
            const isActive = activeCategory === cat.slug;
            const hasDropdown = getSubFilters(cat.slug).length > 0;
            return (
              <BarChip
                key={cat.slug || "all"}
                active={isActive}
                data-active={isActive}
                onClick={() => (hasDropdown ? setPickerSlug(cat.slug) : chooseCategory(cat.slug))}
                aria-pressed={isActive}
                aria-haspopup={hasDropdown ? "dialog" : undefined}
                aria-expanded={hasDropdown ? pickerSlug === cat.slug : undefined}
                title={cat.name}
              >
                <span className="flex items-center [&>svg]:w-3.5 [&>svg]:h-3.5">
                  {categoryIcon(cat.slug)}
                </span>
                <span className="max-w-[110px] truncate">{cat.name}</span>
                {hasDropdown && <ChevronDown className="w-3 h-3 -mr-1 opacity-70" />}
              </BarChip>
            );
          })}
        </div>

        <Link
          href="/cart"
          aria-label={`Shopping cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
          className="shrink-0 relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-brand text-white shadow-ribbon transition-transform active:scale-95"
        >
          <ShoppingBag className="w-4 h-4" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-0.5 bg-coral text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-white/70 dark:ring-[#12121a]">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </Link>
      </div>

      {/* ── Category chooser — dropped down by chips that have registry entries ── */}
      <Sheet
        open={pickerSlug !== null}
        onClose={() => setPickerSlug(null)}
        title={pickerTab?.name ?? "Category"}
      >
        <div className="space-y-1">
          <SheetOption
            active={subsMatchCategory && !activeSubValue}
            label={pickerTab?.slug ? `All ${pickerTab.name}` : "All Gifts"}
            onClick={() => {
              if (pickerSlug) chooseCategory(pickerSlug);
              setPickerSlug(null);
            }}
          />
        </div>
        {pickerGroups.map((group, gi) => (
          <div key={group.name ?? `g${gi}`} className="mt-3">
            {group.name && (
              <p className="px-1 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {group.name}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((f) => (
                <SheetOption
                  key={`${f.param}:${f.value}`}
                  active={subsMatchCategory && activeSubValue === f.value}
                  label={f.label}
                  onClick={() => {
                    pushParams({
                      category: pickerSlug,
                      subcat: f.param === "subcat" ? f.value : null,
                      tag: f.param === "tag" ? f.value : null,
                    });
                    setPickerSlug(null);
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </Sheet>
    </div>
  );
}
