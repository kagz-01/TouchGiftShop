"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatKsh } from "@/lib/utils";
import { ArrowLeft, Gift, Calendar, Users, Sparkles, Crown, Check, Star } from "lucide-react";

interface SubscriptionRecipient {
  id: string;
  recipient_name: string;
  recipient_phone: string | null;
  relationship: string | null;
  occasion: string | null;
  budget_range: string;
  preferences: string | null;
}

interface Subscription {
  id: string;
  plan: string;
  status: string;
  monthly_price: number;
  recipient_count: number;
  max_recipients: number;
  next_billing_date: string;
  subscription_recipients: SubscriptionRecipient[];
  created_at: string;
}

const PLANS = [
  {
    name: "Basic",
    key: "basic",
    price: 500,
    maxRecipients: 3,
    features: ["3 recipients", "Birthday reminders", "AI gift suggestions", "Auto-scheduling"],
  },
  {
    name: "Standard",
    key: "standard",
    price: 1500,
    maxRecipients: 10,
    features: ["10 recipients", "All Basic features", "Priority gift selection", "Personalized messages", "Delivery tracking"],
  },
  {
    name: "Premium",
    key: "premium",
    price: 3500,
    maxRecipients: 25,
    features: ["25 recipients", "All Standard features", "Dedicated account manager", "Custom gift sourcing", "Bulk discounts", "Analytics dashboard"],
  },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [recipients, setRecipients] = useState<Array<{
    name: string;
    phone: string;
    relationship: string;
    occasion: string;
    budgetRange: string;
  }>>([]);

  useEffect(() => {
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((d) => { setSubscriptions(d.subscriptions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function addRecipient() {
    setRecipients([...recipients, { name: "", phone: "", relationship: "", occasion: "", budgetRange: "2000-5000" }]);
  }

  function updateRecipient(index: number, field: string, value: string) {
    const updated = [...recipients];
    (updated[index] as any)[field] = value;
    setRecipients(updated);
  }

  function removeRecipient(index: number) {
    setRecipients(recipients.filter((_, i) => i !== index));
  }

  async function handleSubscribe() {
    if (!selectedPlan || recipients.length === 0) return;

    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan, recipients }),
    });

    if (res.ok) {
      const refresh = await fetch("/api/subscriptions");
      const data = await refresh.json();
      setSubscriptions(data.subscriptions ?? []);
      setSelectedPlan(null);
      setRecipients([]);
      setShowAddForm(false);
    }
  }

  const activeSubscription = subscriptions.find((s) => s.status === "active");

  return (
    <div className="min-h-screen section-theme-e">
      <div className="page-container-capped py-6 md:py-10 max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/account" className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand transition-colors">
            <ArrowLeft className="w-4 h-4" /> Account
          </Link>
        </div>

        {/* Hero */}
        <div className="bg-gradient-to-br from-brand to-brand-deep rounded-3xl p-6 md:p-8 text-white text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Never Forget a Gift</h1>
          <p className="text-white/70 text-sm mb-6">
            AI-powered gift subscriptions. We track birthdays and occasions, then suggest and auto-send the perfect gift.
          </p>
        </div>

        {/* Active subscription */}
        {activeSubscription && (
          <div className="bg-white rounded-2xl border border-brand/20 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="font-semibold text-brand-deep capitalize">{activeSubscription.plan} Plan</p>
                <p className="text-xs text-brand-muted">{activeSubscription.recipient_count} recipients · {formatKsh(activeSubscription.monthly_price)}/mo</p>
              </div>
            </div>
            <div className="space-y-2">
              {activeSubscription.subscription_recipients.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-b border-black/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-brand-deep">{r.recipient_name}</p>
                    <p className="text-xs text-brand-muted">{r.relationship || "Friend"} · {r.occasion || "Birthday"}</p>
                  </div>
                  <span className="text-xs font-medium text-brand bg-brand/5 px-2 py-1 rounded-full">{r.budget_range}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-brand-deep text-lg">Choose Your Plan</h2>
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              onClick={() => { setSelectedPlan(plan.key); setShowAddForm(true); }}
              className={`bg-white rounded-2xl border shadow-sm p-5 cursor-pointer transition-all ${
                selectedPlan === plan.key ? "border-brand ring-2 ring-brand/10" : "border-black/6 hover:border-brand/30"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-brand-deep">{plan.name}</h3>
                  <p className="text-sm text-brand-muted">Up to {plan.maxRecipients} recipients</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-brand-deep">{formatKsh(plan.price)}</p>
                  <p className="text-xs text-brand-muted">/month</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-xs text-brand-muted">
                    <Check className="w-3 h-3 text-emerald-500" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add recipients form */}
        {showAddForm && selectedPlan && (
          <div className="bg-white rounded-2xl border border-black/6 shadow-sm p-5 space-y-4">
            <h2 className="font-display font-bold text-brand-deep">Add Recipients</h2>
            <p className="text-xs text-brand-muted">Add people you want to auto-gift for. We'll remind you and suggest gifts before each occasion.</p>

            {recipients.map((r, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-brand-deep">Recipient {idx + 1}</p>
                  <button onClick={() => removeRecipient(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Name *"
                    value={r.name}
                    onChange={(e) => updateRecipient(idx, "name", e.target.value)}
                    className="w-full bg-white border border-black/8 rounded-xl px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Phone"
                    value={r.phone}
                    onChange={(e) => updateRecipient(idx, "phone", e.target.value)}
                    className="w-full bg-white border border-black/8 rounded-xl px-3 py-2 text-sm"
                  />
                  <select
                    value={r.relationship}
                    onChange={(e) => updateRecipient(idx, "relationship", e.target.value)}
                    className="w-full bg-white border border-black/8 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">Relationship</option>
                    <option value="partner">Partner</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague</option>
                    <option value="client">Client</option>
                  </select>
                  <select
                    value={r.occasion}
                    onChange={(e) => updateRecipient(idx, "occasion", e.target.value)}
                    className="w-full bg-white border border-black/8 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">Occasion</option>
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                    <option value="wedding">Wedding</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
                <select
                  value={r.budgetRange}
                  onChange={(e) => updateRecipient(idx, "budgetRange", e.target.value)}
                  className="w-full bg-white border border-black/8 rounded-xl px-3 py-2 text-sm"
                >
                  <option value="1000-2000">KSh 1,000 - 2,000</option>
                  <option value="2000-5000">KSh 2,000 - 5,000</option>
                  <option value="5000-10000">KSh 5,000 - 10,000</option>
                  <option value="10000-20000">KSh 10,000 - 20,000</option>
                </select>
              </div>
            ))}

            <button
              onClick={addRecipient}
              disabled={recipients.length >= (PLANS.find((p) => p.key === selectedPlan)?.maxRecipients || 3)}
              className="w-full py-3 border-2 border-dashed border-brand/30 rounded-xl text-sm font-medium text-brand hover:bg-brand/5 transition-colors disabled:opacity-30"
            >
              + Add another recipient
            </button>

            <button
              onClick={handleSubscribe}
              disabled={recipients.length === 0 || !recipients.some((r) => r.name)}
              className="w-full py-4 bg-gradient-to-r from-gold to-gold-light text-brand-deep rounded-2xl font-bold text-base shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Subscribe — {formatKsh(PLANS.find((p) => p.key === selectedPlan)?.price || 0)}/mo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
