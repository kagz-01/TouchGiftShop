"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "Birthdays", icon: "🎂", slug: "birthdays" },
  { label: "Anniversaries", icon: "💍", slug: "anniversaries" },
  { label: "Weddings", icon: "💒", slug: "weddings" },
  { label: "Condolences", icon: "🕊️", slug: "condolences" },
  { label: "Corporate", icon: "🏢", slug: "corporate" },
  { label: "Apology", icon: "💐", slug: "apology" },
  { label: "Milestone", icon: "🏆", slug: "milestone" },
  { label: "Just Because", icon: "💝", slug: "just-because" },
];

export default function OccasionFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";

  function setCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === active) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Shop by Occasion</h2>
        {active && (
          <button
            onClick={() => setCategory("")}
            className="text-xs text-brand hover:text-brand-light transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {CATEGORIES.map((cat) => {
          const isActive = cat.slug === active;
          return (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                "relative flex flex-col items-center gap-2 min-w-[80px] pt-4 pb-3 px-3 rounded-xl transition-all duration-300",
                isActive
                  ? "bg-brand text-white shadow-ribbon scale-105"
                  : "bg-white border border-surface-border hover:border-brand/30 hover:shadow-soft hover:-translate-y-1"
              )}
            >
              {/* String */}
              <div
                className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3",
                  isActive ? "bg-white/50" : "bg-brand/20"
                )}
              />

              {/* Icon */}
              <span className="text-2xl">{cat.icon}</span>

              {/* Label */}
              <span className="text-xs font-medium whitespace-nowrap">
                {cat.label}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-gold rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
