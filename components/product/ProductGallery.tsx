"use client";

import React, { useState, MouseEvent, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import LiveCustomizer from "./LiveCustomizer";

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
  const allImages = images.length > 0 ? images : (image_url ? [image_url] : []);
  const [activeIndex, setActiveIndex] = useState(0);

  const [showCustomizer, setShowCustomizer] = useState(false);

  // Zoom State
  const [isHovering, setIsHovering] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.2)",
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setZoomStyle({});
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (isLightboxOpen) {
        if (e.key === "ArrowRight") setActiveIndex((prev) => (prev + 1) % allImages.length);
        if (e.key === "ArrowLeft") setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, allImages.length]);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full animate-fade-in-up">
      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[500px] hide-scrollbar snap-x md:snap-y pb-2 md:pb-0 md:pr-2 md:w-24 shrink-0">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                "relative w-20 h-20 md:w-full md:h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-white transition-all snap-start border-2",
                activeIndex === idx
                  ? "border-brand shadow-md opacity-100 scale-100"
                  : "border-transparent opacity-60 hover:opacity-100 scale-95 hover:scale-100"
              )}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image Container */}
      <div className="flex-1 flex flex-col gap-4">
        <div 
          className="relative aspect-square md:aspect-[4/3] w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-surface-border cursor-zoom-in group"
          onClick={() => setIsLightboxOpen(true)}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {allImages.length > 0 ? (
            <>
              <Image
                src={allImages[activeIndex]}
                alt={productName}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-2 transition-none"
                style={isHovering ? zoomStyle : {}}
                priority
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">🎁</div>
          )}

          {/* Badges */}
          {!in_stock && (
            <div className="absolute top-4 left-4 bg-brand-deep/80 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-xl font-medium z-10">
              Out of stock
            </div>
          )}

          {is_personalizable && (
            <div className="absolute top-4 right-4 bg-gold/90 backdrop-blur-sm text-brand-deep text-sm px-4 py-2 rounded-xl font-medium flex items-center gap-2 z-10">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Customizable
            </div>
          )}
        </div>

        {/* Live Customizer CTA */}
        {is_personalizable && (
          <button 
            onClick={() => setShowCustomizer(true)}
            className="w-full bg-surface border-2 border-brand text-brand hover:bg-blush py-4 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Customize this Gift Live
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center backdrop-blur-sm">
          <button 
            className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors z-[110]"
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {allImages.length > 1 && (
            <button 
              className="absolute left-6 text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors z-[110]"
              onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length); }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="relative w-full max-w-5xl h-[80vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <Image
              src={allImages[activeIndex]}
              alt={productName}
              fill
              className="object-contain"
              priority
            />
          </div>

          {allImages.length > 1 && (
            <button 
              className="absolute right-6 text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors z-[110]"
              onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev + 1) % allImages.length); }}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 px-4 overflow-x-auto">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                  className={cn(
                    "relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden transition-all border-2",
                    activeIndex === idx
                      ? "border-white opacity-100 scale-110 shadow-lg"
                      : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <Image src={img} alt={`Lightbox Thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Live Customizer Studio */}
      {showCustomizer && (
        <LiveCustomizer 
          baseImage={allImages[activeIndex] || ""} 
          onClose={() => setShowCustomizer(false)} 
        />
      )}
    </div>
  );
}
