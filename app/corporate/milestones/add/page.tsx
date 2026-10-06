"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Zap, Gift, Target, Sparkles, Clock, ToggleLeft, ToggleRight } from "lucide-react";

type MilestoneRule = {
  name: string;
  trigger: string;
  description: string;
  giftType: string;
  giftBudget: number;
  autoOrder: boolean;
  notifyHR: boolean;
};

const TRIGGERS = [
  { id: "birthday", label: "Employee Birthday", icon: "🎂" },
  { id: "work_anniversary", label: "Work Anniversary", icon: "🎉" },
  { id: "promotion", label: "Promotion", icon: "🏆" },
  { id: "new_baby", label: "New Baby / Leave", icon: "👶" },
];

const BUDGET_TIERS = [
  { label: "Standard", target: 3000 },
  { label: "Premium", target: 5000 },
  { label: "Luxury", target: 10000 },
];

export default function AddMilestoneRule() {
  const [step, setStep] = useState(1);
  const [rule, setRule] = useState<MilestoneRule>({
    name: "",
    trigger: "",
    description: "",
    giftType: "Catalog Gift",
    giftBudget: 3000,
    autoOrder: false,
    notifyHR: true,
  });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    // Simulate API call
    setTimeout(() => {
      setCreating(false);
      setStep(4);
    }, 1500);
  };

  const selectedTrigger = TRIGGERS.find(t => t.id === rule.trigger);

  return (
    <div className="min-h-screen bg-[#14080D] text-white/90 pb-24">
      {/* Header */}
      <div className="bg-[#14080D]/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="page-container-capped py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/corporate/milestones" className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <h1 className="font-display italic text-lg font-bold text-white">New Milestone Rule</h1>
            <div className="text-sm text-white/40">
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
                        ? "bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                        : s < step
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-white/5 text-white/40 border border-white/10"
                    }`}
                  >
                    <span className="text-base">{s < step ? "✓" : s === 1 ? <Zap className="w-4 h-4" /> : s === 2 ? <Gift className="w-4 h-4" /> : <Target className="w-4 h-4" />}</span>
                    <span className="hidden sm:inline">{s === 1 ? "Trigger" : s === 2 ? "Gift Setup" : "Automations"}</span>
                  </div>
                  {i < 2 && <div className={`w-4 h-0.5 flex-shrink-0 ${s < step ? "bg-emerald-400" : "bg-white/10"}`} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="page-container-capped py-8">
        {/* ═══ STEP 1: Trigger ═══ */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-display italic text-2xl font-bold mb-2 text-white">When should we send a gift?</h2>
              <p className="text-white/50 text-sm">Select the event that will trigger this automated gift.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md shape-premium-card p-6 border border-white/10 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-white/80">Rule Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Employee Birthdays 2025"
                  value={rule.name}
                  onChange={(e) => setRule({ ...rule, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 shape-premium-card px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 placeholder-white/30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-white/80">Milestone Event *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {TRIGGERS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setRule({ ...rule, trigger: t.id })}
                      className={`p-4 shape-premium-card border-2 text-center transition-all ${
                        rule.trigger === t.id
                          ? "border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                          : "border-white/10 bg-white/5 hover:border-violet-400/30 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-2xl block mb-1">{t.icon}</span>
                      <p className="text-xs font-semibold text-white/80">{t.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-white/80">Description</label>
                <textarea
                  placeholder="e.g. Standard KSh 3,000 gift for all employee birthdays."
                  value={rule.description}
                  onChange={(e) => setRule({ ...rule, description: e.target.value })}
                  rows={2}
                  className="w-full bg-black/30 border border-white/10 shape-premium-card px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 placeholder-white/30 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!rule.name || !rule.trigger}
                className="px-6 py-3 bg-violet-500 text-white shape-premium-card font-semibold text-sm hover:bg-violet-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                Next: Gift Setup <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Gift Setup ═══ */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-display italic text-2xl font-bold mb-2 text-white">What should we send?</h2>
              <p className="text-white/50 text-sm">
                Set the budget and gift type for <span className="font-semibold text-violet-400">{selectedTrigger?.label}</span>.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md shape-premium-card p-6 border border-white/10 space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-3 text-white/80">Gift Budget *</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {BUDGET_TIERS.map((tier) => (
                    <button
                      key={tier.label}
                      onClick={() => setRule({ ...rule, giftBudget: tier.target })}
                      className={`p-3 shape-premium-card border-2 text-center transition-all ${
                        rule.giftBudget === tier.target
                          ? "border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                          : "border-white/10 bg-white/5 hover:border-violet-400/30 hover:bg-white/10"
                      }`}
                    >
                      <p className="text-sm font-bold text-white/80">{tier.label}</p>
                      <p className="text-[10px] text-white/50">KSh {tier.target.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">KSh</span>
                    <input
                      type="number"
                      value={rule.giftBudget}
                      onChange={(e) => setRule({ ...rule, giftBudget: Number(e.target.value) })}
                      className="w-full bg-black/30 border border-white/10 shape-premium-card pl-12 pr-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-white/80">Gift Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Catalog Gift", "Custom Basket"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setRule({ ...rule, giftType: type })}
                      className={`p-4 shape-premium-card border-2 text-left transition-all ${
                        rule.giftType === type
                          ? "border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                          : "border-white/10 bg-white/5 hover:border-violet-400/30 hover:bg-white/10"
                      }`}
                    >
                      <p className="text-sm font-bold text-white/80">{type}</p>
                      <p className="text-[10px] text-white/50 mt-1">
                        {type === "Catalog Gift" ? "Recipients pick from a curated list" : "We pre-build a basket for them"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white/50 shape-premium-card font-semibold text-sm hover:bg-white/10 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!rule.giftBudget}
                className="px-6 py-3 bg-violet-500 text-white shape-premium-card font-semibold text-sm hover:bg-violet-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                Next: Automations <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Automations ═══ */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-display italic text-2xl font-bold mb-2 text-white">Automation rules</h2>
              <p className="text-white/50 text-sm">How should we process these gifts when the milestone arrives?</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md shape-premium-card p-6 border border-white/10 space-y-5">
              <button
                onClick={() => setRule({ ...rule, autoOrder: !rule.autoOrder })}
                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 shape-premium-card hover:border-violet-400/30 transition-all"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className={`p-2 rounded-xl ${rule.autoOrder ? "bg-violet-500/20 text-violet-400" : "bg-white/10 text-white/50"}`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">Auto-Order Gifts</p>
                    <p className="text-xs text-white/50">Automatically place order 3 days before event</p>
                  </div>
                </div>
                <div className={`transition-colors ${rule.autoOrder ? "text-violet-400" : "text-white/20"}`}>
                  {rule.autoOrder ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </div>
              </button>

              <button
                onClick={() => setRule({ ...rule, notifyHR: !rule.notifyHR })}
                className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 shape-premium-card hover:border-violet-400/30 transition-all"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className={`p-2 rounded-xl ${rule.notifyHR ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/50"}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">Notify HR First</p>
                    <p className="text-xs text-white/50">Send an approval request to HR before ordering</p>
                  </div>
                </div>
                <div className={`transition-colors ${rule.notifyHR ? "text-emerald-400" : "text-white/20"}`}>
                  {rule.notifyHR ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </div>
              </button>
            </div>

            {/* Preview card */}
            <div className="bg-white/5 backdrop-blur-md shape-premium-card p-6 border border-white/10 shadow-sm">
              <h3 className="text-sm font-semibold text-white/80 mb-3">Rule Summary</h3>
              <div className="bg-black/30 border border-white/10 rounded-xl p-6 text-center">
                <div className="w-14 h-14 mx-auto bg-violet-500/20 shape-premium-card flex items-center justify-center text-2xl mb-3">
                  {selectedTrigger?.icon}
                </div>
                <h4 className="font-display italic text-lg font-bold text-white/90">{rule.name}</h4>
                <p className="text-xs text-white/50 mt-1">{selectedTrigger?.label}</p>
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-violet-400">KSh {rule.giftBudget.toLocaleString()}</p>
                    <p className="text-[10px] text-white/50">Budget</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-white/80">{rule.autoOrder ? "Auto" : "Manual"}</p>
                    <p className="text-[10px] text-white/50">Fulfillment</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white/50 shape-premium-card font-semibold text-sm hover:bg-white/10 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 inline mr-1" /> Back
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-8 py-3 bg-violet-500 text-white shape-premium-card font-semibold text-sm hover:bg-violet-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Create Rule
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: Success ═══ */}
        {step === 4 && (
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-500 to-purple-500 shape-premium-card flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <Check className="w-10 h-10 text-white" />
            </div>

            <div>
              <h2 className="font-display italic text-3xl font-bold mb-2 text-white">Rule Activated!</h2>
              <p className="text-white/50">We will now monitor the employee calendar and trigger gifts automatically based on this rule.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md shape-premium-card p-6 border border-white/10 shadow-sm space-y-4">
              <Link
                href="/corporate/milestones"
                className="block w-full px-4 py-3 bg-violet-500 text-white shape-premium-card font-semibold text-sm hover:bg-violet-600 transition-colors"
              >
                View Automated Rules
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
