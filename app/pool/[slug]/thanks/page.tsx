"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Heart, Share2, Copy, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import ReactConfetti from "react-confetti";

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return size;
}

export default function ThanksPage() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const contributionId = searchParams.get("contribution");
  const name = searchParams.get("name") || "";
  const amount = searchParams.get("amount") || "";

  const [copied, setCopied] = useState(false);
  const [splitCopied, setSplitCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const [cardVisible, setCardVisible] = useState(false);
  const { width, height } = useWindowSize();

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/pool/${slug}` : `/pool/${slug}`;
  const splitUrl = typeof window !== "undefined" ? `${window.location.origin}/pool/${slug}/contribute?split=${contributionId}` : `/pool/${slug}/contribute?split=${contributionId}`;

  useEffect(() => {
    // Confetti for 5 seconds
    const t1 = setTimeout(() => setShowConfetti(false), 5000);
    // Card entrance
    const t2 = setTimeout(() => setCardVisible(true), 200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const copyShare = () => { navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const copySplit = () => { navigator.clipboard?.writeText(splitUrl); setSplitCopied(true); setTimeout(() => setSplitCopied(false), 2000); };

  return (
    <div className="min-h-screen bg-[#14080D] flex items-center justify-center px-4 relative overflow-hidden">
      {/* React Confetti */}
      {showConfetti && width > 0 && (
        <ReactConfetti
          width={width}
          height={height}
          numberOfPieces={300}
          recycle={false}
          colors={["#d946ef", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#fff"]}
          gravity={0.25}
        />
      )}

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[200px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Animated Thank-You Card */}
      <div className={`relative z-10 max-w-sm w-full transition-all duration-700 ease-out ${cardVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>

        {/* The Card */}
        <div className="relative bg-gradient-to-br from-[#1F0A1A] to-[#0D0512] border border-rose-500/20 rounded-[2rem] p-8 text-center shadow-[0_0_80px_rgba(217,70,239,0.15)] overflow-hidden mb-5">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />
          {/* Sparkle dots */}
          <div className="absolute top-6 right-6 text-rose-400/40 animate-spin" style={{ animationDuration: "8s" }}>✦</div>
          <div className="absolute bottom-10 left-8 text-orange-400/30 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }}>✦</div>

          {/* Animated Heart badge */}
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(217,70,239,0.3)]">
            <Heart className="w-12 h-12 text-rose-400 fill-rose-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#14080D]">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="font-display text-3xl font-bold italic text-white mb-2">
            {name ? `Thank you, ${name}! 💛` : "Thank you! 💛"}
          </h1>
          {amount && (
            <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-1.5 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-300 font-bold text-sm">KES {Number(amount).toLocaleString()} contributed</span>
            </div>
          )}
          <p className="text-white/60 leading-relaxed text-sm">
            Your contribution has been received. You&apos;re helping make someone&apos;s day truly special. ✨
          </p>

          {/* Confirmation */}
          <div className="mt-5 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-300 text-left">Payment confirmed by PesaPal. Your name will appear on the pool shortly.</p>
          </div>
        </div>

        {/* Invite friends */}
        <div className="bg-rose-500/5 border border-rose-500/15 rounded-3xl p-5 mb-4">
          <p className="text-sm font-semibold text-white mb-3">🎁 Know others who&apos;d like to contribute?</p>
          <div className="flex gap-2 mb-3">
            <code className="flex-1 text-xs text-white/60 bg-black/30 px-3 py-2 rounded-xl border border-white/10 truncate">{shareUrl}</code>
            <button onClick={copyShare} className="px-3 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors">
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`🎁 I just contributed to a gift pool!\n\nJoin me and help make their day special 💛\n${shareUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-2xl font-semibold text-sm hover:bg-green-600 transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </a>
        </div>

        {/* Split with Friend */}
        {contributionId && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-4 text-left">
            <p className="text-sm font-semibold text-white mb-2">👯‍♀️ Split your contribution?</p>
            <p className="text-xs text-white/40 mb-3">
              Send this link to a friend so they can pay their half directly into the pool.
            </p>
            <div className="flex gap-2">
              <code className="flex-1 text-xs text-white/60 bg-black/30 px-3 py-2 rounded-xl border border-white/10 truncate">{splitUrl}</code>
              <button onClick={copySplit} className="px-3 py-2 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-semibold hover:bg-white/20 transition-colors">
                {splitCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <Link
          href={`/pool/${slug}`}
          className="flex items-center justify-center gap-2 text-rose-400 font-semibold text-sm hover:text-rose-300 transition-colors"
        >
          View pool progress <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
