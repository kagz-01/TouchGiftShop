"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  productName: string;
  image_url: string | null;
  images?: string[];
  in_stock: boolean;
  is_personalizable: boolean;
}

export default function ProductGallery({
  productName,
  image_url,
  images = [],
  in_stock,
  is_personalizable,
}: ProductGalleryProps) {
  // If `images` array is empty or undefined, use `image_url` as the only image
  const allImages = images.length > 0 ? images : (image_url ? [image_url] : []);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      {/* Main Image */}
      <div className="relative aspect-square w-full bg-blush rounded-3xl overflow-hidden shadow-card max-h-[500px]">
        {allImages.length > 0 ? (
          <Image
            src={allImages[activeIndex]}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-opacity duration-300"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">
            🎁
          </div>
        )}

        {/* Stock badge */}
        {!in_stock && (
          <div className="absolute top-4 left-4 bg-brand-deep/80 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-xl font-medium">
            Out of stock
          </div>
        )}

        {/* Personalizable badge */}
        {is_personalizable && (
          <div className="absolute top-4 right-4 bg-gold/90 backdrop-blur-sm text-brand-deep text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Customizable
          </div>
        )}
      </div>

      {/* Thumbnails (Only show if > 1 image) */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden transition-all snap-start",
                activeIndex === idx
                  ? "ring-2 ring-brand ring-offset-2 opacity-100 scale-100"
                  : "opacity-60 hover:opacity-100 scale-95 hover:scale-100"
              )}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
