"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";

interface WishlistItem {
  id: string;
  product_id: string;
  note: string | null;
  is_fulfilled: boolean;
  products: {
    name: string;
    price: number;
    image_url: string | null;
  };
}

interface Wishlist {
  id: string;
  owner_name: string;
  slug: string;
}

export default function WishlistView({ slug }: { slug: string }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/wishlist/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setWishlist(data.wishlist);
        setItems(data.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  async function copyLink() {
    const url = `${window.location.origin}/wishlist/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 text-center">
        <p className="text-sm text-brand-muted">Loading...</p>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="px-4 md:px-8 py-6 text-center">
        <p className="text-sm text-brand-muted">Wishlist not found.</p>
      </div>
    );
  }

  const fulfilled = items.filter((i) => i.is_fulfilled);
  const pending = items.filter((i) => !i.is_fulfilled);

  return (
    <div className="px-4 md:px-8 py-6 max-w-lg mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">{wishlist.owner_name}&apos;s wishlist</h1>
        <p className="text-sm text-brand-muted">
          {items.length === 0
            ? "No items yet."
            : `${fulfilled.length} of ${items.length} items fulfilled`}
        </p>
      </div>

      <button
        onClick={copyLink}
        className="w-full rounded-lg border border-gray-300 py-2 text-sm font-medium"
      >
        {copied ? "Copied!" : "Copy wishlist link"}
      </button>

      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium">Still wanted</h2>
          {pending.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden relative shrink-0">
                {item.products?.image_url && (
                  <Image
                    src={item.products.image_url}
                    alt={item.products.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.products?.name}
                </p>
                <p className="text-xs text-brand-muted">
                  {formatKsh(item.products?.price ?? 0)}
                </p>
                {item.note && (
                  <p className="text-xs text-brand-muted italic mt-1">
                    &ldquo;{item.note}&rdquo;
                  </p>
                )}
              </div>
              <Link
                href={`/checkout?productId=${item.product_id}&amount=${item.products?.price ?? 0}`}
                className="shrink-0 rounded-lg bg-brand text-white px-3 py-1.5 text-xs font-medium"
              >
                Send this
              </Link>
            </div>
          ))}
        </div>
      )}

      {fulfilled.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-brand-muted">Fulfilled</h2>
          {fulfilled.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 opacity-60"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden relative shrink-0">
                {item.products?.image_url && (
                  <Image
                    src={item.products.image_url}
                    alt={item.products.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{item.products?.name}</p>
                <p className="text-xs text-brand-muted">
                  {formatKsh(item.products?.price ?? 0)}
                </p>
              </div>
              <span className="text-xs text-green-600">Sent</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
