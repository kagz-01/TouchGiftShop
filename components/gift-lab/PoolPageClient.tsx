"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PoolProgressBar from "@/components/gift-lab/PoolProgressBar";
import PoolContributeForm from "@/components/gift-lab/PoolContributeForm";
import PoolShareLink from "@/components/gift-lab/PoolShareLink";
import PoolContributors from "@/components/gift-lab/PoolContributors";
import { formatKsh } from "@/lib/utils";

interface Pool {
  id: string;
  slug: string;
  title: string;
  current_balance: number;
  target_amount: number;
  status: string;
  expires_at: string;
}

interface Contribution {
  id: string;
  contributor_name: string;
  amount: number;
  is_verified: boolean;
  created_at: string;
}

export default function PoolPage({ slug }: { slug: string }) {
  const searchParams = useSearchParams()!;
  const justPaid = searchParams.get("paid") === "true";

  const [pool, setPool] = useState<Pool | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPool = useCallback(async () => {
    try {
      const res = await fetch(`/api/pools/${slug}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setPool(data.pool);
        setContributions(data.contributions || []);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPool();
  }, [fetchPool]);

  // Auto-refresh after payment — poll 3 times over 6 seconds
  useEffect(() => {
    if (!justPaid) return;
    const timers = [
      setTimeout(fetchPool, 1000),
      setTimeout(fetchPool, 3000),
      setTimeout(fetchPool, 6000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [justPaid, fetchPool]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-brand-muted">Loading pool...</p>
        </div>
      </div>
    );
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-gradient-warm flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl block mb-4"> Pool not found.</span>
          <p className="font-display text-xl font-semibold mb-2">Pool not found</p>
          <Link href="/gift-lab" className="text-sm text-brand hover:underline mt-4 inline-block">
            Back to Gift Lab
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(pool.expires_at) < new Date();
  const isComplete = pool.status === "completed" || pool.current_balance >= pool.target_amount;
  const daysLeft = Math.max(0, Math.ceil((new Date(pool.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Hero */}
      <div className={`relative overflow-hidden ${isComplete ? "bg-gradient-to-br from-brand-forest/90 to-brand-forest" : "bg-gradient-to-br from-brand-dark to-brand"} px-4 py-10 md:py-14`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl animate-float">Pool</div>
          <div className="absolute bottom-10 right-10 text-6xl animate-float" style={{ animationDelay: "1s" }}>Gift</div>
        </div>

        <div className="max-w-lg mx-auto relative z-10">
          <Link href="/gift-lab" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Gift Lab
          </Link>

          {justPaid && (
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-4 mb-6 text-center animate-pop">
              <p className="text-white font-semibold text-sm">Payment confirmed! Pool balance updated.</p>
            </div>
          )}

          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            {pool.title}
          </h1>

          <div className="flex items-center gap-4 text-white/80 text-sm">
            {isComplete ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Target reached!
              </span>
            ) : isExpired ? (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white/50" />
                Pool closed
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
              </span>
            )}
            <span className="text-white/50">|</span>
            <span>{contributions.length} contributor{contributions.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 -mt-4 relative z-10 pb-12">
        <div className="space-y-5">
          {/* Progress */}
          <div className="bg-white rounded-2xl p-6 border border-surface-border shadow-card">
            <PoolProgressBar current={pool.current_balance} target={pool.target_amount} />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-brand-muted">
                {isComplete ? "Goal reached!" : `${formatKsh(pool.target_amount - pool.current_balance)} to go`}
              </span>
              <span className="text-xs font-semibold text-brand">
                {Math.min(100, Math.round((pool.current_balance / pool.target_amount) * 100))}%
              </span>
            </div>
          </div>

          {/* Contribute */}
          {!isComplete && !isExpired && (
            <PoolContributeForm slug={pool.slug} />
          )}

          {/* Share */}
          <PoolShareLink slug={pool.slug} title={pool.title} />

          {/* Contributors */}
          {contributions.length > 0 && (
            <PoolContributors contributions={contributions} />
          )}

          {/* Complete state */}
          {isComplete && (
            <div className="bg-brand-forest/5 border border-brand-forest/20 rounded-2xl p-6 text-center">
              <span className="text-4xl block mb-3">🎉</span>
              <p className="font-display font-bold text-lg mb-1">Target reached!</p>
              <p className="text-sm text-brand-muted">
                The gift will be ordered automatically. The organizer will handle the rest.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
