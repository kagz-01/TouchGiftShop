"use client";

import { useState } from "react";
import Link from "next/link";
import GiftHistoryDashboard from "@/components/discovery/GiftHistoryDashboard";
import TasteQuiz from "@/components/discovery/TasteQuiz";
import SmartReorderBanner from "@/components/discovery/SmartReorderBanner";
import SeasonalPromptBar from "@/components/home/SeasonalPromptBar";

type Tab = "overview" | "history" | "taste" | "reorder" | "reminders";

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "history", label: "Gift History", icon: "📜" },
  { id: "taste", label: "Taste Profiles", icon: "🎯" },
  { id: "reorder", label: "Smart Reorder", icon: "🔄" },
  { id: "reminders", label: "Reminders", icon: "⏰" },
];

export default function MyStuffPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [quizName, setQuizName] = useState("");
  const [showQuiz, setShowQuiz] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Stuff</h1>
          <p className="text-sm text-gray-500">
            Your gift history, taste profiles, and smart features — all in one place.
          </p>
        </div>

        {/* Seasonal prompt */}
        <div className="mb-6">
          <SeasonalPromptBar />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-brand text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Smart Reorder */}
            <SmartReorderBanner />

            {/* Quick links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link
                href="/wishlist"
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 border border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-colors"
              >
                <span className="text-2xl">💝</span>
                <span className="text-xs font-medium text-gray-700">Wishlist</span>
              </Link>
              <Link
                href="/reminders"
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
              >
                <span className="text-2xl">⏰</span>
                <span className="text-xs font-medium text-gray-700">Reminders</span>
              </Link>
              <Link
                href="/gift-cards"
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-colors"
              >
                <span className="text-2xl">💳</span>
                <span className="text-xs font-medium text-gray-700">Gift Cards</span>
              </Link>
              <Link
                href="/orders"
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-colors"
              >
                <span className="text-2xl">📦</span>
                <span className="text-xs font-medium text-gray-700">Orders</span>
              </Link>
            </div>

            {/* Gift History preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Gift History</h2>
                <button
                  onClick={() => setActiveTab("history")}
                  className="text-xs text-brand hover:text-brand-dark"
                >
                  View all →
                </button>
              </div>
              <GiftHistoryDashboard />
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Gift History</h2>
            <GiftHistoryDashboard />
          </div>
        )}

        {activeTab === "taste" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Taste Profiles</h2>
            <p className="text-sm text-gray-500 mb-4">
              Build a taste profile for someone and we&apos;ll remember their preferences forever.
            </p>

            {!showQuiz ? (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Who&apos;s the gift for?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={quizName}
                      onChange={(e) => setQuizName(e.target.value)}
                      placeholder="e.g. Mama Wanjiku"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (quizName.trim()) setShowQuiz(true);
                      }}
                      disabled={!quizName.trim()}
                      className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                    >
                      Start Quiz
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <TasteQuiz
                recipientName={quizName}
                onComplete={() => {
                  setShowQuiz(false);
                  setQuizName("");
                }}
                onCancel={() => {
                  setShowQuiz(false);
                  setQuizName("");
                }}
              />
            )}
          </div>
        )}

        {activeTab === "reorder" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Smart Reorder</h2>
            <p className="text-sm text-gray-500 mb-4">
              We&apos;ll remind you when it&apos;s time to reorder a past gift.
            </p>
            <SmartReorderBanner />
          </div>
        )}

        {activeTab === "reminders" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Gift Reminders</h2>
            <Link
              href="/reminders"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Go to Reminders →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
