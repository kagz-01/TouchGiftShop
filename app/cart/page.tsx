"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatKsh } from "@/lib/utils";
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
  Package,
  ChevronRight,
  Gift,
  Sparkles,
  ShieldCheck,
  Zap,
  Tag,
  X,
  Check,
} from "lucide-react";
import PackagingDecision, { type PackagingMode } from "@/components/checkout/PackagingDecision";
import LoyaltyCartUpsell from "@/components/cart/LoyaltyCartUpsell";
import type { CartItem } from "@/lib/cart";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, subtotal, itemCount, clearCart } = useCart();
  const [showPackagingDecision, setShowPackagingDecision] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  function handleRemove(id: string) {
    setRemovingId(id);
    setTimeout(() => {
      removeItem(id);
      setRemovingId(null);
    }, 280);
  }

  // ── Packaging Decision intercept (multi-item only) ──
  if (showPackagingDecision) {
    return (
      <PackagingDecision
        cartItems={items as CartItem[]}
        onConfirm={({ mode, hamperWrap, perItemWraps, totalWrappingCost }) => {
          const params = new URLSearchParams({ cart: "true" });
          if (mode === "hamper") {
            params.set("packaging", "hamper");
            if (hamperWrap !== "none") params.set("wrapping", hamperWrap);
          } else if (mode === "individual") {
            params.set("packaging", "individual");
            const nonNone = perItemWraps.filter((p) => p.wrap !== "none");
            if (nonNone.length > 0) params.set("itemWraps", JSON.stringify(nonNone));
          } else if (mode === "multi_recipient") {
            params.set("packaging", "multi_recipient");
          }
          if (totalWrappingCost > 0) params.set("wrapCost", String(totalWrappingCost));
          router.push(`/checkout?${params.toString()}`);
        }}
      />
    );
  }

  // ── Empty State ──
  if (items.length === 0) {
    return (
      <div className="min-h-screen section-theme-e flex flex-col items-center justify-center px-4 text-center py-20">
        <div className="max-w-sm w-full">
          <div className="w-24 h-24 bg-brand/8 rounded-[32px] flex items-center justify-center mx-auto mb-5 border border-brand/10">
            <ShoppingBag className="w-12 h-12 text-brand/25" />
          </div>
          <h1 className="font-display text-2xl font-bold text-brand-deep mb-2">
            Your bag is empty
          </h1>
          <p className="text-sm text-brand-muted mb-8 leading-relaxed">
            Explore our curated collection of luxury gifts, perfumes, and hampers — delivered across Kenya.
          </p>

          <div className="space-y-3">
            <Link
              href="/shop"
              className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Browse Gifts
            </Link>
            <Link
              href="/gift-finder"
              className="w-full py-3.5 border border-brand/20 text-brand rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-brand/5 transition-colors"
            >
              <Gift className="w-4 h-4" /> Find the Perfect Gift
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Populated Cart ──
  return (
    <div className="min-h-screen section-theme-e pb-32 md:pb-16">
      {/* ── Sticky Top Bar ── */}
      <div className="bg-white/90 backdrop-blur-md border-b border-black/5 sticky top-0 z-30">
        <div className="page-container-capped py-3 flex items-center justify-between">
          <Link
            href="/shop"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-muted hover:text-brand transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-deep hidden sm:block">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand/30 hidden sm:block" />
            <span className="text-xs font-bold text-brand">
              {formatKsh(subtotal)}
            </span>
          </div>
        </div>
      </div>

      <div className="page-container-capped py-6 md:py-10">
        {/* ── Page Title ── */}
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-deep">
            Your Bag
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            {itemCount} gift{itemCount === 1 ? "" : "s"} ready to delight
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* ──────────────────────────────── */}
          {/* Left: Cart Items                 */}
          {/* ──────────────────────────────── */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.selectedColor ?? ""}-${item.selectedSize ?? ""}`}
                className={`bg-white rounded-3xl border border-brand/8 shadow-sm overflow-hidden transition-all duration-300 ${
                  removingId === item.productId ? "opacity-0 scale-95 -translate-x-4" : "opacity-100 scale-100 translate-x-0"
                }`}
              >
                <div className="p-4 md:p-5 flex gap-4">
                  {/* Product Thumbnail */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-brand/5 relative overflow-hidden flex-shrink-0 border border-black/5">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 80px, 96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🎁
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-brand-deep text-sm md:text-base leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        aria-label={`Remove ${item.name}`}
                        className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 mt-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Variant badges */}
                    {(item.selectedColor || item.selectedSize) && (
                      <div className="flex items-center gap-2 mt-1">
                        {item.selectedColor && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-muted bg-brand/5 px-2 py-0.5 rounded-full">
                            <span
                              className="w-2 h-2 rounded-full border border-black/10"
                              style={{ backgroundColor: item.selectedColor.toLowerCase() }}
                            />
                            {item.selectedColor}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="text-[10px] font-semibold text-brand-muted bg-brand/5 px-2 py-0.5 rounded-full">
                            {item.selectedSize}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Gift Note */}
                    {item.giftNote && (
                      <p className="text-[11px] text-brand-muted mt-1.5 bg-brand/5 px-2.5 py-1.5 rounded-xl italic line-clamp-1">
                        🎀 &ldquo;{item.giftNote}&rdquo;
                      </p>
                    )}

                    {/* Price + Qty row */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-gray-50 border border-black/8 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="px-3 py-2 text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors disabled:opacity-40"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-2 text-sm font-bold text-brand-deep min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="px-3 py-2 text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-brand-muted">
                            {formatKsh(item.price)} each
                          </p>
                        )}
                        <p className="font-bold text-brand-deep text-base">
                          {formatKsh(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-end pt-1">
              <button
                onClick={clearCart}
                className="text-xs text-red-400 hover:text-red-600 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Clear all items
              </button>
            </div>

            {/* Loyalty Upsell */}
            <LoyaltyCartUpsell subtotal={subtotal} />

            {/* Multi-item packaging banner */}
            {itemCount > 1 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Package className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 text-sm">
                    You have {itemCount} gifts
                  </p>
                  <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                    Bundle them as a beautiful luxury hamper, wrap each individually, or ship to different recipients — we'll help you choose at checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Trust Badges — mobile */}
            <div className="lg:hidden grid grid-cols-3 gap-2 pt-2">
              {[
                { icon: Zap, text: "Same-day Nairobi" },
                { icon: ShieldCheck, text: "Secure payment" },
                { icon: Gift, text: "Luxury wrapping" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="bg-white/80 rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center border border-brand/8">
                  <Icon className="w-4 h-4 text-brand" />
                  <p className="text-[10px] font-semibold text-brand-muted leading-tight">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ──────────────────────────────── */}
          {/* Right: Order Summary             */}
          {/* ──────────────────────────────── */}
          <div className="lg:sticky lg:top-20 space-y-4">

            {/* Summary Card */}
            <div className="bg-white rounded-3xl border border-brand/10 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-br from-brand-deep to-brand px-6 py-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,168,83,0.18),transparent_50%)] pointer-events-none" />
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1 relative z-10">
                  Order Summary
                </p>
                <p className="font-display text-3xl font-bold text-white relative z-10">
                  {formatKsh(subtotal)}
                </p>
                <p className="text-[11px] text-white/50 mt-1 relative z-10">
                  + delivery fee calculated at checkout
                </p>
              </div>

              {/* Breakdown */}
              <div className="px-5 pt-4 pb-2 space-y-2.5 text-sm border-b border-black/5">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
                  <span className="font-semibold text-brand-deep">{formatKsh(subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-muted/70 text-xs">
                  <span>Delivery fee</span>
                  <span className="italic">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-brand-muted/70 text-xs">
                  <span>Gift packaging</span>
                  <span className="italic">Choose at next step</span>
                </div>
              </div>

              {/* CTA */}
              <div className="p-5">
                {itemCount === 1 ? (
                  <Link
                    href="/checkout?cart=true"
                    className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-base shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all block text-center flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Proceed to Checkout →
                  </Link>
                ) : (
                  <button
                    onClick={() => setShowPackagingDecision(true)}
                    className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-base shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" />
                    Choose Packaging & Checkout
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <p className="text-[10px] text-center text-brand-muted mt-3 leading-relaxed">
                  🔒 Secured by Paystack · M-Pesa · Card · Airtel Money
                </p>
              </div>
            </div>

            {/* Trust points */}
            <div className="bg-white rounded-2xl border border-brand/8 p-4 space-y-2.5">
              {[
                { icon: Zap, text: "Same-day delivery in Nairobi" },
                { icon: ShieldCheck, text: "Secure checkout via Paystack" },
                { icon: Gift, text: "Luxury ribbon-wrapped packaging" },
                { icon: Tag, text: "Price stays hidden from recipient" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-brand/8 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3 h-3 text-brand" />
                  </div>
                  <p className="text-xs text-brand-muted font-medium">{text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile Sticky Checkout Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-lg border-t border-brand/10 px-4 py-3 safe-area-inset-bottom shadow-[0_-8px_30px_rgba(155,27,90,0.12)]">
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <p className="text-[11px] text-brand-muted font-semibold uppercase tracking-wider">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
            <p className="font-bold text-lg text-brand-deep">{formatKsh(subtotal)}</p>
          </div>
          {itemCount === 1 ? (
            <Link
              href="/checkout?cart=true"
              className="py-3 px-6 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-sm shadow-gold flex items-center gap-2"
            >
              Checkout →
            </Link>
          ) : (
            <button
              onClick={() => setShowPackagingDecision(true)}
              className="py-3 px-5 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-sm shadow-gold flex items-center gap-2"
            >
              <Package className="w-4 h-4" /> Checkout →
            </button>
          )}
        </div>
        <div className="flex items-center justify-center gap-1 text-[10px] text-brand-muted/70">
          <ShieldCheck className="w-3 h-3" />
          <span>Secured by Paystack</span>
        </div>
      </div>
    </div>
  );
}
