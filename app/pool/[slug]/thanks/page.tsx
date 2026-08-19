"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart, Share2, Copy, CheckCircle2, ChevronRight } from "lucide-react";

export default function ThanksPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const contributionId = searchParams.get("contribution");
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/pool/${slug}` : `/pool/${slug}`;

  useEffect(() => {
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const copy = () => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] to-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Confetti layer */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                fontSize: `${12 + Math.random() * 16}px`,
              }}
            >
              {["🎉", "🎊", "💛", "🌸", "⭐", "💝"][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 max-w-sm w-full text-center">
        {/* Animated Heart */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand/20 to-gold/20 flex items-center justify-center mx-auto mb-6 animate-pulse-soft">
          <Heart className="w-12 h-12 text-brand fill-brand" />
        </div>

        <h1 className="font-display text-3xl font-bold italic text-brand-deep mb-3">
          Thank you! 💛
        </h1>
        <p className="text-brand-deep/60 leading-relaxed mb-8">
          Your contribution has been received and is being processed. You&apos;re helping make someone&apos;s day truly special.
        </p>

        {/* Thank you card */}
        <div className="bg-white rounded-3xl shadow-card p-6 mb-6 text-left">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="font-semibold text-brand-deep text-sm">Contribution Confirmed</span>
          </div>
          <p className="text-brand-deep/60 text-sm">
            Once payment is confirmed by PesaPal, your contribution will appear on the pool page. You&apos;ll receive an SMS confirmation shortly.
          </p>
        </div>

        {/* Invite friends */}
        <div className="bg-brand/5 rounded-3xl p-5 mb-6">
          <p className="text-sm font-semibold text-brand-deep mb-3">🎁 Know others who&apos;d like to contribute?</p>
          <div className="flex gap-2">
            <code className="flex-1 text-xs text-brand-deep bg-white px-3 py-2 rounded-xl border border-brand/10 truncate">{shareUrl}</code>
            <button onClick={copy} className="px-3 py-2 bg-brand text-white rounded-xl text-xs font-semibold">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`🎁 I just contributed to a gift pool!\n\nJoin me and help make their day special 💛\n${shareUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-2xl font-semibold text-sm hover:bg-green-600 transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </a>
        </div>

        <Link
          href={`/pool/${slug}`}
          className="flex items-center justify-center gap-2 text-brand font-semibold text-sm hover:underline"
        >
          View pool progress <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
