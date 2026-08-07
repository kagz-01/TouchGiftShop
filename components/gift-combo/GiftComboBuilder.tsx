"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
};

type ComboSuggestion = {
  id: string;
  name: string;
  items: Product[];
  total: number;
  savings: number;
  reason: string;
};

type GiftComboBuilderProps = {
  selectedProduct: Product;
  budget?: number;
};

export default function GiftComboBuilder({ selectedProduct, budget = 10000 }: GiftComboBuilderProps) {
  const [suggestions, setSuggestions] = useState<ComboSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCombos() {
      try {
        const res = await fetch(`/api/products?limit=50`);
        const data = await res.json();
        const products: Product[] = data.products || [];

        const remaining = budget - selectedProduct.price;

        // Generate combo suggestions
        const combos: ComboSuggestion[] = [];

        // Combo 1: Add a card
        const cards = products.filter(
          (p) => p.category?.includes("card") || p.name.toLowerCase().includes("card") || p.name.toLowerCase().includes("note")
        );
        if (cards.length > 0 && remaining > 500) {
          combos.push({
            id: "card",
            name: "Add a Card",
            items: [selectedProduct, cards[0]],
            total: selectedProduct.price + cards[0].price,
            savings: 0,
            reason: "A personal note makes any gift complete",
          });
        }

        // Combo 2: Add chocolates
        const chocolates = products.filter(
          (p) => p.name.toLowerCase().includes("chocolate") || p.name.toLowerCase().includes("truffle")
        );
        if (chocolates.length > 0 && remaining > 1000) {
          combos.push({
            id: "chocolates",
            name: "Add Chocolates",
            items: [selectedProduct, chocolates[0]],
            total: selectedProduct.price + chocolates[0].price,
            savings: 0,
            reason: "The classic pairing — everyone loves chocolates",
          });
        }

        // Combo 3: Add flowers
        const flowers = products.filter(
          (p) => p.name.toLowerCase().includes("rose") || p.name.toLowerCase().includes("flower") || p.name.toLowerCase().includes("bouquet")
        );
        if (flowers.length > 0 && remaining > 2000) {
          combos.push({
            id: "flowers",
            name: "Add Flowers",
            items: [selectedProduct, flowers[0]],
            total: selectedProduct.price + flowers[0].price,
            savings: 0,
            reason: "Flowers elevate any gift to something special",
          });
        }

        // Combo 4: Full hamper bundle
        if (remaining > 3000) {
          const extras = [chocolates[0], cards[0], flowers[0]].filter(Boolean);
          if (extras.length >= 2) {
            const bundleTotal = selectedProduct.price + extras.reduce((sum, e) => sum + e.price, 0);
            combos.push({
              id: "bundle",
              name: "Full Gift Bundle",
              items: [selectedProduct, ...extras],
              total: bundleTotal,
              savings: Math.floor(bundleTotal * 0.05),
              reason: "Go all out — create a memory they'll never forget",
            });
          }
        }

        setSuggestions(combos.slice(0, 3));
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchCombos();
  }, [selectedProduct, budget]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-surface-border p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-surface rounded w-1/3" />
          <div className="h-3 bg-surface rounded w-2/3" />
          <div className="h-3 bg-surface rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-surface-border p-6 space-y-4">
      <h3 className="font-display text-lg font-semibold flex items-center gap-2">
        <span className="text-xl">✨</span>
        Make It a Bundle
      </h3>
      <p className="text-sm text-brand-muted">
        T-Gifter suggests adding to this gift
      </p>

      <div className="space-y-3">
        {suggestions.map((combo) => (
          <button
            key={combo.id}
            onClick={() => setSelectedCombo(selectedCombo === combo.id ? null : combo.id)}
            className={cn(
              "w-full text-left p-4 rounded-xl border-2 transition-all",
              selectedCombo === combo.id
                ? "border-brand bg-brand/5"
                : "border-surface-border hover:border-brand/20"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{combo.name}</span>
                {combo.savings > 0 && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Save {formatKsh(combo.savings)}
                  </span>
                )}
              </div>
              <span className="font-bold text-sm text-brand">{formatKsh(combo.total)}</span>
            </div>
            <p className="text-xs text-brand-muted">{combo.reason}</p>

            {/* Combo items preview */}
            <div className="flex items-center gap-2 mt-3">
              {combo.items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-1">
                  {i > 0 && <span className="text-brand-muted text-xs">+</span>}
                  <div className="w-8 h-8 bg-blush rounded-lg overflow-hidden shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} width={32} height={32} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs">🎁</div>
                    )}
                  </div>
                  <span className="text-[10px] text-brand-muted max-w-[60px] truncate">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Expanded details */}
            {selectedCombo === combo.id && (
              <div className="mt-4 pt-4 border-t border-surface-border space-y-2">
                {combo.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-brand-muted">{item.name}</span>
                    <span>{formatKsh(item.price)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-surface-border">
                  <span>Total</span>
                  <span className="text-brand">{formatKsh(combo.total - combo.savings)}</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
