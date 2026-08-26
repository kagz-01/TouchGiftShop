"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";

type QuizAnswers = {
  recipient: string;
  occasion: string;
  budget: string;
  interests: string[];
};

type TopPick = {
  product_id: string;
  reason: string;
};

type SmartQuizResultsProps = {
  answers: QuizAnswers;
  preFetchedProducts?: Product[];
};

export default function SmartQuizResults({ answers, preFetchedProducts = [] }: SmartQuizResultsProps) {
  const [explanation, setExplanation] = useState("");
  const [topPicks, setTopPicks] = useState<TopPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [refining, setRefining] = useState(false);

  // Fetch AI explanation on mount
  useEffect(() => {
    async function fetchExplanation() {
      if (preFetchedProducts.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/ai/quiz-explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: answers.recipient,
            occasion: answers.occasion,
            budget: answers.budget,
            interests: answers.interests,
            products: preFetchedProducts.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              description: p.description
            })),
          }),
        });
        const data = await res.json();
        setExplanation(data.explanation || "");
        setTopPicks(data.top_picks || []);
      } catch {
        setExplanation("");
      } finally {
        setLoading(false);
      }
    }
    fetchExplanation();
  }, [answers, preFetchedProducts]);

  // Smart follow-up handler
  const handleFollowUp = async () => {
    if (!followUpMessage.trim() || preFetchedProducts.length === 0) return;

    setRefining(true);
    setShowFollowUp(false);

    try {
      const res = await fetch("/api/ai/quiz-refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: answers.recipient,
          occasion: answers.occasion,
          budget: answers.budget,
          interests: answers.interests,
          feedback: followUpMessage,
          previousPicks: topPicks,
          products: preFetchedProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            description: p.description
          })),
        }),
      });
      const data = await res.json();
      if (data.explanation) setExplanation(data.explanation);
      if (data.top_picks) setTopPicks(data.top_picks);
    } catch {
      // do nothing on fail
    } finally {
      setRefining(false);
      setFollowUpMessage("");
    }
  };

  const topPickIds = new Set(topPicks.map(tp => tp.product_id));
  const topProducts = topPicks
    .map(tp => ({ product: preFetchedProducts.find(p => p.id === tp.product_id), reason: tp.reason }))
    .filter((tp): tp is { product: Product; reason: string } => tp.product !== undefined);
  
  const otherProducts = preFetchedProducts.filter(p => !topPickIds.has(p.id));

  return (
    <div className="space-y-12">
      {/* AI Explanation Card */}
      <div className="bg-gradient-to-br from-brand/5 to-gold/5 rounded-2xl p-6 border border-brand/10 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-9xl opacity-5">🤖</div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-12 h-12 bg-brand text-white rounded-xl flex items-center justify-center text-xl shrink-0 shadow-lg">
            🤖
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-brand uppercase tracking-wider mb-2">T-Gifter says</p>
            {loading || refining ? (
              <div className="space-y-3">
                <div className="h-4 bg-brand/10 rounded-full animate-pulse w-full" />
                <div className="h-4 bg-brand/10 rounded-full animate-pulse w-5/6" />
                <div className="h-4 bg-brand/10 rounded-full animate-pulse w-3/4" />
              </div>
            ) : (
              <p className="text-brand-deep text-lg leading-relaxed">{explanation}</p>
            )}
          </div>
        </div>
      </div>

      {/* T-Gifter's Top Picks */}
      {topProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-brand-deep">Top AI Picks</h2>
            <span className="px-3 py-1 rounded-full bg-gold/20 text-gold-dark text-xs font-bold uppercase tracking-wider">
              Highly Recommended
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProducts.map(({ product, reason }, i) => (
              <div key={product.id} className="relative flex flex-col">
                <div className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white">
                  {i + 1}
                </div>
                <ProductCard product={product} />
                <div className="mt-3 bg-white p-3 rounded-xl border border-brand/10 shadow-sm flex-1">
                  <p className="text-sm text-brand-deep leading-snug">
                    <span className="text-brand font-semibold">Why:</span> {reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State for Products */}
      {loading && preFetchedProducts.length > 0 && topProducts.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {preFetchedProducts.slice(0, 4).map((p) => (
             <div key={p.id} className="opacity-50 animate-pulse">
               <ProductCard product={p} />
             </div>
           ))}
        </div>
      )}

      {/* Smart Follow-up Section */}
      {!loading && !refining && topProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-brand/20 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold mb-2">Not quite right?</h3>
              <p className="text-brand-muted">
                Tell T-Gifter what you don&apos;t like, and it will re-evaluate the catalog to find better matches.
              </p>
            </div>
            
            {showFollowUp ? (
              <div className="w-full md:w-1/2 space-y-3">
                <textarea
                  value={followUpMessage}
                  onChange={(e) => setFollowUpMessage(e.target.value)}
                  placeholder="e.g., Show me something more luxurious..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-brand/30 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowFollowUp(false)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-brand-muted hover:bg-surface transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFollowUp}
                    disabled={!followUpMessage.trim()}
                    className={cn(
                      "px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                      followUpMessage.trim()
                        ? "bg-brand text-white hover:bg-brand-deep shadow-md"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                  >
                    Get New Picks
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowFollowUp(true)}
                className="px-6 py-3 rounded-xl font-medium bg-surface hover:bg-brand hover:text-white text-brand transition-all shadow-sm"
              >
                💬 Tell T-Gifter what&apos;s wrong
              </button>
            )}
          </div>

          {/* Quick rejection chips */}
          {showFollowUp && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-surface-border">
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
                  onClick={() => setFollowUpMessage(chip)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand/5 text-brand hover:bg-brand hover:text-white transition-all border border-brand/10"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other Products */}
      {otherProducts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-surface-border">
          <h2 className="font-display text-2xl font-bold text-brand-deep">Other Great Options</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {otherProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
