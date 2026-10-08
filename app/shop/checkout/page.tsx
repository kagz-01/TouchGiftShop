"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { ArrowLeft, Smartphone, ShieldCheck, Gift, Wallet } from "lucide-react";

export default function ShopCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Payment States
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  
  // Wallet States
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletId, setWalletId] = useState<string | null>(null);
  const [useWallet, setUseWallet] = useState(true);

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

  // Debounced Wallet Check
  useEffect(() => {
    if (phone.length >= 9) {
      const checkWallet = async () => {
        const { data } = await supabase.from("user_wallets").select("id, balance").eq("phone", phone).single();
        if (data) {
          setWalletBalance(Number(data.balance));
          setWalletId(data.id);
        } else {
          setWalletBalance(0);
          setWalletId(null);
        }
      };
      const timeout = setTimeout(checkWallet, 500);
      return () => clearTimeout(timeout);
    } else {
      setWalletBalance(0);
      setWalletId(null);
    }
  }, [phone, supabase]);

  const amountToPayWithMpesa = useWallet && walletBalance > 0 
    ? Math.max(0, Number(product?.price || 0) - walletBalance) 
    : Number(product?.price || 0);

  const amountFromWallet = useWallet && walletBalance > 0 
    ? Math.min(Number(product?.price || 0), walletBalance)
    : 0;

  const handleSlideToBuy = async () => {
    if (amountToPayWithMpesa > 0 && phone.length < 9) {
      alert("Please enter a valid M-Pesa number for the remaining balance");
      return;
    }
    setPaying(true);
    setPaymentStatus("processing");

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

        // 2. Process Wallet Deduction if applicable
        if (amountFromWallet > 0 && walletId) {
          // Deduct from wallet
          await supabase.from("user_wallets").update({ balance: walletBalance - amountFromWallet }).eq("id", walletId);
          // Log transaction
          await supabase.from("wallet_transactions").insert({
            wallet_id: walletId,
            amount: amountFromWallet,
            type: "debit",
            reference_type: "order_payment",
            reference_id: order.id
          });
        }

        // 3. Generate Secret Gift Slug
        const slug = Math.random().toString(36).substring(2, 10);

        // 4. Create Gift Link
        const { error: linkError } = await supabase
          .from("shop_gift_links")
          .insert({
            order_id: order.id,
            slug: slug
          });

        if (linkError) throw linkError;

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

  if (loading || !product) return (
    <div className="min-h-screen bg-[#0A0508] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0508] text-white selection:bg-rose-500/30">
      <header className="sticky top-0 z-40 bg-[#0A0508]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-sm">Cancel</span>
        </button>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(217,70,239,0.3)]">
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
              <p className="text-white/60 text-xs mt-1">Blind Gifting Mode</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-rose-400">KES {Number(product.price).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* M-Pesa Input */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">Phone Number</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input 
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="w-full bg-[#1F0A1C] border border-rose-500/20 focus:border-rose-500 focus:outline-none rounded-2xl py-4 pl-12 pr-4 text-white font-semibold transition-colors"
                disabled={paying}
              />
            </div>
          </div>
        </div>

        {/* Wallet Detection */}
        {walletBalance > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 mb-6 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">TouchGift Wallet Found</p>
                  <p className="text-emerald-400 text-xs font-semibold mt-0.5">Balance: KES {walletBalance.toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setUseWallet(!useWallet)}
                className={`w-12 h-6 rounded-full transition-colors relative ${useWallet ? "bg-emerald-500" : "bg-white/20"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${useWallet ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
            
            {useWallet && (
              <div className="mt-4 pt-4 border-t border-emerald-500/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Total Cost</span>
                  <span className="font-bold">KES {Number(product.price).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400">Wallet Deduction</span>
                  <span className="font-bold text-emerald-400">- KES {amountFromWallet.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-emerald-500/10">
                  <span>M-Pesa Amount</span>
                  <span className="text-rose-400">KES {amountToPayWithMpesa.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Slide to Buy Simulation */}
        <button 
          onClick={handleSlideToBuy}
          disabled={paying}
          className={`relative w-full h-16 rounded-full flex items-center justify-center overflow-hidden transition-all duration-500 ${
            paymentStatus === "success" 
              ? "bg-emerald-500 scale-105" 
              : paymentStatus === "processing"
              ? "bg-rose-600/50"
              : amountToPayWithMpesa === 0
              ? "bg-emerald-500 hover:bg-emerald-400"
              : "bg-rose-500 hover:bg-rose-400"
          }`}
        >
          {paymentStatus === "idle" && (
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-white" />
              <span className="font-bold text-lg">
                {amountToPayWithMpesa === 0 ? "Pay from Wallet" : `Pay KES ${amountToPayWithMpesa.toLocaleString()}`}
              </span>
            </div>
          )}
          {paymentStatus === "processing" && (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="font-bold">{amountToPayWithMpesa === 0 ? "Processing Wallet..." : "Check your phone..."}</span>
            </div>
          )}
          {paymentStatus === "success" && (
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-white" />
              <span className="font-bold text-lg">Payment Confirmed!</span>
            </div>
          )}
        </button>

      </main>
    </div>
  );
}
