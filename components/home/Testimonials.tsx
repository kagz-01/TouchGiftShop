"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { ReviewWithMedia } from "@/lib/types";

const GOOGLE_REVIEW_URL = "https://www.google.com/search?q=TouchGiftShop+Kenya+reviews";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? "text-gold" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-brand", "bg-gold", "bg-brand-dark", "bg-brand-forest",
  "bg-brand-coral", "bg-gold-dark",
];

function getAvatarColor(name: string | undefined) {
  const safe = name || "Anonymous";
  let hash = 0;
  for (let i = 0; i < safe.length; i++) {
    hash = safe.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}

export default function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [reviews, setReviews] = useState<ReviewWithMedia[]>([]);
  const scrollAmount = 380;

  useEffect(() => {
    fetch("/api/reviews?limit=8&sort=helpful")
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .catch(() => {});
  }, []);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animFrame: number;
    let lastTime = 0;
    const speed = 0.15;
    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const delta = time - lastTime;
      lastTime = time;
      if (!isPaused) {
        el.scrollLeft += speed * delta;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0;
        }
      }
      animFrame = requestAnimationFrame(animate);
    };
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [isPaused]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (reviews.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="w-full mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-brand-deep">TouchGift Shop</h3>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">4.9</span>
                <StarRating rating={5} />
                <span className="text-xs text-brand-muted">·</span>
                <span className="text-xs text-brand-muted">{reviews.length}+ reviews on</span>
                <svg className="w-12 h-4" viewBox="0 0 72 24">
                  <text x="0" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#4285F4">G</text>
                  <text x="14" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#EA4335">o</text>
                  <text x="26" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#FBBC05">o</text>
                  <text x="38" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#4285F4">g</text>
                  <text x="50" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#34A853">l</text>
                  <text x="56" y="18" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#EA4335">e</text>
                </svg>
              </div>
            </div>
          </div>

          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-brand/20 hover:border-brand rounded-xl text-sm font-semibold text-brand hover:bg-brand/5 transition-all group"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Leave a Review
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Carousel */}
        <div className="relative group">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-white shadow-card-hover border border-surface-border flex items-center justify-center text-brand-muted hover:text-brand hover:shadow-card transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-white shadow-card-hover border border-surface-border flex items-center justify-center text-brand-muted hover:text-brand hover:shadow-card transition-all opacity-0 group-hover:opacity-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[...reviews, ...reviews].map((review, i) => (
              <div
                key={`${review.id}-${i}`}
                className="flex-shrink-0 w-[340px] bg-surface-secondary rounded-2xl p-5 border border-surface-border hover:shadow-card-hover transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {review.isAnonymous ? (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    ) : (
                      <>
                        <div className={`w-10 h-10 rounded-full ${getAvatarColor(review.reviewer_name)} flex items-center justify-center text-white text-sm font-bold`}>
                          {(review.reviewer_name || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-brand-deep">{review.reviewer_name || "Anonymous"}</p>
                          <p className="text-[11px] text-brand-muted">{timeAgo(review.createdAt)}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <svg className="w-4 h-4 opacity-40" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>

                <div className="flex items-center gap-1.5 mb-2">
                  <StarRating rating={review.rating} />
                  {review.isVerifiedPurchase && (
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {review.title && (
                  <p className="text-sm font-semibold text-brand-deep mb-1">{review.title}</p>
                )}

                <p className="text-sm text-brand-muted leading-relaxed mb-3">
                  {review.body || ""}
                </p>

                {review.media && review.media.length > 0 && (
                  <div className="flex gap-2">
                    {review.media.slice(0, 3).map((m, j) => (
                      <div key={j} className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden">
                        {m.mediaType === "image" ? (
                          <img src={m.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-brand-deep/10 flex items-center justify-center text-xs">
                            ▶
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-brand-muted mt-6">
          All reviews are from verified Google reviews.{" "}
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            See all reviews
          </a>
        </p>
      </div>
    </section>
  );
}
