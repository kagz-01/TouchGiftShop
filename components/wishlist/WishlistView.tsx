"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import {
  Heart, Share2, Copy, Check, ExternalLink, Gift,
  ShoppingBag, Sparkles, ChevronRight
} from "lucide-react";

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

const OCCASION_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  birthday:    { emoji: "🎂", color: "text-pink-600",   bg: "from-pink-50 to-rose-50" },
  wedding:     { emoji: "💒", color: "text-rose-600",   bg: "from-rose-50 to-pink-50" },
  baby:        { emoji: "👶", color: "text-sky-600",    bg: "from-sky-50 to-blue-50" },
  anniversary: { emoji: "💕", color: "text-red-500",    bg: "from-red-50 to-pink-50" },
  graduation:  { emoji: "🎓", color: "text-violet-600", bg: "from-violet-50 to-purple-50" },
  christmas:   { emoji: "🎄", color: "text-emerald-600",bg: "from-emerald-50 to-green-50" },
  "just because": { emoji: "💝", color: "text-pink-500", bg: "from-pink-50 to-rose-50" },
  other:       { emoji: "🎁", color: "text-amber-600",  bg: "from-amber-50 to-yellow-50" },
};

export default function WishlistView({ slug }: { slug: string }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [giftingItem, setGiftingItem] = useState<string | null>(null);

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
    try { await navigator.clipboard.writeText(url); }
    catch {
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
    const text = `Hey! 🎁 Check out ${wishlist?.owner_name}'s gift wishlist — pick something they'd actually love!\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareTwitter = () => {
    const url = `${window.location.origin}/wishlist/${slug}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out my wishlist 🎁")}&url=${encodeURIComponent(url)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-rose-400 font-medium">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center px-6 max-w-sm">
          <span className="text-6xl block mb-4">🔍</span>
          <h1 className="font-display text-2xl font-bold mb-2">Wishlist not found</h1>
          <p className="text-gray-500 mb-6">This wishlist doesn&apos;t exist or has been removed.</p>
          <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-semibold text-sm hover:bg-rose-600 transition-colors">
            <ShoppingBag className="w-4 h-4" /> Browse Gifts
          </Link>
        </div>
      </div>
    );
  }

  const occasion = wishlist.occasion?.toLowerCase() ?? "other";
  const cfg = OCCASION_CONFIG[occasion] ?? OCCASION_CONFIG.other;
  const fulfilled = items.filter((i) => i.is_fulfilled);
  const pending = items.filter((i) => !i.is_fulfilled);
  const totalValue = pending.reduce((s, i) => s + (i.products?.price || 0), 0);
  const progress = items.length > 0 ? (fulfilled.length / items.length) * 100 : 0;
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/wishlist/${slug}`;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${cfg.bg} via-white`}>
      {/* ── Hero Header ── */}
      <div className="bg-white/70 backdrop-blur-md border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/shop" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <Gift className="w-4 h-4" />
            <span className="hidden sm:inline">TouchGift</span>
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:border-rose-300 hover:text-rose-600 transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            {showShareMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 w-52 animate-fade-in">
                <button onClick={() => { shareWhatsApp(); setShowShareMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-green-50 transition-colors text-left rounded-xl mx-auto">
                  <span className="text-lg">💬</span> <span className="font-medium">Share on WhatsApp</span>
                </button>
                <button onClick={() => { shareTwitter(); setShowShareMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 transition-colors text-left">
                  <span className="text-lg">🐦</span> <span className="font-medium">Share on X</span>
                </button>
                <button onClick={() => { copyLink(); setShowShareMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left">
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  <span className="font-medium">{copied ? "Copied!" : "Copy link"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* ── Registry Hero Card ── */}
        <div className="bg-white rounded-3xl shadow-lg border border-white/80 overflow-hidden">
          <div className={`bg-gradient-to-br ${cfg.bg} px-6 pt-10 pb-6 text-center`}>
            <span className="text-5xl block mb-3 animate-bounce">{cfg.emoji}</span>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">
              {wishlist.owner_name}&apos;s
            </h1>
            <p className={`text-lg font-semibold ${cfg.color} capitalize`}>
              {wishlist.occasion ? `${wishlist.occasion} Wishlist` : "Gift Registry"}
            </p>
            {wishlist.message && (
              <p className="text-gray-500 text-sm italic mt-3 max-w-xs mx-auto">
                &ldquo;{wishlist.message}&rdquo;
              </p>
            )}
          </div>

          {/* Progress strip */}
          {items.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-medium">
                  {fulfilled.length} of {items.length} gifts fulfilled
                </span>
                <span className={`font-bold ${cfg.color}`}>{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-rose-400 to-pink-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {totalValue > 0 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Still looking for: <span className="font-semibold text-gray-700">{formatKsh(totalValue)}</span> worth of gifts
                </p>
              )}
            </div>
          )}

          {/* Share URL pill */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 font-mono text-xs text-gray-400 truncate">
              {shareUrl}
            </div>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                copied ? "bg-emerald-500 text-white" : "bg-rose-50 text-rose-600 hover:bg-rose-100"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* ── Still Wanted ── */}
        {pending.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                Still Wanted ({pending.length})
              </h2>
            </div>
            <div className="space-y-3">
              {pending.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className="w-20 h-20 bg-rose-50 rounded-xl overflow-hidden relative flex-shrink-0">
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

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${item.product_id}`}
                        className="font-semibold text-sm text-gray-800 hover:text-rose-600 transition-colors line-clamp-1"
                      >
                        {item.products?.name}
                      </Link>
                      <p className="text-rose-600 font-bold text-sm mt-0.5">
                        {formatKsh(item.products?.price || 0)}
                      </p>
                      {item.note && (
                        <p className="text-xs text-gray-400 italic mt-1 line-clamp-1">
                          &ldquo;{item.note}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Link
                        href={`/checkout?productId=${item.product_id}&amount=${item.products?.price || 0}`}
                        onMouseEnter={() => setGiftingItem(item.id)}
                        onMouseLeave={() => setGiftingItem(null)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-xs font-bold hover:from-rose-600 hover:to-pink-600 shadow-sm hover:shadow-rose-200 hover:shadow-lg transition-all"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        {giftingItem === item.id ? "Let's go! 🎉" : "Send Gift"}
                      </Link>
                      <Link
                        href={`/product/${item.product_id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-xl text-xs font-medium hover:bg-gray-100 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" /> View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Fulfilled ── */}
        {fulfilled.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Check className="w-4 h-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Already Gifted ({fulfilled.length})
              </h2>
            </div>
            <div className="space-y-2">
              {fulfilled.map((item) => (
                <div key={item.id} className="bg-white/60 rounded-2xl border border-gray-100 p-4 flex items-center gap-4 opacity-60">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
                    {item.products?.image_url && (
                      <Image src={item.products.image_url} alt={item.products.name} fill sizes="56px" className="object-cover grayscale" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-through text-gray-400">{item.products?.name}</p>
                    <p className="text-xs text-gray-400">{formatKsh(item.products?.price || 0)}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    ✓ Gifted
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {items.length === 0 && (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-white/80">
            <Sparkles className="w-12 h-12 text-rose-300 mx-auto mb-4" />
            <p className="font-display text-xl font-bold text-gray-700 mb-2">No items yet</p>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              This wishlist is empty. Browse the shop and tap the heart on any gift to add it.
            </p>
            <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-semibold text-sm hover:bg-rose-600 transition-colors">
              <ShoppingBag className="w-4 h-4" /> Browse Gifts
            </Link>
          </div>
        )}

        {/* ── Browse more CTA ── */}
        {pending.length > 0 && (
          <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-6 text-center text-white shadow-lg">
            <p className="font-display text-lg font-bold mb-1">Can&apos;t decide?</p>
            <p className="text-rose-100 text-sm mb-4">Browse the full catalog for more gift inspiration.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-rose-600 rounded-xl font-semibold text-sm hover:bg-rose-50 transition-colors"
            >
              Browse Gifts <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
