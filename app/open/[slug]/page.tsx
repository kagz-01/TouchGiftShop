"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Gift, MapPin, Phone, User, CheckCircle2, PackageOpen } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function UnboxGiftPage() {
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(true);
  const [giftLink, setGiftLink] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);
  
  // States
  const [unboxed, setUnboxed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const { width, height } = useWindowSize();
  const supabase = createClient();

  useEffect(() => {
    const fetchGiftData = async () => {
      try {
        const { data: linkData, error: linkError } = await supabase
          .from("shop_gift_links")
          .select("*, shop_orders(*, shop_products(*))")
          .eq("slug", slug)
          .single();

        if (linkError) throw linkError;
        
        setGiftLink(linkData);
        setOrder(linkData.shop_orders);
        setProduct(linkData.shop_orders.shop_products);
        
        // If already unboxed and address provided, show success state immediately
        if (linkData.delivery_address) {
          setUnboxed(true);
          setSuccess(true);
        }
      } catch (err) {
        console.error("Failed to load gift link", err);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchGiftData();
  }, [slug, supabase]);

  const handleUnbox = async () => {
    setUnboxed(true);
    // Mark as unboxed in DB
    await supabase.from("shop_gift_links").update({ unboxed_at: new Date().toISOString() }).eq("id", giftLink.id);
  };

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await supabase.from("shop_gift_links").update({
        recipient_name: name,
        recipient_phone: phone,
        delivery_address: address
      }).eq("id", giftLink.id);

      // Update order status
      await supabase.from("shop_orders").update({
        status: "processing"
      }).eq("id", order.id);

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong saving your details.");
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

  if (!giftLink) {
    return (
      <div className="min-h-screen bg-[#0A0508] flex items-center justify-center text-white">
        <p className="text-white/50">This magical link doesn't seem to exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0508] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-rose-500/30">
      
      {/* ── BEFORE UNBOXING ── */}
      {!unboxed && (
        <div className="text-center z-10 max-w-sm w-full animate-in fade-in zoom-in duration-1000">
          <div className="w-32 h-32 mx-auto mb-8 relative cursor-pointer hover:scale-105 transition-transform" onClick={handleUnbox}>
            <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-[40px] animate-pulse" />
            <Gift className="w-full h-full text-rose-400 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
          </div>
          <h1 className="font-display text-4xl font-bold italic mb-4">You have a gift!</h1>
          <p className="text-white/60 text-sm mb-8">Someone thinks you're awesome. Tap the button to unwrap your surprise.</p>
          <button 
            onClick={handleUnbox}
            className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-500 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(217,70,239,0.3)] hover:scale-105 transition-transform"
          >
            Tap to Unbox ✨
          </button>
        </div>
      )}

      {/* ── AFTER UNBOXING (THE REVEAL & FORM) ── */}
      {unboxed && !success && (
        <>
          {width > 0 && <ReactConfetti width={width} height={height} numberOfPieces={200} recycle={false} colors={["#d946ef", "#ec4899", "#f59e0b"]} gravity={0.3} />}
          <div className="max-w-md w-full z-10 animate-in slide-in-from-bottom-12 fade-in duration-700 py-12">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-rose-500/10 rounded-full mb-4 border border-rose-500/20">
                <PackageOpen className="w-6 h-6 text-rose-400" />
              </div>
              <h2 className="font-display text-3xl font-bold italic mb-2">It's {product.name}!</h2>
              <p className="text-white/60 text-sm">Now, where should we send it?</p>
            </div>

            {/* Product Card */}
            <div className="bg-[#1F0A1C] border border-rose-500/20 rounded-3xl p-4 mb-6 shadow-2xl flex gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-black shrink-0">
                {product.media_urls?.[0] && <img src={product.media_urls[0]} alt={product.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 py-2">
                <h3 className="font-bold text-sm leading-tight mb-1">{product.name}</h3>
                <p className="text-[10px] text-white/50 line-clamp-3 leading-relaxed">{product.description}</p>
              </div>
            </div>

            {/* Address Form */}
            <form onSubmit={handleSubmitAddress} className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input required type="text" aria-label="Your Full Name" placeholder="Your Full Name" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-rose-500 focus:outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-colors" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input required type="tel" aria-label="Your Phone Number" placeholder="Your Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-rose-500 focus:outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-colors" />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-white/40" />
                <textarea required placeholder="Delivery Address (e.g. 4th Floor, Kofisi Square, Riverside)" value={address} onChange={e => setAddress(e.target.value)} rows={3}
                  className="w-full bg-white/5 border border-white/10 focus:border-rose-500 focus:outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold transition-colors resize-none" />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-4 mt-2 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white rounded-2xl font-bold shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all">
                {submitting ? "Confirming..." : "Confirm Delivery Details"}
              </button>
            </form>
          </div>
        </>
      )}

      {/* ── SUCCESS ── */}
      {success && (
        <div className="text-center z-10 max-w-sm w-full animate-in zoom-in fade-in duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="font-display text-3xl font-bold italic mb-3">All Set!</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">
            We've got your details. Your gift is being prepared and will be dispatched to your location shortly. Enjoy! ✨
          </p>
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left">
             <div className="flex items-center gap-2 mb-2 text-white/40 text-xs uppercase tracking-wider font-bold">
               <MapPin className="w-3.5 h-3.5" /> Delivering to
             </div>
             <p className="text-sm font-medium">{giftLink?.delivery_address || address}</p>
          </div>
        </div>
      )}

    </div>
  );
}
