import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Sparkles, ArrowRight, Gift, Activity, Coffee, Plane, Moon } from "lucide-react";
import type { Metadata } from "next";
import ProductModalClient from "./ProductModalClient"; // We will create this

export const metadata: Metadata = {
  title: "The Vibe Engine | TouchGift Shop",
  description: "Shop by mood, not by category. Discover the perfect premium gift.",
};

// Initialize Supabase admin client for server components
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getProducts() {
  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data || [];
}

const VIBE_ICONS: Record<string, React.ReactNode> = {
  "Sunday Reset": <Moon className="w-4 h-4 text-purple-400" />,
  "Main Character Energy": <Activity className="w-4 h-4 text-emerald-400" />,
  "The Tech Minimalist": <Coffee className="w-4 h-4 text-blue-400" />,
  "Wanderlust": <Plane className="w-4 h-4 text-amber-400" />,
  "Evening Wind Down": <Moon className="w-4 h-4 text-indigo-400" />,
};

export default async function ShopVibeEngine() {
  const products = await getProducts();

  // Group products by vibe tags
  const vibeGroups: Record<string, typeof products> = {};
  products.forEach((p) => {
    (p.vibe_tags || []).forEach((tag: string) => {
      if (!vibeGroups[tag]) vibeGroups[tag] = [];
      vibeGroups[tag].push(p);
    });
  });

  // Sort vibes so the seed ones appear first
  const sortedVibes = Object.keys(vibeGroups).sort();

  return (
    <div className="min-h-screen bg-[#0A0508] text-white selection:bg-fuchsia-500/30">
      
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-[#0A0508]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-600 to-pink-500 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.4)]">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-display font-bold italic text-lg tracking-wide">Vibe Engine</h1>
          </div>
          <Link href="/gift-finder" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-xs font-bold hover:bg-white/20 transition-colors border border-white/5">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
            AI Match
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto pb-24 overflow-hidden">
        
        {/* ── Hero Banner ── */}
        <div className="px-4 py-8 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none" />
          <h2 className="font-display text-4xl font-bold italic leading-tight mb-2">
            Shop by <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-pink-500">mood.</span>
          </h2>
          <p className="text-white/50 text-sm">Find gifts that match their exact energy.</p>
        </div>

        {/* ── Vibe Stacks ── */}
        <div className="space-y-12">
          {sortedVibes.map((vibe) => (
            <section key={vibe} className="relative">
              <div className="px-4 flex items-center gap-2 mb-4">
                {VIBE_ICONS[vibe] || <Sparkles className="w-4 h-4 text-white/40" />}
                <h3 className="font-bold text-lg">{vibe}</h3>
              </div>
              
              {/* Horizontal Scroll Snap */}
              <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pl-4 pr-4 gap-4 pb-4">
                {vibeGroups[vibe].map((product) => (
                  <ProductModalClient key={product.id} product={product}>
                    <div className="snap-center shrink-0 w-[280px] h-[380px] relative rounded-[2rem] overflow-hidden group cursor-pointer border border-white/10 hover:border-fuchsia-500/50 transition-colors shadow-2xl">
                      {/* Image */}
                      {product.media_urls?.[0] ? (
                        <img 
                          src={product.media_urls[0]} 
                          alt={product.name} 
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black" />
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0508] via-[#0A0508]/40 to-transparent" />
                      
                      {/* Content */}
                      <div className="absolute bottom-0 left-0 w-full p-5">
                        <div className="inline-block px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold text-white/80 uppercase tracking-wider mb-2">
                          KES {Number(product.price).toLocaleString()}
                        </div>
                        <h4 className="font-display text-xl font-bold italic leading-tight text-white mb-1 group-hover:text-fuchsia-300 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-white/60 text-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </ProductModalClient>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

    </div>
  );
}
