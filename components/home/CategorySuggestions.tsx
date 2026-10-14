"use client";

import Link from "next/link";
import { getSuggestions, type CategorySuggestion } from "@/lib/category-suggestions";

export default function CategorySuggestions({ category }: { category: string }) {
  const suggestions = getSuggestions(category);

  if (suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-brand/5 to-gold/5 rounded-2xl p-4 md:p-5 border border-brand/10">
      <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-3">
        Complete the gift
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <Link
            key={s.slug}
            href={`/?category=${s.slug}`}
            className="group flex items-center gap-2 bg-white rounded-xl px-3 py-2 text-sm font-medium text-brand-deep hover:bg-brand hover:text-white transition-all duration-300 shadow-sm hover:shadow-ribbon border border-transparent hover:border-brand"
          >
            <span className="text-base group-hover:scale-110 transition-transform">{s.emoji}</span>
            <span>{s.label}</span>
            <span className="text-[10px] text-brand-muted group-hover:text-white/70 hidden md:inline">
              — {s.reason}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
