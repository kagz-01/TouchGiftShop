"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { ArrowLeft, Building2, Link as LinkIcon, Upload, ShieldCheck, Download } from "lucide-react";

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

  const totalAmount = (product?.price || 0) * quantity;

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
    <div className="min-h-screen bg-[#050304] text-white selection:bg-emerald-500/30">
      <header className="sticky top-0 z-40 bg-[#050304]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4 max-w-4xl mx-auto flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold text-sm">Back</span>
        </button>
        <div className="font-display font-bold italic text-emerald-400 text-sm">Pesapal B2B Gateway</div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Configuration */}
        <div>
          <h1 className="font-display text-3xl font-bold mb-8">Configure Order</h1>
          
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Team Size</h2>
            <input 
              type="range" 
              min="10" max="500" step="10"
              value={quantity} 
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full accent-emerald-500 mb-4"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/60">Number of Employees</span>
              <span className="font-display text-3xl font-bold text-emerald-400">{quantity}</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-6">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">Delivery Method</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setDeliveryMethod("links")}
                className={`p-4 rounded-2xl border transition-all text-left ${deliveryMethod === "links" ? "bg-emerald-500/20 border-emerald-500" : "bg-white/5 border-white/10 hover:border-white/30"}`}
              >
                <LinkIcon className={`w-6 h-6 mb-2 ${deliveryMethod === "links" ? "text-emerald-400" : "text-white/40"}`} />
                <h3 className="font-bold text-sm">Generate Links</h3>
                <p className="text-[10px] text-white/50 mt-1">We give you a list of links. You DM them via Slack/Teams.</p>
              </button>
              
              <button 
                onClick={() => setDeliveryMethod("csv")}
                className={`p-4 rounded-2xl border transition-all text-left ${deliveryMethod === "csv" ? "bg-emerald-500/20 border-emerald-500" : "bg-white/5 border-white/10 hover:border-white/30"}`}
              >
                <Upload className={`w-6 h-6 mb-2 ${deliveryMethod === "csv" ? "text-emerald-400" : "text-white/40"}`} />
                <h3 className="font-bold text-sm">Auto-Send CSV</h3>
                <p className="text-[10px] text-white/50 mt-1">Upload emails. Our system blasts them automatically.</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout */}
        <div>
          <div className="bg-[#0C080A] border border-white/10 rounded-3xl p-8 sticky top-24 shadow-2xl">
            <h2 className="font-display text-2xl font-bold mb-6 border-b border-white/10 pb-4">Order Summary</h2>
            
            <div className="flex gap-4 mb-6">
               <div className="w-16 h-16 rounded-xl bg-black overflow-hidden shrink-0">
                 {product.media_urls?.[0] && <img src={product.media_urls[0]} alt="" className="w-full h-full object-cover" />}
               </div>
               <div>
                 <h3 className="font-bold">{product.name}</h3>
                 <p className="text-sm text-white/50">KES {Number(product.price).toLocaleString()} / ea</p>
               </div>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Subtotal ({quantity}x)</span>
                <span>KES {totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">B2B Volume Discount</span>
                <span className="text-emerald-400">- KES {(totalAmount * 0.1).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-xl pt-4 border-t border-white/10">
                <span>Total</span>
                <span className="text-emerald-400">KES {(totalAmount * 0.9).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 mb-8">
               <h4 className="text-xs font-bold text-white/60 uppercase tracking-wider">Payment Method</h4>
               <select 
                 value={paymentMethod}
                 onChange={e => setPaymentMethod(e.target.value as any)}
                 className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-emerald-500 font-semibold"
               >
                 <option value="bank" className="bg-[#0C080A]">Pesapal: Bank Transfer (Invoice)</option>
                 <option value="mpesa" className="bg-[#0C080A]">Pesapal: Corporate M-Pesa</option>
               </select>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={paying}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${paying ? "bg-emerald-600/50" : "bg-emerald-500 hover:bg-emerald-400"}`}
            >
              {paying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Corporate Order...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Complete Corporate Checkout
                </>
              )}
            </button>
          </div>
        </div>

      </main>
    </div>
  );
}
