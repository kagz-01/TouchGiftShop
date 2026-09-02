"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { ReviewWithMedia } from "@/lib/types";

/**
 * Subscribe to real-time review changes for a product.
 * Returns live reviews that update when inserts/updates/deletes happen.
 */
export function useRealtimeReviews(
  productId: string,
  initialReviews: ReviewWithMedia[] = []
) {
  const [reviews, setReviews] = useState<ReviewWithMedia[]>(initialReviews);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  const fetchReviews = useCallback(async () => {
    const res = await fetch(
      `/api/reviews?productId=${productId}&sort=newest&limit=20`
    );
    const data = await res.json();
    setReviews(data.reviews || []);
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supabase = createClient();

    const channel = supabase
      .channel(`reviews:${productId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
          filter: `product_id=eq.${productId}`,
        },
        async (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            const { data: review } = await supabase
              .from("reviews")
              .select("*, media:review_media(*)")
              .eq("id", payload.new.id)
              .single();

            if (review) {
              setReviews((prev) => {
                const exists = prev.find((r) => r.id === review.id);
                if (exists) {
                  return prev.map((r) => (r.id === review.id ? review : r));
                }
                return [review, ...prev];
              });
            }
          } else if (payload.eventType === "DELETE") {
            setReviews((prev) =>
              prev.filter((r) => r.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [productId]);

  return reviews;
}

/**
 * Subscribe to real-time review stats for a product.
 */
export function useRealtimeReviewStats(productId: string) {
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  });
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  const fetchStats = useCallback(async () => {
    const res = await fetch(`/api/reviews/stats?productId=${productId}`);
    const data = await res.json();
    setStats({
      averageRating: data.averageRating || 0,
      totalReviews: data.totalReviews || 0,
    });
  }, [productId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supabase = createClient();

    const channel = supabase
      .channel(`review-stats:${productId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reviews",
          filter: `product_id=eq.${productId}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [productId, fetchStats]);

  return stats;
}
