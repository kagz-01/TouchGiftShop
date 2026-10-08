"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Gift, MapPin, Phone, User, CheckCircle2, PackageOpen, Sparkles } from "lucide-react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "react-use";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="min-h-screen bg-[#050304] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden selection:bg-rose-500/30 font-sans">
      
      {/* Ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-900/10 rounded-full blur-[150px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* ── BEFORE UNBOXING ── */}
        {!unboxed && (
          <motion.div 
            key="unopened"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center z-10 max-w-sm w-full relative"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-40 h-40 mx-auto mb-10 relative cursor-pointer group" 
              onClick={handleUnbox}
            >
              <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-[50px] group-hover:bg-rose-500/40 transition-all duration-500 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-600/20 to-pink-500/20 rounded-full border border-rose-500/30 backdrop-blur-sm group-hover:border-rose-400/50 transition-all duration-500" />
              <Gift className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-rose-300 drop-shadow-[0_0_20px_rgba(225,29,72,0.6)] group-hover:scale-110 transition-transform duration-500" />
            </motion.div>
            
            <h1 className="font-display text-5xl font-bold tracking-tight mb-4">A Gift Awaits</h1>
            <p className="text-white/50 text-base mb-10 tracking-wide font-medium">Someone thinks you're exceptional. <br/> Tap the box to reveal your surprise.</p>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUnbox}
              className="relative w-full py-5 rounded-2xl font-bold text-lg overflow-hidden group border border-white/10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
              <div className="absolute w-[200%] h-full top-0 left-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_2s_infinite]" />
              <span className="relative z-10 flex items-center justify-center gap-2 drop-shadow-md">
                <Sparkles className="w-5 h-5 text-rose-200" />
                Reveal Your Gift
              </span>
            </motion.button>
          </motion.div>
        )}

        {/* ── AFTER UNBOXING (THE REVEAL & FORM) ── */}
        {unboxed && !success && (
          <motion.div 
            key="revealed"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="max-w-md w-full z-10 py-12"
          >
            {width > 0 && <ReactConfetti width={width} height={height} numberOfPieces={300} recycle={false} colors={["#e11d48", "#be123c", "#fb7185", "#f43f5e"]} gravity={0.2} initialVelocityY={20} />}
            
            <div className="text-center mb-10">
              <motion.div 
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.6 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-rose-500/20 to-pink-500/20 rounded-2xl mb-6 border border-rose-500/30 shadow-[0_0_30px_rgba(225,29,72,0.3)]"
              >
                <PackageOpen className="w-8 h-8 text-rose-400" />
              </motion.div>
              <h2 className="font-display text-4xl font-bold tracking-tight mb-3">It's {product.name}!</h2>
              <p className="text-white/60 text-base">We need your details to orchestrate the delivery.</p>
            </div>

            {/* Product Card */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 mb-8 shadow-2xl backdrop-blur-xl flex gap-5 hover:border-rose-500/30 transition-colors"
            >
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#0A0508] shrink-0 border border-white/5 relative group">
                {product.media_urls?.[0] && <img src={product.media_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />}
              </div>
              <div className="flex-1 py-1 flex flex-col justify-center">
                <h3 className="font-bold text-base leading-tight mb-2 tracking-wide">{product.name}</h3>
                <p className="text-xs text-white/50 line-clamp-3 leading-relaxed">{product.description}</p>
              </div>
            </motion.div>

            {/* Address Form */}
            <motion.form 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              onSubmit={handleSubmitAddress} 
              className="space-y-4"
            >
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-rose-400 transition-colors" />
                <input required type="text" aria-label="Your Full Name" placeholder="Your Full Name" value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all" />
              </div>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-rose-400 transition-colors" />
                <input required type="tel" aria-label="Your Phone Number" placeholder="Your Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all" />
              </div>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-white/40 group-focus-within:text-rose-400 transition-colors" />
                <textarea required aria-label="Delivery Address" placeholder="Delivery Address (e.g. 4th Floor, Kofisi Square, Riverside)" value={address} onChange={e => setAddress(e.target.value)} rows={3}
                  className="w-full bg-black/40 border border-white/10 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 outline-none rounded-2xl py-4 pl-12 pr-4 text-sm font-medium transition-all resize-none" />
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={submitting}
                className="w-full py-4 mt-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:shadow-[0_0_50px_rgba(225,29,72,0.5)] transition-all flex items-center justify-center gap-2 border border-rose-400/20"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Confirming...
                  </>
                ) : "Secure Delivery Details"}
              </motion.button>
            </motion.form>
          </motion.div>
        )}

        {/* ── SUCCESS ── */}
        {success && (
          <motion.div 
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="text-center z-10 max-w-sm w-full"
          >
            <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(16,185,129,0.2)] relative">
              <div className="absolute inset-0 rounded-full border border-emerald-400/20 animate-ping opacity-30" />
              <CheckCircle2 className="w-12 h-12 text-emerald-400 relative z-10" />
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight mb-4">Confirmed!</h2>
            <p className="text-white/60 text-base leading-relaxed mb-8 font-medium">
              We've securely logged your details. Your gift is being prepared and will be dispatched shortly. ✨
            </p>
            <div className="p-5 bg-white/[0.03] border border-white/10 rounded-3xl text-left backdrop-blur-md">
               <div className="flex items-center gap-2 mb-3 text-emerald-400 text-xs uppercase tracking-[0.2em] font-bold">
                 <MapPin className="w-4 h-4" /> Destination
               </div>
               <p className="text-sm font-medium leading-relaxed">{giftLink?.delivery_address || address}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
