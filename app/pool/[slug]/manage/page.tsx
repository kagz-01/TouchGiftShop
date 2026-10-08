"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, TrendingUp, Share2, Copy, Check,
  Clock, Target, Zap, Crown, Gift, MessageSquare,
  RefreshCw, CheckCircle, AlertCircle, ExternalLink,
  Trophy, Flame, Heart, Lock, Calendar, DollarSign,
  RotateCcw, Bell, ChevronRight, XCircle
} from "lucide-react";

type Contribution = {
  id: string;
  contributor_name?: string;
  amount: number;
  is_verified: boolean;
  is_anonymous: boolean;
  is_ghost: boolean;
  message?: string;
  created_at: string;
};

type Pool = {
  id: string;
  title: string;
  slug: string;
  recipient_name: string;
  occasion?: string;
  target_amount: number;
  current_balance: number;
  min_contribution: number;
  expires_at?: string;
  status: string;
  privacy_mode: string;
  surprise_mode: boolean;
  gift_name?: string;
  gift_price?: number;
  is_corporate: boolean;
};

const MILESTONE_THRESHOLDS = [25, 50, 75, 100];

function MilestoneRing({ pct }: { pct: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const filled = (Math.min(pct, 100) / 100) * circ;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="url(#poolGrad)" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="poolGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black text-white">{Math.round(Math.min(pct, 100))}%</span>
        <span className="text-[10px] text-white/40 font-medium">funded</span>
      </div>
    </div>
  );
}

function TimeLeft({ expiresAt }: { expiresAt?: string }) {
  const [label, setLabel] = useState("");
  useEffect(() => {
    if (!expiresAt) { setLabel("No deadline"); return; }
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setLabel("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setLabel(d > 0 ? `${d}d ${h}h left` : `${h}h ${m}m left`);
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return <span>{label}</span>;
}

export default function PoolManagePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const [pool, setPool] = useState<Pool | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "leaderboard" | "messages" | "audit">("overview");
  const [unlockedMilestones, setUnlockedMilestones] = useState<number[]>([]);
  const [closeAction, setCloseAction] = useState<"extend" | "downgrade" | "refund" | null>(null);
  const [extendDate, setExtendDate] = useState("");
  const [closeLoading, setCloseLoading] = useState(false);
  const [closeResult, setCloseResult] = useState<string | null>(null);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeSent, setNudgeSent] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const res = await fetch(`/api/pools/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setPool(data.pool);
        setContributions(data.contributions ?? []);
        const pct = data.progressPercent ?? 0;
        setUnlockedMilestones(MILESTONE_THRESHOLDS.filter((t) => pct >= t));
      } else {
        router.push("/");
      }
    } catch { /* noop */ }
    setLoading(false);
    setRefreshing(false);
  }, [slug, router]);

  useEffect(() => { load(); }, [load]);

  const copyLink = async () => {
    const url = `${window.location.origin}/pool/${slug}`;
    try { await navigator.clipboard.writeText(url); }
    catch {
      const el = document.createElement("input");
      el.value = url; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseAction = async () => {
    if (!closeAction || !pool) return;
    setCloseLoading(true);
    try {
      const res = await fetch(`/api/pools/${slug}/close-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: closeAction, newDeadline: extendDate || undefined }),
      });
      if (res.ok) {
        setCloseResult(closeAction);
        await load(true);
      }
    } catch { /* noop */ } finally { setCloseLoading(false); }
  };

  const handleNudge = async () => {
    setNudgeLoading(true);
    try {
      const res = await fetch(`/api/pools/${slug}/nudge`, { method: "POST" });
      if (res.ok) setNudgeSent(true);
    } catch { /* noop */ } finally { setNudgeLoading(false); }
  };

  const shareWhatsApp = () => {
    const url = `${window.location.origin}/pool/${slug}`;
    const text = `🎁 ${pool?.title}\n\nHelp us reach the goal! Contribute here:\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#14080D] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!pool) return null;

  const pct = pool.target_amount > 0 ? (pool.current_balance / pool.target_amount) * 100 : 0;
  const isActive = pool.status === "active";
  const isCompleted = pool.status === "completed";
  const isExpired = pool.status === "expired";
  const isRefunded = pool.status === "refunded";
  const totalRaised = pool.current_balance;
  const remaining = Math.max(0, pool.target_amount - totalRaised);
  const canNudge = pct >= 70 && pct < 100 && isActive;

  // Leaderboard (named contributors, sorted by amount)
  const named = contributions
    .filter((c) => !c.is_anonymous && !c.is_ghost && c.contributor_name)
    .reduce<Record<string, { name: string; total: number; count: number }>>((acc, c) => {
      const n = c.contributor_name!;
      if (!acc[n]) acc[n] = { name: n, total: 0, count: 0 };
      acc[n].total += c.amount;
      acc[n].count += 1;
      return acc;
    }, {});
  const leaderboard = Object.values(named).sort((a, b) => b.total - a.total);

  // Messages wall
  const messages = contributions.filter((c) => c.message?.trim());

  // Stats
  const verified = contributions.filter((c) => c.is_verified);
  const avgContrib = verified.length > 0
    ? Math.round(verified.reduce((s, c) => s + c.amount, 0) / verified.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#14080D] text-white pb-24">
      {/* ── Sticky Header ── */}
      <div className="bg-[#14080D]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display italic font-bold text-white text-lg leading-tight">{pool.title}</h1>
              <p className="text-xs text-rose-400">Organizer Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(true)}
              className="p-2 bg-white/5 border border-white/10 rounded-xl hover:border-rose-400/30 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-white/60 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <Link
              href={`/pool/${slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white/60 hover:border-rose-400/30 hover:text-white transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Public View
            </Link>
          </div>
        </div>

        {/* Status banner */}
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl font-semibold ${
            isCompleted ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
            isActive    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
            isRefunded  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
          }`}>
            {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> :
             isActive    ? <Flame className="w-3.5 h-3.5" />       :
             isRefunded  ? <RotateCcw className="w-3.5 h-3.5" />   :
                           <AlertCircle className="w-3.5 h-3.5" />}
            {isCompleted ? "🎉 Goal reached! Ready to order the gift." :
             isActive    ? <span>Live · <TimeLeft expiresAt={pool.expires_at} /></span> :
             isRefunded  ? "All contributions refunded." :
                           "Pool expired — choose what to do next"}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1 border-b border-white/10 overflow-x-auto scrollbar-hide">
            {[
              { id: "overview",    label: "Overview",    icon: <TrendingUp className="w-3.5 h-3.5" /> },
              { id: "leaderboard", label: "Leaderboard", icon: <Trophy className="w-3.5 h-3.5" /> },
              { id: "messages",    label: "Messages",    icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: "audit",       label: "Audit Trail", icon: <DollarSign className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-rose-400 text-rose-400"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                {tab.icon} {tab.label}
                {tab.id === "messages" && messages.length > 0 && (
                  <span className="ml-1 text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded-full">{messages.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ═══ OVERVIEW ═══ */}
        {activeTab === "overview" && (
          <>
            {/* Progress ring + stats */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6">
              <MilestoneRing pct={pct} />

              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="text-center p-3 bg-black/30 rounded-2xl border border-white/5">
                  <p className="text-lg font-bold text-rose-400">KES {totalRaised.toLocaleString()}</p>
                  <p className="text-[10px] text-white/40">Raised</p>
                </div>
                <div className="text-center p-3 bg-black/30 rounded-2xl border border-white/5">
                  <p className="text-lg font-bold text-white">{contributions.length}</p>
                  <p className="text-[10px] text-white/40">Contributors</p>
                </div>
                <div className="text-center p-3 bg-black/30 rounded-2xl border border-white/5">
                  <p className="text-lg font-bold text-amber-400">KES {remaining.toLocaleString()}</p>
                  <p className="text-[10px] text-white/40">To Go</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="p-3 bg-black/30 rounded-2xl border border-white/5">
                  <p className="text-xs text-white/40 mb-0.5">Goal</p>
                  <p className="text-sm font-bold text-white">KES {pool.target_amount.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-black/30 rounded-2xl border border-white/5">
                  <p className="text-xs text-white/40 mb-0.5">Avg Contribution</p>
                  <p className="text-sm font-bold text-emerald-400">KES {avgContrib.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Milestone unlocks */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Milestone Unlocks</h3>
              </div>
              <div className="space-y-3">
                {[
                  { pct: 25, label: "Quarter way!", reward: "First shout-out unlocked 🎉", icon: "🌱" },
                  { pct: 50, label: "Halfway there!", reward: "Share badge unlocked 🏅", icon: "⚡" },
                  { pct: 75, label: "Almost there!", reward: "Express delivery eligible 🚀", icon: "🔥" },
                  { pct: 100, label: "Goal reached!", reward: "Order the gift now! 🎁", icon: "🏆" },
                ].map((m) => {
                  const unlocked = unlockedMilestones.includes(m.pct);
                  return (
                    <div
                      key={m.pct}
                      className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${
                        unlocked
                          ? "bg-rose-500/10 border-rose-500/30 shadow-[0_0_10px_rgba(217,70,239,0.1)]"
                          : "bg-black/20 border-white/5 opacity-60"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                        unlocked ? "bg-rose-500/20" : "bg-white/5"
                      }`}>
                        {unlocked ? m.icon : <Lock className="w-4 h-4 text-white/20" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${unlocked ? "text-white" : "text-white/40"}`}>
                          {m.pct}% — {m.label}
                        </p>
                        <p className={`text-xs ${unlocked ? "text-rose-300" : "text-white/20"}`}>
                          {m.reward}
                        </p>
                      </div>
                      {unlocked && <CheckCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Share & Action strip */}
            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-rose-400" /> Spread the word
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={copyLink}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    copied
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/5 border border-white/10 text-white hover:border-rose-400/30"
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={shareWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20B858] transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </div>

            {/* 80% Nudge button */}
            {canNudge && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Flame className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">Almost There — {Math.round(pct)}% funded!</p>
                  <p className="text-xs text-white/50">Send yourself an "Almost There" nudge to share with friends.</p>
                </div>
                <button
                  onClick={handleNudge}
                  disabled={nudgeLoading || nudgeSent}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-50 shrink-0"
                >
                  {nudgeSent ? <><Check className="w-3.5 h-3.5" /> Sent!</> : nudgeLoading ? "…" : <><Bell className="w-3.5 h-3.5" /> Nudge</>}
                </button>
              </div>
            )}

            {/* Order CTA when completed */}
            {isCompleted && (
              <div className="bg-gradient-to-r from-rose-600/20 to-orange-500/20 border border-rose-500/30 rounded-3xl p-6 text-center shadow-[0_0_30px_rgba(217,70,239,0.1)]">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="font-display italic text-xl font-bold text-white mb-1">Goal Reached!</h3>
                <p className="text-white/60 text-sm mb-4">
                  KES {totalRaised.toLocaleString()} collected from {contributions.length} contributors.
                  Time to order the gift!
                </p>
                <Link
                  href={`/corporate/pool/${slug}/order`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-2xl font-bold text-sm hover:from-rose-600 hover:to-orange-600 transition-all shadow-lg"
                >
                  <Gift className="w-4 h-4" /> Order the Gift
                </Link>
              </div>
            )}

            {/* Expired Pool — Choose Action */}
            {isExpired && !closeResult && (
              <div className="border border-amber-500/30 rounded-3xl overflow-hidden">
                <div className="bg-amber-500/10 px-6 py-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">Pool Deadline Reached</p>
                    <p className="text-xs text-white/50">KES {totalRaised.toLocaleString()} of KES {pool.target_amount.toLocaleString()} raised ({Math.round(pct)}%). Choose what to do next.</p>
                  </div>
                </div>
                <div className="p-5 space-y-3 bg-black/30">
                  {/* Option cards */}
                  {([
                    {
                      id: "extend" as const,
                      icon: <Calendar className="w-5 h-5 text-sky-400" />,
                      bg: "bg-sky-500/10 border-sky-500/20",
                      activeBg: "bg-sky-500/20 border-sky-500/50",
                      title: "Extend Deadline",
                      desc: "Pick a new date — contributors get notified to come back.",
                    },
                    {
                      id: "downgrade" as const,
                      icon: <Gift className="w-5 h-5 text-emerald-400" />,
                      bg: "bg-emerald-500/10 border-emerald-500/20",
                      activeBg: "bg-emerald-500/20 border-emerald-500/50",
                      title: "Proceed with Current Amount",
                      desc: `Order a gift within the KES ${totalRaised.toLocaleString()} budget you've already raised.`,
                    },
                    {
                      id: "refund" as const,
                      icon: <RotateCcw className="w-5 h-5 text-red-400" />,
                      bg: "bg-red-500/10 border-red-500/20",
                      activeBg: "bg-red-500/20 border-red-500/50",
                      title: "Refund All Contributors",
                      desc: `Auto-refund KES ${totalRaised.toLocaleString()} to all ${contributions.length} contributors.`,
                    },
                  ] as const).map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setCloseAction(closeAction === opt.id ? null : opt.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                        closeAction === opt.id ? opt.activeBg : opt.bg
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-black/20 flex items-center justify-center shrink-0 mt-0.5">{opt.icon}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{opt.title}</p>
                        <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{opt.desc}</p>
                        {opt.id === "extend" && closeAction === "extend" && (
                          <input
                            type="date"
                            value={extendDate}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={e => setExtendDate(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="mt-3 w-full px-3 py-2 rounded-xl bg-black/40 border border-sky-500/30 text-white text-sm focus:outline-none focus:border-sky-400"
                          />
                        )}
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center ${
                        closeAction === opt.id ? "border-rose-400 bg-rose-400" : "border-white/20"
                      }`}>
                        {closeAction === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={handleCloseAction}
                    disabled={!closeAction || closeLoading || (closeAction === "extend" && !extendDate)}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-orange-600 text-white rounded-2xl font-bold text-sm hover:from-rose-700 hover:to-orange-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {closeLoading ? "Processing…" : closeAction === "extend" ? "Extend Pool" : closeAction === "downgrade" ? "Proceed with Gift" : closeAction === "refund" ? "Refund All" : "Select an option"}
                    {!closeLoading && closeAction && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* After action confirmation */}
            {closeResult && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 text-center">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="font-bold text-white">
                  {closeResult === "extended" ? "Deadline Extended! Pool is live again." :
                   closeResult === "downgraded" ? "Done! Proceed to order a gift." :
                   "Refunds initiated. Contributors will be notified."}
                </p>
              </div>
            )}

            {isRefunded && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-6 text-center">
                <RotateCcw className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-white">All contributions have been refunded.</p>
                <p className="text-xs text-white/50 mt-1">KES {totalRaised.toLocaleString()} returned to {contributions.length} contributors.</p>
              </div>
            )}
          </>
        )}

        {/* ═══ LEADERBOARD ═══ */}
        {activeTab === "leaderboard" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Contributor Leaderboard</h2>
              <span className="text-xs text-white/40">{contributions.length} total</span>
            </div>

            {leaderboard.length === 0 && (
              <div className="bg-white/5 rounded-3xl border border-white/10 p-12 text-center">
                <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No named contributions yet.</p>
                <p className="text-xs text-white/20 mt-1">
                  {pool.privacy_mode === "anonymous" ? "This pool is anonymous." : "Share the link to get contributors!"}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {leaderboard.map((c, i) => (
                <div
                  key={c.name}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    i === 0 ? "bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]" :
                    i === 1 ? "bg-white/5 border-white/10" :
                    i === 2 ? "bg-orange-500/5 border-orange-500/10" :
                              "bg-black/20 border-white/5"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                    i === 0 ? "bg-amber-400/20 text-amber-400" :
                    i === 1 ? "bg-white/10 text-white/60" :
                    i === 2 ? "bg-orange-500/20 text-orange-400" :
                              "bg-white/5 text-white/30"
                  }`}>
                    {i < 3 ? <Trophy className="w-5 h-5" /> : `#${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-white/40">
                      {c.count} contribution{c.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-rose-400">KES {c.total.toLocaleString()}</p>
                    <p className="text-[10px] text-white/30">
                      {pool.target_amount > 0 ? `${Math.round((c.total / pool.target_amount) * 100)}% of goal` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Anonymous + ghost count */}
            {contributions.filter((c) => c.is_anonymous || c.is_ghost).length > 0 && (
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white/30" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/60">
                    + {contributions.filter((c) => c.is_anonymous || c.is_ghost).length} anonymous supporter{contributions.filter((c) => c.is_anonymous || c.is_ghost).length !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-white/30">Hidden to respect privacy settings</p>
                </div>
              </div>
            )}

            {/* Quick stat */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <p className="text-xl font-bold text-rose-400">
                  {leaderboard.length > 0 ? `KES ${leaderboard[0].total.toLocaleString()}` : "—"}
                </p>
                <p className="text-xs text-white/40 mt-0.5">Top contribution</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                <p className="text-xl font-bold text-emerald-400">
                  KES {contributions.length > 0 ? Math.round(contributions.reduce((s,c) => s+c.amount,0)/contributions.length).toLocaleString() : 0}
                </p>
                <p className="text-xs text-white/40 mt-0.5">Average gift</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MESSAGES ═══ */}
        {activeTab === "messages" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Wall of Love 💌</h2>
              <span className="text-xs text-white/40">{messages.length} messages</span>
            </div>

            {messages.length === 0 && (
              <div className="bg-white/5 rounded-3xl border border-white/10 p-12 text-center">
                <MessageSquare className="w-10 h-10 text-white/20 mx-auto mb-3" />
                <p className="text-sm text-white/40">No messages yet.</p>
                <p className="text-xs text-white/20 mt-1">Contributors can leave a message when they contribute.</p>
              </div>
            )}

            <div className="space-y-3">
              {messages.map((c) => {
                const name = c.is_anonymous || c.is_ghost ? "Someone special" : (c.contributor_name ?? "Anonymous");
                const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
                const timeAgo = (() => {
                  const diff = Date.now() - new Date(c.created_at).getTime();
                  const h = Math.floor(diff / 3600000);
                  const d = Math.floor(h / 24);
                  return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : "Just now";
                })();
                return (
                  <div key={c.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {c.is_anonymous || c.is_ghost ? "♥" : initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-xs font-semibold text-white">{name}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-rose-400 font-bold">KES {c.amount.toLocaleString()}</span>
                            <span className="text-[10px] text-white/30">{timeAgo}</span>
                          </div>
                        </div>
                        <p className="text-sm text-white/70 italic leading-relaxed">&ldquo;{c.message}&rdquo;</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ AUDIT TRAIL ═══ */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Money Trail</h2>
              <span className="text-xs text-white/40">{contributions.filter(c => c.is_verified).length} verified payments</span>
            </div>

            {/* Summary bar */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Total collected</span>
                <span className="font-bold text-emerald-400">KES {totalRaised.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Goal</span>
                <span className="font-bold text-white">KES {pool.target_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Verified contributions</span>
                <span className="font-bold text-rose-400">{contributions.filter(c => c.is_verified).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Pending verification</span>
                <span className="font-bold text-amber-400">{contributions.filter(c => !c.is_verified).length}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Status</span>
                <span className={`font-bold capitalize ${
                  pool.status === "active" ? "text-rose-400" :
                  pool.status === "completed" ? "text-emerald-400" :
                  pool.status === "expired" ? "text-amber-400" :
                  pool.status === "refunded" ? "text-blue-400" : "text-white/50"
                }`}>{pool.status}</span>
              </div>
            </div>

            {/* Per-contribution ledger */}
            <div className="space-y-2">
              {contributions.length === 0 && (
                <div className="bg-white/5 rounded-3xl border border-white/10 p-12 text-center">
                  <DollarSign className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">No contributions yet.</p>
                </div>
              )}
              {contributions.map((c, i) => {
                const name = c.is_anonymous || c.is_ghost ? "Anonymous" : (c.contributor_name ?? "Unknown");
                const date = new Date(c.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={c.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 text-xs font-bold text-rose-400">#{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{name}</p>
                      <p className="text-xs text-white/30">{date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-emerald-400">KES {c.amount.toLocaleString()}</p>
                      <p className={`text-[10px] font-semibold ${
                        c.is_verified ? "text-emerald-400" : "text-amber-400"
                      }`}>{c.is_verified ? "✓ Verified" : "⏳ Pending"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
