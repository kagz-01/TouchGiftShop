"use client";

import { useState } from "react";
import { getSubstitutions, getSmartSubstituteMessage } from "@/lib/smart-substitutions";

type SubstitutionSuggestionProps = {
  category: string;
  reason?: "out-of-stock" | "discontinued" | "price-match" | "similar-vibe";
  onSelect?: (category: string) => void;
};

export default function SubstitutionSuggestion({
  category,
  reason = "similar-vibe",
  onSelect,
}: SubstitutionSuggestionProps) {
  const [expanded, setExpanded] = useState(false);

  const alternatives = getSubstitutions(category, reason);
  const message = getSmartSubstituteMessage(category);

  if (alternatives.length === 0) return null;

  const formatCategoryName = (slug: string) =>
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg">💡</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900">Not quite what you wanted?</p>
          <p className="mt-1 text-xs text-amber-700">{message}</p>

          {expanded ? (
            <div className="mt-3 space-y-2">
              {alternatives.map((alt) => (
                <button
                  key={alt.category}
                  onClick={() => onSelect?.(alt.category)}
                  className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left shadow-sm hover:bg-amber-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {formatCategoryName(alt.category)}
                    </p>
                    <p className="text-xs text-gray-500">{alt.reason}</p>
                  </div>
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
              <button
                onClick={() => setExpanded(false)}
                className="text-xs text-amber-600 hover:text-amber-800"
              >
                Show less
              </button>
            </div>
          ) : (
            <button
              onClick={() => setExpanded(true)}
              className="mt-2 text-xs font-medium text-amber-700 hover:text-amber-900"
            >
              View {alternatives.length} alternatives →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
