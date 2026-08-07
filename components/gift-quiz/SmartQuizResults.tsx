"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type QuizAnswers = {
  recipient: string;
  occasion: string;
  budget: string;
  interests: string[];
};

type RejectedProduct = {
  id: string;
  name: string;
  reason: string;
};

type SmartQuizResultsProps = {
  answers: QuizAnswers;
  children: React.ReactNode;
};

export default function SmartQuizResults({ answers, children }: SmartQuizResultsProps) {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [rejectedProducts, setRejectedProducts] = useState<RejectedProduct[]>([]);

  // Fetch AI explanation on mount
  useEffect(() => {
    async function fetchExplanation() {
      try {
        const res = await fetch("/api/ai/quiz-explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: answers.recipient,
            occasion: answers.occasion,
            budget: answers.budget,
            interests: answers.interests,
            products: [],
          }),
        });
        const data = await res.json();
        setExplanation(data.explanation || "");
      } catch {
        setExplanation("");
      } finally {
        setLoading(false);
      }
    }
    fetchExplanation();
  }, [answers]);

  // Smart follow-up handler
  const handleFollowUp = async () => {
    if (!followUpMessage.trim()) return;

    setShowFollowUp(false);
    setFollowUpMessage("");

    // In a real implementation, this would call T-Gifter with the rejection context
    // For now, we'll show a message
    const response = `Based on your feedback, we're adjusting our suggestions. Here are some alternatives that might work better for you!`;

    setExplanation((prev) => `${prev}\n\n${response}`);
  };

  return (
    <div className="space-y-6">
      {/* AI Explanation Card */}
      {(loading || explanation) && (
        <div className="bg-gradient-to-br from-brand/5 to-gold/5 rounded-2xl p-6 border border-brand/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-lg shrink-0">
              🤖
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-brand mb-1">T-Gifter says</p>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-brand/10 rounded-full animate-pulse w-full" />
                  <div className="h-3 bg-brand/10 rounded-pulse animate-pulse w-3/4" />
                </div>
              ) : (
                <p className="text-sm text-brand-deep leading-relaxed">{explanation}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product grid */}
      {children}

      {/* Smart Follow-up Section */}
      <div className="bg-white rounded-2xl border border-surface-border p-6">
        <h3 className="font-display text-lg font-semibold mb-3">Not quite right?</h3>
        <p className="text-sm text-brand-muted mb-4">
          Tell T-Gifter what you don&apos;t like and we&apos;ll find better options.
        </p>

        {showFollowUp ? (
          <div className="space-y-3">
            <textarea
              value={followUpMessage}
              onChange={(e) => setFollowUpMessage(e.target.value)}
              placeholder="e.g., Too expensive, not her style, she already has that..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleFollowUp}
                disabled={!followUpMessage.trim()}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  followUpMessage.trim()
                    ? "bg-brand text-white hover:bg-brand-deep"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                )}
              >
                Get Better Picks
              </button>
              <button
                onClick={() => setShowFollowUp(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-brand-muted hover:bg-surface transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowFollowUp(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-surface hover:bg-brand/5 text-brand transition-all"
          >
            💬 Tell T-Gifter what&apos;s wrong
          </button>
        )}

        {/* Quick rejection chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            "Too expensive",
            "Not her style",
            "Too casual",
            "Too fancy",
            "Already has it",
            "Not practical",
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setFollowUpMessage(chip);
                setShowFollowUp(true);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand/5 text-brand hover:bg-brand/10 transition-all"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
