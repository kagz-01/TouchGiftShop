"use client";

import Link from "next/link";
import Image from "next/image";
import { formatKsh, cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
  className?: string;
}

export default function ProductCard({ product, index = 0, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isPopular = index < 4;

  return (
    <Link
      href={`/product/${product.id}`}
      className={cn("group block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="gift-card">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-blush overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-transform duration-700 ease-out",
                isHovered && "scale-110"
              )}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-warm">
              🎁
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-brand-dark/60 via-transparent to-transparent transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Quick view button */}
          <div
            className={cn(
              "absolute bottom-3 left-3 right-3 transition-all duration-300",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center text-sm font-semibold text-brand shadow-soft">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Quick View
              </span>
            </div>
          </div>

          {/* Gift tag for popular items */}
          {isPopular && (
            <div className="gift-tag">
              <span className="flex items-center gap-1">
                <span className="animate-wiggle inline-block">🎁</span>
                Popular
              </span>
            </div>
          )}

          {/* Stock badge */}
          {!product.in_stock && (
            <div className="absolute top-3 left-3 bg-brand-deep/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg font-medium">
              Out of stock
            </div>
          )}

          {/* Personalizable badge */}
          {product.is_personalizable && (
            <div className="absolute top-3 left-3 bg-gold/90 backdrop-blur-sm text-brand-deep text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Customizable
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-sm mb-1.5 line-clamp-2 group-hover:text-brand transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-gold font-bold text-base">{formatKsh(product.price)}</p>
            <div
              className={cn(
                "w-8 h-8 rounded-full bg-brand/5 flex items-center justify-center transition-all duration-300",
                isHovered && "bg-brand text-white scale-110"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
