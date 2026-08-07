"use client";

import { useState } from "react";
import {
  KENYA_OCCASIONS,
  getCulturalOccasion,
  type CulturalOccasion,
} from "@/lib/cultural-context";

type CulturalGuideProps = {
  occasionId?: string;
};

export default function CulturalGuide({ occasionId }: CulturalGuideProps) {
  const [selected, setSelected] = useState<CulturalOccasion | null>(
    occasionId ? getCulturalOccasion(occasionId) || null : null
  );

  if (selected) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <button
          onClick={() => setSelected(null)}
          className="mb-4 flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
        >
          ← Back to all occasions
        </button>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">{selected.name}</h3>
          <p className="text-sm text-purple-600">{selected.nameLocal}</p>
        </div>

        <p className="mb-4 text-sm text-gray-600">{selected.description}</p>

        {/* Budget */}
        <div className="mb-4 rounded-xl bg-purple-50 p-3">
          <p className="text-xs font-medium text-purple-600">Typical Budget</p>
          <p className="text-sm font-semibold text-purple-900">{selected.budgetRange}</p>
        </div>

        {/* Do's */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-green-700">Do's ✓</h4>
          <ul className="space-y-1">
            {selected.dos.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="mt-0.5 text-green-500">✓</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Don'ts */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-red-700">Don'ts ✗</h4>
          <ul className="space-y-1">
            {selected.donts.map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="mt-0.5 text-red-500">✗</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Typical gifts */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">Typical Gifts</h4>
          <div className="flex flex-wrap gap-2">
            {selected.typicalGifts.map((gift, i) => (
              <span
                key={i}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
              >
                {gift}
              </span>
            ))}
          </div>
        </div>

        {/* Etiquette */}
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-xs font-medium text-amber-700">Etiquette Note</p>
          <p className="mt-1 text-xs text-amber-800">{selected.etiquette}</p>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="mb-1 text-lg font-bold text-gray-900">Kenyan Gifting Guide</h3>
        <p className="text-sm text-gray-500">
          Understanding local customs makes your gift more meaningful.
        </p>
      </div>

      {KENYA_OCCASIONS.map((occasion) => (
        <button
          key={occasion.id}
          onClick={() => setSelected(occasion)}
          className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm hover:border-purple-200 hover:bg-purple-50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-sm">
            {occasion.id === "ruracio"
              ? "💍"
              : occasion.id === "dowry"
                ? "🐄"
                : occasion.id === "circumcision"
                  ? "🗡️"
                  : occasion.id === "funeral"
                    ? "🕊️"
                    : occasion.id === "christening"
                      ? "⛪"
                      : occasion.id === "housewarming"
                        ? "🏠"
                        : "🎓"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{occasion.name}</p>
            <p className="text-xs text-gray-500 truncate">{occasion.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-purple-600">{occasion.budgetRange}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
