"use client";

import { useEffect, useState } from "react";

export type ShopCategory = { slug: string; name: string; count: number };

/**
 * The categories that have products, newest taxonomy included.
 * Used for first paint; the live list from /api/categories replaces it so a
 * newly imported product line appears in the nav without a deploy.
 */
export const FALLBACK_CATEGORIES: ShopCategory[] = [
  { slug: "stationery-office", name: "Stationery & Office", count: 91 },
  { slug: "gift-sets", name: "Gift Sets & Hampers", count: 75 },
  { slug: "drinkware", name: "Drinkware", count: 50 },
  { slug: "awards-trophies", name: "Awards & Trophies", count: 45 },
  { slug: "accessories", name: "Accessories", count: 43 },
  { slug: "bags", name: "Bags", count: 16 },
  { slug: "clocks", name: "Clocks & Timepieces", count: 14 },
  { slug: "tech-gadgets", name: "Tech & Gadgets", count: 7 },
];

export function useShopCategories(): ShopCategory[] {
  const [categories, setCategories] = useState<ShopCategory[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    let alive = true;
    fetch("/api/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && Array.isArray(d?.categories)) setCategories(d.categories);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return categories;
}
