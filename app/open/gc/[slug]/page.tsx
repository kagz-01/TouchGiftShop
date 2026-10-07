"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Phone, CheckCircle2, Play, Pause, Wallet } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function UnboxGiftCardPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [giftCard, setGiftCard] = useState<any>(null);
  
  // States
  const [unboxed, setUnboxed] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);
  
  // OTP / Claiming State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [submitting, setSubmitting] = useState(false);

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
      // In a real app, play the audio here.
      setTimeout(() => setPlayingAudio(false), 3000);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate sending OTP
    setTimeout(() => {
      setSubmitting(false);
      setStep("otp");
    }, 1500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Create or get wallet
      let { data: wallet } = await supabase.from("user_wallets").select("id, balance").eq("phone", phone).single();
      
      if (!wallet) {
        const { data: newWallet, error: createError } = await supabase.from("user_wallets").insert({ phone, balance: giftCard.amount }).select().single();
        if (createError) throw createError;
        wallet = newWallet;
      } else {
        await supabase.from("user_wallets").update({ balance: Number(wallet.balance) + Number(giftCard.amount) }).eq("id", wallet.id);
      }

      // 2. Log transaction
      await supabase.from("wallet_transactions").insert({
        wallet_id: wallet!.id,
        amount: giftCard.amount,
        type: "credit",
        reference_type: "gift_card_claim",
        reference_id: giftCard.id
      });

      // 3. Mark Gift Card as claimed
      await supabase.from("digital_gift_cards").update({
        status: "claimed",
        claimed_by_phone: phone,
        claimed_at: new Date().toISOString()
      }).eq("id", giftCard.id);

      setStep("success");
    } catch (err) {
      console.error(err);
      alert("Failed to claim gift card");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0508] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
      </div>
    );
  }

  if (!giftCard) return <div className="min-h-screen bg-[#0A0508] flex items-center justify-center text-white/50">Gift not found</div>;

  return (
    <div className="min-h-screen bg-[#0A0508] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-fuchsia-500/30">
      
      {/* ── BEFORE UNBOXING ── */}
      {!unboxed && (
        <div className="text-center z-10 max-w-sm w-full animate-in fade-in zoom-in duration-1000">
          <div className="w-64 h-40 mx-auto mb-8 relative cursor-pointer group" onClick={handleUnbox}>
             {/* Closed Envelope Mock */}
             <div className="absolute inset-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl group-hover:scale-105 transition-transform duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center">
               <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-fuchsia-600 to-pink-500 flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.5)]">
                 <Wallet className="w-6 h-6 text-white" />
               </div>
             </div>
          </div>
          <h1 className="font-display text-4xl font-bold italic mb-4">A Gift from {giftCard.sender_name}</h1>
          <button onClick={handleUnbox} className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-pink-500 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:scale-105 transition-transform">
            Tap to Open ✨
          </button>
        </div>
      )}

      {/* ── AFTER UNBOXING ── */}
      {unboxed && step !== "success" && (
        <>
          {width > 0 && <ReactConfetti width={width} height={height} numberOfPieces={200} recycle={false} colors={["#d946ef", "#34d399", "#60a5fa"]} gravity={0.3} />}
          
          <div className="max-w-md w-full z-10 animate-in slide-in-from-bottom-12 fade-in duration-700 py-12 flex flex-col items-center">
            
            {/* 3D Card Representation */}
            <div className={`w-80 h-48 rounded-[2rem] p-6 flex flex-col justify-between border shadow-2xl relative overflow-hidden mb-8 transform transition-transform hover:scale-105 ${
              giftCard.theme_style === "holographic" ? "border-fuchsia-500 shadow-[0_0_50px_rgba(217,70,239,0.3)]" :
              giftCard.theme_style === "glassmorphism" ? "border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.2)] bg-white/5 backdrop-blur-xl" :
              "border-white/20 bg-black shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            }`}>
              {giftCard.theme_style === "holographic" && <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600 via-purple-500 to-pink-500 opacity-80" />}
              {giftCard.theme_style === "glassmorphism" && <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20" />}
              
              <div className="relative z-10 flex justify-between items-start">
                <span className="font-display font-bold italic text-lg opacity-80">TouchGift</span>
                {giftCard.voice_note_url && (
                  <button onClick={() => setPlayingAudio(!playingAudio)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                    {playingAudio ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>
                )}
              </div>
              <div className="relative z-10">
                <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Value</p>
                <p className="font-display text-4xl font-bold italic">KES {Number(giftCard.amount).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-[#1F0A1C] border border-fuchsia-500/20 rounded-3xl p-6 w-full shadow-2xl">
              <h2 className="font-bold text-xl mb-2 text-center">Claim to Wallet</h2>
              <p className="text-sm text-white/50 text-center mb-6">Enter your phone number to secure these funds in your TouchGift Wallet.</p>

              {step === "phone" ? (
                <form onSubmit={handleRequestOtp}>
                  <div className="relative mb-4">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input required type="tel" placeholder="07XX XXX XXX" value={phone} onChange={e => setPhone(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-500 focus:outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-colors" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-4 bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-50 text-white rounded-2xl font-bold transition-colors">
                    {submitting ? "Sending OTP..." : "Send Secure OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="animate-in fade-in zoom-in duration-300">
                  <div className="mb-4">
                    <input required type="text" placeholder="Enter 4-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={4}
                      className="w-full bg-white/5 border border-white/10 focus:border-fuchsia-500 focus:outline-none rounded-2xl py-4 text-center text-2xl font-bold tracking-[0.5em] transition-colors" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white rounded-2xl font-bold transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    {submitting ? "Verifying..." : "Verify & Claim Funds"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── SUCCESS ── */}
      {step === "success" && (
        <div className="text-center z-10 max-w-sm w-full animate-in zoom-in fade-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <Wallet className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="font-display text-3xl font-bold italic mb-3">Funds Secured!</h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            KES {Number(giftCard.amount).toLocaleString()} has been added to your TouchGift Wallet.
          </p>
          <button className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold text-sm transition-colors border border-white/10">
            View My Wallet
          </button>
        </div>
      )}

    </div>
  );
}
