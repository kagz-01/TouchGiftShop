"use client";

import { useState } from "react";

type ReferralBannerProps = {
  referralCode?: string;
};

export default function ReferralBanner({ referralCode = "FRIEND20" }: ReferralBannerProps) {
  const [copied, setCopied] = useState(false);

  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}?ref=${referralCode}`
    : `?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <section className="py-12 bg-gradient-to-br from-brand/5 to-gold/5">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 rounded-full text-brand text-sm font-semibold mb-4">
          <span className="text-lg">🎁</span>
          Refer & Earn
        </div>

        <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
          Give KSh 500, Get KSh 500
        </h2>
        <p className="text-brand-muted max-w-md mx-auto mb-6">
          Share your referral code with friends. They get KSh 500 off their first order,
          and you earn KSh 500 credit for your next gift.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl border-2 border-dashed border-brand/30">
            <span className="font-mono font-bold text-lg text-brand tracking-wider">
              {referralCode}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="px-5 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-deep transition-all flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy Referral Link
              </>
            )}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex items-center justify-center gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Hey! Use my code ${referralCode} to get KSh 500 off your first gift on TouchGift! 🎁 ${referralUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600 transition-all flex items-center gap-2"
          >
            <span>💬</span> WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Get KSh 500 off gifts on TouchGift! Use my code ${referralCode} 🎁`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 transition-all flex items-center gap-2"
          >
            <span>🐦</span> Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <span>👤</span> Facebook
          </a>
        </div>
      </div>
    </section>
  );
}
