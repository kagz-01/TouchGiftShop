"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { formatKsh } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/types";
import { X, Minus, Plus, Sparkles, Zap, ShoppingCart, Check } from "lucide-react";

export default function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, itemCount } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState("");
  const [customizationImageUrl, setCustomizationImageUrl] = useState<string | null>(null);
  const [giftNote, setGiftNote] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);

  useEffect(() => { setMounted(true); }, []);

  // Listen for Live Customizer saves
  useEffect(() => {
    const handleCustomization = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { imageUrl, text } = customEvent.detail;
        if (imageUrl) setCustomizationImageUrl(imageUrl);
        if (text) setPersonalization(text);
        setIsOpen(true);
      }
    };
    window.addEventListener("customizationSaved", handleCustomization);
    return () => window.removeEventListener("customizationSaved", handleCustomization);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Calculate effective price
  const getEffectivePrice = () => {
    let price = product.sale_price ?? product.price;
    if (selectedSize && product.size_variants?.length) {
      const sv = product.size_variants.find(v => v.name === selectedSize);
      if (sv?.priceOverride != null) price = sv.priceOverride;
    }
    return price;
  };

  const effectivePrice = getEffectivePrice();
  const total = effectivePrice * quantity;

  function handleAddToCart() {
    addItem(product, quantity, {
      giftNote,
      personalization,
      customizationImageUrl: customizationImageUrl ?? undefined,
      selectedColor,
      selectedSize,
    });
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      setIsOpen(false);
      setQuantity(1);
      setGiftNote("");
      setPersonalization("");
      setCustomizationImageUrl(null);
    }, 1200);
  }

  function handleBuyNow() {
    const params = new URLSearchParams({
      productId: product.id,
      amount: total.toString(),
      qty: quantity.toString(),
    });
    if (selectedColor) params.set("color", selectedColor);
    if (selectedSize) params.set("size", selectedSize);
    if (product.is_personalizable && personalization) params.set("engraving", personalization);
    if (customizationImageUrl) params.set("customizationImage", customizationImageUrl);
    if (giftNote) params.set("note", giftNote);
    router.push(`/checkout?${params.toString()}`);
  }

  const INPUT =
    "w-full bg-gray-50 border border-black/8 rounded-xl px-4 py-3 text-sm text-brand-deep placeholder:text-brand-muted/50 focus:outline-none focus:border-brand focus:bg-white transition-all";

  return (
    <>
      {/* Primary CTA */}
      <div className="flex gap-3">
        <button
          id="add-to-cart-btn"
          onClick={() => setIsOpen(true)}
          disabled={!product.in_stock || !!product.is_coming_soon}
          className="flex-1 py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold text-base rounded-2xl shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {product.is_coming_soon ? "Coming Soon — Not Yet Available" : (
            <>Send this Gift &mdash; {formatKsh(effectivePrice)}</>
          )}
        </button>
      </div>
      <p className="text-xs text-center text-brand-muted">
        Same-day Nairobi · Next-day nationwide
      </p>

      {mounted && createPortal(
        <>
          {/* Backdrop */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Slide-out Drawer */}
          <div
            className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-transparent shadow-2xl flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            aria-hidden={!isOpen}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-black/6">
              <div>
                <h2 className="font-display font-bold text-brand-deep">Gift Details</h2>
                <p className="text-[11px] text-brand-muted">Personalise before sending</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-brand-muted hover:bg-brand/5 hover:text-brand transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Product summary */}
              <div className="bg-white rounded-2xl border border-black/6 p-4 flex items-center gap-4 shadow-sm">
                <div className="w-14 h-14 bg-brand/8 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  🎁
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-deep text-sm truncate">{product.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {product.sale_price && product.sale_price < product.price ? (
                      <>
                        <p className="text-red-500 font-bold text-base">{formatKsh(product.sale_price)}</p>
                        <p className="text-gray-400 text-xs line-through">{formatKsh(product.price)}</p>
                      </>
                    ) : (
                      <p className="text-gold font-bold text-base">{formatKsh(product.price)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Color Variants */}
              {product.color_variants && product.color_variants.length > 0 && (
                <div className="bg-white rounded-2xl border border-black/6 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-brand-deep mb-2">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {product.color_variants.map((cv, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(selectedColor === cv.name ? undefined : cv.name)}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-medium transition-colors ${
                          selectedColor === cv.name
                            ? "border-brand bg-brand/5 text-brand"
                            : "border-black/10 hover:border-brand/50"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: cv.name.toLowerCase() }} />
                        {cv.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Variants */}
              {product.size_variants && product.size_variants.length > 0 && (
                <div className="bg-white rounded-2xl border border-black/6 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-brand-deep mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {product.size_variants.map((sv, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSize(selectedSize === sv.name ? undefined : sv.name)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${
                          selectedSize === sv.name
                            ? "border-brand bg-brand/5 text-brand"
                            : "border-black/10 hover:border-brand/50"
                        }`}
                      >
                        {sv.name}
                        {sv.priceOverride && (
                          <span className="text-xs text-brand/70">{formatKsh(sv.priceOverride)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="bg-white rounded-2xl border border-black/6 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-brand-deep">Quantity</p>
                    <p className="text-[11px] text-brand-muted mt-0.5">For multiple recipients</p>
                  </div>
                  <div className="flex items-center bg-gray-50 border border-black/8 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-brand-deep min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-2 text-brand-muted hover:text-brand hover:bg-brand/5 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Personalisation */}
              {product.is_personalizable && (
                <div className="bg-white rounded-2xl border border-black/6 p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <p className="text-sm font-semibold text-brand-deep">Personalisation <span className="text-brand-muted font-normal">(optional)</span></p>
                  </div>
                  <input
                    type="text"
                    placeholder="Name, date, or short message…"
                    value={personalization}
                    onChange={(e) => setPersonalization(e.target.value)}
                    className={INPUT}
                  />
                </div>
              )}

              {/* Gift note */}
              <div className="bg-white rounded-2xl border border-black/6 p-4 shadow-sm space-y-3">
                <div>
                  <p className="text-sm font-semibold text-brand-deep">Gift Note</p>
                  <p className="text-[11px] text-brand-muted mt-0.5">Printed and attached to the gift</p>
                </div>
                <textarea
                  placeholder="Write a heartfelt message…"
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  rows={3}
                  className={`${INPUT} resize-none`}
                />
              </div>

              {/* Delivery note */}
              <div className="flex items-center gap-3 bg-white border border-black/6 rounded-2xl p-3.5 shadow-sm">
                <Zap className="w-4 h-4 text-gold-dark flex-shrink-0" />
                <p className="text-xs text-brand-muted">
                  Order before <span className="font-semibold text-brand-deep">2 PM</span> for same-day Nairobi delivery.
                  Next-day available nationwide.
                </p>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-black/5 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-brand-muted">
                  {quantity} × {formatKsh(effectivePrice)}
                </span>
                <span className="font-bold text-xl text-brand-deep">{formatKsh(total)}</span>
              </div>
              <div className="flex gap-3">
                <button
                  id="add-to-cart-confirm-btn"
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                    addedToCart
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-brand text-brand hover:bg-brand/5"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </>
                  )}
                </button>
                <button
                  id="proceed-checkout-btn"
                  onClick={handleBuyNow}
                  className="flex-1 py-3 bg-gradient-to-r from-gold to-gold-light text-brand-deep font-bold text-sm rounded-xl shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Buy Now →
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
