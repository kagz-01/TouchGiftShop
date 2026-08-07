"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";

type RecentProduct = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
};

const STORAGE_KEY = "touchgift_recently_viewed";
const MAX_ITEMS = 10;

export function trackRecentlyViewed(product: RecentProduct) {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const recent: RecentProduct[] = stored ? JSON.parse(stored) : [];

    // Remove if already exists
    const filtered = recent.filter((p) => p.id !== product.id);

    // Add to front
    filtered.unshift({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });

    // Limit to MAX_ITEMS
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {
    // localStorage not available
  }
}

export default function RecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // localStorage not available
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="py-10 md:py-14">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold">Recently Viewed</h2>
          <p className="text-sm text-brand-muted mt-1">Pick up where you left off</p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/product/${item.id}`}
            className="flex-shrink-0 w-40 group"
          >
            <div className="relative aspect-[4/5] bg-blush rounded-xl overflow-hidden mb-2">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="160px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
              )}
            </div>
            <h3 className="text-xs font-medium line-clamp-2 group-hover:text-brand transition-colors">
              {item.name}
            </h3>
            <p className="text-xs font-bold text-gold mt-0.5">{formatKsh(item.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
