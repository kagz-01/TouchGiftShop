"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import {
  Heart, Share2, Copy, Check, Trash2, ExternalLink,
  Plus, Gift, Sparkles, ShoppingBag
} from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://touchgiftshop.co.ke";
const WISHLIST_SLUG_KEY = "touchgift_wishlist_slug";

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

const OCCASION_CONFIG: Record<string, { emoji: string; gradient: string }> = {
  birthday:       { emoji: "🎂", gradient: "from-pink-400 to-rose-500" },
  wedding:        { emoji: "💒", gradient: "from-rose-400 to-red-500" },
  baby:           { emoji: "👶", gradient: "from-sky-400 to-blue-500" },
  anniversary:    { emoji: "💕", gradient: "from-red-400 to-pink-500" },
  graduation:     { emoji: "🎓", gradient: "from-violet-400 to-purple-500" },
  christmas:      { emoji: "🎄", gradient: "from-emerald-400 to-green-500" },
  "just because": { emoji: "💝", gradient: "from-pink-400 to-fuchsia-500" },
  other:          { emoji: "🎁", gradient: "from-amber-400 to-orange-500" },
};

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [noWishlist, setNoWishlist] = useState(false);
  const [copied, setCopied] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const slug = localStorage.getItem(WISHLIST_SLUG_KEY);
    if (!slug) { setNoWishlist(true); setLoaded(true); return; }

    fetch(`/api/wishlist/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.wishlist) {
          setWishlist(data.wishlist);
          setItems(data.items ?? []);
        } else {
          localStorage.removeItem(WISHLIST_SLUG_KEY);
          setNoWishlist(true);
        }
        setLoaded(true);
      })
      .catch(() => { setNoWishlist(true); setLoaded(true); });
  }, []);

  const removeItem = async (itemId: string) => {
    if (!wishlist) return;
    setRemoving(itemId);
    const res = await fetch(`/api/wishlist/${wishlist.slug}?itemId=${itemId}`, { method: "DELETE" });
    if (res.ok) setItems(items.filter((i) => i.id !== itemId));
    setRemoving(null);
  };

  const copyLink = async () => {
    if (!wishlist) return;
    const url = `${SITE_URL}/wishlist/${wishlist.slug}`;
    try { await navigator.clipboard.writeText(url); }
    catch {
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
    const text = `Hey! 🎁 Check out my gift wishlist — pick something you'd love to send me!\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (noWishlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center px-6 max-w-sm">
          <div className="w-20 h-20 mx-auto mb-5 bg-rose-100 rounded-3xl flex items-center justify-center">
            <Heart className="w-10 h-10 text-rose-400" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2 text-gray-900">No wishlist yet</h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Create your gift registry so friends & family always know exactly what to get you.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/wishlist/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-bold text-sm shadow-lg hover:from-rose-600 hover:to-pink-600 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Create My Wishlist
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-semibold text-sm hover:border-rose-300 hover:text-rose-600 transition-all"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Gifts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shareUrl = wishlist ? `${SITE_URL}/wishlist/${wishlist.slug}` : "";
  const occasion = wishlist?.occasion?.toLowerCase() ?? "other";
  const cfg = OCCASION_CONFIG[occasion] ?? OCCASION_CONFIG.other;
  const fulfilled = items.filter((i) => i.is_fulfilled);
  const pending = items.filter((i) => !i.is_fulfilled);
  const progress = items.length > 0 ? (fulfilled.length / items.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-black/5 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
            <Gift className="w-4 h-4 text-rose-500" />
            <span className="font-semibold">My Wishlist</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href={shareUrl}
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-rose-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Public view
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* ── Registry Card ── */}
        <div className="bg-white rounded-3xl shadow-lg border border-white/80 overflow-hidden">
          {/* gradient header */}
          <div className={`bg-gradient-to-r ${cfg.gradient} p-6 text-white text-center`}>
            <span className="text-4xl block mb-2">{cfg.emoji}</span>
            <h1 className="font-display text-2xl font-bold">{wishlist?.owner_name}&apos;s</h1>
            <p className="text-white/80 text-sm capitalize mt-0.5">
              {wishlist?.occasion ? `${wishlist.occasion} Wishlist` : "Gift Registry"}
            </p>
          </div>

          {/* Progress */}
          {items.length > 0 && (
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>{fulfilled.length} of {items.length} items fulfilled</span>
                <span className="font-bold text-rose-500">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Share strip */}
          <div className="px-6 py-4 flex items-center gap-3">
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
            <button
              onClick={shareWhatsApp}
              className="p-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 rounded-xl transition-colors"
              title="Share on WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Items ── */}
        {items.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 rounded-3xl flex items-center justify-center">
              <Heart className="w-8 h-8 text-rose-300" />
            </div>
            <p className="font-display font-bold text-lg text-gray-700 mb-2">Your wishlist is empty</p>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
              Tap the heart icon on any gift to add it here!
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl font-bold text-sm hover:bg-rose-600 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Browse Gifts
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md ${
                  item.is_fulfilled ? "opacity-50" : ""
                }`}
              >
                <div className="w-16 h-16 bg-rose-50 rounded-xl overflow-hidden relative flex-shrink-0">
                  {item.products?.image_url ? (
                    <Image
                      src={item.products.image_url}
                      alt={item.products.name}
                      fill sizes="64px"
                      className={`object-cover ${item.is_fulfilled ? "grayscale" : ""}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product_id}`} className="text-sm font-semibold text-gray-800 hover:text-rose-600 transition-colors line-clamp-1">
                    {item.products?.name}
                  </Link>
                  <p className="text-rose-600 font-bold text-sm mt-0.5">
                    {formatKsh(item.products?.price || 0)}
                  </p>
                  {item.is_fulfilled && (
                    <span className="text-xs font-semibold text-emerald-600">✓ Fulfilled</span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.is_fulfilled && (
                    <Link
                      href={`/checkout?productId=${item.product_id}`}
                      className="text-xs px-3 py-2 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
                    >
                      Send Now
                    </Link>
                  )}
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={removing === item.id}
                    className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    {removing === item.id ? (
                      <div className="w-4 h-4 border-2 border-gray-200 border-t-red-400 rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Add more ── */}
        {items.length > 0 && (
          <Link
            href="/shop"
            className="flex items-center justify-center gap-2 w-full py-4 bg-white border-2 border-dashed border-rose-200 rounded-2xl text-sm font-semibold text-rose-500 hover:border-rose-400 hover:bg-rose-50 transition-all"
          >
            <Plus className="w-4 h-4" /> Add more gifts
          </Link>
        )}
      </div>
    </div>
  );
}
