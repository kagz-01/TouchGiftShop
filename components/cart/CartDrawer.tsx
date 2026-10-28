"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { formatKsh } from "@/lib/utils";
import {
  X,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Gift,
  Package,
} from "lucide-react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Cart"
        aria-modal="true"
        className={`fixed top-0 right-0 bottom-0 z-[90] w-full max-w-[420px] flex flex-col bg-[#FEFAF6] shadow-2xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand/10 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="font-display font-bold text-brand-deep text-base leading-tight">
                Your Bag
              </h2>
              <p className="text-[11px] text-brand-muted">
                {itemCount === 0 ? "Empty" : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-brand-muted hover:text-brand hover:bg-brand/8 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center pb-20">
              <div className="w-20 h-20 bg-brand/8 rounded-3xl flex items-center justify-center mb-4">
                <Gift className="w-10 h-10 text-brand/30" />
              </div>
              <h3 className="font-display text-lg font-bold text-brand-deep mb-1">
                Your bag is empty
              </h3>
              <p className="text-xs text-brand-muted mb-6 leading-relaxed max-w-[240px]">
                Discover curated gifts, luxury hampers, and same-day delivery experiences.
              </p>
              <Link
                href="/shop"
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" /> Browse Gifts
              </Link>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.selectedColor ?? ""}-${item.selectedSize ?? ""}`}
                  className="bg-white rounded-2xl border border-brand/8 shadow-sm overflow-hidden flex gap-3 p-3.5 group transition-all"
                >
                  {/* Product Image */}
                  <div className="w-16 h-16 rounded-xl bg-brand/5 relative overflow-hidden flex-shrink-0 border border-black/5">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        🎁
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-brand-deep line-clamp-2 leading-snug mb-0.5">
                      {item.name}
                    </p>
                    {(item.selectedColor || item.selectedSize) && (
                      <p className="text-[10px] text-brand-muted">
                        {[item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {item.giftNote && (
                      <p className="text-[10px] text-brand-muted italic truncate">
                        Note: &ldquo;{item.giftNote}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty Controls */}
                      <div className="flex items-center bg-gray-50 border border-black/8 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease"
                          className="px-2 py-1 text-brand-muted hover:text-brand hover:bg-brand/5 disabled:opacity-40 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-brand-deep min-w-[1.75rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label="Increase"
                          className="px-2 py-1 text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price + Remove */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-brand-deep">
                          {formatKsh(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          aria-label={`Remove ${item.name}`}
                          className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Multi-item packaging hint */}
              {itemCount > 1 && (
                <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 flex items-start gap-2.5">
                  <Package className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-bold">Multiple gifts?</span> You can bundle them as a hamper or send to different people at checkout.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer / Order Summary ── */}
        {items.length > 0 && (
          <div className="border-t border-brand/10 bg-white px-4 py-4 space-y-3">
            {/* Subtotal */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
                <span className="font-semibold text-brand-deep">{formatKsh(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-muted text-xs">
                <span>Delivery fee</span>
                <span className="italic">Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-black/5 pt-2 mt-2">
                <span className="text-brand-deep">Estimated Total</span>
                <span className="text-brand">{formatKsh(subtotal)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <Link
                href="/checkout?cart=true"
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Checkout Securely
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cart"
                onClick={onClose}
                className="w-full py-2.5 border border-brand/20 text-brand rounded-xl text-sm font-semibold text-center block hover:bg-brand/5 transition-colors"
              >
                View Full Cart
              </Link>
            </div>

            {/* Accepted payment methods */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {[
                  { label: "M-Pesa", color: "bg-[#00B300]" },
                  { label: "Airtel Money", color: "bg-[#E40000]" },
                  { label: "Visa", color: "bg-[#1A1F71]" },
                  { label: "Mastercard", color: "bg-[#EB001B]" },
                  { label: "Bank Transfer", color: "bg-[#7C5C2E]" },
                ].map(({ label, color }) => (
                  <span
                    key={label}
                    className={`${color} text-white text-[9px] font-bold px-1.5 py-0.5 rounded`}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-center text-brand-muted">
                🔒 Secured by Paystack · Touch Line Ltd
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

