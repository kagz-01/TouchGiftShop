"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  Sparkles, Cake, Gem, Heart, Baby, Building2, Feather, 
  GraduationCap, Flower2, HeartPulse, Gift, Dumbbell, 
  Gamepad2, Home, ChefHat 
} from "lucide-react";

const CATEGORIES = [
  // Occasions
  { label: "All", icon: <Sparkles className="w-4 h-4" />, slug: "" },
  { label: "Birthdays", icon: <Cake className="w-4 h-4" />, slug: "birthdays" },
  { label: "Anniversaries", icon: <Gem className="w-4 h-4" />, slug: "anniversaries" },
  { label: "Weddings", icon: <Heart className="w-4 h-4" />, slug: "weddings" },
  { label: "Baby", icon: <Baby className="w-4 h-4" />, slug: "baby" },
  { label: "Graduation", icon: <GraduationCap className="w-4 h-4" />, slug: "graduation" },
  { label: "Condolences", icon: <Feather className="w-4 h-4" />, slug: "condolences" },
  { label: "Just Because", icon: <HeartPulse className="w-4 h-4" />, slug: "just-because" },
  { label: "Apology", icon: <Flower2 className="w-4 h-4" />, slug: "apology" },
  { label: "Milestone", icon: <GraduationCap className="w-4 h-4" />, slug: "milestone" },
  // Lifestyle & Interests
  { label: "For Her", icon: <HeartPulse className="w-4 h-4" />, slug: "for-her" },
  { label: "For Him", icon: <Gift className="w-4 h-4" />, slug: "for-him" },
  { label: "Fitness", icon: <Dumbbell className="w-4 h-4" />, slug: "fitness" },
  { label: "Gaming", icon: <Gamepad2 className="w-4 h-4" />, slug: "gaming" },
  { label: "Home", icon: <Home className="w-4 h-4" />, slug: "home-decor" },
  { label: "Kitchen", icon: <ChefHat className="w-4 h-4" />, slug: "kitchen" },
  // Business
  { label: "Corporate", icon: <Building2 className="w-4 h-4" />, slug: "corporate" },
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
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
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
            <div className="flex items-center justify-center shrink-0">{cat.icon}</div>
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
