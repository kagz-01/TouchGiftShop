"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Receipt, Sparkles, Truck, CheckCircle2 } from "lucide-react";

interface Advantage {
  icon: typeof ShieldCheck;
  title: string;
  badge: string;
  description: string;
  proof: string;
}

const ADVANTAGES: Advantage[] = [
  {
    icon: Receipt,
    title: "Instant KRA eTIMS Tax Compliance",
    badge: "100% Deductible",
    description: "Every single corporate invoice is generated with valid KRA PIN, QR verification, and automated VAT breakdowns ready for immediate reconciliation by your finance audit team.",
    proof: "KRA PIN P052199201A verified · Automated eTIMS PDF issuance",
  },
  {
    icon: ShieldCheck,
    title: "Zero-Address-Friction WhatsApp Links",
    badge: "Privacy Guaranteed",
    description: "Never collect, store, or share private home coordinates on unsecured Excel sheets. TouchGift sends secure automated WhatsApp Magic Links letting staff or clients confirm their own pin drops.",
    proof: "Compliant with Kenya Data Protection Act 2019 (ODPC)",
  },
  {
    icon: Sparkles,
    title: "Executive Presentation & Bespoke Swag",
    badge: "Premium Unboxing",
    description: "Wax-sealed custom stationery, laser-engraved bamboo tumblers, gold-foil ribbons, and high-touch unboxing that reinforces your enterprise prestige in every unboxing video.",
    proof: "Curated artisan gifts from Kenyan & global luxury houses",
  },
  {
    icon: Truck,
    title: "Multi-Address Logistics & Guaranteed SLA",
    badge: "Same-Day Dispatch",
    description: "Dispatching 500 gifts to 500 unique addresses across Nairobi or nationwide? Our dedicated riders execute synchronous drop-offs with real-time photographic confirmation upon handoff.",
    proof: "99.4% on-time corporate arrival · Dedicated account manager",
  },
];

export default function CorporateAdvantages() {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 bg-brand/10 text-brand border border-brand/20 dark:text-brand-light"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>The TouchGift Enterprise Advantage</span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-[color:var(--corp-text)]">
          Why Kenya&apos;s leading employers <br className="hidden sm:block" />
          <span className="italic font-light text-brand dark:text-brand-light">
            trust TouchGift at scale.
          </span>
        </h2>
        <p className="text-sm sm:text-base leading-relaxed text-[color:var(--corp-text-muted)]">
          Built from the ground up for HR directors, People teams, and procurement officers who demand flawless execution, data confidentiality, and audit-ready accounting.
        </p>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {ADVANTAGES.map((adv, idx) => {
          const Icon = adv.icon;
          return (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:-translate-y-1 group bg-white dark:bg-white/[0.04] border border-surface-border dark:border-white/10 shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 bg-brand/10 text-brand dark:text-brand-light dark:bg-brand/20"
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border bg-gold/10 text-gold border-gold/30"
                  >
                    {adv.badge}
                  </span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-bold mb-3 text-[color:var(--corp-text)]">
                  {adv.title}
                </h3>
                <p className="text-sm leading-relaxed text-[color:var(--corp-text-muted)] mb-6">
                  {adv.description}
                </p>
              </div>

              <div
                className="pt-4 border-t border-surface-border dark:border-white/10 flex items-center gap-2 text-xs font-semibold text-brand dark:text-brand-light"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                <span className="text-[color:var(--corp-text-muted)]">{adv.proof}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
