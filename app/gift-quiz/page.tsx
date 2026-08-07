import { Suspense } from "react";
import GiftQuiz from "@/components/gift-quiz/GiftQuiz";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Finder Quiz | TouchGift",
  description: "Answer 4 quick questions and we'll find the perfect gift for any occasion.",
};

export default function GiftQuizPage() {
  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Find the Perfect Gift
          </h1>
          <p className="text-brand-muted">
            Answer 4 quick questions and we&apos;ll curate the best picks for you
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
          <GiftQuiz />
        </Suspense>
      </div>
    </div>
  );
}
