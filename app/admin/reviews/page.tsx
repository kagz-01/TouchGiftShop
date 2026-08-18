"use client";

import { useState, useEffect, useCallback } from "react";
import StarRating from "@/components/reviews/StarRating";
import type { ReviewWithMedia } from "@/lib/types";

type StatusFilter = "all" | "pending" | "approved" | "flagged" | "rejected";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithMedia[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", "50");
    params.set("sort", "newest");
    if (statusFilter !== "all") params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const updateStatus = async (reviewId: string, status: string) => {
    setActionLoading(reviewId);
    try {
      await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setActionLoading(reviewId);
    try {
      await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="page-container py-8">
      <h1 className="font-display text-2xl font-bold text-brand-deep mb-6">
        Review Moderation
      </h1>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pending", "approved", "flagged", "rejected"] as StatusFilter[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                statusFilter === s
                  ? "bg-brand text-white"
                  : "bg-surface-secondary text-brand-muted hover:bg-brand/5"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-secondary rounded-2xl p-5 animate-pulse h-32" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-brand-muted">No reviews found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-surface-border rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-sm font-semibold text-brand-deep">
                      {(review as any).reviewer_name || review.reviewerName || "Anonymous"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        review.status === "approved"
                          ? "bg-green-50 text-green-600"
                          : review.status === "pending"
                          ? "bg-yellow-50 text-yellow-600"
                          : review.status === "flagged"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {review.status}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    )}
                  </div>

                  {review.title && (
                    <p className="text-sm font-semibold text-brand-deep mb-1">
                      {review.title}
                    </p>
                  )}

                  <p className="text-sm text-brand-muted mb-2">{review.body}</p>

                  {review.media && review.media.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {review.media.map((m) => (
                        <div
                          key={m.id}
                          className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100"
                        >
                          {m.mediaType === "image" ? (
                            <img
                              src={m.url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs">
                              ▶
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-brand-muted">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {review.status !== "approved" && (
                    <button
                      onClick={() => updateStatus(review.id, "approved")}
                      disabled={actionLoading === review.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                  )}
                  {review.status !== "flagged" && (
                    <button
                      onClick={() => updateStatus(review.id, "flagged")}
                      disabled={actionLoading === review.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors disabled:opacity-50"
                    >
                      Flag
                    </button>
                  )}
                  {review.status !== "rejected" && (
                    <button
                      onClick={() => updateStatus(review.id, "rejected")}
                      disabled={actionLoading === review.id}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    disabled={actionLoading === review.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-brand-muted hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
