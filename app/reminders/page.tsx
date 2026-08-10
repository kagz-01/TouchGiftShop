"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import SubscriptionForm from "@/components/reminders/SubscriptionForm";
import { useSubscription } from "@/components/reminders/SubscriptionProvider";
import { formatKsh, cn } from "@/lib/utils";

interface Product {
  name: string;
  price: number;
  image_url: string;
}

interface Reminder {
  id: string;
  recipient_name: string;
  relationship: string | null;
  occasion_date: string | null;
  occasion_type: string | null;
  is_subscription: boolean;
  frequency: string | null;
  delivery_day: string | null;
  delivery_address: string | null;
  google_maps_link: string | null;
  products?: Product[] | null;
}

const OCCASIONS = ["Birthday", "Anniversary", "Wedding", "Graduation", "Retirement", "Other"];

function daysUntil(date: string | null): number {
  if (!date) return 999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RemindersDashboard() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCompletingSetup = searchParams.get("building") === "true";

  const { startBuildingSubscription, isBuildingSubscription, subscriptionItems } = useSubscription();

  const [activeTab, setActiveTab] = useState<"occasions" | "subscriptions">(isCompletingSetup ? "subscriptions" : "occasions");
  const [showOccasionForm, setShowOccasionForm] = useState(false);

  
  // Occasion form state
  const [occForm, setOccForm] = useState({
    recipientName: "",
    relationship: "",
    occasionDate: "",
    occasionType: "",
  });

  useEffect(() => {
    fetch("/api/reminders")
      .then((r) => r.json())
      .then((data) => {
        setReminders(data.reminders ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAddOccasion(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: occForm.recipientName,
        relationship: occForm.relationship || undefined,
        occasionDate: occForm.occasionDate,
        occasionType: occForm.occasionType || undefined,
        isSubscription: false
      }),
    });
    const data = await res.json();
    if (data.reminder) {
      setReminders((prev) => [...prev, data.reminder]);
      setOccForm({ recipientName: "", relationship: "", occasionDate: "", occasionType: "" });
      setShowOccasionForm(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/reminders?id=${id}`, { method: "DELETE" });
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }

  const occasions = reminders.filter(r => !r.is_subscription);
  const subscriptions = reminders.filter(r => r.is_subscription);

  const upcomingOccasions = occasions.filter((r) => daysUntil(r.occasion_date) >= 0).sort((a, b) => daysUntil(a.occasion_date) - daysUntil(b.occasion_date));
  const pastOccasions = occasions.filter((r) => daysUntil(r.occasion_date) < 0);

  return (
    <div className="min-h-screen bg-gradient-warm pb-20">
      {/* Header */}
      <div className="bg-white border-b border-surface-border sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-deep">Reminders & Subscriptions</h1>
              <p className="text-sm text-brand-muted mt-1">Never miss an important date again.</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-6 border-b border-surface-border">
            <button
              onClick={() => setActiveTab("occasions")}
              className={cn(
                "pb-3 text-sm font-bold transition-colors relative",
                activeTab === "occasions" ? "text-brand" : "text-brand-muted hover:text-brand-deep"
              )}
            >
              Occasions ({occasions.length})
              {activeTab === "occasions" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={cn(
                "pb-3 text-sm font-bold transition-colors relative",
                activeTab === "subscriptions" ? "text-brand" : "text-brand-muted hover:text-brand-deep"
              )}
            >
              Subscriptions ({subscriptions.length})
              {activeTab === "subscriptions" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8 mt-8 space-y-6">
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ─── OCCASIONS TAB ─── */}
            {activeTab === "occasions" && (
              <div className="space-y-6 animate-fade-in">
                {!showOccasionForm && (
                  <button
                    onClick={() => setShowOccasionForm(true)}
                    className="w-full border-2 border-dashed border-brand/20 rounded-2xl py-4 text-sm font-bold text-brand hover:bg-brand/5 transition-colors"
                  >
                    + Add an Occasion
                  </button>
                )}

                {showOccasionForm && (
                  <form onSubmit={handleAddOccasion} className="bg-white rounded-2xl p-5 border border-surface-border space-y-4 shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                      <h3 className="font-display font-bold">New Occasion</h3>
                      <button type="button" onClick={() => setShowOccasionForm(false)} className="text-sm font-semibold text-brand-muted hover:text-brand">Cancel</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-brand-deep mb-1">Recipient name</label>
                        <input required value={occForm.recipientName} onChange={(e) => setOccForm({ ...occForm, recipientName: e.target.value })} placeholder="e.g. Grace" className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-deep mb-1">Relationship</label>
                        <input value={occForm.relationship} onChange={(e) => setOccForm({ ...occForm, relationship: e.target.value })} placeholder="e.g. Sister" className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-brand-deep mb-1">Date</label>
                        <input type="date" required value={occForm.occasionDate} onChange={(e) => setOccForm({ ...occForm, occasionDate: e.target.value })} className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-brand-deep mb-1">Occasion</label>
                        <select value={occForm.occasionType} onChange={(e) => setOccForm({ ...occForm, occasionType: e.target.value })} className="w-full border border-surface-border rounded-xl px-3 py-2 text-sm focus:border-brand outline-none bg-white">
                          <option value="">Select...</option>
                          {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="w-full rounded-xl bg-brand text-white py-3 font-bold text-sm shadow-button hover:bg-brand-dark transition-colors">
                      Save Reminder
                    </button>
                  </form>
                )}

                {occasions.length === 0 && !showOccasionForm && (
                  <div className="text-center py-12 bg-white rounded-3xl border border-surface-border">
                    <svg className="w-12 h-12 mx-auto text-brand/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="font-display font-semibold mb-2">No occasions saved</p>
                    <p className="text-sm text-brand-muted max-w-sm mx-auto">
                      Save important dates (birthdays, anniversaries) and we'll send you a reminder and gift ideas 5 days before.
                    </p>
                  </div>
                )}

                {upcomingOccasions.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-bold text-brand-muted uppercase tracking-wider pl-1">Upcoming</h2>
                    {upcomingOccasions.map((r) => {
                      const days = daysUntil(r.occasion_date);
                      return (
                        <div key={r.id} className="bg-white rounded-2xl border border-surface-border p-4 flex items-center justify-between hover:shadow-card transition-shadow">
                          <div>
                            <p className="font-display font-bold text-brand-deep text-lg">{r.recipient_name}</p>
                            <p className="text-xs font-medium text-brand-muted flex items-center gap-2 mt-0.5">
                              {r.occasion_type && <span className="bg-brand/5 text-brand px-2 py-0.5 rounded-md">{r.occasion_type}</span>}
                              {new Date(r.occasion_date!).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
                              {r.relationship && <span>• {r.relationship}</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className={cn("text-xs font-bold uppercase tracking-wider block", days <= 5 ? "text-orange-500" : "text-brand-muted")}>
                                {days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `In ${days} days`}
                              </span>
                            </div>
                            <button onClick={() => handleDelete(r.id)} className="w-8 h-8 rounded-full bg-surface-secondary text-brand-muted flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {pastOccasions.length > 0 && (
                  <div className="space-y-3 pt-4">
                    <h2 className="text-sm font-bold text-brand-muted/50 uppercase tracking-wider pl-1">Past Dates</h2>
                    {pastOccasions.map((r) => (
                      <div key={r.id} className="bg-white/50 rounded-2xl border border-surface-border p-4 flex items-center justify-between opacity-60">
                        <div>
                          <p className="font-bold text-brand-deep">{r.recipient_name}</p>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {r.occasion_type && `${r.occasion_type} • `}
                            {new Date(r.occasion_date!).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <button onClick={() => handleDelete(r.id)} className="w-8 h-8 rounded-full bg-surface-secondary text-brand-muted flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── SUBSCRIPTIONS TAB ─── */}
            {activeTab === "subscriptions" && (
              <div className="space-y-6 animate-fade-in">
                {(!isCompletingSetup || subscriptionItems.length === 0) && (
                  <button
                    onClick={() => {
                      startBuildingSubscription();
                      router.push("/");
                    }}
                    className="w-full border-2 border-dashed border-brand/20 rounded-2xl py-4 text-sm font-bold text-brand hover:bg-brand/5 transition-colors"
                  >
                    + Build a New Subscription Box
                  </button>
                )}

                {isCompletingSetup && subscriptionItems.length > 0 && (
                  <SubscriptionForm 
                    onSuccess={(newSub) => {
                      setReminders(prev => [...prev, newSub]);
                      router.replace("/reminders");
                    }}
                    onCancel={() => {
                      router.replace("/reminders");
                    }}
                  />
                )}

                {subscriptions.length === 0 && !isCompletingSetup && (
                  <div className="text-center py-12 bg-white rounded-3xl border border-surface-border">
                    <svg className="w-12 h-12 mx-auto text-brand/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    <p className="font-display font-semibold mb-2">No active subscriptions</p>
                    <p className="text-sm text-brand-muted max-w-sm mx-auto">
                      Automate your gifts! Schedule weekly flowers or monthly liquor deliveries and never worry about re-ordering.
                    </p>
                  </div>
                )}

                {subscriptions.length > 0 && (
                  <div className="space-y-4">
                    {subscriptions.map((sub) => (
                      <div key={sub.id} className="bg-white rounded-3xl border border-surface-border overflow-hidden hover:shadow-card transition-shadow">
                        <div className="p-5 flex gap-5">
                          {/* Image (show first product) */}
                          <div className="w-20 h-20 bg-blush rounded-2xl flex-shrink-0 relative overflow-hidden">
                            {sub.products && sub.products.length > 0 && sub.products[0].image_url ? (
                              <Image src={sub.products[0].image_url} alt={sub.products[0].name} fill className="object-contain p-2" sizes="80px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-brand/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="inline-block bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-1">
                                  {sub.frequency} • {sub.delivery_day}s
                                </span>
                                <h3 className="font-display font-bold text-lg text-brand-deep leading-tight">
                                  {sub.products && sub.products.length > 0 
                                    ? sub.products.length === 1 ? sub.products[0].name : `${sub.products[0].name} & ${sub.products.length - 1} more` 
                                    : "Custom Gift"}
                                </h3>
                                <p className="text-sm font-medium text-brand mt-1">
                                  {formatKsh(sub.products?.reduce((acc, p) => acc + p.price, 0) ?? 0)} <span className="text-xs text-brand-muted font-normal">/ delivery</span>
                                </p>
                              </div>
                              <button onClick={() => handleDelete(sub.id)} className="text-brand-muted hover:text-red-500 transition-colors p-2" title="Cancel Subscription">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                            
                            <div className="mt-4 pt-3 border-t border-surface-border grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <p className="text-brand-muted font-medium mb-0.5">Recipient</p>
                                <p className="font-semibold text-brand-deep">{sub.recipient_name} {sub.relationship ? `(${sub.relationship})` : ""}</p>
                              </div>
                              {sub.delivery_address && (
                                <div>
                                  <p className="text-brand-muted font-medium mb-0.5">Delivery To</p>
                                  <div className="font-semibold text-brand-deep line-clamp-1">
                                    {sub.delivery_address}
                                    {sub.google_maps_link && (
                                      <a href={sub.google_maps_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-1 block mt-1">(View Pin)</a>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="bg-surface-secondary px-5 py-3 border-t border-surface-border text-xs text-brand-muted flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            Active
                          </span>
                          <span>We'll text a payment link every {sub.delivery_day}.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
