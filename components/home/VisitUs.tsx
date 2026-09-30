"use client";

import { useState } from "react";
import { 
  MapPin, Phone, Mail, MessageCircle, Plus, Minus, 
  Clock, Camera, ShieldCheck, Leaf, CalendarClock 
} from "lucide-react";
import { SHOP_LOCATION } from "@/lib/delivery";

const FAQS = [
  {
    question: "Do you offer same-day delivery in Nairobi?",
    answer: "Yes! Simply place your order by 6:00 PM and we'll dispatch it the same day within Nairobi. Deliveries outside Nairobi arrive the next day."
  },
  {
    question: "Can I schedule a gift for a future date?",
    answer: "Absolutely. You can buy today and select any future delivery date at checkout. We'll store it safely and handle the perfect timing."
  },
  {
    question: "What happens if the recipient isn't home?",
    answer: "Our riders always call the recipient before arrival to coordinate a safe drop-off, leave it with a trusted neighbor/reception, or reschedule if needed."
  },
  {
    question: "Can I send a gift anonymously?",
    answer: "Yes! During checkout, just check the 'Make this an anonymous gift' box. We will deliver the surprise without revealing your identity."
  },
  {
    question: "Do you offer corporate branding on gifts?",
    answer: "We do. For bulk and corporate orders, we can engrave, print, or embroider your company logo on items and customize the packaging."
  }
];

export default function VisitUs() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="bg-gradient-to-b from-surface-warm to-brand/5 dark:from-[#121216] dark:to-brand/10 border-t border-surface-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 px-6 lg:px-12 py-12 lg:py-16">
          
          {/* Left Column: Concierge & Info */}
          <div className="flex flex-col h-full">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand mb-4">
              Gifting Concierge
            </h3>
            <h2 className="font-display text-4xl lg:text-5xl text-theme-heading mb-5 leading-[1.15]">
              A real team behind every ribbon.
            </h2>
            <p className="text-theme-body text-lg mb-10 max-w-md">
              Drop by, chat on WhatsApp, or talk through a custom corporate brief. We're here to make your gifting effortless.
            </p>
            
            {/* Contact & Hours Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Contact Links */}
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-brand" />
                  </div>
                  <p className="text-sm text-theme-body pt-1.5">
                    Park Towers, Utalii Street<br/>Nairobi, Kenya
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-brand" />
                  </div>
                  <a href="tel:+254142677898" className="text-sm font-medium text-theme-heading hover:text-brand transition-colors">
                    +254 142 677 898
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-brand" />
                  </div>
                  <a href="mailto:info@touchgiftshop.co.ke" className="text-sm font-medium text-theme-heading hover:text-brand transition-colors">
                    info@touchgiftshop.co.ke
                  </a>
                </div>
              </div>

              {/* Operating Hours Box */}
              <div className="bg-white dark:bg-white/5 border border-brand/10 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-brand" />
                  <h4 className="text-sm font-bold text-theme-heading">Operating Hours</h4>
                </div>
                <ul className="space-y-2 text-sm text-theme-body">
                  <li className="flex justify-between">
                    <span>Mon – Fri:</span>
                    <span className="font-semibold text-theme-heading">8:00 AM – 7:15 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-semibold text-theme-heading">9:00 AM – 5:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="text-theme-body/60">Closed</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-10 pb-10 border-b border-surface-border">
              <div className="flex items-center gap-2 text-xs font-semibold text-theme-heading">
                <CalendarClock className="w-4 h-4 text-brand" />
                Order by 6 PM for Same-Day
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-theme-heading">
                <Camera className="w-4 h-4 text-brand" />
                Photo-proof delivery
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-theme-heading">
                <ShieldCheck className="w-4 h-4 text-brand" />
                100% Secure Checkout
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-auto">
              <a
                href="https://wa.me/254142677898?text=Hi%20TouchGift!%20I%27d%20like%20to%20get%20in%20touch."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#00A884] text-white rounded-xl text-sm font-bold hover:bg-[#008f6f] transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                Chat on WhatsApp
              </a>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-theme-heading rounded-xl text-sm font-bold hover:border-brand/40 hover:bg-brand/5 transition-all duration-300 w-full sm:w-auto"
              >
                <MapPin className="w-4 h-4" />
                Get Directions
              </a>
            </div>
          </div>

          {/* Right Column: FAQs */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand mb-6">
              Everything you need to know
            </h3>
            
            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className={`rounded-2xl transition-all duration-300 overflow-hidden border ${
                      isOpen 
                        ? "bg-white dark:bg-white/5 border-brand/20 shadow-sm" 
                        : "bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left group"
                    >
                      <span className={`font-semibold text-sm md:text-[15px] transition-colors pr-6 ${
                        isOpen ? "text-brand dark:text-brand-light" : "text-theme-heading group-hover:text-brand"
                      }`}>
                        {faq.question}
                      </span>
                      <span className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                        isOpen 
                          ? "border-brand bg-brand text-white" 
                          : "border-gray-200 dark:border-white/20 text-theme-body group-hover:border-brand group-hover:text-brand"
                      }`}>
                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </span>
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-40 opacity-100 pb-5 px-5" : "max-h-0 opacity-0 px-5"
                      }`}
                    >
                      <p className="text-theme-body text-sm leading-relaxed pr-8">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Newsletter Bar */}
      <div className="bg-[#FAF7F5] dark:bg-[#15151A] border-t border-gray-200 dark:border-white/10 py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h4 className="font-semibold text-theme-heading">Join our gifting community</h4>
              <p className="text-xs text-theme-body mt-0.5">New arrivals, private edits and gifting inspiration.</p>
            </div>
          </div>
          <form className="flex w-full md:w-auto items-center gap-3" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 md:w-72 px-5 py-3 rounded-xl border border-gray-200 dark:border-white/20 bg-white dark:bg-black/20 text-theme-heading text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
              required
            />
            <button 
              type="submit" 
              className="px-8 py-3 bg-[#8A2B3B] dark:bg-brand text-white rounded-xl text-sm font-bold hover:bg-[#722330] dark:hover:bg-brand-dark transition-colors shrink-0 shadow-sm hover:shadow-md"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
