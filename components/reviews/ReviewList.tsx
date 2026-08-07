"use client";

import { useState, useEffect, useCallback } from "react";
import ReviewCard from "./ReviewCard";
import type { ReviewWithMedia } from "@/lib/types";

interface ReviewListProps {
  productId?: string;
  limit?: number;
}

type SortOption = "newest" | "highest" | "lowest" | "helpful";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest" },
  { value: "lowest", label: "Lowest" },
  { value: "helpful", label: "Most helpful" },
];

export default function ReviewList({ productId, limit = 10 }: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewWithMedia[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<SortOption>("newest");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (productId) params.set("productId", productId);
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (filterRating) params.set("rating", String(filterRating));

    try {
      const res = await fetch(`/api/reviews?${params}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId, sort, page, limit, filterRating]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    setPage(1);
  }, [sort, filterRating]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-semibold text-brand-deep">
          {total} {total === 1 ? "Review" : "Reviews"}
        </p>

        <div className="flex items-center gap-3">
          {/* Rating filter */}
          <select
            value={filterRating || ""}
            onChange={(e) =>
              setFilterRating(e.target.value ? Number(e.target.value) : null)
            }
            className="text-sm px-3 py-2 rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value="">All ratings</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} stars
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-sm px-3 py-2 rounded-xl border border-surface-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-secondary rounded-2xl p-5 border border-surface-border animate-pulse"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-gray-200 rounded" />
                  <div className="w-16 h-2 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-3 bg-gray-200 rounded" />
                <div className="w-3/4 h-3 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl block mb-3">💬</span>
          <p className="text-sm text-brand-muted">
            No reviews yet. Be the first to share your experience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-xl text-sm font-medium border border-surface-border hover:bg-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-brand-muted px-3">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-xl text-sm font-medium border border-surface-border hover:bg-surface-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
