"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatKsh } from "@/lib/utils";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag, Package, ChevronRight } from "lucide-react";
import PackagingDecision, { type PackagingMode } from "@/components/checkout/PackagingDecision";
import type { CartItem } from "@/lib/cart";
import Image from "next/image";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, subtotal, itemCount, clearCart } = useCart();
  const [showPackagingDecision, setShowPackagingDecision] = useState(false);

  // ── Empty state ──
  if (items.length === 0) {
    return (
      <div className="min-h-screen section-theme-e flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="w-16 h-16 text-brand/20 mb-4" />
        <h1 className="text-2xl font-bold text-brand-deep dark:text-white mb-2">Your cart is empty</h1>
        <p className="text-brand-muted dark:text-white/70 mb-6">Browse our gift collection and find something special.</p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition-colors"
        >
          Browse Gifts
        </Link>
      </div>
    );
  }

  // ── Packaging Decision intercept (multi-item only) ──
  if (showPackagingDecision) {
    return (
      <PackagingDecision
        cartItems={items as CartItem[]}
        onConfirm={({ mode, hamperWrap, perItemWraps, totalWrappingCost }) => {
          // Build URL params to pass decisions to CheckoutForm
          const params = new URLSearchParams({ cart: "true" });
          if (mode === "hamper") {
            params.set("packaging", "hamper");
            if (hamperWrap !== "none") params.set("wrapping", hamperWrap);
          } else if (mode === "individual") {
            params.set("packaging", "individual");
            // Encode per-item wraps as JSON
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

  // ── Main Cart ──
  return (
    <div className="min-h-screen section-theme-e">
      <div className="page-container-capped py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-deep">Your Cart</h1>
            <p className="text-sm text-brand-muted mt-1">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

          {/* ── Left: Cart Items ── */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-2xl border border-black/6 shadow-sm p-4 flex items-center gap-4 group"
              >
                <div className="w-16 h-16 bg-brand/8 rounded-xl overflow-hidden flex-shrink-0 relative">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-deep text-sm truncate">{item.name}</p>
                  <p className="text-gold font-bold mt-0.5 text-sm">{formatKsh(item.price)}</p>
                  {item.giftNote && (
                    <p className="text-xs text-brand-muted mt-1 truncate">Note: &ldquo;{item.giftNote}&rdquo;</p>
                  )}
                  {item.personalization && (
                    <p className="text-xs text-brand-muted mt-0.5 truncate">Engraving: &ldquo;{item.personalization}&rdquo;</p>
                  )}
                </div>
                <div className="flex items-center bg-gray-50 border border-black/8 rounded-xl overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-3 py-2 text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-2 text-sm font-bold text-brand-deep min-w-[2.5rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-3 py-2 text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-brand-deep">{formatKsh(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-xs text-red-400 hover:text-red-600 mt-1 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Right: Summary ── */}
          <div className="lg:sticky lg:top-20 space-y-4">

            {/* Multi-item packaging hint */}
            {itemCount > 1 && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <Package className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900 text-sm">You have {itemCount} items</p>
                  <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                    You can send them together as a beautiful hamper, wrap each individually, or ship to different people.
                    We&apos;ll help you choose at checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Order Summary Card */}
            <div className="bg-white rounded-2xl border border-black/6 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-brand-dark to-brand px-6 py-5">
                <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1">Order Total</p>
                <p className="font-display text-2xl font-bold text-white">{formatKsh(subtotal)}</p>
                <p className="text-[10px] text-white/50 mt-1">+ delivery & any wrapping</p>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">{formatKsh(subtotal)}</span>
                </div>
                <div className="flex justify-between text-brand-muted/70">
                  <span>Delivery fee</span>
                  <span className="text-xs italic">Calculated at checkout</span>
                </div>
                <div className="flex justify-between text-brand-muted/70">
                  <span>Gift packaging</span>
                  <span className="text-xs italic">Choose at next step</span>
                </div>
              </div>
              <div className="px-5 pb-5">
                {/* Single item → go straight to checkout. Multiple items → show packaging decision */}
                {itemCount === 1 ? (
                  <Link
                    href="/checkout?cart=true"
                    className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-base shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all block text-center"
                  >
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
              </div>
            </div>

            <button
              onClick={clearCart}
              className="w-full py-2 text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
