"use client";

import { useEffect, useState } from "react";
import type { ReviewMedia } from "@/lib/types";

interface PhotoGalleryProps {
  media: ReviewMedia[];
  initialIndex: number;
  onClose: () => void;
}

export default function PhotoGallery({
  media,
  initialIndex,
  onClose,
}: PhotoGalleryProps) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrent((p) => (p > 0 ? p - 1 : media.length - 1));
      if (e.key === "ArrowRight") setCurrent((p) => (p < media.length - 1 ? p + 1 : 0));
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [media.length, onClose]);

  const item = media[current];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev */}
      {media.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrent((p) => (p > 0 ? p - 1 : media.length - 1));
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Content */}
      <div
        className="max-w-4xl max-h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.mediaType === "image" ? (
          <img
            src={item.url}
            alt={`Review photo ${current + 1}`}
            className="max-w-full max-h-[80vh] object-contain rounded-xl"
          />
        ) : (
          <video
            src={item.url}
            controls
            autoPlay
            className="max-w-full max-h-[80vh] rounded-xl"
          />
        )}
      </div>

      {/* Next */}
      {media.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrent((p) => (p < media.length - 1 ? p + 1 : 0));
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Dots */}
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === current ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
