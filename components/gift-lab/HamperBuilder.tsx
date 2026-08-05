"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import type { Product } from "@/lib/types";

const BOX_SIZES = [
  { name: "Small", price: 500, maxItems: 3, description: "3 items" },
  { name: "Medium", price: 800, maxItems: 5, description: "5 items" },
  { name: "Large", price: 1200, maxItems: 8, description: "8 items" },
];

interface HamperItem {
  product: Product;
  quantity: number;
}

export default function HamperBuilder() {
  const [selectedBox, setSelectedBox] = useState(0);
  const [items, setItems] = useState<HamperItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const box = BOX_SIZES[selectedBox];
  const itemsTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const total = box.price + itemsTotal;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const canAddMore = itemCount < box.maxItems;

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function addItem(product: Product) {
    if (!canAddMore) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (!existing) return prev;
      if (existing.quantity > 1) {
        return prev.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
      }
      return prev.filter((i) => i.product.id !== productId);
    });
  }

  function goToCheckout() {
    const itemIds = items.map((i) => i.product.id).join(",");
    const params = new URLSearchParams({
      productId: items[0]?.product.id ?? "",
      amount: total.toString(),
      qty: itemCount.toString(),
      hamper: "true",
      hamperBox: box.name,
      hamperItems: itemIds,
    });
    window.location.href = `/checkout?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      {/* Box size selector */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Choose a box</p>
        <div className="grid grid-cols-3 gap-2">
          {BOX_SIZES.map((b, i) => (
            <button
              key={b.name}
              onClick={() => {
                setSelectedBox(i);
                setItems([]);
              }}
              className={`rounded-lg border p-3 text-center transition-colors ${
                i === selectedBox
                  ? "border-brand bg-brand text-white"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <p className="font-medium text-sm">{b.name}</p>
              <p className="text-xs mt-1">{b.description}</p>
              <p className="text-xs mt-1">{formatKsh(b.price)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current hamper contents */}
      <div className="rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Your hamper</p>
          <p className="text-xs text-brand-muted">
            {itemCount}/{box.maxItems} items
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-brand-muted">
            Tap products below to add them to your hamper.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden relative shrink-0">
                    {item.product.image_url && (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <span className="truncate">{item.product.name}</span>
                  {item.quantity > 1 && (
                    <span className="text-brand-muted">x{item.quantity}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-brand-muted">
                    {formatKsh(item.product.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 text-xs"
                  >
                    remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-100 pt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-muted">Box ({box.name})</span>
            <span>{formatKsh(box.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-muted">Items ({itemCount})</span>
            <span>{formatKsh(itemsTotal)}</span>
          </div>
          <div className="flex justify-between font-medium border-t border-gray-100 pt-1">
            <span>Total</span>
            <span>{formatKsh(total)}</span>
          </div>
        </div>

        <button
          onClick={goToCheckout}
          disabled={items.length === 0}
          className="w-full rounded-lg bg-brand text-white py-3 text-sm font-medium disabled:opacity-50"
        >
          Send this hamper — {formatKsh(total)}
        </button>
      </div>

      {/* Product catalog to pick from */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Add items</p>
        {loading ? (
          <p className="text-sm text-brand-muted">Loading products...</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {products.slice(0, 30).map((product) => {
              const inHamper = items.find((i) => i.product.id === product.id);
              const disabled = !canAddMore && !inHamper;

              return (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  disabled={disabled}
                  className={`rounded-lg border p-2 text-left transition-colors ${
                    disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "border-gray-200 hover:border-gray-400"
                  } ${inHamper ? "border-brand" : ""}`}
                >
                  <div className="aspect-square bg-gray-100 rounded-md mb-1 overflow-hidden relative">
                    {product.image_url && (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <p className="text-xs font-medium truncate">{product.name}</p>
                  <p className="text-xs text-brand-muted">
                    {formatKsh(product.price)}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
