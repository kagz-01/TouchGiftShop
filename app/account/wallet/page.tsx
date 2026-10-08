"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, Gift, RefreshCw, Phone, CheckCircle2, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";

type WalletData = {
  id: string;
  balance: number;
  phone: string;
  created_at: string;
};

type Transaction = {
  id: string;
  amount: number;
  type: "credit" | "debit";
  reference_type: string;
  reference_id: string;
  created_at: string;
};

const REF_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  gift_card_claim: { label: "Gift Card Claimed", icon: <Gift className="w-4 h-4 text-emerald-400" /> },
  order_payment:   { label: "Order Payment",     icon: <ShoppingBag className="w-4 h-4 text-rose-400" /> },
  refund:          { label: "Refund",             icon: <ArrowDownLeft className="w-4 h-4 text-sky-400" /> },
};

export default function WalletPage() {
  const [phone, setPhone] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [otp, setOtp] = useState("");
  const [authStep, setAuthStep] = useState<"phone" | "otp" | "authed">("phone");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWallet = useCallback(async (ph: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wallet?phone=${encodeURIComponent(ph)}`);
      const data = await res.json();
      setWallet(data.wallet);
      setTransactions(data.transactions ?? []);
    } catch { /* noop */ }
    setLoading(false);
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phoneInput || phoneInput.replace(/\D/g, "").length < 9) {
      setError("Enter a valid Kenyan phone number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setPhone(phoneInput);
      setAuthStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length < 4) { setError("Enter the 4-digit code"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Incorrect code");
      setAuthStep("authed");
      await fetchWallet(phone);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalCredited = transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalSpent    = transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#070409] text-white pb-24">

      {/* Ambient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#070409]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-display italic font-bold text-white text-lg leading-tight">My Wallet</h1>
              <p className="text-[11px] text-emerald-400">TouchGift Balance</p>
            </div>
          </div>
          {authStep === "authed" && (
            <button onClick={() => fetchWallet(phone)} className="p-2 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-400/30 transition-colors">
              <RefreshCw className={`w-4 h-4 text-white/50 ${loading ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 relative z-10">

        {/* ── AUTH ── */}
        {authStep !== "authed" && (
          <div className="space-y-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                <Wallet className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="font-display italic font-bold text-2xl mb-2">Access Your Wallet</h2>
              <p className="text-white/50 text-sm">We'll send you a quick OTP to verify it's you.</p>
            </div>

            {error && (
              <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-sm">{error}</div>
            )}

            {authStep === "phone" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="tel"
                    placeholder="07XX XXX XXX"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    aria-label="Phone number"
                    required
                    className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</> : "Send OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-300">
                <p className="text-center text-sm text-white/50">
                  Code sent to <span className="text-white/80">{phone}</span>
                  <button type="button" onClick={() => { setAuthStep("phone"); setOtp(""); setError(""); }} className="ml-2 text-emerald-400 underline text-xs">Change</button>
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="• • • •"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                  aria-label="OTP code"
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none rounded-2xl py-5 text-center text-3xl font-bold tracking-[0.8em] transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting || otp.length < 4}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</> : "Verify & Open Wallet"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── WALLET DASHBOARD ── */}
        {authStep === "authed" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-900/30 to-teal-900/20 p-6 shadow-[0_0_60px_rgba(16,185,129,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0" />
              <div className="absolute top-3 right-4">
                <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wide">Live</span>
                </div>
              </div>

              <p className="text-white/50 text-xs uppercase tracking-widest mb-1 relative z-10">Available Balance</p>
              {loading ? (
                <div className="h-12 w-40 bg-white/5 rounded-xl animate-pulse" />
              ) : (
                <p className="font-display text-5xl font-bold italic text-white relative z-10">
                  KES {wallet ? Number(wallet.balance).toLocaleString() : "0"}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
                <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
                  <p className="text-[10px] text-white/40 mb-0.5">Total Received</p>
                  <p className="text-sm font-bold text-emerald-400">KES {totalCredited.toLocaleString()}</p>
                </div>
                <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
                  <p className="text-[10px] text-white/40 mb-0.5">Total Spent</p>
                  <p className="text-sm font-bold text-rose-400">KES {totalSpent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* No wallet yet */}
            {!wallet && !loading && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
                <div className="text-4xl mb-3">🎁</div>
                <p className="text-white/60 text-sm">No wallet yet.</p>
                <p className="text-white/30 text-xs mt-1">Open a gift card link to create your wallet automatically.</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/shop"
                className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-emerald-400/30 hover:bg-white/8 transition-all group"
              >
                <ShoppingBag className="w-6 h-6 text-white/50 group-hover:text-emerald-400 transition-colors" />
                <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors">Shop Now</span>
              </Link>
              <Link
                href="/gift-cards/create"
                className="flex flex-col items-center gap-2 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-rose-400/30 hover:bg-white/8 transition-all group"
              >
                <Gift className="w-6 h-6 text-white/50 group-hover:text-rose-400 transition-colors" />
                <span className="text-xs font-semibold text-white/60 group-hover:text-white transition-colors">Send a Gift Card</span>
              </Link>
            </div>

            {/* Transactions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Transaction History</h3>
                <span className="text-xs text-white/30">{transactions.length} entries</span>
              </div>

              {transactions.length === 0 && (
                <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center">
                  <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40">No transactions yet.</p>
                  <p className="text-xs text-white/20 mt-1">Open a gift card to get started!</p>
                </div>
              )}

              {transactions.map((tx) => {
                const isCredit = tx.type === "credit";
                const meta = REF_LABELS[tx.reference_type] ?? { label: tx.reference_type, icon: <Sparkles className="w-4 h-4 text-white/40" /> };
                const date = new Date(tx.created_at).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={tx.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                      {isCredit
                        ? <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                        : <ArrowUpRight className="w-5 h-5 text-rose-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {meta.icon}
                        <p className="text-sm font-semibold text-white truncate">{meta.label}</p>
                      </div>
                      <p className="text-xs text-white/30">{date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${isCredit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isCredit ? "+" : "-"}KES {Number(tx.amount).toLocaleString()}
                      </p>
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
