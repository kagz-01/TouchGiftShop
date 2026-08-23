"use client";

import { useState, useEffect } from "react";
import { Target, RefreshCw, Sparkles } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  slug: string;
  image_url: string;
  short_description: string;
  categories: string[];
};

type BudgetItem = {
  product: Product;
  quantity: number;
};

interface BudgetModeProps {
  budget: number;
  onBudgetChange: (budget: number) => void;
  products: Product[];
  onAutoFill: (items: BudgetItem[]) => void;
  currentItems: BudgetItem[];
}

const BUDGET_PRESETS = [
  { label: "KSh 1,500", value: 1500, tier: "Standard" },
  { label: "KSh 2,500", value: 2500, tier: "Premium" },
  { label: "KSh 5,000", value: 5000, tier: "Luxury" },
  { label: "KSh 10,000", value: 10000, tier: "Executive" },
];

export default function BudgetMode({
  budget,
  onBudgetChange,
  products,
  onAutoFill,
  currentItems,
}: BudgetModeProps) {
  const [autoSuggestions, setAutoSuggestions] = useState<BudgetItem[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Auto-suggest items based on budget
  useEffect(() => {
    if (budget <= 0 || products.length === 0) {
      setAutoSuggestions([]);
      return;
    }

    setIsCalculating(true);
    const timer = setTimeout(() => {
      const suggestions = generateBudgetFill(budget, products);
      setAutoSuggestions(suggestions);
      setIsCalculating(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [budget, products]);

  const generateBudgetFill = (targetBudget: number, availableProducts: Product[]): BudgetItem[] => {
    const sorted = [...availableProducts].sort((a, b) => b.price - a.price);
    const result: BudgetItem[] = [];
    let remaining = targetBudget;

    // Greedy algorithm: pick best items that fit
    for (const product of sorted) {
      if (remaining <= 0) break;
      const maxQty = Math.floor(remaining / product.price);
      if (maxQty > 0 && result.length < 6) {
        const qty = Math.min(maxQty, 2); // Max 2 of same item
        result.push({ product, quantity: qty });
        remaining -= product.price * qty;
      }
    }

    return result;
  };

  const handleApply = () => {
    onAutoFill(autoSuggestions);
  };

  const currentTotal = currentItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const budgetRemaining = budget - currentTotal;
  const budgetPercent = budget > 0 ? Math.min((currentTotal / budget) * 100, 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display italic text-xl font-bold mb-2 text-theme-heading">Budget Mode</h3>
        <p className="text-theme-muted text-sm">Set a budget per hamper and we&apos;ll auto-fill with the best items.</p>
      </div>

      {/* Budget input */}
      <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm shape-premium-card p-5 border border-surface-border space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-theme-heading">Budget per hamper</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted text-sm font-semibold">KSh</span>
            <input
              type="number"
              value={budget || ""}
              onChange={(e) => onBudgetChange(Number(e.target.value))}
              placeholder="Enter budget"
              className="w-full bg-white/50 dark:bg-white/10 border border-surface-border shape-premium-card pl-14 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        {/* Preset buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {BUDGET_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onBudgetChange(preset.value)}
              className={`p-3 shape-premium-card border text-center transition-all ${
                budget === preset.value
                  ? "border-brand bg-brand/5 shadow-ribbon"
                  : "border-surface-border hover:border-brand/30"
              }`}
            >
              <p className="text-sm font-bold text-theme-heading">{preset.label}</p>
              <p className="text-[10px] text-theme-muted uppercase tracking-wider">{preset.tier}</p>
            </button>
          ))}
        </div>

        {/* Budget progress bar */}
        {budget > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-theme-muted">Budget usage</span>
              <span className={`font-semibold ${budgetPercent > 100 ? "text-red-500" : budgetPercent > 80 ? "text-amber-500" : "text-success"}`}>
                KSh {currentTotal.toLocaleString()} / KSh {budget.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPercent > 100 ? "bg-red-500" : budgetPercent > 80 ? "bg-amber-500" : "bg-success"
                }`}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            {budgetRemaining > 0 && (
              <p className="text-xs text-theme-muted mt-1">KSh {budgetRemaining.toLocaleString()} remaining</p>
            )}
            {budgetRemaining < 0 && (
              <p className="text-xs text-red-500 mt-1">Over budget by KSh {Math.abs(budgetRemaining).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>

      {/* Auto-suggestions */}
      {budget > 0 && (
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm shape-premium-card p-5 border border-surface-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-semibold text-theme-heading">Suggested items for this budget</span>
            </div>
            <button
              onClick={handleApply}
              disabled={autoSuggestions.length === 0}
              className="px-4 py-1.5 bg-brand text-white shape-premium-button text-xs font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
            >
              Apply All
            </button>
          </div>

          {isCalculating ? (
            <div className="flex items-center gap-2 text-theme-muted text-sm py-4">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Calculating best items...
            </div>
          ) : autoSuggestions.length > 0 ? (
            <div className="space-y-2">
              {autoSuggestions.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-surface-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 dark:bg-white/10 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm">🎁</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-theme-heading">{item.product.name}</p>
                      <p className="text-xs text-theme-muted">KSh {item.product.price.toLocaleString()} × {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-theme-heading">
                    KSh {(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-surface-border">
                <span className="text-sm font-semibold text-theme-heading">Total</span>
                <span className="text-sm font-bold text-brand">
                  KSh {autoSuggestions.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-theme-muted text-sm py-4 text-center">
              No products available for this budget range.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export { BUDGET_PRESETS };
