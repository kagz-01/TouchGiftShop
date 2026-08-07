"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🎁" },
  { id: "birthdays", label: "Birthdays", emoji: "🎂" },
  { id: "her", label: "For Her", emoji: "💐" },
  { id: "him", label: "For Him", emoji: "🎁" },
  { id: "weddings", label: "Weddings", emoji: "💒" },
  { id: "baby", label: "New Baby", emoji: "👶" },
  { id: "anniversaries", label: "Anniversaries", emoji: "💍" },
  { id: "corporate", label: "Corporate", emoji: "🏢" },
  { id: "hampers", label: "Hampers", emoji: "🧺" },
  { id: "condolences", label: "Condolences", emoji: "🕊️" },
  { id: "just-because", label: "Just Because", emoji: "💝" },
  { id: "beverages", label: "Beverages", emoji: "🍷" },
  { id: "flowers", label: "Flowers", emoji: "🌸" },
  { id: "plants", label: "Plants", emoji: "🪴" },
  { id: "gift-cards", label: "Gift Cards", emoji: "💳" },
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
    if (id === "gift-cards") return "/gift-cards";
    if (id === "corporate") return "/corporate";
    return `/?category=${id}`;
  };

  return (
    <div className="relative">
      {/* Left fade */}
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}

      {/* Right fade */}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}

      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto scrollbar-hide py-2 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((cat) => {
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
