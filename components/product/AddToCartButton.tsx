"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState("");
  const [giftNote, setGiftNote] = useState("");

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
                <label className="text-sm font-semibold text-brand-deep block mb-2">
                  Personalization (name or short message)
                </label>
                <input
                  type="text"
                  value={personalization}
                  onChange={(e) => setPersonalization(e.target.value)}
                  placeholder="e.g. Happy Birthday, Grace"
                  className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 text-sm transition-colors outline-none"
                />
              </div>
            )}

            {/* Gift Note */}
            <div className="pt-2">
              <label className="text-sm font-semibold text-brand-deep block mb-2">
                Complimentary Gift Note
              </label>
              <textarea
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder="Write a sweet message..."
                rows={3}
                className="w-full border-2 border-surface-border focus:border-brand rounded-xl px-4 py-3 text-sm transition-colors outline-none resize-none"
              />
            </div>
          </div>
          
          {/* Upsell Section */}
          <div className="bg-gradient-warm rounded-2xl p-5 border border-gold/20">
            <h4 className="font-semibold text-brand-deep text-sm mb-1">Make it extra special ✨</h4>
            <p className="text-xs text-brand-muted mb-3">Add some premium chocolates for KSh 950?</p>
            <button className="text-xs font-semibold bg-white text-brand border border-surface-border px-4 py-2 rounded-lg hover:border-brand transition-colors">
              + Add Chocolates
            </button>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="border-t border-surface-border p-6 bg-white">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-brand-muted">Subtotal</span>
            <span className="font-bold text-xl text-brand-deep">{formatKsh(total)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full rounded-2xl bg-brand hover:bg-brand-dark text-white py-4 font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
