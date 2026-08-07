"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import PhotoGallery from "./PhotoGallery";
import type { ReviewWithMedia } from "@/lib/types";

interface ReviewCardProps {
  review: ReviewWithMedia;
  onVote?: (reviewId: string) => void;
}

const AVATAR_COLORS = [
  "bg-brand",
  "bg-gold",
  "bg-brand-dark",
  "bg-brand-forest",
  "bg-brand-coral",
  "bg-gold-dark",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
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

export default function ReviewCard({ review, onVote }: ReviewCardProps) {
  const [voted, setVoted] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const media = review.media || [];
  const images = media.filter((m) => m.mediaType === "image");
  const videos = media.filter((m) => m.mediaType === "video");

  const handleVote = async () => {
    if (!onVote) return;
    try {
      const res = await fetch(`/api/reviews/${review.id}/vote`, {
        method: "POST",
      });
      const data = await res.json();
      setVoted(data.voted);
      setHelpfulCount((prev) => (data.voted ? prev + 1 : prev - 1));
    } catch {
      // silently fail
    }
  };

  return (
    <>
      <div className="bg-surface-secondary rounded-2xl p-5 border border-surface-border hover:shadow-card transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full ${getAvatarColor(
                review.reviewerName
              )} flex items-center justify-center text-white text-sm font-bold`}
            >
              {review.reviewerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-brand-deep">
                  {review.reviewerName}
                </p>
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-brand-muted">
                {timeAgo(review.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Stars */}
        <div className="mb-2">
          <StarRating rating={review.rating} size="sm" />
        </div>

        {/* Title */}
        {review.title && (
          <p className="text-sm font-semibold text-brand-deep mb-1">
            {review.title}
          </p>
        )}

        {/* Body */}
        {review.body && (
          <p className="text-sm text-brand-muted leading-relaxed mb-3">
            {review.body}
          </p>
        )}

        {/* Media thumbnails */}
        {media.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {media.slice(0, 4).map((m, i) => (
              <button
                key={m.id}
                onClick={() => {
                  setGalleryIndex(i);
                  setGalleryOpen(true);
                }}
                className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 group"
              >
                {m.mediaType === "image" ? (
                  <img
                    src={m.url}
                    alt={`Review photo ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-deep/10">
                    <svg
                      className="w-6 h-6 text-brand"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                )}
                {i === 3 && media.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      +{media.length - 4}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Seller reply */}
        {review.sellerReply && (
          <div className="bg-brand/5 border border-brand/10 rounded-xl p-3 mb-3">
            <p className="text-[11px] font-semibold text-brand mb-1">
              TouchGift Reply
            </p>
            <p className="text-xs text-brand-muted leading-relaxed">
              {review.sellerReply}
            </p>
          </div>
        )}

        {/* Helpful vote */}
        <button
          onClick={handleVote}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            voted
              ? "bg-brand/10 text-brand"
              : "bg-gray-100 text-brand-muted hover:bg-brand/5 hover:text-brand"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          Helpful{helpfulCount > 0 && ` (${helpfulCount})`}
        </button>
      </div>

      {/* Photo gallery lightbox */}
      {galleryOpen && (
        <PhotoGallery
          media={media}
          initialIndex={galleryIndex}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </>
  );
}
