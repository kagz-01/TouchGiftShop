"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, MicOff, Play, Square, CreditCard, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { motion, AnimatePresence } from "framer-motion";

type Step = "amount" | "style" | "details" | "checkout";
type Style = "glassmorphism" | "holographic" | "dark";

export default function GiftCardWizard() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("amount");
  const [amount, setAmount] = useState<number>(5000);
  const [themeStyle, setThemeStyle] = useState<Style>("holographic");
  const [senderName, setSenderName] = useState("");
  
  // Audio Mock State
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Checkout State
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);

  const handleNext = () => {
    if (step === "amount") setStep("style");
    else if (step === "style") setStep("details");
    else if (step === "details") {
      if (!senderName) { alert("Please enter your name"); return; }
      setStep("checkout");
    }
  };

  const handleSlideToBuy = async () => {
    if (phone.length < 9) {
      alert("Enter a valid M-Pesa number");
      return;
    }
    setPaying(true);

    setTimeout(async () => {
      try {
        const slug = Math.random().toString(36).substring(2, 12);
        const { error } = await supabase.from("digital_gift_cards").insert({
          slug,
          amount,
          theme_style: themeStyle,
          sender_name: senderName,
          voice_note_url: audioUrl, // mocked
        });

        if (error) throw error;
        
        // Push to handoff
        router.push(`/shop/gift-ready?slug=${slug}`);
      } catch (err) {
        console.error(err);
        alert("Failed to secure gift card");
      } finally {
        setPaying(false);
      }
    }, 2000);
  };

  // Mock Audio Recording
  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      setAudioUrl("mocked_audio_url.mp3");
    } else {
      setRecording(true);
      setAudioUrl(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#050304] text-white selection:bg-rose-500/30 font-sans flex flex-col relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-40 bg-[#050304]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center">
          <button 
            onClick={() => step === "amount" ? router.push("/") : setStep(step === "checkout" ? "details" : step === "details" ? "style" : "amount")} 
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-sm">Back</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 relative z-10 flex flex-col">
        {/* Step Indicators */}
        <div className="flex justify-between items-center mb-10 px-2">
          {["amount", "style", "details", "checkout"].map((s, i) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-2 h-2 rounded-full transition-all duration-500 ${["amount", "style", "details", "checkout"].indexOf(step) >= i ? "bg-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.8)] scale-125" : "bg-white/10"}`} />
              {i < 3 && <div className={`h-px flex-1 mx-2 transition-all duration-500 ${["amount", "style", "details", "checkout"].indexOf(step) > i ? "bg-rose-500/50" : "bg-white/5"}`} />}
            </div>
          ))}
        </div>

        <div className="flex-1 relative">
          <AnimatePresence mode="wait">

        {/* --- STEP 1: AMOUNT --- */}
        {step === "amount" && (
          <motion.div 
            key="amount"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
          >
            <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Set the Value</h1>
            <p className="text-white/50 text-sm mb-10 font-medium">How much magic are we sending today?</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[2000, 5000, 10000, 20000].map(val => (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-6 rounded-3xl border transition-all duration-300 ${amount === val ? "bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.15)]" : "bg-white/[0.02] border-white/5 text-white/60 hover:bg-white-[0.05] hover:border-white/10"}`}
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
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-2xl font-bold text-white focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-inner"
              />
            </div>
          </motion.div>
        )}

        {/* --- STEP 2: STYLE --- */}
        {step === "style" && (
          <motion.div 
            key="style"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
          >
            <h2 className="font-display text-4xl font-bold tracking-tight mb-2">Choose the Vibe</h2>
            <p className="text-white/50 text-sm mb-10 font-medium">Pick a premium card style for the 3D unboxing.</p>
            
            <div className="space-y-5 mb-8">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setThemeStyle("holographic")} className={`w-full relative h-36 rounded-3xl overflow-hidden border transition-all duration-300 ${themeStyle === "holographic" ? "border-rose-500 shadow-[0_0_40px_rgba(225,29,72,0.2)]" : "border-white/5 opacity-60 hover:opacity-100 hover:border-white/20"}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-600 to-rose-400" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                <div className="absolute bottom-5 left-5 font-bold text-xl text-white drop-shadow-md flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-200" /> Holographic Glow
                </div>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setThemeStyle("glassmorphism")} className={`w-full relative h-36 rounded-3xl overflow-hidden border transition-all duration-300 ${themeStyle === "glassmorphism" ? "border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]" : "border-white/5 opacity-60 hover:opacity-100 hover:border-white/20"}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-[#050304] to-emerald-900/40" />
                <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 m-3 rounded-2xl" />
                <div className="absolute bottom-6 left-6 font-bold text-xl text-emerald-400 drop-shadow-md">Frost Glass</div>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setThemeStyle("dark")} className={`w-full relative h-36 rounded-3xl overflow-hidden border transition-all duration-300 ${themeStyle === "dark" ? "border-white shadow-[0_0_40px_rgba(255,255,255,0.1)]" : "border-white/5 opacity-60 hover:opacity-100 hover:border-white/20"}`}>
                <div className="absolute inset-0 bg-[#050304]" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5" />
                <div className="absolute bottom-5 left-5 font-bold text-xl text-white">Midnight Obsidian</div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* --- STEP 3: DETAILS --- */}
        {step === "details" && (
          <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
          >
            <h2 className="font-display text-4xl font-bold tracking-tight mb-2">Personalize it</h2>
            <p className="text-white/50 text-sm mb-10 font-medium">Add a voice note that plays when they unbox the card.</p>
            
            <div className="mb-8">
              <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">Your Name</label>
              <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} aria-label="Your name" placeholder="e.g. John Doe"
                className="w-full bg-black/40 border border-white/10 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none rounded-2xl py-4 px-4 text-white font-semibold transition-all shadow-inner" />
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <p className="text-sm font-bold text-white/60 mb-6 uppercase tracking-wider">Record a Voice Note (Optional)</p>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecording}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${recording ? "bg-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]" : audioUrl ? "bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-white/5 hover:bg-white/10 border border-white/10"}`}
              >
                {recording && <div className="absolute inset-0 border-2 border-red-400 rounded-full animate-ping opacity-50" />}
                {recording ? <Square className="w-8 h-8 text-white fill-white relative z-10" /> : audioUrl ? <Play className="w-8 h-8 text-white fill-white ml-1 relative z-10" /> : <Mic className="w-8 h-8 text-white/80 relative z-10" />}
              </motion.button>
              
              <p className="text-sm font-medium text-white/50 mt-6">
                {recording ? <span className="text-red-400 animate-pulse">Recording... tap to stop</span> : audioUrl ? <span className="text-emerald-400">Voice note attached! Tap to play.</span> : "Tap the mic to start recording"}
              </p>
            </div>
          </motion.div>
        )}

        {/* --- STEP 4: CHECKOUT --- */}
        {step === "checkout" && (
          <motion.div 
            key="checkout"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative">
                <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping opacity-30" />
                <ShieldCheck className="w-10 h-10 text-emerald-400 relative z-10" />
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Secure Checkout</h2>
              <p className="text-white/50 text-sm font-medium">You are gifting <span className="text-white">KES {amount.toLocaleString()}</span></p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">Your M-Pesa Number</label>
                <div className="relative group">
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XX XXX XXX" disabled={paying}
                    className="w-full bg-black/40 border border-white/10 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none rounded-2xl py-4 pl-4 pr-4 text-white font-semibold transition-all shadow-inner disabled:opacity-50" />
                </div>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSlideToBuy}
              disabled={paying}
              className={`relative w-full py-5 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 font-bold border ${
                paying ? "bg-emerald-900/40 text-emerald-400 border-emerald-500/20" : "bg-emerald-500 text-[#050304] border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)]"
              }`}
            >
              {paying ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Pay KES {amount.toLocaleString()}</span>
                </div>
              )}
            </motion.button>
          </motion.div>
        )}
        </AnimatePresence>
        </div>

        {/* Global Next Button */}
        {step !== "checkout" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 relative z-20 pb-8"
          >
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-white hover:bg-gray-200 text-[#050304] rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2"
            >
              Next Step <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

      </main>
    </div>
  );
}
