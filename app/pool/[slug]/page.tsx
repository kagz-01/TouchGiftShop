"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import {
  Gift, Clock, Users, Heart, Share2, Copy, CheckCircle2,
  Lock, Sparkles, ChevronRight, AlertCircle, Vote, QrCode, X
} from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import QRCode from "react-qr-code";

type Pool = {
  id: string; slug: string; title: string; description: string | null;
  recipient_name: string; recipient_photo_url: string | null; occasion: string | null;
  gift_name: string | null; gift_price: number | null; gift_image_url: string | null;
  target_amount: number; current_balance: number; min_contribution: number;
  privacy_mode: "named" | "anonymous"; surprise_mode: boolean;
  voice_message_url: string | null; expires_at: string; status: string;
  is_poll_mode: boolean;
  poll_options: Array<{ name: string; price: number; imageUrl?: string }> | null;
};
type Contribution = {
  id: string; contributor_name: string | null; amount: number;
  is_anonymous: boolean; is_ghost: boolean; message: string | null;
  created_at: string; poll_vote_index: number | null;
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
    <span className={`flex items-center gap-1 text-sm font-semibold ${isUrgent ? "text-red-400 animate-pulse" : "text-white/60"}`}>
      <Clock className="w-3.5 h-3.5" />{left}
    </span>
  );
}

function PollBallot({
  options, contributions, isClosed, slug
}: {
  options: Array<{ name: string; price: number; imageUrl?: string }>;
  contributions: Contribution[];
  isClosed: boolean;
  slug: string;
}) {
  // Calculate vote totals by KES weight per option
  const voteTotals = options.map((_, idx) =>
    contributions
      .filter(c => c.poll_vote_index === idx && !c.is_ghost)
      .reduce((sum, c) => sum + Number(c.amount), 0)
  );
  const grandTotal = voteTotals.reduce((s, v) => s + v, 0);
  const leadingIdx = voteTotals.indexOf(Math.max(...voteTotals));

  const OPTION_COLORS = [
    "from-fuchsia-500 to-pink-500",
    "from-blue-500 to-cyan-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500",
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Vote className="w-4 h-4 text-fuchsia-400" />
        <span className="text-sm font-bold text-white">Gift Poll — vote with your contribution</span>
      </div>
      {options.map((opt, idx) => {
        const pct = grandTotal > 0 ? Math.round((voteTotals[idx] / grandTotal) * 100) : 0;
        const isLeading = idx === leadingIdx && grandTotal > 0;
        return (
          <div key={idx} className={`relative overflow-hidden rounded-2xl border-2 transition-all ${
            isLeading ? "border-fuchsia-400/60 shadow-[0_0_20px_rgba(217,70,239,0.2)]" : "border-white/10"
          }`}>
            {/* Vote bar background */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${OPTION_COLORS[idx]} opacity-10 transition-all duration-1000`}
              style={{ width: `${pct}%` }}
            />
            <div className="relative p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${OPTION_COLORS[idx]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {idx + 1}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{opt.name}</p>
                  <p className="text-xs text-white/50">KES {opt.price.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                {isLeading && grandTotal > 0 && (
                  <div className="text-[10px] font-bold text-fuchsia-300 mb-0.5 animate-pulse">🔥 Leading</div>
                )}
                <span className={`text-lg font-bold ${isLeading && grandTotal > 0 ? "text-fuchsia-300" : "text-white/60"}`}>
                  {pct}%
                </span>
                <p className="text-[10px] text-white/40">{voteTotals[idx] > 0 ? `KES ${voteTotals[idx].toLocaleString()}` : "No votes yet"}</p>
              </div>
            </div>
            {!isClosed && (
              <a
                href={`/pool/${slug}/contribute?vote=${idx}`}
                className={`block w-full py-2 text-center text-xs font-bold bg-gradient-to-r ${OPTION_COLORS[idx]} text-white hover:opacity-90 transition-opacity`}
              >
                Vote for this →
              </a>
            )}
          </div>
        );
      })}
      {grandTotal > 0 && (
        <p className="text-center text-xs text-white/30 pt-1">
          {contributions.filter(c => c.poll_vote_index !== null).length} votes · KES {grandTotal.toLocaleString()} pledged
        </p>
      )}
    </div>
  );
}

function ProgressBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min(100, Math.round((current / target) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-bold text-white">KES {current.toLocaleString()}</span>
        <span className="text-white/40">of KES {target.toLocaleString()}</span>
      </div>
      <div className="h-4 rounded-full bg-white/10 overflow-hidden relative">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-fuchsia-400 to-pink-400 transition-all duration-1000 relative"
          style={{ width: `${pct}%` }}
        >
          {pct > 15 && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
          )}
        </div>
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs font-bold text-fuchsia-400">{pct}% funded</span>
        {pct >= 80 && pct < 100 && <span className="text-xs font-semibold text-gold animate-pulse">Almost there! 🔥</span>}
        {pct >= 100 && <span className="text-xs font-bold text-emerald-400">🎉 Goal reached!</span>}
      </div>
    </div>
  );
}

function ContributionFeed({ contributions, privacyMode }: { contributions: Contribution[]; privacyMode: "named" | "anonymous" }) {
  if (contributions.length === 0) {
    return (
      <div className="text-center py-6 text-white/30 text-sm">
        <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
        Be the first to contribute ✨
      </div>
    );
  }

  // Wall of Love Mosaic
  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {contributions.map((c, i) => {
          const name = c.is_ghost ? "👻" :
            privacyMode === "anonymous" || c.is_anonymous ? "💛" :
            c.contributor_name ?? "Someone";
          const initial = name.length > 2 ? name[0].toUpperCase() : name;
          return (
            <div
              key={c.id}
              title={`${name} — KES ${c.amount.toLocaleString()}`}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center text-sm font-bold text-fuchsia-300 border border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.1)] hover:scale-110 transition-transform cursor-default"
              style={{ animation: `popIn 0.5s ease-out ${i * 0.05}s both` }}
            >
              {initial}
            </div>
          );
        })}
      </div>

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
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/8 transition-colors"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{name}</p>
                {c.message && <p className="text-xs text-white/40 italic truncate">&ldquo;{c.message}&rdquo;</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-fuchsia-400">+{c.amount.toLocaleString()}</p>
                <p className="text-xs text-white/30">{timeAgo}</p>
              </div>
            </div>
          );
        })}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}} />
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [error, setError] = useState("");
  const { width, height } = useWindowSize();

  const fetchPool = useCallback(async () => {
    try {
      const res = await fetch(`/api/pools/${slug}`);
      if (!res.ok) { setError("This pool was not found or has been removed."); return; }
      const data = await res.json();
      setPool(data.pool);
      setContributions(data.contributions ?? []);
      setProgressPercent(data.progressPercent ?? 0);
      
      // Auto-trigger confetti if it just loaded and is fully funded
      if (data.progressPercent >= 100 && !showConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 8000);
      }
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
    if (typeof window === "undefined" || !("WebSocket" in window)) return;

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    try {
      channel = supabase
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
    } catch {
      // skip realtime if not available
    }

    return () => {
      if (channel) {
        try { supabase.removeChannel(channel); } catch { /* ignore */ }
      }
    };
  }, [pool?.id, pool?.status, fetchPool]);

  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/pool/${slug}` : `/pool/${slug}`;
  const copyLink = () => { navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#14080D]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading pool…</p>
        </div>
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#14080D] px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-white mb-2">Pool Not Found</h2>
          <p className="text-white/50 mb-6">{error || "This gift pool doesn&apos;t exist or has been removed."}</p>
          <Link href="/" className="px-6 py-3 bg-fuchsia-500 text-white rounded-2xl font-semibold text-sm hover:bg-fuchsia-600 transition-colors">Go Home</Link>
        </div>
      </div>
    );
  }

  const isClosed = !["active"].includes(pool.status);
  const isCompleted = pool.status === "completed" || pool.status === "fulfilled";

  return (
    <div className="min-h-screen bg-[#14080D] relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-fuchsia-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Confetti layer */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={400}
            gravity={0.15}
            colors={['#d946ef', '#ec4899', '#fcd34d', '#3b82f6', '#10b981']}
          />
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-[#1F0A1C] via-fuchsia-950 to-[#14080D] overflow-hidden border-b border-fuchsia-500/10">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px]" />
        <div className="max-w-xl mx-auto px-4 py-10 text-center relative z-10">
          {/* Recipient avatar */}
          <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-fuchsia-500/30 overflow-hidden bg-fuchsia-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(217,70,239,0.3)]">
            {pool.recipient_photo_url
              ? <img src={pool.recipient_photo_url} alt={pool.recipient_name} className="w-full h-full object-cover" />
              : <span className="text-4xl">🎁</span>
            }
          </div>
          {pool.occasion && (
            <div className="inline-block px-3 py-1 bg-fuchsia-500/15 rounded-full text-fuchsia-300 text-xs font-semibold mb-3 border border-fuchsia-500/20">
              {pool.occasion}
            </div>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-bold italic text-white leading-tight">{pool.title}</h1>
          {pool.description && <p className="text-white/60 mt-3 text-sm max-w-sm mx-auto">&ldquo;{pool.description}&rdquo;</p>}
          <div className="mt-4 flex items-center justify-center gap-4">
            <TimeLeft expiresAt={pool.expires_at} />
            <span className="text-white/20">·</span>
            <span className="flex items-center gap-1 text-sm text-white/50">
              <Users className="w-3.5 h-3.5" />{contributions.length} contributor{contributions.length !== 1 ? "s" : ""}
            </span>
            {pool.surprise_mode && (
              <>
                <span className="text-white/20">·</span>
                <span className="flex items-center gap-1 text-sm text-white/50"><Gift className="w-3.5 h-3.5" /> Surprise</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 -mt-4 pb-24 space-y-4">

        {/* Closed banner */}
        {isClosed && (
          <div className={`rounded-2xl p-4 text-center font-semibold text-sm ${
            isCompleted
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {isCompleted ? "🎉 This pool reached its goal!" : pool.status === "expired" ? "⏰ This pool has expired" : "This pool is closed"}
          </div>
        )}

        {/* Progress Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6">
          <ProgressBar current={pool.current_balance} target={pool.target_amount} />

          {/* Gift info or Poll Ballot */}
          {pool.is_poll_mode && pool.poll_options && pool.poll_options.length > 0 ? (
            <div className="mt-5">
              <PollBallot
                options={pool.poll_options}
                contributions={contributions}
                isClosed={isClosed}
                slug={slug as string}
              />
            </div>
          ) : (
            <>
              {pool.gift_name && !pool.surprise_mode && (
                <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-fuchsia-500/5 border border-fuchsia-500/10">
                  {pool.gift_image_url
                    ? <img src={pool.gift_image_url} alt="" className="w-14 h-14 object-cover rounded-xl" />
                    : <div className="w-14 h-14 rounded-xl bg-fuchsia-500/10 flex items-center justify-center"><Sparkles className="w-6 h-6 text-fuchsia-400/40" /></div>
                  }
                  <div>
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">The Gift</p>
                    <p className="font-semibold text-white">{pool.gift_name}</p>
                    <p className="text-sm text-fuchsia-400">KES {(pool.gift_price ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              )}
              {pool.gift_name && pool.surprise_mode && (
                <div className="mt-5 flex items-center gap-3 p-3 rounded-2xl bg-fuchsia-500/5 border border-fuchsia-500/10">
                  <div className="w-14 h-14 rounded-xl bg-fuchsia-500/10 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-fuchsia-400/40" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/40 uppercase tracking-wide">The Gift</p>
                    <p className="font-semibold text-white">🤫 It&apos;s a surprise!</p>
                    <p className="text-sm text-white/40">Revealed when delivered</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Contribute CTA */}
        {!isClosed && (
          <Link
            href={`/pool/${slug}/contribute`}
            className="group block w-full py-5 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white rounded-3xl font-bold text-lg text-center shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:shadow-[0_0_40px_rgba(217,70,239,0.5)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
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

        {/* Share Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-semibold hover:bg-white/10 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          Share Pool
        </button>

        {/* Organizer link */}
        <div className="text-center">
          <Link
            href={`/pool/${slug}/manage`}
            className="inline-flex items-center gap-1.5 text-xs text-white/20 hover:text-fuchsia-400 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Organizer? Manage this pool
          </Link>
        </div>

        {/* Contribution Feed */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-fuchsia-400" />
            <h3 className="font-semibold text-white">
              {pool.privacy_mode === "anonymous" ? "Contributions" : "Wall of Love"}
            </h3>
            <span className="ml-auto text-xs text-white/30">{contributions.length} total</span>
          </div>
          <ContributionFeed contributions={contributions} privacyMode={pool.privacy_mode} />
        </div>

      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#1A0B14] border border-white/10 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Share this pool</h3>
            <p className="text-sm text-white/50 mb-6">Invite friends and family to chip in.</p>

            <div className="bg-white p-4 rounded-2xl mb-6 mx-auto w-fit">
              <QRCode value={shareUrl} size={160} />
            </div>

            <div className="space-y-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`🎁 ${pool.title}\n\nWe're collecting for ${pool.recipient_name}'s gift! Chip in here: ${shareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                <Share2 className="w-4 h-4" /> Share on WhatsApp
              </a>
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Link Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
