"use client";
import { useState, useEffect } from "react";
import { Target, Plus, Users, DollarSign, Calendar, Copy, CheckCircle,
  ExternalLink, Loader2, Gift, X } from "lucide-react";
import { formatKsh } from "@/lib/utils";
import Link from "next/link";

// DB columns: current_balance (not current_amount), slug ✅, contributor_count ✅
interface Pool {
  id: string; title: string; description: string | null;
  target_amount: number; current_balance: number;
  status: string; deadline: string | null;
  contributor_count: number | null; created_at: string;
  slug: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  active:    "bg-green-50 text-green-700 border-green-200",
  funded:    "bg-blue-50 text-blue-700 border-blue-200",
  closed:    "bg-gray-100 text-gray-500 border-gray-200",
  draft:     "bg-amber-50 text-amber-700 border-amber-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

function PoolCard({ pool }: { pool: Pool }) {
  const pct      = Math.min(100, Math.round(((pool.current_balance ?? 0) / Math.max(pool.target_amount, 1)) * 100));
  const [copied, setCopied] = useState(false);
  const origin   = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/corporate/pool/${pool.slug ?? pool.id}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm hover:border-amber-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{pool.title}</h3>
            {pool.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{pool.description}</p>}
          </div>
        </div>
        <span className={`shrink-0 ml-2 text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_COLOR[pool.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
          {pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span className="font-semibold text-gray-900">{formatKsh(pool.current_balance ?? 0)}</span>
          <span>of {formatKsh(pool.target_amount)} · {pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-green-500" : "bg-indigo-500"}`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 flex-wrap">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {pool.contributor_count ?? 0} contributors
        </span>
        {pool.deadline && (
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(pool.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button onClick={() => navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
          className="flex items-center gap-1.5 flex-1 justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-700 rounded-lg transition-all">
          {copied ? <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Link</>}
        </button>
        <Link href={`/corporate/pool/${pool.slug ?? pool.id}`} target="_blank"
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-indigo-300 text-xs font-semibold text-gray-700 rounded-lg transition-all">
          <ExternalLink className="w-3.5 h-3.5" /> View
        </Link>
      </div>
    </div>
  );
}

function CreatePoolModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle]   = useState("");
  const [desc, setDesc]     = useState("");
  const [target, setTarget] = useState(10000);
  const [deadline, setDeadline] = useState("");
  const [recipient, setRecipient] = useState("");
  const [occasion, setOccasion] = useState("holiday");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      await fetch("/api/corporate/pools", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description: desc, targetAmount: target,
          deadline: deadline || new Date(Date.now() + 30 * 86400000).toISOString(),
          recipientName: recipient || "Team Member",
          occasion,
        }),
      });
      onCreated();
    } catch {}
    setSubmitting(false); onClose();
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Create Gift Pool</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Pool Title *</label>
            <input required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Year-End Gift for Sarah"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Recipient Name *</label>
              <input required value={recipient} onChange={e => setRecipient(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Occasion *</label>
              <select value={occasion} onChange={e => setOccasion(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {["birthday","work_anniversary","farewell","new_hire","holiday","promotion","custom"].map(o => (
                  <option key={o} value={o}>{o.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2}
              placeholder="Optional message shown to contributors"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Target (KES) *</label>
              <input required type="number" min={500} value={target} onChange={e => setTarget(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deadline</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
            {submitting ? "Creating…" : "Create Pool & Get Share Link"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function GiftPoolsTab() {
  const [pools, setPools]         = useState<Pool[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/corporate/pools");
      if (r.ok) {
        const d = await r.json();
        // API returns { pools: [...] }
        setPools(Array.isArray(d) ? d : (d.pools ?? []));
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const active      = pools.filter(p => p.status === "active").length;
  const totalRaised = pools.reduce((s, p) => s + Number(p.current_balance ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Gift Pools</h2>
          <p className="text-sm text-gray-500 mt-0.5">Group contributions for team and client gifts</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Pool
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Pools",   val: loading ? "—" : String(active),              icon: Target,      bg: "bg-indigo-50 text-indigo-600" },
          { label: "Total Raised",   val: loading ? "—" : formatKsh(totalRaised),      icon: DollarSign,  bg: "bg-green-50 text-green-600" },
          { label: "Total Pools",    val: loading ? "—" : String(pools.length),         icon: Gift,        bg: "bg-amber-50 text-amber-600" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.bg}`}>
              <k.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{k.val}</p>
              <p className="text-xs text-gray-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse h-52" />)}
        </div>
      ) : pools.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white border border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mb-3">
            <Target className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">No pools yet</h3>
          <p className="text-sm text-gray-400 mb-5 text-center max-w-xs">Create a gift pool and share the link — colleagues contribute towards a shared gift.</p>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Create First Pool
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pools.map(p => <PoolCard key={p.id} pool={p} />)}
        </div>
      )}

      {showCreate && <CreatePoolModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}
