"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, MicOff, Play, Square, CreditCard, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

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
    <div className="min-h-screen bg-[#0A0508] text-white selection:bg-rose-500/30 font-sans">
      <header className="sticky top-0 z-40 bg-[#0A0508]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <button 
          onClick={() => step === "amount" ? router.push("/") : setStep(step === "checkout" ? "details" : step === "details" ? "style" : "amount")} 
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-sm">Back</span>
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 py-8 relative">
        {/* Step Indicators */}
        <div className="flex justify-between items-center mb-8 px-2">
          {["amount", "style", "details", "checkout"].map((s, i) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`w-2 h-2 rounded-full ${["amount", "style", "details", "checkout"].indexOf(step) >= i ? "bg-rose-500 shadow-[0_0_10px_#d946ef]" : "bg-white/20"}`} />
              {i < 3 && <div className={`h-px flex-1 mx-2 ${["amount", "style", "details", "checkout"].indexOf(step) > i ? "bg-rose-500" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        {/* --- STEP 1: AMOUNT --- */}
        {step === "amount" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="font-display text-3xl font-bold italic mb-2">Set the Value</h1>
            <p className="text-white/50 text-sm mb-8">How much magic are we sending today?</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[2000, 5000, 10000, 20000].map(val => (
                <button 
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-6 rounded-3xl border transition-all ${amount === val ? "bg-rose-500/20 border-rose-500 text-rose-300" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"}`}
                >
                  <span className="text-xl font-bold">KES {val.toLocaleString()}</span>
                </button>
              ))}
            </div>
            
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 font-bold">KES</span>
              <input 
                type="number"
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full bg-[#1F0A1C] border border-rose-500/20 rounded-2xl py-5 pl-16 pr-6 text-2xl font-bold text-white focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* --- STEP 2: STYLE --- */}
        {step === "style" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="font-display text-3xl font-bold italic mb-2">Choose the Vibe</h1>
            <p className="text-white/50 text-sm mb-8">Pick a premium card style for the 3D unboxing.</p>
            
            <div className="space-y-4 mb-8">
              <button onClick={() => setThemeStyle("holographic")} className={`w-full relative h-32 rounded-3xl overflow-hidden border transition-all ${themeStyle === "holographic" ? "border-rose-500 shadow-[0_0_30px_rgba(217,70,239,0.3)]" : "border-white/10 opacity-70"}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-500" />
                <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
                <div className="absolute bottom-4 left-4 font-bold text-lg">Holographic Glow</div>
              </button>

              <button onClick={() => setThemeStyle("glassmorphism")} className={`w-full relative h-32 rounded-3xl overflow-hidden border transition-all ${themeStyle === "glassmorphism" ? "border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "border-white/10 opacity-70"}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-800 to-gray-900" />
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 m-2 rounded-2xl" />
                <div className="absolute bottom-6 left-6 font-bold text-lg text-emerald-400">Frost Glass</div>
              </button>

              <button onClick={() => setThemeStyle("dark")} className={`w-full relative h-32 rounded-3xl overflow-hidden border transition-all ${themeStyle === "dark" ? "border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "border-white/10 opacity-70"}`}>
                <div className="absolute inset-0 bg-black" />
                <div className="absolute bottom-4 left-4 font-bold text-lg text-white">Midnight Obsidian</div>
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: DETAILS --- */}
        {step === "details" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="font-display text-3xl font-bold italic mb-2">Personalize it</h1>
            <p className="text-white/50 text-sm mb-8">Add a voice note that plays when they unbox the card.</p>
            
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/80 mb-2">Your Name</label>
              <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} aria-label="Your name" placeholder="e.g. John Doe"
                className="w-full bg-[#1F0A1C] border border-white/10 focus:border-rose-500 focus:outline-none rounded-2xl py-4 px-4 text-white font-semibold transition-colors" />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center">
              <p className="text-sm font-bold text-white/70 mb-4">Record a Voice Note (Optional)</p>
              
              <button 
                onClick={toggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all ${recording ? "bg-red-500 animate-pulse shadow-[0_0_30px_rgba(239,68,68,0.5)]" : audioUrl ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "bg-rose-500 hover:bg-rose-400"}`}
              >
                {recording ? <Square className="w-8 h-8 text-white fill-white" /> : audioUrl ? <Play className="w-8 h-8 text-white fill-white ml-1" /> : <Mic className="w-8 h-8 text-white" />}
              </button>
              
              <p className="text-xs text-white/40 mt-4">
                {recording ? "Recording... tap to stop" : audioUrl ? "Voice note attached! Tap to play/re-record." : "Tap the mic to start recording"}
              </p>
            </div>
          </div>
        )}

        {/* --- STEP 4: CHECKOUT --- */}
        {step === "checkout" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold italic mb-1">Secure Checkout</h1>
              <p className="text-white/50 text-sm">You are gifting KES {amount.toLocaleString()}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">Your M-Pesa Number</label>
                <div className="relative">
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07XX XXX XXX" disabled={paying}
                    className="w-full bg-[#1F0A1C] border border-rose-500/20 focus:border-rose-500 focus:outline-none rounded-2xl py-4 pl-4 pr-4 text-white font-semibold transition-colors" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleSlideToBuy}
              disabled={paying}
              className={`relative w-full h-16 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 ${
                paying ? "bg-rose-600/50" : "bg-rose-500 hover:bg-rose-400"
              }`}
            >
              {paying ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-bold">Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-white" />
                  <span className="font-bold text-lg">Pay KES {amount.toLocaleString()}</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Global Next Button (Hidden on checkout) */}
        {step !== "checkout" && (
          <div className="mt-8">
            <button 
              onClick={handleNext}
              className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              Next Step
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
