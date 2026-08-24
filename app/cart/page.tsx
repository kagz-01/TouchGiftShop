"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { formatKsh } from "@/lib/utils";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, itemCount, clearCart } = useCart();
  const [giftWrapping, setGiftWrapping] = useState(false);
  const [giftWrappingStyle, setGiftWrappingStyle] = useState<"classic" | "premium" | "luxury">("classic");

  const wrappingPrices = { classic: 200, premium: 500, luxury: 1000 };
  const wrappingCost = giftWrapping ? wrappingPrices[giftWrappingStyle] : 0;
  const total = subtotal + wrappingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen section-theme-e flex flex-col items-center justify-center px-4 text-center">
        <ShoppingBag className="w-16 h-16 text-brand/20 mb-4" />
        <h1 className="text-2xl font-bold text-brand-deep mb-2">Your cart is empty</h1>
        <p className="text-brand-muted mb-6">Browse our gift collection and find something special.</p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition-colors"
        >
          Browse Gifts
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-theme-e">
      <div className="page-container-capped py-6 md:py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-brand-deep">
              Your Cart
            </h1>
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
          {/* Cart Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.productId}
                className="bg-white rounded-2xl border border-black/6 shadow-sm p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 bg-brand/8 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  🎁
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-deep text-sm truncate">{item.name}</p>
                  <p className="text-gold font-bold mt-0.5">{formatKsh(item.price)}</p>
                  {item.giftNote && (
                    <p className="text-xs text-brand-muted mt-1 truncate">Note: "{item.giftNote}"</p>
                  )}
                </div>
                <div className="flex items-center bg-gray-50 border border-black/8 rounded-xl overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-3 py-2 text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-2 text-sm font-bold text-brand-deep min-w-[2.5rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-3 py-2 text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors"
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

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-20 space-y-4">
            {/* Gift Wrapping */}
            <div className="bg-white rounded-2xl border border-black/6 shadow-sm p-5 space-y-3">
              <h3 className="font-display font-bold text-brand-deep">Gift Wrapping 🎁</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={giftWrapping}
                  onChange={(e) => setGiftWrapping(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span className="text-sm text-brand-deep">Add gift wrapping</span>
              </label>
              {giftWrapping && (
                <div className="space-y-2 mt-2">
                  {[
                    { style: "classic" as const, label: "Classic Wrap", price: 200, emoji: "🎀" },
                    { style: "premium" as const, label: "Premium Box", price: 500, emoji: "🎁" },
                    { style: "luxury" as const, label: "Luxury Experience", price: 1000, emoji: "✨" },
                  ].map((opt) => (
                    <label
                      key={opt.style}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        giftWrappingStyle === opt.style
                          ? "border-brand bg-brand/5"
                          : "border-black/8 hover:border-brand/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="wrapping"
                        checked={giftWrappingStyle === opt.style}
                        onChange={() => setGiftWrappingStyle(opt.style)}
                        className="w-4 h-4 text-brand focus:ring-brand"
                      />
                      <span className="text-lg">{opt.emoji}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-deep">{opt.label}</p>
                      </div>
                      <span className="text-sm font-bold text-brand-deep">{formatKsh(opt.price)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-black/6 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-brand-dark to-brand px-6 py-5">
                <p className="text-[11px] font-semibold text-white/60 uppercase tracking-wider mb-1">Order Total</p>
                <p className="font-display text-2xl font-bold text-white">{formatKsh(total)}</p>
              </div>
              <div className="p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">{formatKsh(subtotal)}</span>
                </div>
                {giftWrapping && (
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Gift wrapping</span>
                    <span className="font-medium">{formatKsh(wrappingCost)}</span>
                  </div>
                )}
                <div className="border-t border-black/5 pt-3 flex justify-between font-bold text-brand-deep">
                  <span>Total</span>
                  <span>{formatKsh(total)}</span>
                </div>
              </div>
              <div className="px-5 pb-5">
                <Link
                  href={`/checkout?cart=true&wrapping=${giftWrapping ? giftWrappingStyle : ""}`}
                  className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-base shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all block text-center"
                >
                  Proceed to Checkout →
                </Link>
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
