"use client";

import { Gift, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface GiftCardPreviewProps {
  amount: number;
  recipientName: string;
  senderName: string;
  message: string;
  code?: string;
  flipped?: boolean;
}

export default function GiftCardPreview({
  amount,
  recipientName,
  senderName,
  message,
  code,
  flipped = false,
}: GiftCardPreviewProps) {
  const hasAmount = amount >= 500;
  const hasRecipient = recipientName.trim().length > 0;
  const hasSender = senderName.trim().length > 0;
  const hasMessage = message.trim().length > 0;

  return (
    <div className="perspective-[1200px] w-full max-w-[420px] mx-auto">
      <div
        className={cn(
          "relative w-full aspect-[1.6/1] transition-transform duration-700 preserve-3d",
          flipped && "rotate-y-180"
        )}
      >
        {/* Front face */}
        <div className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden shadow-2xl">
          {/* Card background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-deep to-[#2D0A1E]" />

          {/* Decorative pattern overlay */}
          <div className="absolute inset-0 opacity-[0.07]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="giftDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#giftDots)" />
            </svg>
          </div>

          {/* Gold accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-gold-light to-gold" />

          {/* Decorative corner flourish */}
          <div className="absolute top-4 right-5">
            <Sparkles className="w-5 h-5 text-gold/40" />
          </div>

          {/* Card content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-7 md:p-8">
            {/* Top: Logo + amount */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gold/70 text-[10px] uppercase tracking-[0.25em] font-bold mb-1">
                  TouchGift
                </p>
                <p className="text-white/50 text-[10px] uppercase tracking-widest">
                  Gift Card
                </p>
              </div>
              {hasAmount && (
                <div className="text-right">
                  <p className="font-display text-3xl md:text-4xl font-black text-gold leading-none">
                    {amount >= 1000 ? `${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}K` : amount}
                  </p>
                  <p className="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">
                    KSh
                  </p>
                </div>
              )}
            </div>

            {/* Middle: Recipient */}
            <div className={cn("transition-opacity duration-300", hasRecipient ? "opacity-100" : "opacity-30")}>
              <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">
                For
              </p>
              <p className="font-display text-xl md:text-2xl font-bold text-white leading-tight">
                {recipientName || "Recipient Name"}
              </p>
            </div>

            {/* Bottom: Sender + message */}
            <div>
              {(hasSender || hasMessage) && (
                <div className={cn("mb-3 transition-opacity duration-300", (hasSender || hasMessage) ? "opacity-100" : "opacity-30")}>
                  {hasMessage && (
                    <p className="text-white/60 text-xs italic leading-relaxed line-clamp-2">
                      &ldquo;{message}&rdquo;
                    </p>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className={cn("transition-opacity duration-300", hasSender ? "opacity-100" : "opacity-30")}>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">
                    From
                  </p>
                  <p className="text-white/80 text-sm font-semibold">
                    {senderName || "Your Name"}
                  </p>
                </div>
                <Gift className="w-5 h-5 text-gold/30" />
              </div>
            </div>
          </div>

          {/* Subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Back face (shown on success) */}
        {flipped && (
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E] via-brand-deep to-brand" />
            <div className="absolute inset-0 opacity-[0.05]">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="giftDots2" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#giftDots2)" />
              </svg>
            </div>
            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-14 h-14 bg-gold/20 rounded-2xl flex items-center justify-center mb-4">
                <Gift className="w-7 h-7 text-gold" />
              </div>
              <p className="text-gold/60 text-[10px] uppercase tracking-[0.25em] font-bold mb-2">
                Your Gift Card Code
              </p>
              <p className="font-mono text-2xl md:text-3xl font-black text-white tracking-widest mb-3">
                {code || "TG-XXXXXXXX"}
              </p>
              <p className="text-white/50 text-xs">
                Share this code with {recipientName || "the recipient"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
