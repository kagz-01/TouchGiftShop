"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";

type WishlistItem = {
  id: string;
  product_id: string;
  note: string | null;
  is_fulfilled: boolean;
  fulfilled_by: string | null;
  products: {
    name: string;
    price: number;
    image_url: string | null;
    slug?: string;
  };
};

type Wishlist = {
  id: string;
  owner_name: string;
  slug: string;
  occasion: string | null;
  message: string | null;
  created_at: string;
};

export default function WishlistView({ slug }: { slug: string }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

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

  const copyLink = async () => {
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
  };

  const shareWhatsApp = () => {
    const url = `${window.location.origin}/wishlist/${slug}`;
    const text = `Hey! Check out my wishlist 🎁 ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareTwitter = () => {
    const url = `${window.location.origin}/wishlist/${slug}`;
    const text = `Check out my wishlist 🎁`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-brand-muted">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center px-4">
          <span className="text-6xl block mb-4">🔍</span>
          <p className="font-display text-xl font-semibold mb-2">Wishlist not found</p>
          <p className="text-brand-muted mb-6">This wishlist doesn&apos;t exist or has been removed.</p>
          <Link href="/shop" className="inline-flex px-6 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const fulfilled = items.filter((i) => i.is_fulfilled);
  const pending = items.filter((i) => !i.is_fulfilled);
  const totalValue = pending.reduce((sum, i) => sum + (i.products?.price || 0), 0);
  const fulfilledValue = fulfilled.reduce((sum, i) => sum + (i.products?.price || 0), 0);
  const progress = items.length > 0 ? (fulfilled.length / items.length) * 100 : 0;

  const OCCASION_EMOJI: Record<string, string> = {
    birthday: "🎂",
    wedding: "💒",
    baby: "👶",
    anniversary: "💕",
    graduation: "🎓",
    christmas: "🎄",
    "just because": "💝",
    other: "🎁",
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="bg-white border-b border-surface-border">
        <div className="page-container py-6">
          {/* Owner name + occasion */}
          <div className="text-center mb-4">
            {wishlist.occasion && (
              <span className="text-4xl block mb-2">
                {OCCASION_EMOJI[wishlist.occasion.toLowerCase()] || "🎁"}
              </span>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
              {wishlist.owner_name}&apos;s Wishlist
            </h1>
            {wishlist.message && (
              <p className="text-brand-muted text-sm italic max-w-md mx-auto">
                &ldquo;{wishlist.message}&rdquo;
              </p>
            )}
          </div>

          {/* Progress bar */}
          {items.length > 0 && (
            <div className="max-w-sm mx-auto">
              <div className="flex items-center justify-between text-xs text-brand-muted mb-2">
                <span>{fulfilled.length} of {items.length} items fulfilled</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand to-gold rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {totalValue > 0 && (
                <p className="text-xs text-brand-muted text-center mt-2">
                  Still looking for: <span className="font-semibold text-brand">{formatKsh(totalValue)}</span> worth of gifts
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="page-container py-6 space-y-6">
        {/* Share section */}
        <div className="bg-white rounded-2xl p-4 border border-surface-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Share this wishlist</p>
              <p className="text-xs text-brand-muted">Let friends & family know what you&apos;d love</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="px-4 py-2 bg-brand/10 text-brand rounded-xl text-xs font-semibold hover:bg-brand/20 transition-colors"
              >
                Share 📤
              </button>
              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-card-hover border border-surface-border py-2 z-50 w-44 animate-pop">
                  <button
                    onClick={() => { shareWhatsApp(); setShowShareMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-green-50 transition-colors text-left"
                  >
                    <span>💬</span> WhatsApp
                  </button>
                  <button
                    onClick={() => { shareTwitter(); setShowShareMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors text-left"
                  >
                    <span>🐦</span> Twitter
                  </button>
                  <button
                    onClick={() => { copyLink(); setShowShareMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
                  >
                    <span>🔗</span> {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending items */}
        {pending.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-brand-muted uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-brand rounded-full" />
              Still wanted ({pending.length})
            </h2>
            <div className="space-y-3">
              {pending.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-surface-border hover:shadow-card transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Product image */}
                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden relative flex-shrink-0">
                      {item.products?.image_url ? (
                        <Image
                          src={item.products.image_url}
                          alt={item.products.name}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">🎁</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product_id}`}
                        className="font-semibold text-sm hover:text-brand transition-colors line-clamp-1"
                      >
                        {item.products?.name}
                      </Link>
                      <p className="text-brand font-bold text-sm mt-0.5">
                        {formatKsh(item.products?.price || 0)}
                      </p>
                      {item.note && (
                        <p className="text-xs text-brand-muted italic mt-1 line-clamp-2">
                          &ldquo;{item.note}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Send button */}
                    <Link
                      href={`/checkout?productId=${item.product_id}&amount=${item.products?.price || 0}`}
                      className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-brand to-brand-light text-white rounded-xl text-xs font-semibold hover:shadow-ribbon transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Send this 🎁
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fulfilled items */}
        {fulfilled.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-success uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-success rounded-full" />
              Fulfilled ({fulfilled.length})
            </h2>
            <div className="space-y-3">
              {fulfilled.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-surface-border opacity-60"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden relative flex-shrink-0">
                      {item.products?.image_url && (
                        <Image
                          src={item.products.image_url}
                          alt={item.products.name}
                          fill
                          sizes="64px"
                          className="object-cover grayscale"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-through text-brand-muted">{item.products?.name}</p>
                      <p className="text-xs text-brand-muted">{formatKsh(item.products?.price || 0)}</p>
                    </div>
                    <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-full">
                      ✓ Sent
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">📝</span>
            <p className="font-display text-lg font-semibold mb-2">No items yet</p>
            <p className="text-brand-muted text-sm mb-6">
              Add items from the shop to build your perfect wishlist
            </p>
            <Link
              href="/"
              className="inline-flex px-6 py-3 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors"
            >
              Browse Gifts
            </Link>
          </div>
        )}

        {/* Add items CTA */}
        {items.length > 0 && (
          <div className="text-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-surface-border rounded-xl text-sm font-semibold text-brand hover:border-brand/30 hover:shadow-soft transition-all"
            >
              <span>+</span> Add more items
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
