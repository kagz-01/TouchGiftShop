"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Share2, Copy, ArrowRight, Gift } from "lucide-react";

export default function GiftReadyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) {
      router.push("/shop");
    }
  }, [slug, router]);

  if (!slug) return null;

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/open/${slug}` : `https://touchgift.shop/open/${slug}`;
  const whatsappMsg = `I just sent you a gift! 🎁✨\nTap the link to unbox it and tell us where to deliver it:\n${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0508] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-sm w-full relative z-10 text-center">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>

        <h1 className="font-display text-3xl font-bold italic mb-3">Gift Secured!</h1>
        <p className="text-white/60 text-sm leading-relaxed mb-8">
          Your payment was successful. We've created a magical digital unboxing link for your recipient.
        </p>

        {/* The Link Card */}
        <div className="bg-[#1F0A1C] border border-fuchsia-500/20 rounded-3xl p-6 mb-6 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Gift className="w-24 h-24 text-fuchsia-500 transform rotate-12" />
          </div>
          
          <h3 className="font-bold text-lg mb-2 relative z-10">Send the Magic Link</h3>
          <p className="text-xs text-white/50 mb-4 relative z-10">
            Send this via WhatsApp. When they open it, they'll see their gift and enter their delivery address.
          </p>

          <div className="flex gap-2 relative z-10">
            <code className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-xs text-fuchsia-300 truncate">
              {shareUrl}
            </code>
            <button 
              onClick={handleCopy}
              className="px-4 py-3 bg-fuchsia-500 hover:bg-fuchsia-400 transition-colors rounded-xl flex items-center justify-center"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            </button>
          </div>

          <a 
            href={`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 w-full py-3 bg-emerald-500 hover:bg-emerald-400 transition-colors rounded-xl flex items-center justify-center gap-2 font-bold text-sm relative z-10"
          >
            <Share2 className="w-4 h-4" /> Share on WhatsApp
          </a>
        </div>

        <button onClick={() => router.push("/shop")} className="text-white/40 text-sm font-semibold hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto">
          Back to Shop <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
