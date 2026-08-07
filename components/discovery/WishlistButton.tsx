"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

type WishlistButtonProps = {
  productId: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const WISHLIST_KEY = "touchgift_wishlist";

export default function WishlistButton({
  productId,
  productName,
  productPrice,
  productImage,
  className,
  size = "md",
}: WishlistButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        const items: Array<{ id: string }> = JSON.parse(stored);
        setIsSaved(items.some((item) => item.id === productId));
      }
    } catch {
      // localStorage not available
    }
  }, [productId]);

  const toggleWishlist = () => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      let items: Array<{ id: string; name: string; price: number; image?: string }> = stored
        ? JSON.parse(stored)
        : [];

      if (isSaved) {
        items = items.filter((item) => item.id !== productId);
      } else {
        items.unshift({
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
        });
      }

      localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
      setIsSaved(!isSaved);

      // Show toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch {
      // localStorage not available
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  return (
    <>
      <button
        onClick={toggleWishlist}
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300",
          sizeClasses[size],
          isSaved
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-white/80 text-brand-muted hover:bg-white hover:text-red-500",
          className
        )}
        aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
      >
        <svg
          className={cn(
            "transition-transform duration-300",
            isSaved && "scale-110"
          )}
          fill={isSaved ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-brand-deep text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium animate-fade-in z-50">
          {isSaved ? "❤️ Saved to wishlist" : "💔 Removed from wishlist"}
        </div>
      )}
    </>
  );
}

// Hook to get wishlist count
export function useWishlistCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const stored = localStorage.getItem(WISHLIST_KEY);
        if (stored) {
          setCount(JSON.parse(stored).length);
        }
      } catch {
        // localStorage not available
      }
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    return () => window.removeEventListener("storage", updateCount);
  }, []);

  return count;
}
