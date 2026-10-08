"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Gift, Sparkles, ShieldCheck } from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  media_urls: string[];
};

export default function ProductModalClient({ children, product }: { children: React.ReactNode; product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Bottom Sheet Modal */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0D050A] rounded-t-[2.5rem] border-t border-rose-500/20 shadow-[0_-20px_60px_rgba(217,70,239,0.15)] transition-transform duration-500 max-h-[90vh] overflow-y-auto overflow-x-hidden
          ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="max-w-md mx-auto relative pb-safe">
          
          {/* Drag Handle & Close */}
          <div className="sticky top-0 z-10 flex justify-between items-center p-4 bg-gradient-to-b from-[#0D050A] to-transparent">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-4" />
            <button 
              onClick={() => setIsOpen(false)}
              className="ml-auto w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Product Media */}
          <div className="px-4">
            <div className="w-full h-64 md:h-80 rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/5">
              {product.media_urls?.[0] ? (
                <img src={product.media_urls[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D050A] via-transparent to-transparent opacity-80" />
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            <h2 className="font-display text-2xl font-bold italic text-white mb-2">{product.name}</h2>
            <div className="inline-block px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full mb-4">
              <span className="text-rose-400 font-bold tracking-wide">KES {Number(product.price).toLocaleString()}</span>
            </div>
            
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Perks */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-2 border border-white/5">
                <Gift className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-white/70 font-semibold">Blind Gifting</span>
              </div>
              <div className="bg-white/5 rounded-2xl p-3 flex flex-col items-center justify-center text-center gap-2 border border-white/5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-xs text-white/70 font-semibold">Premium Wrap</span>
              </div>
            </div>

            {/* Slide to Gift (CTA) */}
            <div className="relative w-full h-16 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center overflow-hidden cursor-pointer group"
                 onClick={() => router.push(`/shop/checkout?product=${product.id}`)}>
              <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-500 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              
              <div className="relative z-10 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                <span className="text-white font-bold text-lg group-hover:scale-105 transition-transform">
                  Gift this for KES {Number(product.price).toLocaleString()}
                </span>
              </div>
            </div>
            
            <p className="text-center text-[10px] text-white/40 mt-4 uppercase tracking-wider">
              Recipient enters their own delivery address
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
