"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";

type WishlistItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
};

const WISHLIST_KEY = "touchgift_wishlist";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch {
      // localStorage not available
    }
    setLoaded(true);
  }, []);

  function removeItem(id: string) {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  }

  function clearAll() {
    setItems([]);
    localStorage.removeItem(WISHLIST_KEY);
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <span className="text-3xl">💝</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Save gifts you love by tapping the heart icon. They&apos;ll show up here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Browse Gifts →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
            <p className="text-sm text-gray-500">
              {items.length} item{items.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-50 relative">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300 text-3xl">
                    🎁
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                  aria-label="Remove from wishlist"
                >
                  ✕
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <Link
                  href={`/product/${item.id}`}
                  className="text-sm font-medium text-gray-900 hover:text-brand line-clamp-2 transition-colors"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm font-semibold text-brand">
                  {formatKsh(item.price)}
                </p>
                <Link
                  href={`/checkout?productId=${item.id}`}
                  className="mt-2 block w-full rounded-lg bg-brand/5 text-center py-1.5 text-xs font-medium text-brand hover:bg-brand hover:text-white transition-colors"
                >
                  Buy Now
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Share wishlist */}
        <div className="mt-8 rounded-xl bg-white border border-gray-100 p-4 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Share your wishlist so others know what you love
          </p>
          <button
            onClick={() => {
              const msg = `Check out my TouchGift wishlist! 🎁\n\n${items.map((i) => `- ${i.name} (${formatKsh(i.price)})`).join("\n")}`;
              navigator.clipboard.writeText(msg);
              alert("Wishlist copied to clipboard!");
            }}
            className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Copy List to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
}
