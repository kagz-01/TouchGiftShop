"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Target, Users, Clock, TrendingUp, CheckCircle2,
  AlertCircle, RefreshCw, ShoppingBag, CalendarPlus, DollarSign, Gift
} from "lucide-react";

type Pool = {
  id: string; slug: string; title: string; recipient_name: string;
  target_amount: number; current_balance: number; min_contribution: number;
  status: string; expires_at: string; privacy_mode: string;
  over_target_behaviour: string; gift_name: string | null; gift_price: number | null;
  organiser_user_id: string; created_at: string; closed_at: string | null;
};
type Contribution = {
  id: string; contributor_name: string | null; amount: number;
  is_verified: boolean; is_anonymous: boolean; message: string | null; created_at: string;
};

type Action = "idle" | "refund" | "extend" | "downgrade" | "place_order";

export default function ManagePoolPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [pool, setPool] = useState<Pool | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [activeAction, setActiveAction] = useState<Action>("idle");
  const [newDeadline, setNewDeadline] = useState("");
  const [error, setError] = useState("");

  const fetchPool = useCallback(async () => {
    const res = await fetch(`/api/pools/${slug}`);
    if (!res.ok) { setError("Pool not found"); return; }
    const data = await res.json();
    setPool(data.pool);
    setContributions(data.contributions ?? []);
    setLoading(false);
  }, [slug]);

  useEffect(() => { fetchPool(); }, [fetchPool]);

  const doAction = async (action: string, extra?: object) => {
    setActionLoading(true);
    setActionMsg("");
    try {
      const res = await fetch(`/api/pools/${slug}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setActionMsg(data.message);
      await fetchPool();
      setActiveAction("idle");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
    </div>
  );

  if (!pool) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-brand-deep/60">Pool not found or not authorised</p>
        <Link href="/" className="mt-4 text-brand font-semibold text-sm inline-block">Go Home</Link>
      </div>
    </div>
  );

  const pct = Math.min(100, Math.round((pool.current_balance / pool.target_amount) * 100));
  const isActive = pool.status === "active";
  const isCompleted = pool.status === "completed";
  const isExpired = pool.status === "expired";
  const isFulfilled = pool.status === "fulfilled";
  const totalVerified = contributions.filter(c => c.is_verified).reduce((s, c) => s + c.amount, 0);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/pool/${pool.slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F8] to-white pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <Link href={`/pool/${slug}`} className="flex items-center gap-2 text-brand-deep/60 text-sm mb-6 hover:text-brand-deep">
          <ArrowLeft className="w-4 h-4" /> Back to pool
        </Link>

        {/* Pool header */}
        <div className="bg-gradient-to-br from-brand-deep to-brand rounded-3xl p-6 text-white mb-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gold/15 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Organiser Dashboard</p>
                <h1 className="font-display text-2xl font-bold italic">{pool.title}</h1>
                <p className="text-white/60 text-sm mt-1">For {pool.recipient_name}</p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                isActive ? "bg-success/20 text-green-300" :
                isCompleted ? "bg-gold/20 text-gold" :
                isFulfilled ? "bg-brand-light/20 text-brand-light" :
                "bg-white/10 text-white/60"
              }`}>
                {pool.status.toUpperCase()}
              </div>
            </div>
            {/* Progress */}
            <div className="h-3 rounded-full bg-white/20 mb-2">
              <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-bold">KES {pool.current_balance.toLocaleString()} <span className="text-white/50 font-normal">raised</span></span>
              <span className="text-white/50">{pct}% of KES {pool.target_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Contributors", value: contributions.length, icon: Users, color: "text-brand" },
            { label: "Verified Funds", value: `KES ${totalVerified.toLocaleString()}`, icon: DollarSign, color: "text-success" },
            { label: "Progress", value: `${pct}%`, icon: TrendingUp, color: "text-gold" },
            { label: "Deadline", value: new Date(pool.expires_at).toLocaleDateString("en-KE", { day: "numeric", month: "short" }), icon: Clock, color: "text-coral" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-1`} />
              <p className="text-lg font-bold text-brand-deep">{stat.value}</p>
              <p className="text-xs text-brand-deep/40">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Action Messages */}
        {actionMsg && <div className="mb-4 p-4 rounded-2xl bg-success/10 border border-success/20 text-success text-sm font-medium">{actionMsg}</div>}
        {error && <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

        {/* Actions */}
        <div className="bg-white rounded-3xl shadow-card p-5 mb-5">
          <h3 className="font-semibold text-brand-deep mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand" /> Pool Actions
          </h3>

          {isActive && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-brand/5 border border-brand/10">
                <p className="text-sm font-semibold text-brand-deep mb-1">Share Pool Link</p>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs text-brand-deep bg-white px-3 py-2 rounded-xl border border-brand/10 truncate">{shareUrl}</code>
                  <button onClick={() => navigator.clipboard.writeText(shareUrl)} className="px-3 py-2 bg-brand text-white rounded-xl text-xs font-semibold">Copy</button>
                </div>
              </div>
              <a href={`https://wa.me/?text=${encodeURIComponent(`🎁 ${pool.title}\n${shareUrl}`)}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-2xl font-semibold text-sm">
                📱 Share on WhatsApp
              </a>
            </div>
          )}

          {isCompleted && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-success/10 border border-success/20 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-deep text-sm">🎉 Target Reached!</p>
                  <p className="text-xs text-brand-deep/60 mt-1">Your pool has hit the goal. Place the order below to dispatch the gift.</p>
                </div>
              </div>
              <button
                onClick={() => doAction("place_order")}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-brand to-gold text-white rounded-2xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5" />
                {actionLoading ? "Placing order…" : "Place Order & Dispatch 🎁"}
              </button>
            </div>
          )}

          {isExpired && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200">
                <p className="font-semibold text-orange-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Pool expired at {pct}% of target
                </p>
                <p className="text-xs text-orange-600/70 mt-1">KES {pool.current_balance.toLocaleString()} collected. Choose what to do next:</p>
              </div>

              {activeAction === "idle" && (
                <div className="grid grid-cols-1 gap-2">
                  <button onClick={() => setActiveAction("extend")}
                    className="flex items-center gap-3 p-4 rounded-2xl border-2 border-brand/15 hover:border-brand/40 text-left transition-all">
                    <CalendarPlus className="w-5 h-5 text-brand" />
                    <div><p className="font-semibold text-brand-deep text-sm">Extend Deadline</p><p className="text-xs text-brand-deep/50">Keep collecting with a new date</p></div>
                  </button>
                  <button onClick={() => doAction("downgrade")} disabled={actionLoading}
                    className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gold/20 hover:border-gold/50 text-left transition-all disabled:opacity-50">
                    <Gift className="w-5 h-5 text-gold" />
                    <div><p className="font-semibold text-brand-deep text-sm">Downgrade Gift</p><p className="text-xs text-brand-deep/50">Proceed with a smaller gift from collected funds</p></div>
                  </button>
                  <button onClick={() => doAction("refund")} disabled={actionLoading}
                    className="flex items-center gap-3 p-4 rounded-2xl border-2 border-red-200 hover:border-red-400 text-left transition-all disabled:opacity-50">
                    <RefreshCw className="w-5 h-5 text-red-500" />
                    <div><p className="font-semibold text-red-600 text-sm">Refund All</p><p className="text-xs text-red-400/70">Return funds to each contributor</p></div>
                  </button>
                </div>
              )}

              {activeAction === "extend" && (
                <div className="p-4 rounded-2xl bg-brand/5 border border-brand/15 space-y-3">
                  <p className="text-sm font-semibold text-brand-deep">New Deadline</p>
                  <input type="date" value={newDeadline} min={new Date().toISOString().split("T")[0]}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-brand/10 focus:border-brand focus:outline-none text-brand-deep" />
                  <div className="flex gap-2">
                    <button onClick={() => setActiveAction("idle")} className="flex-1 py-2.5 border border-brand/15 rounded-xl text-sm font-semibold text-brand-deep">Cancel</button>
                    <button onClick={() => doAction("extend", { newDeadline: new Date(newDeadline + "T23:59:59").toISOString() })}
                      disabled={!newDeadline || actionLoading}
                      className="flex-1 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                      {actionLoading ? "Extending…" : "Confirm"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isFulfilled && (
            <div className="p-4 rounded-2xl bg-brand/5 border border-brand/10 text-center">
              <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="font-semibold text-brand-deep">Order placed! Your gift is on its way 🎁</p>
            </div>
          )}
        </div>

        {/* Contributions list */}
        <div className="bg-white rounded-3xl shadow-card p-5">
          <h3 className="font-semibold text-brand-deep mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-brand" /> Contributions ({contributions.length})
          </h3>
          {contributions.length === 0 ? (
            <p className="text-center text-brand-deep/40 text-sm py-6">No contributions yet. Share your pool link!</p>
          ) : (
            <div className="space-y-2">
              {contributions.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-brand/3 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-sm font-bold text-brand flex-shrink-0">
                    {c.is_anonymous || c.contributor_name === null ? "👤" : (c.contributor_name[0] ?? "?")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-brand-deep">{c.is_anonymous ? "Anonymous" : c.contributor_name ?? "Unknown"}</p>
                    {c.message && <p className="text-xs text-brand-deep/50 italic truncate">&ldquo;{c.message}&rdquo;</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-brand text-sm">KES {c.amount.toLocaleString()}</p>
                    <p className="text-xs flex items-center gap-1 justify-end">
                      {c.is_verified
                        ? <><CheckCircle2 className="w-3 h-3 text-success" /><span className="text-success">Verified</span></>
                        : <span className="text-brand-deep/30">Pending</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
