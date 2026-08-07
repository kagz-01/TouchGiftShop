"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "All", icon: "✨", slug: "" },
  { label: "Birthdays", icon: "🎂", slug: "birthdays" },
  { label: "Anniversaries", icon: "💍", slug: "anniversaries" },
  { label: "Weddings", icon: "💒", slug: "weddings" },
  { label: "Baby", icon: "👶", slug: "baby" },
  { label: "Corporate", icon: "🏢", slug: "corporate" },
  { label: "Condolences", icon: "🕊️", slug: "condolences" },
  { label: "Graduation", icon: "🎓", slug: "graduation" },
  { label: "Apology", icon: "💐", slug: "apology" },
  { label: "Just Because", icon: "💝", slug: "just-because" },
  { label: "For Her", icon: "💝", slug: "for-her" },
  { label: "For Him", icon: "🎁", slug: "for-him" },
  { label: "Fitness", icon: "💪", slug: "fitness" },
  { label: "Gaming", icon: "🎮", slug: "gaming" },
  { label: "Home", icon: "🏠", slug: "home-decor" },
  { label: "Kitchen", icon: "🍳", slug: "kitchen" },
];

export default function OccasionPills() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  function setCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="relative">
      {/* Fade edges */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 py-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setCategory(cat.slug)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0",
              active === cat.slug
                ? "bg-brand text-white shadow-ribbon"
                : "bg-white text-brand-muted border border-surface-border hover:border-brand/30 hover:text-brand hover:bg-brand/5"
            )}
          >
            <span className="text-base">{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
