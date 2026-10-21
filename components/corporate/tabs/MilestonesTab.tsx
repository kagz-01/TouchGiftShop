"use client";
import { useState, useEffect } from "react";
import { Zap, Plus, Calendar, Gift, TrendingUp, AlertCircle, X, Loader2, CheckCircle } from "lucide-react";

interface MilestoneRule {
  id: string; name: string; trigger_type: string;
  trigger_value: string | null; gift_type: string;
  gift_value: number; is_active: boolean; created_at: string;
  fire_count?: number;
}

const TRIGGER_LABELS: Record<string, string> = {
  birthday:     "🎂 Birthday",
  workiversary: "🎊 Work Anniversary",
  spend_threshold: "💰 Spend Threshold",
  custom_date:  "📅 Custom Date",
  new_client:   "🤝 New Client",
};
const GIFT_LABELS: Record<string, string> = {
  voucher:   "Gift Voucher",
  hamper:    "Gift Hamper",
  flowers:   "Flowers",
  product:   "Specific Product",
  cash:      "Cash Contribution",
};

function RuleCard({ rule, onToggle }: { rule: MilestoneRule; onToggle: (id: string, v: boolean) => void }) {
  return (
    <div className={`bg-white border rounded-xl p-5 transition-all hover:shadow-sm ${rule.is_active ? "border-gray-200 hover:border-amber-300" : "border-gray-100 opacity-60"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${rule.is_active ? "bg-yellow-50 border border-yellow-200" : "bg-gray-100"}`}>
            <Zap className={`w-4 h-4 ${rule.is_active ? "text-yellow-600" : "text-gray-400"}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{rule.name}</h3>
            <p className="text-xs text-gray-400">{TRIGGER_LABELS[rule.trigger_type] ?? rule.trigger_type}</p>
          </div>
        </div>
        {/* Toggle */}
        <button onClick={() => onToggle(rule.id, !rule.is_active)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${rule.is_active ? "bg-amber-500" : "bg-gray-200"}`}>
          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${rule.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium">
          <Gift className="w-3 h-3" /> {GIFT_LABELS[rule.gift_type] ?? rule.gift_type}
        </span>
        <span className="text-xs text-gray-500 font-medium">KES {Number(rule.gift_value).toLocaleString()}</span>
        {(rule.fire_count ?? 0) > 0 && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Fired {rule.fire_count} time{rule.fire_count !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function CreateRuleModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName]       = useState("");
  const [trigger, setTrigger] = useState("birthday");
  const [giftType, setGiftType] = useState("voucher");
  const [giftValue, setGiftValue] = useState(2500);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true);
    try {
      await fetch("/api/corporate/milestones", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, trigger_type: trigger, gift_type: giftType, gift_value: giftValue, is_active: true }),
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
          <h2 className="font-bold text-gray-900">New Gifting Rule</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Rule Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Staff Birthday Gift"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Trigger</label>
            <select value={trigger} onChange={e => setTrigger(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white">
              {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gift Type</label>
              <select value={giftType} onChange={e => setGiftType(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white">
                {Object.entries(GIFT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gift Value (KES)</label>
              <input type="number" min={500} value={giftValue} onChange={e => setGiftValue(Number(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">Rules fire automatically when a matching event is detected in your client directory. Make sure clients have their key dates filled in.</p>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {submitting ? "Creating…" : "Create Rule"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MilestonesTab() {
  const [rules, setRules]         = useState<MilestoneRule[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/corporate/milestones");
      if (r.ok) setRules(await r.json());
    } catch {}
    setLoading(false);
  }

  async function toggle(id: string, val: boolean) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: val } : r));
    try {
      await fetch(`/api/corporate/milestones/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: val }),
      });
    } catch {}
  }

  useEffect(() => { load(); }, []);

  const active   = rules.filter(r => r.is_active).length;
  const inactive = rules.length - active;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Gifting Milestones</h2>
          <p className="text-sm text-gray-500 mt-0.5">Automatic gift triggers based on events</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Rule
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Rules",  val: String(active),   icon: Zap, bg: "bg-yellow-50 text-yellow-600" },
          { label: "Inactive",      val: String(inactive), icon: TrendingUp, bg: "bg-gray-100 text-gray-400" },
          { label: "Total Rules",   val: String(rules.length), icon: Gift, bg: "bg-amber-50 text-amber-600" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.bg}`}>
              <k.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{loading ? "—" : k.val}</p>
              <p className="text-xs text-gray-500">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse h-36" />)}
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white border border-gray-200 rounded-xl">
          <div className="w-12 h-12 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-center mb-3">
            <Zap className="w-6 h-6 text-yellow-400" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">No rules set up yet</h3>
          <p className="text-sm text-gray-400 mb-5 text-center max-w-xs">Automate gifting for birthdays, work anniversaries, and key milestones.</p>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Create First Rule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map(r => <RuleCard key={r.id} rule={r} onToggle={toggle} />)}
        </div>
      )}

      {showCreate && <CreateRuleModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}
