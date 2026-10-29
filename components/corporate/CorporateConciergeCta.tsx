"use client";

import { MessageSquare, Phone, Mail, ArrowRight, ShieldCheck, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CorporateConciergeCta() {
  const whatsappUrl = `https://wa.me/254183172111?text=${encodeURIComponent(
    "Hi TouchGift Corporate Concierge! We are planning an upcoming corporate gifting campaign and would like to review custom tier options and volume quotes."
  )}`;

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-28">
      <div
        className="rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden transition-all shadow-xl"
        style={{
          background: "linear-gradient(135deg, rgba(155, 27, 90, 0.95) 0%, rgba(12, 12, 26, 0.95) 100%)",
          border: "1px solid rgba(212, 168, 83, 0.3)",
          color: "#FFFFFF",
        }}
      >
        {/* Ambient Gold Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#D4A853]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5 bg-white/10 border border-white/20 text-[#D4A853]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dedicated Corporate Concierge</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white">
            Ready to elevate your company gifting?
          </h2>

          <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-8">
            Whether rewarding 15 executive board members or dispatching 500 team hampers across Kenya, our corporate account managers deliver perfection on time.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg text-white"
              style={{ background: "#25D366" }}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat on Corporate WhatsApp</span>
            </a>

            <Link
              href="/corporate/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-white/20 bg-white/10 hover:bg-white/20 text-white"
            >
              <span>Explore Corporate Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Direct Contact strip */}
          <div className="pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>corporate@touchgiftshop.co.ke</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>+254 183 172 111</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Quotes responded within 2 business hours</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

