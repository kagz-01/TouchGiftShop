"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users, Gift, Calendar, Target, Building2, Sparkles,
  ArrowRight, ArrowLeft, Check, Upload, Heart, Clock,
  TrendingUp, Shield, ChevronDown, ChevronUp
} from "lucide-react";

type PoolRecipient = {
  name: string;
  occasion: string;
  role: string;
  department: string;
};

type PoolConfig = {
  title: string;
  description: string;
  targetAmount: number;
  minContribution: number;
  deadline: string;
  companyMatch: boolean;
  matchRatio: number;
  matchCap: number;
  anonymousContributions: boolean;
  showLeaderboard: boolean;
  autoReminders: boolean;
};

const OCCASIONS = [
  { id: "birthday", label: "Birthday", icon: "🎂", color: "from-pink-400 to-rose-400" },
  { id: "work_anniversary", label: "Work Anniversary", icon: "🎉", color: "from-violet-400 to-purple-400" },
  { id: "farewell", label: "Farewell / Send-off", icon: "👋", color: "from-blue-400 to-indigo-400" },
  { id: "promotion", label: "Promotion", icon: "🏆", color: "from-amber-400 to-yellow-400" },
  { id: "new_baby", label: "New Baby", icon: "👶", color: "from-emerald-400 to-teal-400" },
  { id: "get_well", label: "Get Well Soon", icon: "💐", color: "from-coral to-pink-400" },
  { id: "holiday", label: "Holiday / Christmas", icon: "🎄", color: "from-red-400 to-green-400" },
  { id: "team_celebration", label: "Team Celebration", icon: "🥳", color: "from-brand to-brand-deep" },
];

const BUDGET_TIERS = [
  { label: "Casual", range: "KSh 500 – 1,500", target: 1500, description: "Small token of appreciation" },
  { label: "Standard", range: "KSh 1,500 – 3,000", target: 3000, description: "Thoughtful gift" },
  { label: "Premium", range: "KSh 3,000 – 6,000", target: 5000, description: "Premium experience" },
  { label: "Luxury", range: "KSh 6,000 – 15,000", target: 10000, description: "Executive-level gift" },
];

export default function CorporatePoolCreate() {
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState<PoolRecipient>({
    name: "",
    occasion: "",
    role: "",
    department: "",
  });
  const [config, setConfig] = useState<PoolConfig>({
    title: "",
    description: "",
    targetAmount: 3000,
    minContribution: 200,
    deadline: "",
    companyMatch: false,
    matchRatio: 1,
    matchCap: 5000,
    anonymousContributions: false,
    showLeaderboard: true,
    autoReminders: true,
  });
  const [poolLink, setPoolLink] = useState("");
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/corporate/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: config.title,
          description: config.description || undefined,
          recipientName: recipient.name,
          recipientRole: recipient.role || undefined,
          recipientDepartment: recipient.department || undefined,
          occasion: recipient.occasion,
          targetAmount: config.targetAmount,
          minContribution: config.minContribution,
          deadline: config.deadline,
          companyMatch: config.companyMatch
            ? { enabled: true, ratio: config.matchRatio, cap: config.matchCap }
            : undefined,
          showLeaderboard: config.showLeaderboard,
          autoReminders: config.autoReminders,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create pool");
        return;
      }

      setPoolLink(data.shareUrl);
      setStep(4);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const selectedOccasion = OCCASIONS.find((o) => o.id === recipient.occasion);

  return (
    <div className="min-h-screen section-theme-a">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-surface-border sticky top-0 z-40">
        <div className="page-container-capped py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/corporate" className="text-brand-muted hover:text-brand text-sm flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <h1 className="font-display italic text-lg font-bold">Team Gift Pool</h1>
            <div className="text-sm text-brand-muted">
              {step < 4 && <span className="text-xs">Step {step}/3</span>}
            </div>
          </div>

          {/* Step indicator */}
          {step < 4 && (
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 shape-premium-card text-sm font-medium transition-all w-full ${
                      s === step
                        ? "bg-brand text-white shadow-ribbon"
                        : s < step
                        ? "bg-success/10 text-success"
                        : "bg-white/60 text-brand-muted border border-surface-border/50"
                    }`}
                  >
                    <span className="text-base">{s < step ? "✓" : s === 1 ? <Users className="w-4 h-4" /> : s === 2 ? <Target className="w-4 h-4" /> : <Shield className="w-4 h-4" />}</span>
                    <span className="hidden sm:inline">{s === 1 ? "Recipient" : s === 2 ? "Pool Setup" : "Settings"}</span>
                  </div>
                  {i < 2 && <div className={`w-4 h-0.5 flex-shrink-0 ${s < step ? "bg-success" : "bg-gray-200"}`} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="page-container-capped py-8">
        {/* ═══ STEP 1: Recipient ═══ */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-display italic text-2xl font-bold mb-2">Who is this gift for?</h2>
              <p className="text-theme-muted text-sm">Tell us about the colleague you&apos;re celebrating.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border space-y-5 shadow-sm">
              <div>
                <label className="block text-sm font-semibold mb-2 text-theme-heading">Colleague&apos;s Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Wanjiku"
                  value={recipient.name}
                  onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                  className="w-full bg-white/50 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-theme-heading">Role / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Designer"
                    value={recipient.role}
                    onChange={(e) => setRecipient({ ...recipient, role: e.target.value })}
                    className="w-full bg-white/50 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-theme-heading">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Design Team"
                    value={recipient.department}
                    onChange={(e) => setRecipient({ ...recipient, department: e.target.value })}
                    className="w-full bg-white/50 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-theme-heading">Occasion *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      onClick={() => setRecipient({ ...recipient, occasion: occ.id })}
                      className={`p-4 shape-premium-card border-2 text-center transition-all ${
                        recipient.occasion === occ.id
                          ? "border-brand bg-brand/5 shadow-ribbon"
                          : "border-surface-border hover:border-brand/30"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{occ.icon}</span>
                      <p className="text-xs font-semibold text-theme-heading">{occ.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!recipient.name || !recipient.occasion}
                className="px-6 py-3 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                Next: Pool Setup <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Pool Setup ═══ */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-display italic text-2xl font-bold mb-2">Set up the pool</h2>
              <p className="text-theme-muted text-sm">
                Configure the gift pool for <span className="font-semibold text-brand">{recipient.name}</span>&apos;s {selectedOccasion?.label}.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border space-y-5 shadow-sm">
              <div>
                <label className="block text-sm font-semibold mb-2 text-theme-heading">Pool Title *</label>
                <input
                  type="text"
                  placeholder={`e.g. Let's celebrate ${recipient.name.split(" ")[0]}!`}
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full bg-white/50 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-theme-heading">Message to Contributors</label>
                <textarea
                  placeholder="e.g. Sarah is moving to a new role! Let's come together to get her something special."
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/50 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
                />
              </div>

              {/* Target amount */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-theme-heading">Gift Budget</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {BUDGET_TIERS.map((tier) => (
                    <button
                      key={tier.label}
                      onClick={() => setConfig({ ...config, targetAmount: tier.target })}
                      className={`p-3 shape-premium-card border-2 text-center transition-all ${
                        config.targetAmount === tier.target
                          ? "border-brand bg-brand/5 shadow-ribbon"
                          : "border-surface-border hover:border-brand/30"
                      }`}
                    >
                      <p className="text-sm font-bold text-theme-heading">{tier.label}</p>
                      <p className="text-[10px] text-theme-muted">{tier.range}</p>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted text-sm">KSh</span>
                    <input
                      type="number"
                      value={config.targetAmount}
                      onChange={(e) => setConfig({ ...config, targetAmount: Number(e.target.value) })}
                      className="w-full bg-white/50 border border-surface-border shape-premium-card pl-12 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>
                </div>
              </div>

              {/* Min contribution */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-theme-heading">Minimum Contribution</label>
                <div className="flex gap-2">
                  {[200, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setConfig({ ...config, minContribution: amt })}
                      className={`px-4 py-2 shape-premium-button text-sm font-medium transition-all ${
                        config.minContribution === amt
                          ? "bg-brand text-white"
                          : "bg-white/50 border border-surface-border text-theme-muted"
                      }`}
                    >
                      KSh {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-theme-heading">Deadline *</label>
                <input
                  type="date"
                  value={config.deadline}
                  onChange={(e) => setConfig({ ...config, deadline: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white/50 border border-surface-border shape-premium-card px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                />
                <p className="text-xs text-theme-muted mt-1">Pool closes and auto-orders the gift when deadline arrives.</p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-100 text-theme-muted shape-premium-card font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!config.title || !config.deadline}
                className="px-6 py-3 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                Next: Settings <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Settings ═══ */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-display italic text-2xl font-bold mb-2">Pool settings</h2>
              <p className="text-theme-muted text-sm">Configure company matching and contributor experience.</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border space-y-5 shadow-sm">
              {/* Company matching */}
              <div className="p-4 bg-gradient-to-r from-brand/5 to-gold/5 border border-brand/20 shape-premium-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand/10 shape-premium-card flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-theme-heading">Company Match</p>
                      <p className="text-xs text-theme-muted">Match employee contributions automatically</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfig({ ...config, companyMatch: !config.companyMatch })}
                    className={`w-12 h-7 shape-premium-button transition-all relative ${
                      config.companyMatch ? "bg-brand" : "bg-gray-200"
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                      config.companyMatch ? "left-6" : "left-1"
                    }`} />
                  </button>
                </div>
                {config.companyMatch && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-theme-heading">Match Ratio</label>
                      <select
                        value={config.matchRatio}
                        onChange={(e) => setConfig({ ...config, matchRatio: Number(e.target.value) })}
                        className="w-full bg-white/50 border border-surface-border shape-premium-card px-3 py-2 text-sm focus:outline-none focus:border-brand"
                      >
                        <option value={0.5}>1:0.5 (50% match)</option>
                        <option value={1}>1:1 (100% match)</option>
                        <option value={1.5}>1:1.5 (150% match)</option>
                        <option value={2}>1:2 (200% match)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-theme-heading">Company Cap (KSh)</label>
                      <input
                        type="number"
                        value={config.matchCap}
                        onChange={(e) => setConfig({ ...config, matchCap: Number(e.target.value) })}
                        className="w-full bg-white/50 border border-surface-border shape-premium-card px-3 py-2 text-sm focus:outline-none focus:border-brand"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy & experience */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-theme-heading">Contributor Experience</label>

                <button
                  onClick={() => setConfig({ ...config, showLeaderboard: !config.showLeaderboard })}
                  className="w-full flex items-center justify-between p-4 bg-white/50 border border-surface-border shape-premium-card hover:border-brand/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-theme-muted" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-theme-heading">Show Leaderboard</p>
                      <p className="text-xs text-theme-muted">Display top contributors on the pool page</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 shape-premium-button transition-all relative ${config.showLeaderboard ? "bg-brand" : "bg-gray-200"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${config.showLeaderboard ? "left-5" : "left-1"}`} />
                  </div>
                </button>

                <button
                  onClick={() => setConfig({ ...config, autoReminders: !config.autoReminders })}
                  className="w-full flex items-center justify-between p-4 bg-white/50 border border-surface-border shape-premium-card hover:border-brand/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-theme-muted" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-theme-heading">Auto Reminders</p>
                      <p className="text-xs text-theme-muted">Send WhatsApp reminders 3 days before deadline</p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 shape-premium-button transition-all relative ${config.autoReminders ? "bg-brand" : "bg-gray-200"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${config.autoReminders ? "left-5" : "left-1"}`} />
                  </div>
                </button>
              </div>
            </div>

            {/* Preview card */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm">
              <h3 className="text-sm font-semibold text-theme-heading mb-3">Preview</h3>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 text-center">
                <div className="w-14 h-14 mx-auto bg-brand/10 shape-premium-card flex items-center justify-center text-2xl mb-3">
                  {selectedOccasion?.icon}
                </div>
                <h4 className="font-display italic text-lg font-bold text-theme-heading">{config.title || `Celebrate ${recipient.name}`}</h4>
                <p className="text-xs text-theme-muted mt-1">{recipient.department}</p>
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-brand">KSh {config.targetAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-theme-muted">Target</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-theme-heading">KSh {config.minContribution}</p>
                    <p className="text-[10px] text-theme-muted">Min</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-theme-heading">{config.deadline || "TBD"}</p>
                    <p className="text-[10px] text-theme-muted">Deadline</p>
                  </div>
                </div>
                {config.companyMatch && (
                  <div className="mt-3 inline-flex items-center gap-1 bg-brand/10 text-brand text-xs font-semibold px-3 py-1 shape-premium-button">
                    <Building2 className="w-3 h-3" /> Company matches {config.matchRatio}:1
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-gray-100 text-theme-muted shape-premium-card font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-8 py-3 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating pool...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Launch Pool
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: Success ═══ */}
        {step === 4 && (
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand to-gold shape-premium-card flex items-center justify-center shadow-ribbon">
              <Check className="w-10 h-10 text-white" />
            </div>

            <div>
              <h2 className="font-display italic text-3xl font-bold mb-2">Pool is live!</h2>
              <p className="text-theme-muted">Share the link with colleagues to start collecting contributions.</p>
            </div>

            {/* Share link */}
            <div className="bg-white/80 backdrop-blur-sm shape-premium-card p-6 border border-surface-border shadow-sm space-y-4">
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                <p className="text-xs text-theme-muted mb-1">Pool link</p>
                <p className="text-sm font-mono text-brand break-all">{poolLink}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigator.clipboard.writeText(poolLink)}
                  className="flex-1 px-4 py-3 bg-brand text-white shape-premium-card font-semibold text-sm hover:bg-brand-dark transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`🎉 ${config.title}\n\nHelp us celebrate ${recipient.name}!\n\nTarget: KSh ${config.targetAmount.toLocaleString()}\n\nContribute here: ${poolLink}`)}`, "_blank")}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white shape-premium-card font-semibold text-sm hover:bg-emerald-600 transition-colors"
                >
                  Share on WhatsApp
                </button>
              </div>

              <Link
                href="/corporate"
                className="block text-sm text-brand hover:text-brand-dark font-semibold"
              >
                Go to Corporate Dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
