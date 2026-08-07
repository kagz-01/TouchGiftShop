import Link from "next/link";
import { getRecommendation, type QuizAnswer } from "@/lib/gift-quiz";
import ProductGrid from "@/components/home/ProductGrid";
import SmartQuizResults from "@/components/gift-quiz/SmartQuizResults";

export const metadata = {
  title: "Your Gift Recommendations | TouchGift",
};

export default async function QuizResults({
  searchParams,
}: {
  searchParams: Promise<{ recipient?: string; occasion?: string; budget?: string; interests?: string }>;
}) {
  const params = await searchParams;

  const answers: QuizAnswer = {
    recipient: params.recipient || "friend",
    occasion: params.occasion || "any",
    budget: params.budget || "any",
    interests: params.interests ? params.interests.split(",") : [],
  };

  const recommendation = getRecommendation(answers);

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block animate-float">🎁</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Your Perfect Picks
          </h1>
          <p className="text-brand-muted max-w-xl mx-auto mb-6">
            {recommendation.message}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/gift-quiz"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-surface-border hover:border-brand/30 transition-all"
            >
              Retake Quiz
            </Link>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-sm font-medium bg-brand text-white hover:bg-brand-deep transition-all"
            >
              Browse All Gifts
            </Link>
          </div>
        </div>

        {/* Recommended categories */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {recommendation.categories.map((cat) => (
              <Link
                key={cat}
                href={`/?category=${cat}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand/10 text-brand hover:bg-brand hover:text-white transition-all"
              >
                {cat.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </Link>
            ))}
          </div>
        </div>

        {/* AI-powered results with smart follow-ups */}
        <SmartQuizResults answers={answers}>
          <ProductGrid
            searchParams={Promise.resolve({
              category: recommendation.categories[0],
              budget: answers.budget !== "any" ? answers.budget : undefined,
            })}
          />
        </SmartQuizResults>
      </div>
    </div>
  );
}
