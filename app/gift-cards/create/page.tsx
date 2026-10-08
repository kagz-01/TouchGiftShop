"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, Play, Square, CreditCard, ShieldCheck, Sparkles, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "amount" | "style" | "details" | "checkout";
type Style = "glassmorphism" | "holographic" | "dark";

const AMOUNTS = [2000, 5000, 10000, 20000];

const THEMES: { id: Style; label: string; desc: string }[] = [
  { id: "holographic", label: "Holographic Glow", desc: "Vibrant rose gradient — premium & bold" },
  { id: "glassmorphism", label: "Frost Glass", desc: "Emerald glassmorphism — sleek & modern" },
  { id: "dark", label: "Midnight Obsidian", desc: "Pure black — timeless & refined" },
];

export default function GiftCardWizard() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number>(5000);
  const [themeStyle, setThemeStyle] = useState<Style>("holographic");
  const [senderName, setSenderName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  // Audio State
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  // Checkout State
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const steps: Step[] = ["amount", "style", "details", "checkout"];
  const stepIndex = steps.indexOf(step);

  const handleNext = () => {
    if (step === "amount") {
      if (amount < 500) { alert("Minimum amount is KES 500"); return; }
      setStep("style");
    } else if (step === "style") {
      setStep("details");
    } else if (step === "details") {
      if (!senderName.trim()) { alert("Please enter your name"); return; }
      if (!recipientName.trim()) { alert("Please enter the recipient's name"); return; }
      setStep("checkout");
    }
  };

  const handleBack = () => {
    if (step === "amount") router.push("/gift-cards");
    else if (step === "style") setStep("amount");
    else if (step === "details") setStep("style");
    else if (step === "checkout") setStep("details");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch {
      alert("Microphone access required to record a voice note.");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setRecording(false);
  };

  const toggleRecording = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  const handlePay = async () => {
    setPayError("");
    if (!phone || phone.replace(/\D/g, "").length < 9) {
      setPayError("Enter a valid M-Pesa number");
      return;
    }
    setPaying(true);
    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          senderName: senderName.trim(),
          recipientName: recipientName.trim(),
          recipientPhone: recipientPhone.trim() || undefined,
          style: { theme: themeStyle },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      // Redirect to PesaPal
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        // Fallback: show success
        router.push(`/shop/gift-ready?slug=${data.card?.id ?? ""}`);
      }
    } catch (err: any) {
      setPayError(err.message);
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050304] text-white selection:bg-rose-500/30 font-sans flex flex-col relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050304]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-sm">Back</span>
          </button>
          <span className="text-xs text-white/30 font-medium">Step {stepIndex + 1} of {steps.length}</span>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 relative z-10 flex flex-col">
        {/* Progress dots */}
        <div className="flex justify-between items-center mb-10 px-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${stepIndex >= i ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)] scale-125" : "bg-white/10"}`} />
              {i < steps.length - 1 && (
                <div className={`h-px flex-1 mx-2 transition-all duration-700 ${stepIndex > i ? "bg-rose-500/50" : "bg-white/5"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 relative">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: AMOUNT ── */}
            {step === "amount" && (
              <motion.div key="amount" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Set the Value</h1>
                <p className="text-white/50 text-sm mb-10">How much magic are we sending today?</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {AMOUNTS.map(val => (
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-6 rounded-3xl border transition-all duration-300 ${amount === val ? "bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.15)]" : "bg-white/[0.02] border-white/5 text-white/60 hover:border-white/10"}`}
                    >
                      <span className="text-xl font-bold">KES {val.toLocaleString()}</span>
                    </motion.button>
                  ))}
                </div>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 font-bold group-focus-within:text-rose-400 transition-colors">KES</span>
                  <input
                    type="number"
                    value={amount}
                    min={500}
                    onChange={e => setAmount(Number(e.target.value))}
                    aria-label="Custom amount"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-2xl font-bold text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all"
                  />
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: STYLE ── */}
            {step === "style" && (
              <motion.div key="style" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="font-display text-4xl font-bold tracking-tight mb-2">Choose the Vibe</h2>
                <p className="text-white/50 text-sm mb-10">Pick a premium card style for the 3D unboxing.</p>
                <div className="space-y-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setThemeStyle("holographic")}
                    className={`w-full relative h-36 rounded-3xl overflow-hidden border transition-all duration-300 ${themeStyle === "holographic" ? "border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.2)]" : "border-white/5 opacity-60 hover:opacity-100 hover:border-white/20"}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-600 to-orange-500" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0" />
                    <div className="absolute bottom-5 left-5 font-bold text-xl text-white drop-shadow-md flex items-center gap-2"><Sparkles className="w-5 h-5" /> Holographic Glow</div>
                    {themeStyle === "holographic" && <div className="absolute top-4 right-4 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setThemeStyle("glassmorphism")}
                    className={`w-full relative h-36 rounded-3xl overflow-hidden border transition-all duration-300 ${themeStyle === "glassmorphism" ? "border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]" : "border-white/5 opacity-60 hover:opacity-100 hover:border-white/20"}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#050304] to-emerald-900/40" />
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 m-3 rounded-2xl" />
                    <div className="absolute bottom-6 left-6 font-bold text-xl text-emerald-400">Frost Glass</div>
                    {themeStyle === "glassmorphism" && <div className="absolute top-4 right-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setThemeStyle("dark")}
                    className={`w-full relative h-36 rounded-3xl overflow-hidden border transition-all duration-300 ${themeStyle === "dark" ? "border-white shadow-[0_0_40px_rgba(255,255,255,0.1)]" : "border-white/5 opacity-60 hover:opacity-100 hover:border-white/20"}`}
                  >
                    <div className="absolute inset-0 bg-[#050304]" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5" />
                    <div className="absolute bottom-5 left-5 font-bold text-xl text-white">Midnight Obsidian</div>
                    {themeStyle === "dark" && <div className="absolute top-4 right-4 w-6 h-6 bg-white rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-black" /></div>}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: DETAILS ── */}
            {step === "details" && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="font-display text-4xl font-bold tracking-tight mb-2">Personalize It</h2>
                <p className="text-white/50 text-sm mb-8">Add details and an optional voice note.</p>
                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Your Name</label>
                    <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="e.g. John Doe" aria-label="Your name"
                      className="w-full bg-black/40 border border-white/10 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none rounded-2xl py-4 px-4 text-white font-semibold transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Recipient's Name</label>
                    <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="e.g. Jane Doe" aria-label="Recipient name"
                      className="w-full bg-black/40 border border-white/10 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none rounded-2xl py-4 px-4 text-white font-semibold transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Recipient Phone (optional)</label>
                    <input type="tel" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} placeholder="07XX XXX XXX" aria-label="Recipient phone"
                      className="w-full bg-black/40 border border-white/10 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none rounded-2xl py-4 px-4 text-white font-semibold transition-all" />
                  </div>
                </div>

                {/* Voice Note Recorder */}
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden backdrop-blur-sm">
                  <p className="text-xs font-bold text-white/50 mb-6 uppercase tracking-wider">Record a Voice Note (Optional)</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={toggleRecording}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${recording ? "bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)]" : audioUrl ? "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-white/5 hover:bg-white/10 border border-white/10"}`}
                  >
                    {recording && <div className="absolute inset-0 border-2 border-rose-400 rounded-full animate-ping opacity-50" />}
                    {recording ? <Square className="w-8 h-8 text-white fill-white relative z-10" /> : audioUrl ? <Play className="w-8 h-8 text-white fill-white ml-1 relative z-10" /> : <Mic className="w-8 h-8 text-white/80 relative z-10" />}
                  </motion.button>
                  <p className="text-sm font-medium text-white/50 mt-6">
                    {recording ? <span className="text-rose-400 animate-pulse">Recording... tap to stop</span>
                     : audioUrl ? <span className="text-emerald-400">✓ Voice note recorded!</span>
                     : "Tap the mic to start recording"}
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: CHECKOUT ── */}
            {step === "checkout" && (
              <motion.div key="checkout" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative">
                    <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping opacity-30" />
                    <ShieldCheck className="w-10 h-10 text-emerald-400 relative z-10" />
                  </div>
                  <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Secure Checkout</h2>
                  <p className="text-white/50 text-sm">
                    Gifting <span className="text-white font-bold">KES {amount.toLocaleString()}</span> to <span className="text-white font-bold">{recipientName}</span>
                  </p>
                </div>

                {/* Order Summary */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-2">
                  {[
                    { label: "Card Theme", value: THEMES.find(t => t.id === themeStyle)?.label ?? themeStyle },
                    { label: "From", value: senderName },
                    { label: "To", value: recipientName },
                    { label: "Amount", value: `KES ${amount.toLocaleString()}`, highlight: true },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-white/40">{row.label}</span>
                      <span className={row.highlight ? "text-emerald-400 font-bold" : "text-white font-semibold"}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {payError && (
                  <div className="mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-sm">{payError}</div>
                )}

                <div className="mb-6">
                  <label className="block text-xs font-bold text-white/50 mb-2 uppercase tracking-wider">Your M-Pesa Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="07XX XXX XXX"
                    disabled={paying}
                    aria-label="M-Pesa number"
                    className="w-full bg-black/40 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none rounded-2xl py-4 px-4 text-white font-semibold transition-all disabled:opacity-50"
                  />
                  <p className="text-xs text-white/30 mt-2">You'll receive an M-Pesa STK push to complete payment.</p>
                </div>

                <motion.button
                  whileHover={{ scale: paying ? 1 : 1.02 }} whileTap={{ scale: paying ? 1 : 0.98 }}
                  onClick={handlePay}
                  disabled={paying}
                  className={`relative w-full py-5 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 font-bold border ${paying ? "bg-emerald-900/40 text-emerald-400 border-emerald-500/20" : "bg-emerald-500 text-[#050304] border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)]"}`}
                >
                  {paying ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                      <span>Initiating M-Pesa Push…</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span>Pay KES {amount.toLocaleString()} via M-Pesa</span>
                    </div>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Next button (not on checkout) */}
        {step !== "checkout" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 pb-8">
            <button
              onClick={handleNext}
              className="w-full py-4 bg-white hover:bg-gray-100 text-[#050304] rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
            >
              Next Step <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
