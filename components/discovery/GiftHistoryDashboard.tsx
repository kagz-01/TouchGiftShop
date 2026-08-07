"use client";

import { useState, useEffect } from "react";
import { formatKsh } from "@/lib/utils";
import { getGiftHistory, getGiftSummary } from "@/lib/gift-history";

type GiftHistory = {
  recipientName: string;
  recipientRelation: string;
  gifts: Array<{
    productId: string;
    productName: string;
    price: number;
    occasion: string;
    date: string;
  }>;
};

type RecipientSummary = {
  recipient: string;
  relation: string;
  totalGifts: number;
  occasions: string[];
  totalSpent: number;
  lastGift: {
    productId: string;
    productName: string;
    price: number;
    occasion: string;
    date: string;
  };
  avgPrice: number;
};

const RELATION_EMOJI: Record<string, string> = {
  partner: "❤️",
  parent: "👨‍👩‍👧",
  friend: "🤝",
  colleague: "💼",
  child: "👶",
  sibling: "👫",
  family: "🏠",
};

const OCCASION_COLORS: Record<string, string> = {
  birthday: "bg-pink-100 text-pink-700",
  wedding: "bg-purple-100 text-purple-700",
  anniversary: "bg-red-100 text-red-700",
  christmas: "bg-green-100 text-green-700",
  valentines: "bg-rose-100 text-rose-700",
  "baby-shower": "bg-blue-100 text-blue-700",
  graduation: "bg-amber-100 text-amber-700",
  "just-because": "bg-teal-100 text-teal-700",
};

function OccasionBadge({ occasion }: { occasion: string }) {
  const colors = OCCASION_COLORS[occasion] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors}`}>
      {occasion.replace(/-/g, " ")}
    </span>
  );
}

export default function GiftHistoryDashboard() {
  const [history, setHistory] = useState<GiftHistory[]>([]);
  const [summaries, setSummaries] = useState<RecipientSummary[]>([]);
  const [expandedRecipient, setExpandedRecipient] = useState<string | null>(null);

  useEffect(() => {
    const data = getGiftHistory();
    setHistory(data);

    const sums = data
      .map((r) => getGiftSummary(r.recipientName))
      .filter(Boolean) as RecipientSummary[];
    sums.sort((a, b) => b.totalGifts - a.totalGifts);
    setSummaries(sums);
  }, []);

  if (summaries.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
          <span className="text-2xl">🎁</span>
        </div>
        <p className="text-sm font-medium text-gray-900">No gift history yet</p>
        <p className="mt-1 text-xs text-gray-500">
          Gift tracking starts when you add items to your cart. Your gift history will appear here.
        </p>
      </div>
    );
  }

  const totalSpentAll = summaries.reduce((sum, s) => sum + s.totalSpent, 0);
  const totalGiftsAll = summaries.reduce((sum, s) => sum + s.totalGifts, 0);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-100 bg-white p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{summaries.length}</p>
          <p className="text-xs text-gray-500">Recipients</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{totalGiftsAll}</p>
          <p className="text-xs text-gray-500">Gifts Given</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{formatKsh(totalSpentAll)}</p>
          <p className="text-xs text-gray-500">Total Spent</p>
        </div>
      </div>

      {/* Recipient list */}
      <div className="space-y-3">
        {summaries.map((summary) => {
          const isExpanded = expandedRecipient === summary.recipient;
          const emoji = RELATION_EMOJI[summary.relation] || "👤";

          return (
            <div
              key={summary.recipient}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white"
            >
              {/* Header */}
              <button
                onClick={() =>
                  setExpandedRecipient(isExpanded ? null : summary.recipient)
                }
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-lg">
                  {emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {summary.recipient}
                  </p>
                  <p className="text-xs text-gray-500">
                    {summary.totalGifts} gift{summary.totalGifts !== 1 ? "s" : ""} ·{" "}
                    {formatKsh(summary.totalSpent)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-1">
                    {summary.occasions.slice(0, 3).map((occ) => (
                      <OccasionBadge key={occ} occasion={occ} />
                    ))}
                  </div>
                  <svg
                    className={`h-5 w-5 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* Expanded: gift timeline */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-4 pb-4">
                  <div className="mt-3 space-y-3">
                    {[...summary.occasions].map((occasion) => {
                      const occasionGifts = history
                        .find((h) => h.recipientName === summary.recipient)
                        ?.gifts.filter((g) => g.occasion === occasion) || [];

                      return (
                        <div key={occasion}>
                          <p className="mb-2 text-xs font-medium uppercase text-gray-400">
                            {occasion.replace(/-/g, " ")}
                          </p>
                          <div className="space-y-2">
                            {occasionGifts.map((gift, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-gray-800">
                                    {gift.productName}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {new Date(gift.date).toLocaleDateString("en-KE", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                                <span className="ml-2 shrink-0 text-sm font-semibold text-gray-700">
                                  {formatKsh(gift.price)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick stats */}
                  <div className="mt-3 flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Avg Gift</p>
                      <p className="text-sm font-semibold text-gray-700">
                        {formatKsh(summary.avgPrice)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Last Gift</p>
                      <p className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">
                        {summary.lastGift.productName}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-400">Next Occasion</p>
                      <p className="text-sm font-semibold text-gray-700">
                        Upcoming
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
