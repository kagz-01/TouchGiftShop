"use client";

import { useState } from "react";

interface WishlistButtonProps {
  productId: string;
}

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleClick = async () => {
    const savedSlug = localStorage.getItem("wishlist_slug");
    if (savedSlug) {
      setSlug(savedSlug);
      await addToWishlist(savedSlug);
    } else {
      setShowInput(true);
    }
  };

  const addToWishlist = async (s: string) => {
    setLoading(true);
    setFeedback("");
    try {
      const res = await fetch(`/api/wishlist/${s}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setWishlisted(true);
        setFeedback("Added to your wishlist!");
        localStorage.setItem("wishlist_slug", s);
        setTimeout(() => {
          setFeedback("");
          setShowInput(false);
        }, 2000);
      } else {
        setFeedback("Wishlist not found. Check your link.");
      }
    } catch {
      setFeedback("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${
          wishlisted
            ? "bg-brand/10 text-brand border-2 border-brand/30"
            : "bg-white border-2 border-surface-border text-brand-muted hover:border-brand hover:text-brand"
        }`}
      >
        {wishlisted ? (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            Added to Wishlist
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Add to My Wishlist
          </>
        )}
      </button>

      {/* Slug input */}
      {showInput && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-card-hover border border-surface-border p-4 z-20 animate-pop">
          <p className="text-xs font-semibold mb-1">What&apos;s your wishlist link?</p>
          <p className="text-[10px] text-brand-muted mb-3">Paste the slug from your wishlist URL (e.g. <code>/wishlist/grace</code>)</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. grace"
              className="flex-1 bg-gray-50 border border-surface-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
            <button
              onClick={() => slug.trim() && addToWishlist(slug.trim())}
              disabled={!slug.trim() || loading}
              className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "..." : "Add"}
            </button>
          </div>
          {feedback && (
            <p className={`text-xs mt-2 ${feedback.includes("not found") || feedback.includes("wrong") ? "text-brand-coral" : "text-brand-forest"}`}>
              {feedback}
            </p>
          )}
        </div>
      )}

      {!showInput && feedback && (
        <p className="text-xs text-brand-forest text-center mt-1">{feedback}</p>
      )}
    </div>
  );
}
