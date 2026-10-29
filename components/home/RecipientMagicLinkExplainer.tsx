"use client";

import { MessageSquare, MapPin, Calendar, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default function RecipientMagicLinkExplainer() {
  return (
    <section className="py-12 md:py-16 bg-white dark:bg-[#0C0C1A] border-b border-gray-100 dark:border-white/10 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-12">
        <div className="rounded-3xl p-6 md:p-10 bg-gradient-to-br from-[#9B1B5A]/5 via-white dark:via-[#161626] to-[#D4A853]/10 border border-[#9B1B5A]/15 dark:border-white/10 shadow-lg relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left text */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#9B1B5A]/10 text-[#9B1B5A] dark:bg-[#9B1B5A]/20 dark:text-[#E0528D]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Zero Address Friction</span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                Don&apos;t know their exact address? <br />
                <span className="text-[#9B1B5A] dark:text-[#E0528D]">We coordinate via WhatsApp Magic Link.</span>
              </h2>

              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                Just enter their phone number at checkout. We dispatch a discreet, branded message allowing your recipient to pick their preferred delivery time and drop their precise Nairobi GPS pin.
              </p>

              {/* 3 Step highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#1E1E34] border border-gray-200/60 dark:border-white/5">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-[#9B1B5A]/10 text-[#9B1B5A] mb-2">1</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">You Order With Phone</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">No need to awkwardly ask where they live</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#1E1E34] border border-gray-200/60 dark:border-white/5">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-[#D4A853]/20 text-[#D4A853] mb-2">2</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">They Drop Their Pin</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Recipient sets delivery date & GPS location</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#1E1E34] border border-gray-200/60 dark:border-white/5">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-emerald-500/10 text-emerald-600 mb-2">3</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Rider Hand-Delivers</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Wrapped beautifully with real-time GPS tracking</p>
                </div>
              </div>
            </div>

            {/* Right card mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl p-4 bg-white dark:bg-[#161626] border border-gray-200 dark:border-white/10 shadow-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">WhatsApp Intake Demo</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">Active Feature</span>
                </div>

                <div className="p-3 rounded-xl bg-[#E7F8EE] dark:bg-emerald-950/30 text-xs text-gray-800 dark:text-gray-200 border border-[#25D366]/20 space-y-1">
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">TouchGift Concierge:</p>
                  <p className="text-[11px]">
                    &ldquo;Hello Brian! You have a special gift arriving from Sandra. Tap here to pick your delivery day & pin your Nairobi location:&rdquo;
                  </p>
                  <p className="text-[10px] font-mono text-[#9B1B5A] dark:text-[#E0528D] underline pt-0.5">
                    touchgiftshop.co.ke/gift/claim?id=TG-2026-VIP
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1E1E34] text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-[11px]">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Sender & Price Confidential
                  </span>
                  <Link
                    href="/shop"
                    className="text-[11px] font-bold text-[#9B1B5A] dark:text-[#E0528D] flex items-center gap-0.5 hover:underline"
                  >
                    <span>Try it Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

