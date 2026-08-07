"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { label: "Birthdays", icon: "🎂", slug: "birthdays", color: "from-pink-400 to-rose-500" },
  { label: "Anniversaries", icon: "💍", slug: "anniversaries", color: "from-red-400 to-pink-500" },
  { label: "Weddings", icon: "💒", slug: "weddings", color: "from-purple-400 to-violet-500" },
  { label: "Baby Shower", icon: "👶", slug: "baby", color: "from-blue-400 to-cyan-500" },
  { label: "Corporate", icon: "🏢", slug: "corporate", color: "from-slate-500 to-gray-700" },
  { label: "Condolences", icon: "🕊️", slug: "condolences", color: "from-gray-400 to-gray-600" },
  { label: "Graduation", icon: "🎓", slug: "graduation", color: "from-amber-400 to-orange-500" },
  { label: "Milestone", icon: "🏆", slug: "milestone", color: "from-emerald-400 to-teal-500" },
  { label: "Apology", icon: "💐", slug: "apology", color: "from-amber-400 to-orange-500" },
  { label: "Just Because", icon: "💝", slug: "just-because", color: "from-rose-400 to-red-500" },
  { label: "Beverages", icon: "🍷", slug: "beverages", color: "from-amber-500 to-red-500" },
  { label: "Plants", icon: "🪴", slug: "plants", color: "from-green-400 to-emerald-500" },
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
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">Shop by Occasion</h2>
          <p className="text-sm text-brand-muted mt-1">Find the perfect gift for every moment</p>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setCategory(cat.slug)}
            className={cn(
              "group flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border-2 transition-all duration-300",
              active === cat.slug
                ? "border-brand bg-brand/5 shadow-ribbon scale-105"
                : "border-transparent bg-white hover:border-brand/20 hover:shadow-card hover:-translate-y-1"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl md:text-3xl transition-transform duration-300",
                active === cat.slug
                  ? "scale-110"
                  : "group-hover:scale-110"
              )}
            >
              {cat.icon}
            </div>
            <span
              className={cn(
                "text-[10px] md:text-xs font-semibold transition-colors",
                active === cat.slug ? "text-brand" : "text-brand-muted"
              )}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
