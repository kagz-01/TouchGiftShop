"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import BackToHome from "@/components/ui/BackToHome";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://touch-gift-shop.vercel.app";
const WISHLIST_SLUG_KEY = "touchgift_wishlist_slug";
const WISHLIST_NAME_KEY = "touchgift_wishlist_name";

type WishlistItem = {
  id: string;
  product_id: string;
  note: string | null;
  is_fulfilled: boolean;
  products: {
    name: string;
    price: number;
    image_url: string | null;
  };
};

type Wishlist = {
  id: string;
  owner_name: string;
  slug: string;
  occasion: string | null;
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [noWishlist, setNoWishlist] = useState(false);

  useEffect(() => {
    const slug = localStorage.getItem(WISHLIST_SLUG_KEY);
    if (!slug) {
      setNoWishlist(true);
      setLoaded(true);
      return;
    }
    fetch(`/api/wishlist/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.wishlist) {
          setWishlist(data.wishlist);
          setItems(data.items ?? []);
        } else {
          // Stale slug in storage
          localStorage.removeItem(WISHLIST_SLUG_KEY);
          localStorage.removeItem(WISHLIST_NAME_KEY);
          setNoWishlist(true);
        }
        setLoaded(true);
      })
      .catch(() => {
        setNoWishlist(true);
        setLoaded(true);
      });
  }, []);

  const removeItem = async (itemId: string) => {
    if (!wishlist) return;
    const res = await fetch(`/api/wishlist/${wishlist.slug}?itemId=${itemId}`, { method: "DELETE" });
    if (res.ok) {
      setItems(items.filter((i) => i.id !== itemId));
    }
  };

  const copyLink = async () => {
    if (!wishlist) return;
    const url = `${SITE_URL}/wishlist/${wishlist.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("input");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsApp = () => {
    if (!wishlist) return;
    const url = `${SITE_URL}/wishlist/${wishlist.slug}`;
    const text = `Hey! Check out ${wishlist.owner_name}'s wishlist on TouchGift 🎁\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!loaded) {
    return (
      <div className="min-h-screen section-theme-d flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (noWishlist) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center px-4 max-w-sm">
          <div className="flex justify-center mb-4">
            <svg className="w-16 h-16 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">No wishlist yet</h1>
          <p className="text-brand-muted text-sm mb-6">
            Browse our gifts and tap the heart icon on any product to create your wishlist and add items!
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors shadow-button"
          >
            Browse Gifts →
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = wishlist ? `${SITE_URL}/wishlist/${wishlist.slug}` : "";

  return (
    <div className="min-h-screen section-theme-d">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <BackToHome />
          <Link
            href={shareUrl}
            target="_blank"
            className="text-xs text-brand-muted hover:text-brand transition-colors"
          >
            Public view →
          </Link>
        </div>

        {/* Wishlist Header Card */}
        <div className="bg-white rounded-3xl shadow-card p-6 mb-6 text-center border border-surface-border">
          <div className="flex justify-center mb-2">
            <svg className="w-10 h-10 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>
          <h1 className="font-display text-2xl font-bold">{wishlist?.owner_name}&apos;s Wishlist</h1>
          {wishlist?.occasion && (
            <p className="text-brand-muted text-sm mt-1 capitalize flex items-center justify-center gap-1">
              <svg className="w-4 h-4 text-brand-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              {wishlist.occasion}
            </p>
          )}
          <p className="text-sm text-brand-muted mt-2">
            {items.length} item{items.length !== 1 ? "s" : ""} saved
          </p>

          {/* Share strip */}
          <div className="mt-4 bg-surface rounded-2xl p-3 flex items-center gap-2">
            <p className="flex-1 text-xs text-brand-muted font-mono truncate text-left">{shareUrl}</p>
            <button
              onClick={copyLink}
              className="shrink-0 text-xs px-3 py-2 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors"
            >
              {copied ? "Copied! ✓" : "Copy"}
            </button>
            <button
              onClick={shareWhatsApp}
              className="shrink-0 p-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 rounded-xl transition-colors"
              title="Share on WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-surface-border">
            <div className="flex justify-center mb-3">
              <svg className="w-12 h-12 text-brand/50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </div>
            <p className="font-display font-semibold mb-2">Your wishlist is empty</p>
            <p className="text-sm text-brand-muted mb-6">
              Tap the heart icon on any gift to add it here!
            </p>
            <Link href="/shop" className="btn-brand px-6 py-3 rounded-xl font-bold text-sm shadow-button">
              Browse Gifts
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border border-surface-border flex items-center gap-4 group transition-all hover:shadow-card ${item.is_fulfilled ? "opacity-50" : ""}`}
              >
                {/* Image */}
                <div className="w-16 h-16 bg-blush rounded-xl overflow-hidden relative flex-shrink-0">
                  {item.products?.image_url ? (
                    <Image
                      src={item.products.image_url}
                      alt={item.products.name}
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-brand/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product_id}`}
                    className="text-sm font-semibold hover:text-brand transition-colors line-clamp-1"
                  >
                    {item.products?.name}
                  </Link>
                  <p className="text-brand font-bold text-sm mt-0.5">
                    {formatKsh(item.products?.price || 0)}
                  </p>
                  {item.is_fulfilled && (
                    <span className="text-xs text-green-600 font-semibold">✓ Fulfilled</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/checkout?productId=${item.product_id}`}
                    className="text-xs px-3 py-2 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors"
                  >
                    Buy Now
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-brand-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add more */}
        {items.length > 0 && (
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-surface-border rounded-2xl text-sm font-semibold text-brand hover:border-brand/30 hover:shadow-soft transition-all"
            >
              + Browse more gifts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
