"use client";

import { useState, useRef, useCallback } from "react";
import {
  Send, CheckCircle, AlertCircle, Trash2, Plus, RefreshCw,
  CreditCard, Users, DollarSign, Upload, X, ChevronDown,
} from "lucide-react";

interface Recipient {
  id: string;
  name: string;
  email: string;
  amount: number;
  status: "pending" | "sent" | "error";
  error?: string;
}
interface IssuedCard {
  code: string;
  recipientName: string;
  recipientEmail: string;
  amount: number;
  status: "active" | "redeemed" | "scheduled" | "pending_payment" | "expired";
  sendDate: string;
  balance: number;
}

const DENOMINATIONS = [500, 1000, 2000, 3000, 5000, 10000];
const STATUS_LABEL: Record<IssuedCard["status"], string> = {
  active: "Active", redeemed: "Redeemed", scheduled: "Scheduled",
  pending_payment: "Pending", expired: "Expired",
};
const STATUS_COLOR: Record<IssuedCard["status"], string> = {
  active: "var(--portal-positive)", redeemed: "var(--portal-text-faint)",
  scheduled: "var(--portal-warn)", pending_payment: "var(--portal-warn)",
  expired: "var(--portal-stop)",
};

function uid() { return Math.random().toString(36).slice(2, 9); }

function parseCSV(text: string): Recipient[] {
  return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => {
    const [name, email] = line.split(",").map(s => s.trim());
    if (!name || !email?.includes("@")) return null;
    return { id: uid(), name, email, amount: 0, status: "pending" as const };
  }).filter(Boolean) as Recipient[];
}

function StatCard({ icon: Icon, label, value, alert }: {
  icon: React.ElementType; label: string; value: string | number; alert?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl"
      style={{ background: "var(--portal-surface)", border: `1px solid ${alert ? "var(--portal-stop)" : "var(--portal-border)"}`, boxShadow: "var(--portal-shadow)" }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: alert ? "var(--portal-stop-tint)" : "var(--portal-accent-tint)" }}>
        <Icon className="w-4 h-4" style={{ color: alert ? "var(--portal-stop)" : "var(--portal-accent)" }} />
      </div>
      <p className="text-xl font-bold mt-1" style={{ color: "var(--portal-text)" }}>{value}</p>
      <p className="text-xs" style={{ color: "var(--portal-text-muted)" }}>{label}</p>
    </div>
  );
}

export default function GiftCardsTab() {
  const [issued, setIssued] = useState<IssuedCard[]>([]);
  const [loadingIssued, setLoadingIssued] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const fetchIssued = useCallback(async () => {
    setLoadingIssued(true);
    try { const r = await fetch("/api/corporate/gift-cards"); if (r.ok) setIssued(await r.json()); } catch {}
    setLoadingIssued(false);
  }, []);

  const [step, setStep] = useState<"config" | "review" | "sending" | "done">("config");
  const [denomination, setDenomination] = useState(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [message, setMessage] = useState("Thank you for your dedication. Enjoy this gift card as a token of our appreciation!");
  const [sendDate, setSendDate] = useState(new Date().toISOString().slice(0, 10));
  const [senderName, setSenderName] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [csvText, setCsvText] = useState("");
  const [csvError, setCsvError] = useState("");
  const [results, setResults] = useState({ sent: 0, failed: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const effectiveAmount = useCustom ? (parseInt(customAmount) || 0) : denomination;
  const totalValue = recipients.length * effectiveAmount;

  function applyCSV() {
    const parsed = parseCSV(csvText);
    if (!parsed.length) { setCsvError("No valid rows. Format: Name, email@example.com"); return; }
    setCsvError("");
    setRecipients(prev => [...prev, ...parsed.map(r => ({ ...r, amount: effectiveAmount }))]);
    setCsvText("");
  }

  function addRow() {
    setRecipients(prev => [...prev, { id: uid(), name: "", email: "", amount: effectiveAmount, status: "pending" as const }]);
  }

  function updateRow(id: string, field: "name" | "email" | "amount", val: string) {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, [field]: field === "amount" ? parseInt(val) || 0 : val } : r));
  }

  function removeRow(id: string) {
    setRecipients(prev => prev.filter(r => r.id !== id));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCsvText(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = "";
  }

  async function sendCards() {
    setStep("sending");
    let sent = 0, failed = 0;
    const updated = [...recipients];
    const res = await Promise.allSettled(recipients.map(async (r, idx) => {
      const resp = await fetch("/api/gift-cards/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: r.amount || effectiveAmount, senderName: senderName || "Corporate", recipientName: r.name, recipientEmail: r.email, message, sendDate }),
      });
      if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.error || "Failed"); }
      return idx;
    }));
    res.forEach((result, idx) => {
      if (result.status === "fulfilled") { updated[idx] = { ...updated[idx], status: "sent" }; sent++; }
      else { updated[idx] = { ...updated[idx], status: "error", error: (result.reason as Error).message }; failed++; }
    });
    setRecipients(updated); setResults({ sent, failed }); setStep("done");
  }

  function reset() { setStep("config"); setRecipients([]); setCsvText(""); setResults({ sent: 0, failed: 0 }); }

  const STEP_KEYS = ["config", "review", "sending", "done"] as const;
  const stepIdx = STEP_KEYS.indexOf(step);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--portal-text)" }}>Corporate Gift Cards</h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--portal-text-muted)" }}>Issue branded gift cards to employees or clients in bulk — they redeem in-store or online.</p>
        </div>
        <button onClick={() => { setHistoryOpen(v => !v); if (!historyOpen) fetchIssued(); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shrink-0"
          style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)", color: "var(--portal-accent)" }}>
          <CreditCard className="w-4 h-4" />
          {historyOpen ? "Hide Issued Cards" : "View Issued Cards"}
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${historyOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Issued history */}
      {historyOpen && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--portal-surface)", border: "1px solid var(--portal-border)", boxShadow: "var(--portal-shadow)" }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--portal-border-soft)" }}>
            <p className="font-semibold text-sm" style={{ color: "var(--portal-text)" }}>Previously Issued</p>
            <button onClick={fetchIssued} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: "var(--portal-accent-tint)" }}>
              <RefreshCw className={`w-3.5 h-3.5 ${loadingIssued ? "animate-spin" : ""}`} style={{ color: "var(--portal-accent)" }} />
            </button>
          </div>
          {issued.length > 0 && (
            <div className="grid grid-cols-3 gap-3 p-4" style={{ borderBottom: "1px solid var(--portal-border-soft)" }}>
              <StatCard icon={CreditCard} label="Total issued" value={issued.length} />
              <StatCard icon={CheckCircle} label="Redeemed" value={issued.filter(c => c.status === "redeemed").length} />
              <StatCard icon={DollarSign} label="Total value" value={`KSh ${issued.reduce((s, c) => s + c.amount, 0).toLocaleString()}`} />
            </div>
          )}
          {loadingIssued ? (
            <div className="flex items-center justify-center py-12 gap-2" style={{ color: "var(--portal-text-muted)" }}>
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : issued.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2">
              <CreditCard className="w-8 h-8" style={{ color: "var(--portal-text-faint)" }} />
              <p className="text-sm" style={{ color: "var(--portal-text-muted)" }}>No cards issued yet via this portal.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--portal-border-soft)" }}>
                    {["Code", "Recipient", "Email", "Amount", "Balance", "Status", "Send Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: "var(--portal-text-faint)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {issued.map(c => (
                    <tr key={c.code} style={{ borderBottom: "1px solid var(--portal-border-soft)" }}>
                      <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: "var(--portal-accent)" }}>{c.code}</td>
                      <td className="px-4 py-3" style={{ color: "var(--portal-text)" }}>{c.recipientName}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--portal-text-muted)" }}>{c.recipientEmail}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--portal-text)" }}>KSh {c.amount.toLocaleString()}</td>
                      <td className="px-4 py-3" style={{ color: "var(--portal-text-muted)" }}>KSh {c.balance.toLocaleString()}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold" style={{ color: STATUS_COLOR[c.status] }}>{STATUS_LABEL[c.status]}</span></td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--portal-text-muted)" }}>{c.sendDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Wizard */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--portal-surface)", border: "1px solid var(--portal-border)", boxShadow: "var(--portal-shadow)" }}>

        {/* Progress bar */}
        <div className="flex items-center px-6 py-4 gap-0" style={{ borderBottom: "1px solid var(--portal-border-soft)" }}>
          {[{label:"Configure"},{label:"Recipients"},{label:"Sending"},{label:"Complete"}].map((s, i, arr) => {
            const done = i < stepIdx; const active = i === stepIdx;
            return (
              <div key={s.label} className="flex items-center flex-1">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                    style={{ background: done || active ? "var(--portal-accent)" : "var(--portal-accent-tint)", color: done || active ? "var(--portal-accent-text)" : "var(--portal-text-faint)" }}>
                    {done ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className="text-xs font-semibold hidden sm:block" style={{ color: active ? "var(--portal-text)" : "var(--portal-text-faint)" }}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className="flex-1 h-px mx-3" style={{ background: done ? "var(--portal-accent)" : "var(--portal-border)" }} />}
              </div>
            );
          })}
        </div>

        {/* Step 1: Configure */}
        {step === "config" && (
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--portal-text-faint)" }}>Card Value (KSh)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {DENOMINATIONS.map(d => (
                  <button key={d} onClick={() => { setDenomination(d); setUseCustom(false); }}
                    className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    style={!useCustom && denomination === d
                      ? { background: "var(--portal-accent)", color: "var(--portal-accent-text)" }
                      : { background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)", color: "var(--portal-accent)" }}>
                    {d.toLocaleString()}
                  </button>
                ))}
                <button onClick={() => setUseCustom(true)}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  style={useCustom ? { background: "var(--portal-accent)", color: "var(--portal-accent-text)" } : { background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)", color: "var(--portal-accent)" }}>
                  Custom
                </button>
              </div>
              {useCustom && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--portal-text-muted)" }}>KSh</span>
                  <input type="number" min="500" value={customAmount} onChange={e => setCustomAmount(e.target.value)} placeholder="e.g. 7500"
                    className="flex-1 px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                    style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)", color: "var(--portal-text)" }} />
                </div>
              )}
              {effectiveAmount >= 500 && <p className="text-xs mt-2 font-semibold" style={{ color: "var(--portal-positive)" }}>✓ Each card: KSh {effectiveAmount.toLocaleString()}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--portal-text-faint)" }}>From (Company / Sender Name)</label>
              <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="e.g. Acme Corp HR Team"
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)", color: "var(--portal-text)" }} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--portal-text-faint)" }}>Gift Message (shown on card)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} maxLength={200}
                className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none resize-none"
                style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)", color: "var(--portal-text)" }} />
              <p className="text-xs mt-1 text-right" style={{ color: "var(--portal-text-faint)" }}>{message.length}/200</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--portal-text-faint)" }}>Send Date</label>
              <input type="date" value={sendDate} onChange={e => setSendDate(e.target.value)} min={new Date().toISOString().slice(0, 10)}
                className="px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)", color: "var(--portal-text)" }} />
            </div>
            <button disabled={effectiveAmount < 500} onClick={() => setStep("review")}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
              style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}>
              Continue → Add Recipients
            </button>
          </div>
        )}

        {/* Step 2: Recipients */}
        {step === "review" && (
          <div className="p-6 space-y-5">
            <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--portal-text)" }}>📋 Import CSV</p>
              <p className="text-xs" style={{ color: "var(--portal-text-muted)" }}>One per line: <code className="font-mono">Full Name, email@company.com</code></p>
              <textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={4}
                placeholder={"Jane Doe, jane@acme.com\nJohn Smith, john@acme.com"}
                className="w-full px-3 py-2 rounded-lg text-sm font-mono focus:outline-none resize-none"
                style={{ background: "var(--portal-surface)", border: "1px solid var(--portal-border)", color: "var(--portal-text)" }} />
              {csvError && <p className="text-xs font-semibold" style={{ color: "var(--portal-stop)" }}>{csvError}</p>}
              <div className="flex gap-2">
                <button onClick={applyCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}>
                  <Plus className="w-3.5 h-3.5" /> Add to List
                </button>
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{ background: "var(--portal-surface)", border: "1px solid var(--portal-border)", color: "var(--portal-text-muted)" }}>
                  <Upload className="w-3.5 h-3.5" /> Upload .csv
                </button>
                <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-bold" style={{ color: "var(--portal-text)" }}>
                Recipients <span className="font-normal ml-1" style={{ color: "var(--portal-text-muted)" }}>({recipients.length})</span>
              </p>
              <button onClick={addRow} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)", color: "var(--portal-accent)" }}>
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            {recipients.length === 0 ? (
              <div className="flex flex-col items-center py-10 gap-2 rounded-xl" style={{ border: "2px dashed var(--portal-border)" }}>
                <Users className="w-8 h-8" style={{ color: "var(--portal-text-faint)" }} />
                <p className="text-sm" style={{ color: "var(--portal-text-muted)" }}>No recipients yet. Import CSV or add rows manually.</p>
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--portal-border)" }}>
                <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider"
                  style={{ background: "var(--portal-accent-tint)", color: "var(--portal-text-faint)", borderBottom: "1px solid var(--portal-border)" }}>
                  <span>Name</span><span>Email</span><span>KSh</span><span />
                </div>
                <div className="divide-y max-h-60 overflow-y-auto" style={{ borderColor: "var(--portal-border-soft)" }}>
                  {recipients.map(r => (
                    <div key={r.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 px-4 py-2 items-center">
                      <input value={r.name} onChange={e => updateRow(r.id, "name", e.target.value)} placeholder="Name"
                        className="px-2 py-1 rounded text-sm focus:outline-none w-full"
                        style={{ background: "var(--portal-accent-tint)", color: "var(--portal-text)", border: "1px solid var(--portal-border)" }} />
                      <input value={r.email} onChange={e => updateRow(r.id, "email", e.target.value)} placeholder="email@company.com" type="email"
                        className="px-2 py-1 rounded text-sm focus:outline-none w-full"
                        style={{ background: "var(--portal-accent-tint)", color: "var(--portal-text)", border: "1px solid var(--portal-border)" }} />
                      <input value={r.amount || effectiveAmount} onChange={e => updateRow(r.id, "amount", e.target.value)} type="number" min="500"
                        className="px-2 py-1 rounded text-sm focus:outline-none w-20"
                        style={{ background: "var(--portal-accent-tint)", color: "var(--portal-text)", border: "1px solid var(--portal-border)" }} />
                      <button onClick={() => removeRow(r.id)} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: "var(--portal-stop-tint)" }}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color: "var(--portal-stop)" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recipients.length > 0 && (
              <div className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                style={{ background: "var(--portal-accent-tint)", border: "1px solid var(--portal-border)" }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--portal-text)" }}>
                    {recipients.length} recipient{recipients.length > 1 ? "s" : ""} ·{" "}
                    <span style={{ color: "var(--portal-accent)" }}>KSh {totalValue.toLocaleString()} total</span>
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--portal-text-muted)" }}>
                    Sending {sendDate} · Each card KSh {effectiveAmount.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep("config")} className="px-4 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ border: "1px solid var(--portal-border)", color: "var(--portal-text-muted)" }}>Back</button>
                  <button onClick={sendCards} disabled={recipients.some(r => !r.name || !r.email)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
                    style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}>
                    <Send className="w-4 h-4" /> Issue {recipients.length} Card{recipients.length > 1 ? "s" : ""}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Sending */}
        {step === "sending" && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center animate-pulse" style={{ background: "var(--portal-accent-tint)" }}>
              <Send className="w-7 h-7" style={{ color: "var(--portal-accent)" }} />
            </div>
            <p className="text-base font-bold" style={{ color: "var(--portal-text)" }}>Issuing {recipients.length} gift cards…</p>
            <p className="text-sm" style={{ color: "var(--portal-text-muted)" }}>Generating codes and queuing email delivery</p>
          </div>
        )}

        {/* Step 4: Done */}
        {step === "done" && (
          <div className="p-6 space-y-5">
            <div className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background: results.failed === 0 ? "var(--portal-positive-tint, rgba(47,107,79,0.1))" : "var(--portal-warn-tint)", border: `1px solid ${results.failed === 0 ? "var(--portal-positive)" : "var(--portal-warn)"}` }}>
              {results.failed === 0
                ? <CheckCircle className="w-8 h-8 shrink-0" style={{ color: "var(--portal-positive)" }} />
                : <AlertCircle className="w-8 h-8 shrink-0" style={{ color: "var(--portal-warn)" }} />
              }
              <div>
                <p className="font-bold" style={{ color: "var(--portal-text)" }}>
                  {results.failed === 0 ? `🎉 All ${results.sent} gift cards issued!` : `${results.sent} sent · ${results.failed} failed`}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--portal-text-muted)" }}>Recipients receive their cards on {sendDate} via email.</p>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--portal-border)" }}>
              <div className="max-h-60 overflow-y-auto divide-y" style={{ borderColor: "var(--portal-border-soft)" }}>
                {recipients.map(r => (
                  <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                    {r.status === "sent"
                      ? <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "var(--portal-positive)" }} />
                      : <X className="w-4 h-4 shrink-0" style={{ color: "var(--portal-stop)" }} />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--portal-text)" }}>{r.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--portal-text-muted)" }}>{r.email}</p>
                    </div>
                    <span className="text-xs font-bold shrink-0" style={{ color: r.status === "sent" ? "var(--portal-positive)" : "var(--portal-stop)" }}>
                      {r.status === "sent" ? `KSh ${(r.amount || effectiveAmount).toLocaleString()}` : r.error ?? "Failed"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}>Issue More Cards</button>
              <button onClick={() => { setHistoryOpen(true); fetchIssued(); reset(); }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm"
                style={{ border: "1px solid var(--portal-border)", color: "var(--portal-text-muted)" }}>
                <CreditCard className="w-4 h-4" /> View All Issued
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
