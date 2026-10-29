"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "Do you accept 30-day payment terms or formal Local Purchase Orders (LPOs)?",
    a: "Yes. For verified corporate clients and registered Kenyan enterprises, we support Net-14 and Net-30 payment terms upon receipt of a signed LPO or PO. You can input your internal PO number directly into our dashboard and proforma invoices.",
  },
  {
    q: "Can TouchGift deliver to 50–200 individual homes or office branches in a single day?",
    a: "Yes. Our temperature-controlled concierge fleet coordinates high-volume simultaneous drop-offs across Nairobi and surrounding counties (Kiambu, Machakos, Kajiado). Nationwide deliveries to major towns (Mombasa, Kisumu, Nakuru, Eldoret) are dispatched overnight.",
  },
  {
    q: "How do you protect employee privacy and avoid HR collecting home addresses?",
    a: "Through our proprietary WhatsApp Magic Links. HR simply uploads a CSV with employee names and Kenyan mobile numbers. TouchGift dispatches a confidential, branded link where each recipient selects their delivery date and drops their exact GPS pin. Your HR team never handles private residential data.",
  },
  {
    q: "Are all invoices fully KRA eTIMS compliant?",
    a: "Yes. Every invoice issued by TouchGift is processed through our active KRA eTIMS integration with certified QR codes, system serial numbers, and 16% standard VAT breakdown ready for statutory accounting audits.",
  },
  {
    q: "Can hampers be customized for dietary preferences, Halal, or non-alcoholic recipients?",
    a: "100%. Any champagne or wine can be swapped for premium sparkling botanical cordials or non-alcoholic French press selections at identical valuation. All gourmet confectioneries and artisanal items can be 100% Halal-certified upon request.",
  },
  {
    q: "What is the turnaround time for corporate dispatches?",
    a: "Curated hampers from our pre-approved tiers (Executive, Celebration, Onboarding) dispatch within 24 to 48 hours. Custom laser-engraved drinkware and embroidered merchandise take 3 to 5 business days. Rush same-day dispatches are available for emergency client retention gifts.",
  },
];

export default function CorporateFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(prev => prev === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-20 scroll-mt-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 text-[color:var(--corp-hero-gold,#D4A853)] bg-[color:var(--corp-hero-gold-tint,rgba(212,168,83,0.1))] border border-[color:var(--corp-hero-gold,rgba(212,168,83,0.3))]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Procurement & HR Clarity</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 text-[color:var(--corp-hero-text)]">
          Frequently Answered Questions
        </h2>
        <p className="text-xs sm:text-sm text-[color:var(--corp-text-muted)] max-w-lg mx-auto">
          Everything your finance director, HR lead, and legal counsel need to know before partner onboarding.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border transition-all overflow-hidden"
              style={{
                background: "var(--corp-hero-card, var(--portal-surface, #FFFFFF))",
                borderColor: isOpen ? "var(--corp-hero-accent, #9B1B5A)" : "var(--corp-hero-border, rgba(155, 27, 90, 0.12))",
              }}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-[color:var(--corp-hero-text)] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className="w-4 h-4 shrink-0 transition-transform duration-300"
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "var(--corp-hero-accent, #9B1B5A)",
                  }}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t"
                      style={{
                        borderColor: "var(--corp-hero-border, rgba(155, 27, 90, 0.08))",
                        color: "var(--corp-text-muted)",
                      }}
                    >
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
