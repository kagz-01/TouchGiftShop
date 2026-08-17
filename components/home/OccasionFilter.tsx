"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  // Occasions
  { label: "Birthdays", slug: "birthdays", color: "from-pink-400 to-rose-500" },
  { label: "Anniversaries", slug: "anniversaries", color: "from-red-400 to-pink-500" },
  { label: "Weddings", slug: "weddings", color: "from-purple-400 to-violet-500" },
  { label: "Baby Shower", slug: "baby", color: "from-blue-400 to-cyan-500" },
  { label: "Graduation", slug: "graduation", color: "from-amber-400 to-orange-500" },
  { label: "Condolences", slug: "condolences", color: "from-gray-400 to-gray-600" },
  { label: "Just Because", slug: "just-because", color: "from-rose-400 to-red-500" },
  { label: "Apology", slug: "apology", color: "from-amber-400 to-orange-500" },
  { label: "Milestone", slug: "milestone", color: "from-emerald-400 to-teal-500" },
  // Lifestyle & Interests
  { label: "For Her", slug: "for-her", color: "from-pink-400 to-fuchsia-500" },
  { label: "For Him", slug: "for-him", color: "from-blue-400 to-indigo-500" },
  { label: "Fitness", slug: "fitness", color: "from-orange-400 to-red-500" },
  { label: "Gaming", slug: "gaming", color: "from-violet-400 to-purple-500" },
  { label: "Music", slug: "music", color: "from-pink-400 to-fuchsia-500" },
  { label: "Outdoor", slug: "outdoor", color: "from-green-400 to-emerald-500" },
  { label: "Home Decor", slug: "home-decor", color: "from-amber-400 to-orange-500" },
  { label: "Kitchen", slug: "kitchen", color: "from-red-400 to-rose-500" },
  // Business
  { label: "Corporate", slug: "corporate", color: "from-slate-500 to-gray-700" },
];

export default function OccasionFilter() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const active = searchParams.get("category") ?? "";

  function setCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === active) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold">Shop by Occasion</h2>
          <p className="text-sm text-brand-muted mt-1">Find the perfect gift for every moment</p>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
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
