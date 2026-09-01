"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import {
  Gift, Clock, Users, Heart, Share2, Copy, CheckCircle2,
  Lock, Sparkles, ChevronRight, AlertCircle
} from "lucide-react";

type Pool = {
  id: string; slug: string; title: string; description: string | null;
  recipient_name: string; recipient_photo_url: string | null; occasion: string | null;
  gift_name: string | null; gift_price: number | null; gift_image_url: string | null;
  target_amount: number; current_balance: number; min_contribution: number;
  privacy_mode: "named" | "anonymous"; surprise_mode: boolean;
  voice_message_url: string | null; expires_at: string; status: string;
};
type Contribution = {
  id: string; contributor_name: string | null; amount: number;
  is_anonymous: boolean; is_ghost: boolean; message: string | null; created_at: string;
};

function TimeLeft({ expiresAt }: { expiresAt: string }) {
  const [left, setLeft] = useState("");
  const calc = useCallback(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return setLeft("Expired");
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    if (d > 0) setLeft(`${d}d ${h}h left`);
    else if (h > 0) setLeft(`${h}h ${m}m left`);
    else setLeft(`${m}m left`);
  }, [expiresAt]);
  useEffect(() => { calc(); const t = setInterval(calc, 60000); return () => clearInterval(t); }, [calc]);
  const isUrgent = new Date(expiresAt).getTime() - Date.now() < 86400000;
  return (
    <span className={`flex items-center gap-1 text-sm font-semibold ${isUrgent ? "text-red-500 animate-pulse" : "text-brand-deep/60"}`}>
      <Clock className="w-3.5 h-3.5" />{left}
    </span>
  );
}

function ProgressBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-bold text-brand-deep">KES {current.toLocaleString()}</span>
        <span className="text-brand-deep/50">of KES {target.toLocaleString()}</span>
      </div>
      <div className="h-4 rounded-full bg-brand/10 overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand via-brand-light to-gold transition-all duration-1000 relative"
          style={{ width: `${pct}%` }}
        >
          {pct > 15 && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
          )}
        </div>
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs font-bold text-brand">{pct}% funded</span>
        {pct >= 80 && pct < 100 && <span className="text-xs font-semibold text-gold animate-pulse">Almost there! 🔥</span>}
        {pct >= 100 && <span className="text-xs font-bold text-success">🎉 Goal reached!</span>}
      </div>
    </div>
  );
}

function ContributionFeed({ contributions, privacyMode }: { contributions: Contribution[]; privacyMode: "named" | "anonymous" }) {
  if (contributions.length === 0) {
    return (
      <div className="text-center py-6 text-brand-deep/40 text-sm">
        <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
        Be the first to contribute ✨
      </div>
    );
  }
  return (
    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
      {contributions.map((c, i) => {
        const name = c.is_ghost ? "👻 Anonymous" :
          privacyMode === "anonymous" || c.is_anonymous ? "💛 Contributor" :
          c.contributor_name ?? "Someone";
        const timeAgo = (() => {
          const diff = Date.now() - new Date(c.created_at).getTime();
          if (diff < 60000) return "just now";
          if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
          if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
          return `${Math.floor(diff / 86400000)}d ago`;
        })();
        return (
          <div
            key={c.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-brand/3 hover:bg-brand/5 transition-colors"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand/20 to-gold/20 flex items-center justify-center text-sm font-bold text-brand-deep flex-shrink-0">
              {name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-deep truncate">{name}</p>
              {c.message && <p className="text-xs text-brand-deep/50 italic truncate">&ldquo;{c.message}&rdquo;</p>}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-brand">+{c.amount.toLocaleString()}</p>
              <p className="text-xs text-brand-deep/40">{timeAgo}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function PoolLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [pool, setPool] = useState<Pool | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState("");

  const fetchPool = useCallback(async () => {
    try {
      const res = await fetch(`/api/pools/${slug}`);
      if (!res.ok) { setError("This pool was not found or has been removed."); return; }
      const data = await res.json();
      setPool(data.pool);
      setContributions(data.contributions ?? []);
      setProgressPercent(data.progressPercent ?? 0);
    } catch {
      setError("Could not load this pool.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchPool(); }, [fetchPool]);

  // Realtime updates
  useEffect(() => {
    if (!pool?.id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`public:pool-${pool.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pool_contributions", filter: `pool_id=eq.${pool.id}` }, () => {
        fetchPool();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "pool_contributions", filter: `pool_id=eq.${pool.id}` }, () => {
        fetchPool();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "group_gifting_pools", filter: `id=eq.${pool.id}` }, (payload) => {
        fetchPool();
        // If it just completed
        if (payload.new.status === "completed" && pool.status === "active") {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pool?.id, pool?.status, fetchPool]);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/pool/${slug}` : `/pool/${slug}`;
  const copyLink = () => { navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF5F8] to-[#FDF8F4]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-brand/20 border-t-brand animate-spin mx-auto mb-4" />
          <p className="text-brand-deep/50 text-sm">Loading pool…</p>
        </div>
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF5F8] to-[#FDF8F4] px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-brand-deep mb-2">Pool Not Found</h2>
          <p className="text-brand-deep/60 mb-6">{error || "This gift pool doesn't exist or has been removed."}</p>
          <Link href="/" className="px-6 py-3 bg-brand text-white rounded-2xl font-semibold text-sm">Go Home</Link>
        </div>
      </div>
    );
  }

  const isClosed = !["active"].includes(pool.status);
  const isCompleted = pool.status === "completed" || pool.status === "fulfilled";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] to-[#FDF8F4] relative overflow-hidden">
      {/* Confetti layer */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {Array.from({ length: 30 }).map((_, i) => (
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
              {["🎉", "🎊", "💛", "🌸", "⭐", "💝", "🎁"][Math.floor(Math.random() * 7)]}
            </div>
          ))}
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-brand-deep via-brand to-brand-light overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/20 rounded-full blur-[80px]" />
        <div className="max-w-xl mx-auto px-4 py-10 text-center relative z-10">
          {/* Recipient photo */}
          <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/30 overflow-hidden bg-white/20 flex items-center justify-center shadow-xl">
            {pool.recipient_photo_url
              ? <img src={pool.recipient_photo_url} alt={pool.recipient_name} className="w-full h-full object-cover" />
              : <span className="text-4xl">🎁</span>
            }
          </div>
          {pool.occasion && (
            <div className="inline-block px-3 py-1 bg-white/15 rounded-full text-white/80 text-xs font-semibold mb-3 backdrop-blur-sm">
              {pool.occasion}
            </div>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-bold italic text-white leading-tight">{pool.title}</h1>
          {pool.description && <p className="text-white/70 mt-3 text-sm max-w-sm mx-auto">&ldquo;{pool.description}&rdquo;</p>}
          <div className="mt-4 flex items-center justify-center gap-4">
            <TimeLeft expiresAt={pool.expires_at} />
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1 text-sm text-white/60">
              <Users className="w-3.5 h-3.5" />{contributions.length} contributor{contributions.length !== 1 ? "s" : ""}
            </span>
            {pool.surprise_mode && (
              <>
                <span className="text-white/40">·</span>
                <span className="flex items-center gap-1 text-sm text-white/60"><Gift className="w-3.5 h-3.5" /> Surprise</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-4 pb-24 space-y-4">

        {/* Closed banner */}
        {isClosed && (
          <div className={`rounded-2xl p-4 text-center font-semibold text-sm ${isCompleted ? "bg-success/10 text-success border border-success/20" : "bg-orange-50 text-orange-600 border border-orange-200"}`}>
            {isCompleted ? "🎉 This pool reached its goal!" : pool.status === "expired" ? "⏰ This pool has expired" : "This pool is closed"}
          </div>
        )}

        {/* Progress Card */}
        <div className="bg-white rounded-3xl shadow-card p-6">
          <ProgressBar current={pool.current_balance} target={pool.target_amount} />

          {/* Gift info */}
          {pool.gift_name && !pool.surprise_mode && (
            <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-brand/5">
              {pool.gift_image_url
                ? <img src={pool.gift_image_url} alt="" className="w-14 h-14 object-cover rounded-xl" />
                : <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center"><Sparkles className="w-6 h-6 text-brand/40" /></div>
              }
              <div>
                <p className="text-xs font-semibold text-brand-deep/50 uppercase tracking-wide">The Gift</p>
                <p className="font-semibold text-brand-deep">{pool.gift_name}</p>
                <p className="text-sm text-brand">KES {(pool.gift_price ?? 0).toLocaleString()}</p>
              </div>
            </div>
          )}
          {pool.gift_name && pool.surprise_mode && (
            <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-brand/5">
              <div className="w-14 h-14 rounded-xl bg-brand/10 flex items-center justify-center">
                <Lock className="w-6 h-6 text-brand/40" />
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-deep/50 uppercase tracking-wide">The Gift</p>
                <p className="font-semibold text-brand-deep">🤫 It&apos;s a surprise!</p>
                <p className="text-sm text-brand-deep/50">Revealed when delivered</p>
              </div>
            </div>
          )}
        </div>

        {/* Contribute CTA */}
        {!isClosed && (
          <Link
            href={`/pool/${slug}/contribute`}
            className="group block w-full py-5 bg-gradient-to-r from-brand to-brand-deep text-white rounded-3xl font-bold text-lg text-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              Contribute Now
              <ChevronRight className="w-5 h-5" />
            </span>
            <p className="text-white/60 text-xs font-normal mt-1">Minimum KES {pool.min_contribution.toLocaleString()}</p>
          </Link>
        )}

        {/* Share Row */}
        <div className="flex gap-3">
          <button
            onClick={copyLink}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-brand/10 rounded-2xl text-brand-deep font-semibold text-sm hover:bg-brand/5 transition-colors shadow-sm"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`🎁 ${pool.title}\n\nContribute here: ${shareUrl}`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-2xl font-semibold text-sm hover:bg-green-600 transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" /> WhatsApp
          </a>
        </div>

        {/* Contribution Feed */}
        <div className="bg-white rounded-3xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-brand" />
            <h3 className="font-semibold text-brand-deep">
              {pool.privacy_mode === "anonymous" ? "Contributions" : "Wall of Love"}
            </h3>
            <span className="ml-auto text-xs text-brand-deep/40">{contributions.length} total</span>
          </div>
          <ContributionFeed contributions={contributions} privacyMode={pool.privacy_mode} />
        </div>

      </div>
    </div>
  );
}
