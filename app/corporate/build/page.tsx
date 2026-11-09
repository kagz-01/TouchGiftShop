"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Gift,
  Building2,
  Users,
  Check,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  FileText,
  Sliders,
  Plus,
  Trash2,
  Truck,
  Upload,
  Info,
  Clock,
  ExternalLink,
  X,
} from "lucide-react";
import { formatKsh } from "@/lib/utils";
import { createPortal } from "react-dom";

// ── 6 Pre-Curated B2B Packs (High-Turnover Solutions) ──
interface PackItem {
  id: string;
  name: string;
  unitCost: number;
  category: string;
}

interface CorporatePack {
  id: string;
  name: string;
  tagline: string;
  description: string;
  badge?: string;
  baseUnitPrice: number;
  gradient: string;
  icon: string;
  defaultItems: PackItem[];
}

const CORPORATE_PACKS: CorporatePack[] = [
  {
    id: "welcome-kit",
    name: "New Hire Onboarding Kit",
    tagline: "First-day employee retention & team pride",
    description: "Curated welcome essentials for day-one delight. Ships in branded premium gift box.",
    badge: "Most Popular",
    baseUnitPrice: 3200,
    gradient: "from-brand/10 to-amber-500/10 border-brand/20",
    icon: "🎒",
    defaultItems: [
      { id: "p1", name: "Executive Hardcover Notebook", unitCost: 650, category: "stationery" },
      { id: "p2", name: "Matte Metal Rollerball Pen (Laser Engraved)", unitCost: 450, category: "stationery" },
      { id: "p3", name: "Thermal Insulated Vacuum Tumbler (500ml)", unitCost: 1250, category: "drinkware" },
      { id: "p4", name: "Artisan Kenyan Coffee Roast (150g)", unitCost: 550, category: "coffee" },
      { id: "p5", name: "Gold Foil Welcome Letter & Custom Seal", unitCost: 300, category: "packaging" },
    ],
  },
  {
    id: "client-appreciation",
    name: "VIP Client Appreciation Box",
    tagline: "Solidify high-ticket accounts & contract renewals",
    description: "Elegant blend of handcrafted indulgences and executive keepsakes for major partners.",
    badge: "High Impact",
    baseUnitPrice: 5400,
    gradient: "from-amber-500/10 to-yellow-600/10 border-amber-300/30",
    icon: "🥂",
    defaultItems: [
      { id: "p6", name: "Robertson Reserve Cabernet Sauvignon (or Non-Alc Sparkler)", unitCost: 1950, category: "drinks" },
      { id: "p7", name: "Handmade Belgian Dark Chocolate Truffles (12pc)", unitCost: 1200, category: "confectionery" },
      { id: "p8", name: "Acacia Wood & Marble Dual Coaster Set", unitCost: 950, category: "desk" },
      { id: "p9", name: "Branded Embossed Card with Client Recognition", unitCost: 300, category: "packaging" },
      { id: "p10", name: "Scented Soy Wax Travel Candle", unitCost: 1000, category: "lifestyle" },
    ],
  },
  {
    id: "event-swag",
    name: "Conference & AGM Swag Pack",
    tagline: "High-volume brand visibility & attendee utility",
    description: "Practical branded merchandise for summit delegates, board meetings, and product launches.",
    badge: "Volume Saver",
    baseUnitPrice: 2100,
    gradient: "from-sky-500/10 to-blue-600/10 border-sky-300/30",
    icon: "🎯",
    defaultItems: [
      { id: "p11", name: "Heavyweight Cotton Canvas Tote Bag (Screen Printed)", unitCost: 600, category: "merch" },
      { id: "p12", name: "Sleek Stainless Steel Water Bottle (750ml)", unitCost: 850, category: "drinkware" },
      { id: "p13", name: "Kraft Pocket Journal & Recycled Pen", unitCost: 350, category: "stationery" },
      { id: "p14", name: "Fast-Charging Multi-Port USB Cable", unitCost: 300, category: "tech" },
    ],
  },
  {
    id: "executive-luxury",
    name: "C-Suite & Founder Luxury Box",
    tagline: "Uncompromising elegance for executive milestones",
    description: "Top-shelf gifting tailored for Directors, Board Members, and keynote honorees.",
    badge: "VIP Tier",
    baseUnitPrice: 9800,
    gradient: "from-amber-600/15 to-rose-600/10 border-amber-500/40",
    icon: "💎",
    defaultItems: [
      { id: "p15", name: "Single Malt Glenfiddich 12Y (or Premium Spiced Mocktail Elixir)", unitCost: 4500, category: "drinks" },
      { id: "p16", name: "Full-Grain Genuine Leather Document Folio", unitCost: 2800, category: "leather" },
      { id: "p17", name: "Heavyweight Crystal Old Fashioned Tumblers (Pair)", unitCost: 1500, category: "glassware" },
      { id: "p18", name: "Artisanal Macadamia Nut Confections", unitCost: 1000, category: "food" },
    ],
  },
  {
    id: "festive-holiday",
    name: "Festive Season Year-End Hamper",
    tagline: "Celebrate annual wins with your entire workforce",
    description: "Heartwarming celebration treats and family-friendly treats for Jamhuri, Christmas & New Year.",
    badge: "Seasonal",
    baseUnitPrice: 4200,
    gradient: "from-emerald-500/10 to-teal-600/10 border-emerald-300/30",
    icon: "🎄",
    defaultItems: [
      { id: "p19", name: "Holiday Spiced Artisanal Cookies Tin", unitCost: 850, category: "food" },
      { id: "p20", name: "Organic Spiced Ginger Tea Caddy", unitCost: 650, category: "tea" },
      { id: "p21", name: "Raw Organic Acacia Honey Pot with Dipper", unitCost: 800, category: "food" },
      { id: "p22", name: "Holiday Cinnamon Fragrance Candle", unitCost: 900, category: "lifestyle" },
      { id: "p23", name: "Company Holiday Appreciation Card", unitCost: 300, category: "packaging" },
      { id: "p24", name: "Roasted Salted Cashew Pack (200g)", unitCost: 700, category: "food" },
    ],
  },
  {
    id: "wellness-care",
    name: "Team Wellness & Care Package",
    tagline: "Thoughtful empathy for recovery, milestones & parents",
    description: "Deep comfort and wellness gifts for maternity/paternity, sick leave, or mental health weeks.",
    badge: "Care & Empathy",
    baseUnitPrice: 3600,
    gradient: "from-rose-500/10 to-purple-600/10 border-rose-300/30",
    icon: "🌸",
    defaultItems: [
      { id: "p25", name: "Ultra-Soft Microfiber Travel Blanket", unitCost: 1200, category: "comfort" },
      { id: "p26", name: "Herbal Chamomile & Lavender Sleep Tea", unitCost: 550, category: "tea" },
      { id: "p27", name: "Natural Shea & Cocoa Butter Hand Cream", unitCost: 650, category: "wellness" },
      { id: "p28", name: "Ceramic Minimalist Mug with Wooden Lid", unitCost: 700, category: "drinkware" },
      { id: "p29", name: "Personalized Handwritten Empathy Note", unitCost: 500, category: "packaging" },
    ],
  },
];

// Add-on pool for swapping or augmenting packs
const CATALOG_ADDONS: PackItem[] = [
  { id: "addon-1", name: "10,000mAh Slim Power Bank with Logo Engraving", unitCost: 1450, category: "tech" },
  { id: "addon-2", name: "Bluetooth 5.3 Wireless Earbuds with Case Print", unitCost: 1850, category: "tech" },
  { id: "addon-3", name: "Leather RFID Cardholder Wallet", unitCost: 900, category: "leather" },
  { id: "addon-4", name: "Luxury Desktop Wireless Phone Charger Stand", unitCost: 1250, category: "tech" },
  { id: "addon-5", name: "Single Origin Kenyan Dark Chocolate Bar (80g)", unitCost: 450, category: "confectionery" },
  { id: "addon-6", name: "Branded Double-Wall Borosilicate Glass Infuser Bottle", unitCost: 1100, category: "drinkware" },
];

export default function CorporateHamperBuilder() {
  // Selected pack state
  const [selectedPackId, setSelectedPackId] = useState<string>("welcome-kit");
  const [customItemsByPack, setCustomItemsByPack] = useState<Record<string, PackItem[]>>({});
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);

  // Volume & Configuration State
  const [quantity, setQuantity] = useState<number>(35);
  const [includeVat, setIncludeVat] = useState<boolean>(true);
  const [deliveryMethod, setDeliveryMethod] = useState<"office" | "magic_link">("office");

  // Corporate Identity State
  const [companyName, setCompanyName] = useState<string>("");
  const [workEmail, setWorkEmail] = useState<string>("");
  const [workPhone, setWorkPhone] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  // Action status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successQuoteRef, setSuccessQuoteRef] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active pack computation
  const activePack = useMemo(() => {
    return CORPORATE_PACKS.find((p) => p.id === selectedPackId) || CORPORATE_PACKS[0];
  }, [selectedPackId]);

  // Current items for active pack (defaults or customized)
  const currentPackItems = useMemo(() => {
    return customItemsByPack[selectedPackId] || activePack.defaultItems;
  }, [customItemsByPack, selectedPackId, activePack]);

  // Dynamic Unit Price based on customized item sum
  const calculatedUnitPrice = useMemo(() => {
    return currentPackItems.reduce((sum, item) => sum + item.unitCost, 0);
  }, [currentPackItems]);

  // Volume discount tier
  const discountRate = useMemo(() => {
    if (quantity >= 250) return 0.25; // 25% off
    if (quantity >= 100) return 0.20; // 20% off
    if (quantity >= 50) return 0.15;  // 15% off
    if (quantity >= 25) return 0.10;  // 10% off
    return 0;                         // 0% off under 25
  }, [quantity]);

  // Cost calculations
  const discountedUnitPrice = Math.round(calculatedUnitPrice * (1 - discountRate));
  const subtotal = discountedUnitPrice * quantity;
  const regularTotal = calculatedUnitPrice * quantity;
  const savings = regularTotal - subtotal;
  const vatAmount = includeVat ? Math.round(subtotal * 0.16) : 0;
  const grandTotal = subtotal + vatAmount;

  // Swap / add items handlers
  const handleRemoveItem = (itemId: string) => {
    if (currentPackItems.length <= 1) return;
    const updated = currentPackItems.filter((i) => i.id !== itemId);
    setCustomItemsByPack((prev) => ({ ...prev, [selectedPackId]: updated }));
  };

  const handleAddCatalogItem = (addon: PackItem) => {
    if (currentPackItems.some((i) => i.id === addon.id)) return;
    const updated = [...currentPackItems, addon];
    setCustomItemsByPack((prev) => ({ ...prev, [selectedPackId]: updated }));
  };

  const handleResetPack = () => {
    setCustomItemsByPack((prev) => {
      const copy = { ...prev };
      delete copy[selectedPackId];
      return copy;
    });
  };

  // Submit quote request
  const handleGenerateProforma = async () => {
    if (!companyName.trim() || !workEmail.trim()) {
      setErrorMsg("Please enter your company name and work email to generate your official quote.");
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const itemsSummary = currentPackItems.map((i) => i.name).join(", ");
      const notesPayload = `Pack: ${activePack.name} | Items: ${itemsSummary} | Delivery: ${
        deliveryMethod === "office" ? "Consolidated Office Drop" : "WhatsApp Magic-Link Recipient Pin"
      } | Notes: ${specialInstructions || "None"}`;

      const res = await fetch("/api/corporate/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: `pack-${activePack.id}`,
          productName: `Corporate Hamper: ${activePack.name} (${quantity} units)`,
          qty: quantity,
          company: companyName,
          email: workEmail,
          phone: workPhone || undefined,
          unitPrice: discountedUnitPrice,
          total: grandTotal,
          notes: notesPayload,
          moqTier: `${quantity} units (${Math.round(discountRate * 100)}% bulk tier)`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate proforma");
      }

      setSuccessQuoteRef(data.reference || `TG-CORP-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again or chat directly on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // WhatsApp Preloaded Message Link
  const whatsAppHref = useMemo(() => {
    const text = `Hi TouchGift Corporate Desk! 👋\n\nI'm configuring a corporate order on the Hamper Configurator:\n\n• Company: ${companyName || "Our Organization"}\n• Pack: ${activePack.name}\n• Quantity: ${quantity} units\n• Estimated Total: ${formatKsh(grandTotal)} (${includeVat ? "incl. 16% VAT" : "excl. VAT"})\n• Dispatch Method: ${deliveryMethod === "office" ? "Office Drop" : "WhatsApp Magic Link Pin"}\n\nCould we get a digital proof & discuss delivery schedule?`;
    return `https://wa.me/254183172111?text=${encodeURIComponent(text)}`;
  }, [companyName, activePack, quantity, grandTotal, includeVat, deliveryMethod]);

  return (
    <div className="corporate-shell min-h-screen bg-white dark:bg-[#0B1620] text-gray-900 dark:text-zinc-100 font-sans pb-36">
      {/* ── Top Bar & Breadcrumb ── */}
      <header className="sticky top-0 z-30 border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-[#0B1620]/95 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/corporate"
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-zinc-200 transition-colors"
              aria-label="Back to Corporate Home"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                <Link href="/corporate" className="hover:text-brand">Corporate</Link>
                <span>/</span>
                <span className="text-brand dark:text-brand-light font-bold">Pack & Hamper Configurator</span>
              </div>
              <h1 className="font-display font-bold text-base sm:text-lg leading-tight text-gray-900 dark:text-white">
                B2B Bulk Hamper Builder
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Direct WhatsApp Desk
            </a>
          </div>
        </div>
      </header>

      {/* ── Value Proposition Banner ── */}
      <div className="bg-gradient-to-r from-brand/5 via-amber-500/5 to-transparent border-b border-gray-100 dark:border-white/5 py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-brand text-white font-bold text-[10px] uppercase tracking-wider">
              Wholesale SLA
            </span>
            <p className="text-gray-700 dark:text-zinc-300">
              <strong>100% Brandable</strong> · Free Laser/Embroidery Proof · eTIMS Compliant LPO & Proforma · Same-Day Delivery Dispatch
            </p>
          </div>
          <div className="flex items-center gap-4 text-gray-500 dark:text-zinc-400 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> KRA Tax Compliant
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-500" /> 2-Hour Quote Response
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* ── STEP 1: Select Curated Pack ── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">1</span>
                <h2 className="font-display font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                  Select Pack Concept
                </h2>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 ml-8">
                Choose a proven corporate baseline. You can customize, swap, or add items in step 2.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 ml-8 sm:ml-0">
              Showing 6 Tested B2B Bundles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CORPORATE_PACKS.map((pack) => {
              const isSelected = pack.id === selectedPackId;
              const hasCustomizations = !!customItemsByPack[pack.id];

              return (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`relative p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-brand bg-brand/[0.03] dark:bg-brand/[0.08] shadow-lg ring-1 ring-brand/30 -translate-y-0.5"
                      : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#121B26] hover:border-brand/40 shadow-sm"
                  }`}
                >
                  {/* Top Badge & Selector */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-2xl">{pack.icon}</span>
                    <div className="flex items-center gap-1.5">
                      {pack.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {pack.badge}
                        </span>
                      )}
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                          isSelected
                            ? "bg-brand border-brand text-white"
                            : "border-gray-300 dark:border-zinc-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Pack Title & Copy */}
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug">
                      {pack.name}
                    </h3>
                    <p className="text-xs text-brand dark:text-brand-light font-semibold mt-0.5">
                      {pack.tagline}
                    </p>
                    <p className="text-[11px] text-gray-600 dark:text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                      {pack.description}
                    </p>
                  </div>

                  {/* Included Items Pills */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-zinc-400 mb-2">
                      <span>Includes {hasCustomizations ? customItemsByPack[pack.id].length : pack.defaultItems.length} curated items:</span>
                      {hasCustomizations && (
                        <span className="text-amber-500 font-bold text-[10px]">Customized</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(hasCustomizations ? customItemsByPack[pack.id] : pack.defaultItems).slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="text-[10px] bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-zinc-200 px-2 py-0.5 rounded-md truncate max-w-[170px]"
                        >
                          {item.name}
                        </span>
                      ))}
                      {(hasCustomizations ? customItemsByPack[pack.id].length : pack.defaultItems.length) > 3 && (
                        <span className="text-[10px] bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-md font-semibold">
                          +{(hasCustomizations ? customItemsByPack[pack.id].length : pack.defaultItems.length) - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500">Base Unit Rate</span>
                      <p className="font-display font-bold text-base text-gray-900 dark:text-white">
                        {formatKsh(pack.baseUnitPrice)}
                      </p>
                    </div>
                    {isSelected ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomizeModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold shadow-sm hover:bg-brand-deep transition-all"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        Swap Items
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 group-hover:text-brand flex items-center gap-0.5">
                        Select <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── STEP 2: Interactive Volume & Budget Calculator ── */}
        <section className="p-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121B26] shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="font-display font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
              Volume & Wholesale Discount Tier
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400 ml-8 mb-6">
            Wholesale tier discounts apply automatically based on recipient count.
          </p>

          {/* Quantity Slider */}
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase text-gray-500 dark:text-zinc-400 tracking-wider">
                  Order Quantity
                </span>
                <p className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                  {quantity} <span className="text-sm font-normal text-gray-500 dark:text-zinc-400">units (MOQ 10)</span>
                </p>
              </div>

              {discountRate > 0 ? (
                <div className="px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-right">
                  <span className="text-xs font-bold block">{Math.round(discountRate * 100)}% Volume Discount</span>
                  <span className="text-[10px] opacity-80">Saving {formatKsh(savings)}</span>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-zinc-400 text-xs">
                  Next discount tier at 25 units (10% off)
                </div>
              )}
            </div>

            <input
              type="range"
              min={10}
              max={500}
              step={5}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-2.5 bg-gray-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand"
            />

            {/* Quick Quantity Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-gray-500 font-medium">Quick presets:</span>
              {[15, 25, 50, 100, 250, 500].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuantity(q)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                    quantity === q
                      ? "bg-brand text-white"
                      : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  {q} units
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Summary Grid */}
          <div className="mt-8 p-4 rounded-2xl bg-gray-50 dark:bg-[#0E1520] border border-gray-100 dark:border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] text-gray-400 font-semibold uppercase">Unit Base Cost</span>
              <p className="font-bold text-base text-gray-900 dark:text-white mt-0.5">
                {formatKsh(calculatedUnitPrice)}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-semibold uppercase">Discounted Unit</span>
              <p className="font-bold text-base text-emerald-600 dark:text-emerald-400 mt-0.5">
                {formatKsh(discountedUnitPrice)}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-semibold uppercase">Subtotal ({quantity} units)</span>
              <p className="font-bold text-base text-gray-900 dark:text-white mt-0.5">
                {formatKsh(subtotal)}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-gray-400 font-semibold uppercase">
                {includeVat ? "Total (incl. 16% VAT)" : "Total (excl. VAT)"}
              </span>
              <p className="font-display font-bold text-lg text-brand dark:text-brand-light mt-0.5">
                {formatKsh(grandTotal)}
              </p>
            </div>
          </div>

          {/* 16% VAT Tax Toggle */}
          <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <input
                id="vat-toggle"
                type="checkbox"
                checked={includeVat}
                onChange={(e) => setIncludeVat(e.target.checked)}
                className="w-4 h-4 rounded text-brand focus:ring-brand cursor-pointer"
              />
              <label htmlFor="vat-toggle" className="text-xs font-semibold text-gray-700 dark:text-zinc-300 cursor-pointer">
                Include 16% VAT for Official eTIMS Tax Invoice & ETR Slip
              </label>
            </div>
            {includeVat && (
              <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">
                VAT: +{formatKsh(vatAmount)}
              </span>
            )}
          </div>
        </section>

        {/* ── STEP 3: Dispatch Logistics & Corporate Identification ── */}
        <section className="p-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121B26] shadow-sm space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold">3</span>
              <h2 className="font-display font-bold text-lg sm:text-xl text-gray-900 dark:text-white">
                Dispatch Mode & Company Details
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 ml-8">
              Tell us how you would like the hampers dispatched and where to send the formal proforma quote.
            </p>
          </div>

          {/* Delivery Method Selector (HCI Direct Comparison) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setDeliveryMethod("office")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                deliveryMethod === "office"
                  ? "border-brand bg-brand/[0.03] dark:bg-brand/[0.08]"
                  : "border-gray-200 dark:border-white/10 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 className="w-4 h-4 text-brand" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Single Office Consolidated Drop</h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                We deliver the entire batch to your headquarters or event venue in Nairobi (Free delivery).
              </p>
            </div>

            <div
              onClick={() => setDeliveryMethod("magic_link")}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                deliveryMethod === "magic_link"
                  ? "border-brand bg-brand/[0.03] dark:bg-brand/[0.08]"
                  : "border-gray-200 dark:border-white/10 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Truck className="w-4 h-4 text-emerald-500" />
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Direct WhatsApp Pin Dispatch</h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                Zero address collection for HR! We send an automated WhatsApp link to recipients to drop their home pin.
              </p>
            </div>
          </div>

          {/* Corporate Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                Company / Organization *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Safaricom PLC"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                Work Email (For Proforma PDF) *
              </label>
              <input
                type="email"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                placeholder="procurement@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                Contact Phone / WhatsApp
              </label>
              <input
                type="tel"
                value={workPhone}
                onChange={(e) => setWorkPhone(e.target.value)}
                placeholder="+254 712 345 678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
              Custom Branding / Packaging Requirements
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Include our laser-engraved logo on tumblers, brand colors #004D40, deliver by Nov 28th."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-xs text-gray-900 dark:text-white outline-none focus:border-brand"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleGenerateProforma}
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-brand hover:bg-brand-deep text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Proforma Quote...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Official Proforma Invoice (LPO Ready)
                </>
              )}
            </button>

            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all min-h-[48px]"
            >
              <MessageSquare className="w-4 h-4" />
              Discuss on WhatsApp
            </a>
          </div>
        </section>
      </main>

      {/* ── Swap / Customization Modal ── */}
      {customizeModalOpen && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setCustomizeModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#121B26] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/10">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Customize Items: {activePack.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Swap existing items or add merchandise from our catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomizeModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Current Items in Pack */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
                    Current Pack Contents ({currentPackItems.length})
                  </span>
                  {customItemsByPack[selectedPackId] && (
                    <button
                      type="button"
                      onClick={handleResetPack}
                      className="text-xs text-brand hover:underline font-semibold"
                    >
                      Reset to Defaults
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {currentPackItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-[#0E1520] text-xs"
                    >
                      <span className="font-semibold text-gray-800 dark:text-zinc-200 flex-1 truncate pr-2">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-gray-900 dark:text-white">
                          +{formatKsh(item.unitCost)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove from pack"
                          disabled={currentPackItems.length <= 1}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-on Catalog Items */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-2">
                  Available Catalog Swaps & Upgrades
                </span>
                <div className="space-y-2">
                  {CATALOG_ADDONS.map((addon) => {
                    const isAlreadyIncluded = currentPackItems.some((i) => i.id === addon.id);

                    return (
                      <div
                        key={addon.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-white/5 bg-white dark:bg-zinc-800/60 text-xs"
                      >
                        <span className="text-gray-700 dark:text-zinc-300 flex-1 truncate pr-2">
                          {addon.name}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-gray-500 dark:text-zinc-400 font-semibold">
                            +{formatKsh(addon.unitCost)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddCatalogItem(addon)}
                            disabled={isAlreadyIncluded}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                              isAlreadyIncluded
                                ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed"
                                : "bg-brand text-white hover:bg-brand-deep"
                            }`}
                          >
                            {isAlreadyIncluded ? "Added" : "+ Add"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#0E1520]">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Recalculated Unit Rate</span>
                <p className="font-bold text-base text-gray-900 dark:text-white">
                  {formatKsh(calculatedUnitPrice)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCustomizeModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-brand text-white text-xs font-bold shadow-sm"
              >
                Apply Customization
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Success Quote Generated Modal ── */}
      {successQuoteRef && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#121B26] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10">
                Official Proforma Generated
              </span>
              <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white mt-2">
                Quotation Ref: {successQuoteRef}
              </h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
                A formal quotation has been issued for <strong>{companyName}</strong>. Our corporate desk has received your specifications.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#0E1520] border border-gray-100 dark:border-white/5 text-xs text-left space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Pack:</span>
                <span className="font-bold">{activePack.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity:</span>
                <span className="font-bold">{quantity} units ({Math.round(discountRate * 100)}% tier)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Total:</span>
                <span className="font-bold text-brand dark:text-brand-light">{formatKsh(grandTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Connect with Quote Desk on WhatsApp
              </a>

              <button
                type="button"
                onClick={() => setSuccessQuoteRef(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50"
              >
                Close & Configure Another Pack
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
