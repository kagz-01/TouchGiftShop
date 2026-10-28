import type { ShopCategory } from "@/components/shop/useShopCategories";
import { Percent, Clock, Tag } from "lucide-react";

export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Top Rated", value: "rating" },
];

export const QUICK_FILTERS = [
  { label: "On Sale", icon: <Percent className="w-3.5 h-3.5" />, param: "onSale", value: "1" },
  { label: "New (7d)", icon: <Clock className="w-3.5 h-3.5" />, param: "newArrivals", value: "7d" },
  { label: "New (30d)", icon: <Clock className="w-3.5 h-3.5" />, param: "newArrivals", value: "30d" },
  { label: "Customizable", icon: <Tag className="w-3.5 h-3.5" />, param: "personalizable", value: "1" },
];

// Budget presets — clear, human-readable ranges
export const BUDGET_PRESETS = [
  { label: "Under KSh 2K", min: 0, max: 2000 },
  { label: "KSh 2K – 5K", min: 2000, max: 5000 },
  { label: "KSh 5K – 10K", min: 5000, max: 10000 },
  { label: "KSh 10K – 25K", min: 10000, max: 25000 },
  { label: "KSh 25K+", min: 25000, max: null },
];

export function formatPrice(v: number) {
  if (v >= 1000) return `KSh ${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K`;
  return `KSh ${v}`;
}

/** Focus categories first (matches the desktop card's curated order), then the rest. */
export function buildCategoryTabs(categories: ShopCategory[]) {
  return [
    { slug: "", name: "All Gifts", count: 1 },
    ...categories.filter((c) => ["perfumes", "gift-sets"].includes(c.slug)),
    { slug: "flowers", name: "Flowers", count: categories.find((c) => c.slug === "flowers")?.count || 0 },
    { slug: "drinks", name: "Drinks & Spirits", count: categories.find((c) => c.slug === "drinks")?.count || 0 },
    { slug: "fruits", name: "Fruit Hampers", count: categories.find((c) => c.slug === "fruits")?.count || 0 },
    { slug: "apparel", name: "Wearables", count: categories.find((c) => c.slug === "apparel")?.count || 0 },
    ...categories.filter(
      (c) => !["perfumes", "gift-sets", "flowers", "drinks", "fruits", "apparel"].includes(c.slug)
    ),
  ].filter((cat) => cat.slug === "" || cat.count > 0);
}
