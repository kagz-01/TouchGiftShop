"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { ArrowLeft, Smartphone, ShieldCheck, ChevronRight, Gift } from "lucide-react";

export default function ShopCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [giftLinkSlug, setGiftLinkSlug] = useState("");

  const supabase = createClient();

  useEffect(() => {
    if (!productId) {
      router.push("/shop");
      return;
    }
    const fetchProduct = async () => {
      const { data } = await supabase.from("shop_products").select("*").eq("id", productId).single();
      if (data) setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [productId, router, supabase]);

  const handleSlideToBuy = async () => {
    if (phone.length < 9) {
      alert("Please enter a valid M-Pesa number");
      return;
    }
    setPaying(true);
    setPaymentStatus("processing");

    // In a real app, this hits a real STK Push endpoint.
    // For now, we simulate the payment delay and create the order + gift link locally.
    setTimeout(async () => {
      try {
        // 1. Create the Order
        const { data: order, error: orderError } = await supabase
          .from("shop_orders")
          .insert({
            product_id: product.id,
            buyer_phone: phone,
            amount: product.price,
            status: "pending_address"
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // 2. Generate Secret Gift Slug
        const slug = Math.random().toString(36).substring(2, 10);

        // 3. Create Gift Link
        const { error: linkError } = await supabase
          .from("shop_gift_links")
          .insert({
            order_id: order.id,
            slug: slug
          });

        if (linkError) throw linkError;

        setGiftLinkSlug(slug);
        setPaymentStatus("success");
        setTimeout(() => {
          router.push(`/shop/gift-ready?slug=${slug}`);
        }, 1500);

      } catch (err) {
        console.error("Payment flow failed", err);
        setPaymentStatus("failed");
        setPaying(false);
      }
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0508] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#0A0508] text-white selection:bg-fuchsia-500/30">
      <header className="sticky top-0 z-40 bg-[#0A0508]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-sm">Cancel</span>
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-fuchsia-600 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold italic mb-1">Secure Checkout</h1>
          <p className="text-white/50 text-sm">You are gifting: {product.name}</p>
        </div>

        {/* Summary Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-800 shrink-0">
              {product.media_urls?.[0] && <img src={product.media_urls[0]} alt={product.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
              <p className="text-white/60 text-xs mt-1">Blind Gifting Mode Active</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-fuchsia-400">KES {Number(product.price).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Your M-Pesa Number</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="w-full bg-[#1F0A1C] border border-fuchsia-500/20 focus:border-fuchsia-500 focus:outline-none rounded-2xl py-4 pl-12 pr-4 text-white font-semibold transition-colors"
                disabled={paying}
              />
            </div>
          </div>
        </div>

        {/* Slide to Buy Simulation (simplified button for now) */}
        <button 
          onClick={handleSlideToBuy}
          disabled={paying}
          className={`relative w-full h-16 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 ${
            paymentStatus === "success" 
              ? "bg-emerald-500 scale-105" 
              : paymentStatus === "processing"
              ? "bg-fuchsia-600/50"
              : "bg-fuchsia-500 hover:bg-fuchsia-400"
          }`}
        >
          {paymentStatus === "idle" && (
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-white" />
              <span className="font-bold text-lg">Pay KES {Number(product.price).toLocaleString()}</span>
            </div>
          )}
          {paymentStatus === "processing" && (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="font-bold">Check your phone...</span>
            </div>
          )}
          {paymentStatus === "success" && (
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-white" />
              <span className="font-bold text-lg">Payment Confirmed!</span>
            </div>
          )}
        </button>

        <p className="text-center text-xs text-white/40 mt-4">
          Secured by PesaPal. You will not need the recipient's address yet.
        </p>

      </main>
    </div>
  );
}
