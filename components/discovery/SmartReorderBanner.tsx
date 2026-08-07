"use client";

import { useState, useEffect } from "react";
import {
  getReorderSuggestions,
  formatReorderMessage,
  type ReorderSuggestion,
} from "@/lib/smart-reorder";

export default function SmartReorderBanner() {
  const [suggestions, setSuggestions] = useState<ReorderSuggestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("touchgift_dismissed_reorder");
    const dismissedIds: string[] = stored ? JSON.parse(stored) : [];
    setDismissed(dismissedIds);

    const allSuggestions = getReorderSuggestions();
    setSuggestions(allSuggestions.filter((s) => !dismissedIds.includes(s.lastGift.productId)));
  }, []);

  if (suggestions.length === 0) return null;

  const suggestion = suggestions[current % suggestions.length];
  const actionLabel =
    suggestion.suggestedAction === "reorder"
      ? "Reorder Same"
      : suggestion.suggestedAction === "similar"
        ? "Find Similar"
        : "Upgrade";

  function handleDismiss() {
    const newDismissed = [...dismissed, suggestion.lastGift.productId];
    setDismissed(newDismissed);
    localStorage.setItem("touchgift_dismissed_reorder", JSON.stringify(newDismissed));

    const next = suggestions.filter((s) => s.lastGift.productId !== suggestion.lastGift.productId);
    if (next.length === 0) {
      setSuggestions([]);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  function handleShop() {
    if (suggestion.suggestedAction === "reorder") {
      // Go to product page (would need product slug in real app)
      window.location.href = `/search?q=${encodeURIComponent(suggestion.lastGift.productName)}`;
    } else if (suggestion.suggestedAction === "similar") {
      window.location.href = `/search?q=${encodeURIComponent(suggestion.lastGift.productName)}&sort=popular`;
    } else {
      window.location.href = `/category/${suggestion.occasion}`;
    }
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
            Smart Reorder
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">
            {suggestion.recipient}&apos;s {suggestion.occasion.replace(/-/g, " ")}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            {formatReorderMessage(suggestion)}
          </p>

          {/* Last gift info */}
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-white px-3 py-2">
            <span className="text-sm">🎁</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-gray-700">
                {suggestion.lastGift.productName}
              </p>
              <p className="text-xs text-gray-400">
                KSh {suggestion.lastGift.price.toLocaleString()} ·{" "}
                {new Date(suggestion.lastGift.date).toLocaleDateString("en-KE", {
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleShop}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {actionLabel} →
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Not now
            </button>
            {suggestions.length > 1 && (
              <button
                onClick={() => setCurrent((c) => c + 1)}
                className="ml-auto rounded-xl px-2 py-2 text-gray-400 hover:text-gray-600"
                title="Next suggestion"
              >
                →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
