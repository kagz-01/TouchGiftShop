"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BUDGET_TIERS } from "@/lib/budget-tiers";
import { 
  Sparkles, Cake, Gem, Heart, Baby, Building2, Feather, 
  GraduationCap, Flower2, HeartPulse, Gift, Dumbbell, 
  Gamepad2, Home, ChefHat, Filter
} from "lucide-react";

const CATEGORIES = [
  // Occasions
  { label: "All Gifts", icon: <Sparkles className="w-4 h-4" />, slug: "" },
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

export default function ShopFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const activeCategory = searchParams.get("category") ?? "";
  const activeBudget = searchParams.get("budget") ?? "";
  
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

  function setBudget(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      if (activeBudget === slug) {
        params.delete("budget"); // Toggle off
      } else {
        params.set("budget", slug);
      }
    }
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-[2rem] border border-white/20 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.2)] relative z-20">
      
      {/* ── Occasions ── */}
      <div className="relative mb-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Sparkles className="w-4 h-4 text-white/60" />
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Occasion / Theme</h3>
        </div>
        
        {canScrollLeft && (
          <div className="absolute left-0 top-6 bottom-0 w-12 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-6 bottom-0 w-12 bg-gradient-to-l from-black/20 to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide -mx-2 px-2 pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 shrink-0",
                activeCategory === cat.slug
                  ? "bg-brand text-white shadow-ribbon"
                  : "bg-white/5 text-white/80 hover:bg-white/15 hover:text-white"
              )}
            >
              <div className="flex items-center justify-center shrink-0">{cat.icon}</div>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Budget ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-1">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/60" />
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-wider">Budget:</h3>
        </div>
        
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {BUDGET_TIERS.map((tier) => (
            <button
              key={tier.slug}
              onClick={() => setBudget(tier.slug)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                activeBudget === tier.slug
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:text-white"
              )}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
}
