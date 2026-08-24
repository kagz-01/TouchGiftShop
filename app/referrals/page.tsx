"use client";

import { useState, useEffect } from "react";
import { formatKsh } from "@/lib/utils";
import { Copy, Check, Share2, Gift, Users, TrendingUp, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  successfulReferrals: number;
  pointsEarned: number;
  pointsValueKsh: number;
  referralBonusPoints: number;
  conversionMinOrderKsh: number;
  totalEarned: number;
  availableBalance: number;
  recentReferrals: Array<{
    id: string;
    status: string;
    createdAt: string;
    convertedAt: string | null;
    bonusCredited: boolean;
  }>;
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState("");

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          // 401 etc — leave data null, show sign-in prompt
          setError(d.error);
          setLoading(false);
          return;
        }
        setData(d);
        setShareText(
          `Join TouchGift using my referral code ${d.referralCode} and we both get 1,000 pts (≈KSh 500) to spend on gifts! 🎁 https://touchgiftshop.ac.ke/ref/${d.referralCode}`
        );
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleCopy() {
    if (!data) return;
    navigator.clipboard?.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join TouchGift",
          text: shareText,
        });
      } catch {}
    } else {
      navigator.clipboard?.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen section-theme-e flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen section-theme-e flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <span className="text-4xl block mb-4">🎁</span>
          <p className="font-display text-lg font-bold text-brand-deep mb-2">Sign in to Refer &amp; Earn</p>
          <p className="text-sm text-brand-muted mb-6">
            Create an account or sign in to get your referral code and start earning.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/login?next=/referrals"
              className="px-6 py-3 bg-brand text-white rounded-2xl font-semibold text-sm hover:bg-brand-deep transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/login?mode=signup&next=/referrals"
              className="px-6 py-3 border-2 border-brand text-brand rounded-2xl font-semibold text-sm hover:bg-brand/5 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen section-theme-e flex items-center justify-center px-4 text-center">
        <p className="text-brand-muted">Failed to load referral data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-theme-e">
      <div className="page-container-capped py-6 md:py-10 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/account" className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" /> Account
          </Link>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-brand to-brand-deep rounded-3xl p-6 md:p-8 text-white text-center">
          <Gift className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Refer & Earn</h1>
          <p className="text-white/70 text-sm mb-6">
            Share TouchGift with friends. You both earn 1,000 pts (≈KSh 500) when their first order is KSh 1,000+.
          </p>

          {/* Referral code */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Your referral code</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-wider">{data.referralCode}</span>
              <button
                onClick={handleCopy}
                className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              className="flex-1 py-3 bg-white text-brand-deep rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/90 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share via WhatsApp
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-3 bg-white/10 rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Referrals", value: data.totalReferrals, icon: Users },
            { label: "Successful", value: data.successfulReferrals, icon: Check },
            { label: "Points Earned", value: `${data.pointsEarned.toLocaleString()} pts`, icon: TrendingUp },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-black/6 shadow-sm p-4 text-center">
              <stat.icon className="w-5 h-5 text-brand mx-auto mb-2" />
              <p className="font-bold text-brand-deep text-lg">{stat.value}</p>
              <p className="text-[10px] text-brand-muted uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Points explainer */}
        <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4 space-y-1.5">
          <p className="text-sm font-semibold text-brand-deep">
            🎉 Both sides earn {data.referralBonusPoints.toLocaleString()} pts
            <span className="text-brand-muted font-normal"> (≈ KSh {Math.round(data.referralBonusPoints / 2).toLocaleString()})</span>
          </p>
          <p className="text-xs text-brand-muted">
            Points land when your friend&apos;s <strong>first order of KSh {data.conversionMinOrderKsh.toLocaleString()}+</strong> is paid.
            Redeem points at checkout: 2 pts = KSh 1, up to half your order.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-black/6 shadow-sm p-5 space-y-4">
          <h2 className="font-display font-bold text-brand-deep">How it works</h2>
          <div className="space-y-3">
            {[
              { step: "1", title: "Share your code", desc: "Send your unique referral code to friends" },
              { step: "2", title: "They sign up", desc: "Your friend creates an account using your code" },
              { step: "3", title: "They order", desc: "When they complete their first order, you both earn 1,000 pts (≈KSh 500)" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-7 h-7 bg-brand/10 text-brand rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-deep">{item.title}</p>
                  <p className="text-xs text-brand-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent referrals */}
        {data.recentReferrals.length > 0 && (
          <div className="bg-white rounded-2xl border border-black/6 shadow-sm p-5 space-y-3">
            <h2 className="font-display font-bold text-brand-deep">Recent Referrals</h2>
            {data.recentReferrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                <div>
                  <p className="text-sm font-medium text-brand-deep capitalize">{ref.status}</p>
                  <p className="text-xs text-brand-muted">{new Date(ref.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  ref.status === "converted"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {ref.bonusCredited ? "1,000 pts earned" : ref.status === "converted" ? "Converted" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
