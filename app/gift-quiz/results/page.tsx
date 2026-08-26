import Link from "next/link";
import { getRecommendation, type QuizAnswer } from "@/lib/gift-quiz";
import SmartQuizResults from "@/components/gift-quiz/SmartQuizResults";
import { supabaseAdmin } from "@/lib/supabase";
import { getDbSlugs } from "@/lib/category-map";
import { getBudgetRange } from "@/lib/budget-tiers";
import type { Product } from "@/lib/types";

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

  // Fetch products matching ALL recommended categories
  // Flatten all dbSlugs for the matched categories
  const allDbSlugs = Array.from(new Set(
    recommendation.categories.flatMap(cat => getDbSlugs(cat))
  ));

  let query = supabaseAdmin
    .from("products")
    .select("*, product_categories!inner(categories!inner(slug)), product_specs(spec_key, spec_value, icon, sort_order)")
    .in("product_categories.categories.slug", allDbSlugs);

  // Apply budget filter if any
  if (answers.budget && answers.budget !== "any") {
    const tier = getBudgetRange(answers.budget);
    if (tier) {
      query = query.gte("price", tier.min);
      if (tier.max !== null) {
        query = query.lte("price", tier.max);
      }
    }
  }

  // Get up to 24 products
  const { data: productsData } = await query.limit(24);
  
  // Deduplicate products in case they matched multiple categories
  const uniqueProductsMap = new Map();
  if (productsData) {
    productsData.forEach(p => uniqueProductsMap.set(p.id, p));
  }
  const products = Array.from(uniqueProductsMap.values()) as Product[];

  return (
    <div className="min-h-screen bg-gradient-warm">
      <div className="w-full mx-auto px-4 py-12">
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
        <SmartQuizResults answers={answers} preFetchedProducts={products} />
      </div>
    </div>
  );
}
