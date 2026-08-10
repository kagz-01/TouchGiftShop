"use client";

import { useState, useEffect, useCallback } from "react";
import StarRating from "./StarRating";
import RatingDistribution from "./RatingDistribution";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import { useRealtimeReviewStats } from "./useRealtimeReviews";
import type { ReviewStats } from "@/lib/types";

interface ProductReviewsProps {
  productId: string;
  orderId?: string;
}

export default function ProductReviews({
  productId,
  orderId,
}: ProductReviewsProps) {
  const stats = useRealtimeReviewStats(productId);
  const [fullStats, setFullStats] = useState<ReviewStats | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFullStats = useCallback(async () => {
    const res = await fetch(`/api/reviews/stats?productId=${productId}`);
    const data = await res.json();
    setFullStats(data);
  }, [productId]);

  useEffect(() => {
    fetchFullStats();
  }, [fetchFullStats, refreshKey]);

  // Refetch stats when real-time count changes
  useEffect(() => {
    if (stats.totalReviews > 0) fetchFullStats();
  }, [stats.totalReviews, fetchFullStats]);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <section className="mt-12 border-t border-surface-border pt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-brand-deep">
            Customer Reviews
          </h2>
          {stats.totalReviews > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl font-bold text-brand-deep">
                {stats.averageRating}
              </span>
              <StarRating rating={Math.round(stats.averageRating)} size="md" />
              <span className="text-sm text-brand-muted">
                ({stats.totalReviews}{" "}
                {stats.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Write a Review
        </button>
      </div>

      {/* Rating summary — live updating */}
      {fullStats && fullStats.totalReviews > 0 && (
        <div className="bg-surface-secondary rounded-2xl p-6 mb-8">
          <RatingDistribution
            distribution={fullStats.distribution}
            total={fullStats.totalReviews}
          />
        </div>
      )}

      {/* Empty State */}
      {stats.totalReviews === 0 && !showForm && (
        <div className="bg-surface-secondary/50 rounded-2xl p-8 text-center animate-fade-in mb-8">
          <span className="text-4xl mb-3 block">✨</span>
          <h3 className="font-display font-semibold text-lg text-brand-deep mb-2">
            No reviews yet
          </h3>
          <p className="text-sm text-brand-muted max-w-sm mx-auto mb-6">
            Be the first to experience this! Gift a loved one and leave the very first review.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => {
                document.querySelector('button[aria-label="Add to cart"]')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-brand hover:text-brand-dark transition-colors inline-flex flex-col items-center gap-2"
            >
              <span className="text-xs font-semibold uppercase tracking-wider">Gift this now</span>
              <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <div className="bg-white border border-surface-border rounded-2xl p-6 mb-8">
          <ReviewForm
            productId={productId}
            orderId={orderId}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Review list — real-time */}
      <ReviewList key={refreshKey} productId={productId} />
    </section>
  );
}
