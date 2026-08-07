"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatKsh } from "@/lib/utils";

type GiftRevealProps = {
  senderName: string;
  recipientName: string;
  message: string;
  productName: string;
  productPrice: number;
  productImage?: string;
  productId: string;
};

export default function GiftReveal({
  senderName,
  recipientName,
  message,
  productName,
  productPrice,
  productImage,
  productId,
}: GiftRevealProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        {!revealed ? (
          /* Envelope / Unopened state */
          <div className="animate-fade-in">
            <div className="relative w-48 h-48 mx-auto mb-8">
              {/* Animated envelope */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand to-brand-deep rounded-3xl shadow-xl flex items-center justify-center animate-pulse-soft">
                <span className="text-7xl animate-float">🎁</span>
              </div>
              {/* Seal */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-gold rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">✨</span>
              </div>
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
              You&apos;ve Received a Gift!
            </h1>
            <p className="text-brand-muted mb-8">
              <span className="font-semibold text-brand">{senderName}</span> sent you something special
            </p>

            <button
              onClick={() => setRevealed(true)}
              className="px-8 py-4 bg-brand text-white rounded-2xl font-semibold text-lg hover:bg-brand-deep transition-all shadow-ribbon hover:shadow-xl hover:scale-105 active:scale-95"
            >
              Open Your Gift 🎁
            </button>
          </div>
        ) : (
          /* Revealed state */
          <div className="animate-fade-in space-y-6">
            {/* Confetti effect placeholder */}
            <div className="text-6xl mb-4 animate-bounce">🎉</div>

            <h1 className="font-display text-2xl md:text-3xl font-bold">
              Happy Gift, {recipientName}!
            </h1>

            {/* Product card */}
            <div className="bg-white rounded-2xl border border-surface-border overflow-hidden shadow-card">
              {productImage && (
                <div className="relative aspect-[4/3] bg-blush">
                  <Image
                    src={productImage}
                    alt={productName}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h2 className="font-display text-xl font-bold mb-2">{productName}</h2>
                <p className="text-gold font-bold text-lg mb-4">{formatKsh(productPrice)}</p>

                {message && (
                  <div className="bg-brand/5 rounded-xl p-4 mb-4">
                    <p className="text-sm text-brand-deep italic">&ldquo;{message}&rdquo;</p>
                    <p className="text-xs text-brand-muted mt-2">— {senderName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/product/${productId}`}
                className="px-6 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-deep transition-all"
              >
                View Gift Details
              </Link>
              <Link
                href="/"
                className="px-6 py-3 bg-white border border-surface-border rounded-xl font-semibold hover:bg-surface transition-all"
              >
                Browse More Gifts
              </Link>
            </div>

            {/* Send thank you */}
            <div className="pt-6 border-t border-surface-border">
              <p className="text-sm text-brand-muted mb-3">Send a thank you message?</p>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Thank you ${senderName} for the ${productName}! 🎁💕`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-all"
              >
                <span>💬</span>
                Thank via WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
