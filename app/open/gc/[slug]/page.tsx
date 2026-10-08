"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Phone, CheckCircle2, Play, Pause, Wallet, RefreshCw, Sparkles } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

type GiftCard = {
  id: string;
  slug: string;
  amount: number;
  theme_style: "glassmorphism" | "holographic" | "dark";
  voice_note_url?: string;
  sender_name?: string;
  status: "active" | "claimed";
};

export default function UnboxGiftCardPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);

  const [unboxed, setUnboxed] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  // OTP / Claiming State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const { width, height } = useWindowSize();
  const supabase = createClient();

  useEffect(() => {
    const fetchGiftCard = async () => {
      try {
        const { data, error } = await supabase
          .from("digital_gift_cards")
          .select("*")
          .eq("slug", slug)
          .single();

        if (error) throw error;
        setGiftCard(data);

        if (data.status === "claimed") {
          setUnboxed(true);
          setStep("success");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchGiftCard();
  }, [slug, supabase]);

  const handleUnbox = () => {
    setUnboxed(true);
    if (giftCard?.voice_note_url) {
      setPlayingAudio(true);
      setTimeout(() => setPlayingAudio(false), 4000);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!phone || phone.replace(/\D/g, "").length < 9) {
      setError("Please enter a valid phone number");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep("otp");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length < 4) {
      setError("Please enter the 4-digit code");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp, giftCardId: giftCard?.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");

      setWalletBalance(data.wallet?.balance ?? null);
      setStep("success");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0508] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
      </div>
    );
  }

  if (!giftCard) {
    return (
      <div className="min-h-screen bg-[#0A0508] flex flex-col items-center justify-center gap-4 text-white/50 px-4 text-center">
        <div className="text-5xl">🎁</div>
        <p className="text-lg font-semibold">This gift link wasn't found.</p>
        <p className="text-sm">It may have been removed or the link is incorrect.</p>
      </div>
    );
  }

  const cardGradient =
    giftCard.theme_style === "holographic"
      ? "from-rose-600 via-orange-500 to-amber-500"
      : giftCard.theme_style === "glassmorphism"
      ? "from-teal-600/30 to-emerald-600/30"
      : "from-gray-900 to-black";

  const cardBorder =
    giftCard.theme_style === "holographic"
      ? "border-rose-400/40 shadow-[0_0_60px_rgba(244,63,94,0.25)]"
      : giftCard.theme_style === "glassmorphism"
      ? "border-emerald-400/30 shadow-[0_0_60px_rgba(16,185,129,0.2)]"
      : "border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]";

  return (
    <div className="min-h-screen bg-[#0A0508] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-rose-500/30">

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-rose-900/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Confetti */}
      {showConfetti && width > 0 && (
        <ReactConfetti
          width={width}
          height={height}
          numberOfPieces={300}
          recycle={false}
          colors={["#f43f5e", "#10b981", "#f59e0b", "#06b6d4", "#ffffff"]}
          gravity={0.3}
        />
      )}

      {/* ── BEFORE UNBOXING ── */}
      {!unboxed && (
        <div className="text-center z-10 max-w-sm w-full animate-in fade-in zoom-in duration-700">

          {/* Animated envelope */}
          <div
            className="w-72 h-44 mx-auto mb-10 relative cursor-pointer group"
            onClick={handleUnbox}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${cardGradient} ${cardBorder} border backdrop-blur-xl rounded-3xl group-hover:scale-105 transition-all duration-500 flex items-center justify-center overflow-hidden`}>
              {/* Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-all duration-1000" />
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 shadow-inner">
                  <span className="text-3xl">🎁</span>
                </div>
                <span className="text-white/60 text-sm font-semibold">Tap to open</span>
              </div>
            </div>
          </div>

          <h1 className="font-display text-4xl font-bold italic mb-3">
            A Gift{giftCard.sender_name ? ` from ${giftCard.sender_name}` : " for You"}
          </h1>
          <p className="text-white/50 text-sm mb-8">
            Someone special sent you a TouchGift worth{" "}
            <span className="text-white font-bold">KES {Number(giftCard.amount).toLocaleString()}</span>
          </p>

          <button
            onClick={handleUnbox}
            className="w-full py-5 bg-gradient-to-r from-rose-600 to-orange-500 rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(244,63,94,0.3)] hover:shadow-[0_0_60px_rgba(244,63,94,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" /> Open Your Gift ✨
          </button>
        </div>
      )}

      {/* ── AFTER UNBOXING ── */}
      {unboxed && step !== "success" && (
        <div className="max-w-md w-full z-10 animate-in slide-in-from-bottom-12 fade-in duration-700 py-10 flex flex-col items-center gap-6">

          {/* 3D-style Gift Card */}
          <div className={`w-full max-w-xs h-48 rounded-[2rem] p-6 flex flex-col justify-between border ${cardBorder} relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${cardGradient}`} />
            {giftCard.theme_style === "glassmorphism" && (
              <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            )}
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="font-display font-bold italic text-lg text-white/90">TouchGift</span>
              {giftCard.voice_note_url && (
                <button
                  onClick={() => setPlayingAudio(!playingAudio)}
                  className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {playingAudio ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
                </button>
              )}
            </div>

            <div className="relative z-10">
              <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Gift Value</p>
              <p className="font-display text-4xl font-bold italic text-white">KES {Number(giftCard.amount).toLocaleString()}</p>
              {giftCard.sender_name && (
                <p className="text-white/50 text-xs mt-1">From {giftCard.sender_name}</p>
              )}
            </div>
          </div>

          {/* Claim Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-full shadow-2xl">
            <h2 className="font-bold text-xl mb-1 text-center">Claim to Wallet</h2>
            <p className="text-sm text-white/50 text-center mb-6 leading-relaxed">
              Enter your phone to instantly deposit{" "}
              <span className="text-white font-semibold">KES {Number(giftCard.amount).toLocaleString()}</span>{" "}
              to your TouchGift Wallet.
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-sm">
                {error}
              </div>
            )}

            {step === "phone" ? (
              <form onSubmit={handleRequestOtp}>
                <div className="relative mb-4">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    required
                    type="tel"
                    aria-label="Phone number"
                    placeholder="07XX XXX XXX"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-rose-500 focus:outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</> : "Send Secure OTP"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="animate-in fade-in zoom-in duration-300">
                <p className="text-center text-xs text-white/40 mb-4">
                  Code sent to <span className="text-white/70">{phone}</span>
                  <button type="button" onClick={() => { setStep("phone"); setOtp(""); setError(""); }} className="ml-2 text-rose-400 underline text-xs">Change</button>
                </p>
                <div className="mb-4">
                  <input
                    required
                    type="text"
                    inputMode="numeric"
                    aria-label="One-time password"
                    placeholder="• • • •"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    className="w-full bg-white/5 border border-white/10 focus:border-emerald-500 focus:outline-none rounded-2xl py-5 text-center text-3xl font-bold tracking-[0.8em] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || otp.length < 4}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                >
                  {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</> : <>✓ Verify & Claim KES {Number(giftCard.amount).toLocaleString()}</>}
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={submitting}
                  className="w-full py-3 mt-3 text-white/40 hover:text-white/70 text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend code
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── SUCCESS ── */}
      {step === "success" && (
        <div className="text-center z-10 max-w-sm w-full animate-in zoom-in fade-in duration-500 px-2">
          <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(16,185,129,0.25)] relative">
            <div className="absolute inset-0 border border-emerald-400/20 rounded-full animate-ping" />
            <Wallet className="w-10 h-10 text-emerald-400 relative z-10" />
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wide">Funds Secured!</span>
          </div>

          <h2 className="font-display text-3xl font-bold italic mb-3">It's in your wallet!</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-3">
            <span className="text-emerald-400 font-bold text-lg">KES {Number(giftCard.amount).toLocaleString()}</span> has been added to your TouchGift Wallet.
          </p>
          {walletBalance !== null && (
            <p className="text-white/40 text-xs mb-8">
              New balance: <span className="text-white/70 font-semibold">KES {Number(walletBalance).toLocaleString()}</span>
            </p>
          )}

          <a
            href="/account/wallet"
            className="inline-flex items-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] justify-center"
          >
            <Wallet className="w-5 h-5" /> View My Wallet
          </a>
          <a
            href="/shop"
            className="block mt-3 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-2xl font-semibold text-sm transition-all"
          >
            Shop Now 🛍️
          </a>
        </div>
      )}
    </div>
  );
}
