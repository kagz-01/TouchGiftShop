"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { ArrowLeft, Building2, Link as LinkIcon, Upload, ShieldCheck, Download, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CorporateCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Checkout States
  const [quantity, setQuantity] = useState(50);
  const [deliveryMethod, setDeliveryMethod] = useState<"links" | "csv">("links");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "bank">("bank");
  const [paying, setPaying] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    if (!productId) {
      router.push("/corporate");
      return;
    }
    const fetchProduct = async () => {
      const { data } = await supabase.from("shop_products").select("*").eq("id", productId).single();
      if (data) setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [productId, router, supabase]);

  const baseAmount = (product?.price || 0) * quantity;
  
  // Dynamic Volume Discount Logic
  let discountPercentage = 0;
  if (quantity >= 500) discountPercentage = 0.15;
  else if (quantity >= 100) discountPercentage = 0.10;
  else if (quantity >= 50) discountPercentage = 0.05;
  
  const discountAmount = baseAmount * discountPercentage;
  const finalAmount = baseAmount - discountAmount;

  const handleCheckout = async () => {
    setPaying(true);

    // Simulate Enterprise Pesapal Gateway Checkout
    setTimeout(async () => {
      try {
        const orderIds = [];
        const linkSlugs = [];

        // In a real bulk order, you might create 1 master order and 50 sub-items,
        // but to re-use our Magic Link unboxing, we'll generate 50 gift links.
        for(let i=0; i<quantity; i++) {
          const { data: order } = await supabase.from("shop_orders").insert({
            product_id: product.id,
            buyer_id: "corp_session",
            amount: product.price,
            status: "pending_address",
            payment_ref: "pesapal_b2b"
          }).select().single();

          if(order) {
            const slug = Math.random().toString(36).substring(2, 10);
            await supabase.from("shop_gift_links").insert({
              order_id: order.id,
              slug: slug
            });
            linkSlugs.push(slug);
          }
        }

        // Store bulk slugs in sessionStorage just to show them on the success page
        sessionStorage.setItem("bulk_gift_slugs", JSON.stringify(linkSlugs));
        sessionStorage.setItem("bulk_method", deliveryMethod);
        
        router.push(`/corporate/success`);

      } catch (err) {
        console.error(err);
        alert("B2B Checkout Failed");
        setPaying(false);
      }
    }, 3000);
  };

  if (loading || !product) return (
    <div className="min-h-screen bg-[#050304] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050304] text-white selection:bg-emerald-500/30 font-sans pb-20">
      {/* Premium Gradient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-teal-900/10 blur-[120px] rounded-full" />
      </div>

      <header className="sticky top-0 z-40 bg-[#050304]/60 backdrop-blur-2xl border-b border-white/5 px-6 py-4 flex justify-between items-center transition-all">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm tracking-wide">Return to Showroom</span>
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="font-display font-bold text-emerald-400 text-sm tracking-widest uppercase">Pesapal Enterprise</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        
        {/* Left Column: Configuration */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-7 space-y-8"
        >
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight mb-2">Configure Deployment</h1>
            <p className="text-white/50 text-sm">Customize how your team receives their {product.name} gifts.</p>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Recipient Count
            </h2>
            
            <div className="flex items-end justify-between mb-6">
              <span className="font-display text-5xl font-bold text-white tracking-tighter">{quantity}</span>
              <span className="text-white/40 font-medium mb-2">Employees</span>
            </div>
            
            <input 
              type="range" 
              min="10" max="1000" step="10"
              value={quantity} 
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 relative z-10"
            />
            <div className="flex justify-between text-[10px] text-white/30 uppercase font-bold mt-3 tracking-wider relative">
              <span>Min: 10</span>
              <div className="absolute left-1/2 -translate-x-1/2 flex gap-4">
                <span className={quantity >= 50 && quantity < 100 ? "text-emerald-400" : ""}>50+ (5%)</span>
                <span className={quantity >= 100 && quantity < 500 ? "text-emerald-400" : ""}>100+ (10%)</span>
                <span className={quantity >= 500 ? "text-emerald-400" : ""}>500+ (15%)</span>
              </div>
              <span>Max: 1,000+</span>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Distribution Protocol
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDeliveryMethod("links")}
                className={`p-6 rounded-2xl border transition-all text-left relative overflow-hidden ${
                  deliveryMethod === "links" 
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                {deliveryMethod === "links" && (
                  <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-400" />
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${deliveryMethod === "links" ? "bg-emerald-500/20" : "bg-white/5"}`}>
                  <LinkIcon className={`w-5 h-5 ${deliveryMethod === "links" ? "text-emerald-400" : "text-white/40"}`} />
                </div>
                <h3 className="font-bold text-base mb-2">Export Magic Links</h3>
                <p className="text-xs text-white/50 leading-relaxed">Download a secure spreadsheet of unique gift links. Ideal for internal distribution via Slack or Microsoft Teams.</p>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDeliveryMethod("csv")}
                className={`p-6 rounded-2xl border transition-all text-left relative overflow-hidden ${
                  deliveryMethod === "csv" 
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                }`}
              >
                {deliveryMethod === "csv" && (
                  <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-400" />
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${deliveryMethod === "csv" ? "bg-emerald-500/20" : "bg-white/5"}`}>
                  <Upload className={`w-5 h-5 ${deliveryMethod === "csv" ? "text-emerald-400" : "text-white/40"}`} />
                </div>
                <h3 className="font-bold text-base mb-2">Automated CSV Upload</h3>
                <p className="text-xs text-white/50 leading-relaxed">Provide an employee roster. Our enterprise engine will automatically dispatch branded emails.</p>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Checkout */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-5"
        >
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 sticky top-24 backdrop-blur-xl shadow-2xl">
            <h2 className="font-display text-xl font-bold mb-6 flex items-center justify-between">
              Investment Summary
              <span className="text-xs font-sans font-normal text-white/40 bg-white/5 px-2 py-1 rounded-md">B2B Portal</span>
            </h2>
            
            <div className="flex items-center gap-4 mb-8 bg-black/40 p-3 rounded-2xl border border-white/5">
               <div className="w-14 h-14 rounded-xl bg-[#0A0508] border border-white/10 overflow-hidden shrink-0">
                 {product.media_urls?.[0] && <img src={product.media_urls[0]} alt="" className="w-full h-full object-cover" />}
               </div>
               <div>
                 <h3 className="font-bold text-sm">{product.name}</h3>
                 <p className="text-xs text-emerald-400 mt-1">KES {Number(product.price).toLocaleString()} / recipient</p>
               </div>
            </div>

            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between items-center text-white/60">
                <span>Subtotal ({quantity} units)</span>
                <span className="font-medium text-white">KES {baseAmount.toLocaleString()}</span>
              </div>
              
              <AnimatePresence>
                {discountPercentage > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between items-center"
                  >
                    <span className="text-white/60">Volume Discount ({discountPercentage * 100}%)</span>
                    <span className="font-medium text-emerald-400">- KES {discountAmount.toLocaleString()}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />
              
              <div className="flex justify-between items-end">
                <span className="text-white/60 font-medium">Total Due</span>
                <div className="text-right">
                  <span className="font-display text-3xl font-bold text-white tracking-tight">KES {finalAmount.toLocaleString()}</span>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Includes all taxes</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
               <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Settlement Method</h4>
               
               <div className="relative">
                 <select 
                   value={paymentMethod}
                   onChange={e => setPaymentMethod(e.target.value as any)}
                   className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-4 appearance-none outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 font-medium text-sm transition-all"
                 >
                   <option value="bank" className="bg-[#0C080A]">Wire Transfer / Proforma Invoice</option>
                   <option value="mpesa" className="bg-[#0C080A]">Pesapal Corporate M-Pesa</option>
                 </select>
                 <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none rotate-90" />
               </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={paying}
              className={`relative w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all overflow-hidden group ${
                paying 
                  ? "bg-emerald-900/50 text-emerald-400 cursor-wait border border-emerald-500/20" 
                  : "bg-emerald-500 text-[#050304] hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)] hover:shadow-[0_0_60px_rgba(16,185,129,0.4)]"
              }`}
            >
              {!paying && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />}
              <span className="relative z-10 flex items-center gap-2">
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                    Provisioning Gifts...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Authorize Payment
                  </>
                )}
              </span>
            </button>
            
            <p className="text-center text-[10px] text-white/30 mt-4 uppercase tracking-widest flex items-center justify-center gap-2">
              <ShieldCheck className="w-3 h-3" />
              Secured by Pesapal
            </p>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
