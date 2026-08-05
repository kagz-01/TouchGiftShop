"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PRACTICAL = ["Birthdays", "Anniversaries", "Weddings", "Condolences", "Corporate"];
const NARRATIVE = ["Apology", "Milestone", "Just Because"];

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
    <div className="flex gap-2 overflow-x-auto pb-2">
      {[...PRACTICAL, ...NARRATIVE].map((label) => {
        const slug = label.toLowerCase().replace(/\s+/g, "-");
        const isActive = slug === active;
        return (
          <button
            key={label}
            onClick={() => setCategory(slug)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm border transition-colors ${
              isActive
                ? "bg-brand text-white border-brand"
                : "border-gray-300 text-gray-700 hover:border-gray-400"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
