"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState("");
  const [giftNote, setGiftNote] = useState("");

  const total = product.price * quantity;

  function handleSend() {
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
    <div className="space-y-4 border-t border-gray-200 pt-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Qty</label>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1 text-lg"
          >
            -
          </button>
          <span className="px-4 py-1 text-sm font-medium min-w-[2rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1 text-lg"
          >
            +
          </button>
        </div>
      </div>

      {product.is_personalizable && (
        <div>
          <label className="text-sm font-medium block mb-1">
            Personalization (name / message to engrave)
          </label>
          <input
            type="text"
            value={personalization}
            onChange={(e) => setPersonalization(e.target.value)}
            placeholder="e.g. Happy Birthday, Grace"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium block mb-1">Gift note</label>
        <textarea
          value={giftNote}
          onChange={(e) => setGiftNote(e.target.value)}
          placeholder="Add a personal message to attach with the gift..."
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={!product.in_stock}
        className="w-full rounded-lg bg-brand text-white py-3 font-medium disabled:opacity-50"
      >
        Send this gift &mdash; {formatKsh(total)}
      </button>

      <p className="text-xs text-center text-brand-muted">
        Same-day delivery in Nairobi • Next-day nationwide
      </p>
    </div>
  );
}
