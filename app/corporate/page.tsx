import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Briefcase, ArrowRight, Sparkles, Building2, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate Gifting | TouchGift",
  description: "Cinematic, effortless bulk gifting for modern teams.",
};

// Initialize Supabase admin client for server components
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function CorporatePortalPage() {
  const { data: products } = await supabase
    .from("shop_products")
    .select("*")
    .contains("vibe_tags", ["Corporate"])
    .eq("is_active", true);

  return (
    <div className="min-h-screen bg-[#050304] text-white selection:bg-emerald-500/30">
      
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#050304]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h1 className="font-display font-bold text-lg tracking-wide">TouchGift <span className="font-light italic text-white/50">Corporate</span></h1>
          </Link>
          <div className="flex gap-4">
            <Link href="/shop" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
              Personal Gifting
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-24 pt-12">
        
        {/* ── Hero Banner ── */}
        <div className="text-center max-w-2xl mx-auto mb-16 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 tracking-wide uppercase">B2B Revolutionized</span>
          </div>
          
          <h2 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-6">
            Reward your team at <span className="italic text-emerald-400 font-light">scale.</span>
          </h2>
          <p className="text-white/60 text-lg mb-8 leading-relaxed">
            Forget spreadsheets and logistics. Send 50 or 5,000 gifts instantly via Magic Links or SMS. They unbox digitally, we handle the delivery.
          </p>
        </div>

        {/* ── Corporate Packs ── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <Briefcase className="w-6 h-6 text-emerald-400" />
            <h3 className="font-display text-2xl font-bold">Curated Team Packs</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product) => (
              <div key={product.id} className="bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all duration-500 rounded-[2rem] overflow-hidden group flex flex-col">
                <div className="h-64 relative overflow-hidden bg-black">
                  {product.media_urls?.[0] && (
                    <img src={product.media_urls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050304] to-transparent opacity-90" />
                </div>
                
                <div className="p-6 flex-1 flex flex-col relative z-10 -mt-12">
                  <div className="inline-block self-start px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-3">
                    KES {Number(product.price).toLocaleString()} / per head
                  </div>
                  <h4 className="font-display text-2xl font-bold italic mb-2 text-white group-hover:text-emerald-300 transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-white/60 text-sm leading-relaxed mb-6 flex-1">
                    {product.description}
                  </p>
                  
                  <Link 
                    href={`/corporate/checkout?product=${product.id}`}
                    className="w-full py-4 bg-white/10 hover:bg-emerald-500 transition-colors rounded-xl flex items-center justify-center gap-2 font-bold group/btn border border-white/10 hover:border-emerald-400"
                  >
                    <Users className="w-5 h-5 text-emerald-400 group-hover/btn:text-white transition-colors" />
                    Buy in Bulk
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
