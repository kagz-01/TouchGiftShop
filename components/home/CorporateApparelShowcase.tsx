"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Shirt, Award, Coffee, Briefcase, ChevronRight, CheckCircle2, MessageSquare, Calculator, ArrowUpRight, X, ShieldCheck } from "lucide-react";
import { formatKsh } from "@/lib/utils";

interface MerchItem {
  id: string;
  category: "apparel" | "executive" | "drinkware" | "kits";
  name: string;
  description: string;
  image: string;
  brandingTechnique: string;
  minQty: number;
  basePrice: number; // KES per unit
  turnaroundDays: string;
  badge?: string;
}

const MERCH_ITEMS: MerchItem[] = [
  {
    id: "app-1",
    category: "apparel",
    name: "Executive Pique Embroidered Polo",
    description: "Heavyweight 220gsm combed cotton with custom chest embroidery and contrast tipping collar.",
    image: "/corprate-intro/jearsy.webp",
    brandingTechnique: "Precision Embroidery",
    minQty: 15,
    basePrice: 2200,
    turnaroundDays: "3-5 Days",
    badge: "Most Popular",
  },
  {
    id: "app-2",
    category: "apparel",
    name: "Corporate Structured Twill Cap",
    description: "6-panel structured profile with 3D embroidery and adjustable matte brass buckle closure.",
    image: "/corprate-intro/caps.webp",
    brandingTechnique: "3D Puff Embroidery",
    minQty: 20,
    basePrice: 1250,
    turnaroundDays: "3-4 Days",
  },
  {
    id: "app-3",
    category: "apparel",
    name: "Executive Heavyweight Zip Fleece",
    description: "Thermal lined fleece jacket with subtle debossed logo on left chest and branded zipper pulls.",
    image: "/corprate-intro/jearsy.webp",
    brandingTechnique: "Laser Debossing",
    minQty: 10,
    basePrice: 3800,
    turnaroundDays: "4-6 Days",
    badge: "Executive",
  },
  {
    id: "exec-1",
    category: "executive",
    name: "Heritage Leatherette Portfolio Set",
    description: "Refillable A5 journal with engraved stylus metal pen and hidden magnetic business card pouch.",
    image: "/corprate-intro/3-luxury-gifts-in-1-box.webp",
    brandingTechnique: "Gold Foil Stamp",
    minQty: 10,
    basePrice: 3500,
    turnaroundDays: "2-3 Days",
    badge: "VIP Gifting",
  },
  {
    id: "drink-1",
    category: "drinkware",
    name: "Matte Black Thermal LED Tumbler",
    description: "Double-wall vacuum insulation with digital lid temperature readout and laser etched company logo.",
    image: "/corprate-intro/Luxury-Packaging_3.webp",
    brandingTechnique: "Rotary Laser Etching",
    minQty: 25,
    basePrice: 1950,
    turnaroundDays: "2-4 Days",
  },
  {
    id: "kits-1",
    category: "kits",
    name: "Executive Welcome Onboarding Swag Box",
    description: "Curated gift box containing branded polo, thermal tumbler, notebook, and personalized welcome card.",
    image: "/corprate-intro/bags.webp",
    brandingTechnique: "Full Box Suite",
    minQty: 10,
    basePrice: 7500,
    turnaroundDays: "4-5 Days",
    badge: "Turnkey Swag",
  },
];

export default function CorporateApparelShowcase() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeModalItem, setActiveModalItem] = useState<MerchItem | null>(null);
  const [selectedQty, setSelectedQty] = useState<number>(50);
  const [companyNameInput, setCompanyNameInput] = useState<string>("");

  const filteredItems = MERCH_ITEMS.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  const getDiscountedUnitPrice = (item: MerchItem, qty: number) => {
    let discount = 0;
    if (qty >= 200) discount = 0.25;
    else if (qty >= 100) discount = 0.18;
    else if (qty >= 50) discount = 0.10;
    return Math.round(item.basePrice * (1 - discount));
  };

  const unitPrice = activeModalItem ? getDiscountedUnitPrice(activeModalItem, selectedQty) : 0;
  const totalPrice = unitPrice * selectedQty;

  const handleWhatsAppQuote = () => {
    if (!activeModalItem) return;
    const msg = `Hi TouchGift Concierge! I'd like a formal digital mockup and quote for:\n- Product: ${activeModalItem.name}\n- Quantity: ${selectedQty} units\n- Company: ${companyNameInput || "Corporate Client"}\n- Estimated Price: KES ${totalPrice.toLocaleString()}\nPlease advise on production lead time and branding proof.`;
    window.open(`https://wa.me/254183172111?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-[#FAF7F5] dark:bg-[#0C0C1A] transition-colors border-y border-[#9B1B5A]/10 dark:border-white/10" id="corporate-apparel">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9B1B5A]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4A853]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-[#9B1B5A]/10 text-[#9B1B5A] dark:bg-[#9B1B5A]/20 dark:text-[#E0528D]">
              <Shirt className="w-3.5 h-3.5" />
              <span>Corporate Apparel & Branded Merchandise</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
              Wear Your Brand. <br />
              <span className="text-[#9B1B5A] dark:text-[#E0528D]">Delight Your Workforce.</span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              Premium embroidered executive polos, branded company fleeces, laser-etched drinkware, and curated employee onboarding kits — produced with luxury precision in Nairobi.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/corporate/dashboard"
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:brightness-110 active:scale-95 text-white"
              style={{ background: "#9B1B5A" }}
            >
              <span>Explore B2B Dashboard</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {[
            { id: "all", label: "All Merchandise", icon: Sparkles },
            { id: "apparel", label: "Apparel & Polos", icon: Shirt },
            { id: "executive", label: "Executive Sets", icon: Briefcase },
            { id: "drinkware", label: "Drinkware & Tumblers", icon: Coffee },
            { id: "kits", label: "Onboarding Kits", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition-all ${
                  active
                    ? "bg-[#9B1B5A] text-white shadow-md"
                    : "bg-white dark:bg-[#161626] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:border-[#9B1B5A]/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group rounded-3xl overflow-hidden bg-white dark:bg-[#161626] border border-gray-200/80 dark:border-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Image Frame */}
                <div className="relative h-60 w-full overflow-hidden bg-[#F3EFEA] dark:bg-[#1E1E34]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.badge && (
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#D4A853] text-[#1A1416] shadow-md">
                      {item.badge}
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                    {item.brandingTechnique}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-gray-900 dark:text-white group-hover:text-[#9B1B5A] dark:group-hover:text-[#E0528D] transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 block">Indicative Unit Rate</span>
                      <span className="text-base font-bold text-[#9B1B5A] dark:text-[#E0528D]">
                        From {formatKsh(item.basePrice)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 block">Min. Order</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.minQty} Units · {item.turnaroundDays}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-5 pb-5 pt-0">
                <button
                  onClick={() => {
                    setActiveModalItem(item);
                    setSelectedQty(Math.max(item.minQty, 25));
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all bg-[#FAF7F5] dark:bg-[#1E1E34] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 hover:bg-[#9B1B5A] hover:text-white hover:border-[#9B1B5A] group-hover:bg-[#9B1B5A] group-hover:text-white"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Instant Quote & Mockup</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise Bottom Banner */}
        <div className="mt-12 rounded-3xl p-6 md:p-8 bg-gradient-to-r from-[#9B1B5A] to-[#68103A] text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#D4A853] mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Full KRA eTIMS & Procurement Compliance</span>
            </div>
            <h3 className="font-display text-2xl font-bold">Need a Custom Catalog or 100+ Piece Dispatch?</h3>
            <p className="text-xs sm:text-sm text-white/80 mt-1 leading-relaxed">
              We provide formal tax invoices, LPO acceptance, sample stitching proofs, and direct Nairobi office drops.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/corporate/portal/quotes"
              className="px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-[#D4A853] text-[#1A1416] hover:brightness-105 transition-all shadow-md"
            >
              Request Custom Tender
            </Link>
            <a
              href="https://wa.me/254183172111?text=Hi%20TouchGift!%20I'd%20like%20a%20corporate%20apparel%20and%20swag%20catalog."
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>Chat With Merch Lead</span>
            </a>
          </div>
        </div>

      </div>

      {/* Instant Mockup & Calculator Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl p-6 shadow-2xl relative bg-white dark:bg-[#161626] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl overflow-hidden relative shrink-0 bg-gray-100">
                <Image src={activeModalItem.image} alt={activeModalItem.name} fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-display text-base font-bold">{activeModalItem.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activeModalItem.brandingTechnique}</p>
              </div>
            </div>

            {/* Live Calculation Settings */}
            <div className="space-y-4 my-5 p-4 rounded-2xl bg-gray-50 dark:bg-[#1E1E34] border border-gray-200/60 dark:border-white/5">
              <div>
                <label className="text-xs font-bold block mb-1.5 text-gray-700 dark:text-gray-300">
                  Select Order Volume
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 100, 250].map((qty) => (
                    <button
                      key={qty}
                      onClick={() => setSelectedQty(qty)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedQty === qty
                          ? "bg-[#9B1B5A] text-white shadow-sm"
                          : "bg-white dark:bg-[#161626] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10"
                      }`}
                    >
                      {qty} pcs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1 text-gray-700 dark:text-gray-300">
                  Company Name (for Branding Mockup)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Safaricom, Equity, Techstars..."
                  value={companyNameInput}
                  onChange={(e) => setCompanyNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161626] text-gray-900 dark:text-white outline-none focus:border-[#9B1B5A]"
                />
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-gray-200 dark:border-white/10 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Unit Rate (with bulk discount):</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{formatKsh(unitPrice)} / pc</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-1">
                  <span>Estimated Total (Excl. VAT):</span>
                  <span className="text-lg text-[#9B1B5A] dark:text-[#E0528D]">{formatKsh(totalPrice)}</span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Includes {activeModalItem.brandingTechnique} & standard packaging in Nairobi
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={handleWhatsAppQuote}
                className="flex-1 py-3 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-md transition-all hover:brightness-105"
                style={{ background: "#25D366" }}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Get Digital Proof on WhatsApp</span>
              </button>

              <Link
                href="/corporate/portal/quotes"
                onClick={() => setActiveModalItem(null)}
                className="flex-1 py-3 rounded-2xl text-xs font-bold text-center border border-gray-300 dark:border-white/20 hover:border-[#9B1B5A] text-gray-800 dark:text-gray-200 transition-colors"
              >
                Submit Procurement Tender
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

