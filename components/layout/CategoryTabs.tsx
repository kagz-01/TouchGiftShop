"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { id: "all", label: "All Gifts", emoji: "🎁" },
  { id: "birthdays", label: "Birthday", emoji: "🎂" },
  { id: "weddings", label: "Wedding", emoji: "💒" },
  { id: "baby", label: "New Baby", emoji: "👶" },
  { id: "hampers", label: "Hampers", emoji: "🧺" },
  { id: "flowers", label: "Flowers", emoji: "🌸" },
  { id: "personalised", label: "Personalised", emoji: "✨" },
  { id: "condolences", label: "Condolences", emoji: "🕊️" },
  { id: "just-because", label: "Just Because", emoji: "💝" },
];

export default function CategoryTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const activeCategory = searchParams.get("category") || "all";
  const isHome = pathname === "/";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkFade = () => {
      setShowLeftFade(el.scrollLeft > 10);
      setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    checkFade();
    el.addEventListener("scroll", checkFade, { passive: true });
    window.addEventListener("resize", checkFade);
    return () => {
      el.removeEventListener("scroll", checkFade);
      window.removeEventListener("resize", checkFade);
    };
  }, []);

  const getCategoryHref = (id: string) => {
    if (id === "all") return "/";
    return `/?category=${id}`;
  };

  return (
    <div className="relative">
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}

      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-hide py-2 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {QUICK_LINKS.map((cat) => {
          const isActive = isHome && activeCategory === cat.id;
          const href = getCategoryHref(cat.id);

          return (
            <Link
              key={cat.id}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0",
                isActive
                  ? "bg-brand text-white shadow-ribbon"
                  : "bg-gray-50 text-brand-muted hover:bg-brand/5 hover:text-brand border border-transparent hover:border-brand/10"
              )}
            >
              <span className="text-sm">{cat.emoji}</span>
              {cat.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
