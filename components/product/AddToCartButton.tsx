"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState("");
  const [giftNote, setGiftNote] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = product.price * quantity;

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function handleCheckout() {
    const params = new URLSearchParams({
      productId: product.id,
      amount: total.toString(),
      qty: quantity.toString(),
    });
    if (product.is_personalizable && personalization) {
      params.set("engraving", personalization);
    }
    if (giftNote) {
      params.set("note", giftNote);
    }
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={!product.in_stock}
        className="w-full rounded-2xl bg-brand hover:bg-brand-dark text-white py-4 font-semibold text-lg transition-colors disabled:opacity-50"
      >
        Send this gift &mdash; {formatKsh(product.price)}
      </button>

      <p className="text-sm text-center text-brand-muted mt-3">
        Same-day delivery in Nairobi • Next-day nationwide
      </p>

      {mounted && createPortal(
        <>
          {/* Backdrop overlay */}
          {isOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Slide-out Drawer */}
          <div 
            className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            aria-hidden={!isOpen}
          >
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h2 className="font-display font-bold text-xl text-brand-deep">Gift Details</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-brand-muted hover:text-brand-deep transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Selected Product Summary */}
              <div className="flex items-center gap-4 p-4 bg-blush rounded-2xl">
                <div className="w-16 h-16 bg-surface-secondary rounded-xl flex items-center justify-center text-2xl">
                  🎁
                </div>
                <div>
                  <p className="font-semibold text-brand-deep">{product.name}</p>
                  <p className="text-gold font-bold">{formatKsh(product.price)}</p>
                </div>
              </div>

              <div className="space-y-4 border-t border-surface-border pt-6">
                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-brand-deep">Quantity</label>
                  <div className="flex items-center bg-surface-secondary rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-brand-deep font-medium hover:text-brand transition-colors"
                    >
                      -
                    </button>
                    <span className="px-2 py-2 text-sm font-semibold min-w-[2.5rem] text-center text-brand-deep">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-brand-deep font-medium hover:text-brand transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Personalization */}
                {product.is_personalizable && (
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-brand-deep mb-2">
                      Personalization <span className="text-brand-muted font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Name, date, or short message..."
                      value={personalization}
                      onChange={(e) => setPersonalization(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>
                )}

                {/* Gift Note */}
                <div className="pt-2">
                  <label className="block text-sm font-semibold text-brand-deep mb-2">
                    Complimentary Gift Note
                  </label>
                  <textarea
                    placeholder="Write a sweet message..."
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-surface-border focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                  />
                </div>

                {/* Upsell Mock */}
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 mt-6">
                  <p className="text-sm font-semibold text-brand-deep mb-1">Make it extra special ✨</p>
                  <p className="text-xs text-brand-muted mb-3">Add some premium chocolates for KSh 950?</p>
                  <button className="text-xs font-semibold text-brand bg-white px-4 py-2 rounded-full border border-orange-100 hover:border-brand transition-colors">
                    + Add Chocolates
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-6 border-t border-surface-border bg-surface-secondary/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-brand-muted font-medium">Subtotal</span>
                <span className="font-bold text-xl text-brand-deep">{formatKsh(total)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full rounded-2xl bg-brand hover:bg-brand-dark text-white py-4 font-semibold text-lg transition-colors shadow-button"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
