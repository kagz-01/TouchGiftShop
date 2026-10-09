"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Package, Users, Check, Gift, Info, ChevronDown, ChevronUp } from "lucide-react";
import type { CartItem } from "@/lib/cart";
import GiftWrapSelector, { WrapType, WRAP_OPTIONS } from "@/components/shared/GiftWrapSelector";

export type PackagingMode = "hamper" | "individual" | "multi_recipient";

interface PerItemWrap {
  productId: string;
  wrap: WrapType;
}

interface PackagingDecisionProps {
  cartItems: CartItem[];
  onConfirm: (decision: {
    mode: PackagingMode;
    hamperWrap: WrapType;
    perItemWraps: PerItemWrap[];
    totalWrappingCost: number;
  }) => void;
}

const OPTION_CARDS = [
  {
    id: "hamper" as PackagingMode,
    title: "Curate as a Hamper",
    subtitle: "Everything together in one beautiful box",
    image: "/images/wraps/hamper_together.png",
    badge: "Most Popular 🔥",
    badgeColor: "bg-amber-400/90 text-amber-950",
    pros: ["One luxurious unboxing moment", "Saves on individual packaging costs", "Perfect for a single recipient"],
    highlight: true,
  },
  {
    id: "individual" as PackagingMode,
    title: "Wrap Individually",
    subtitle: "Each item gets its own special wrapping",
    image: "/images/wraps/individual_wraps.png",
    badge: "Most Flexible",
    badgeColor: "bg-sky-400/90 text-sky-950",
    pros: ["Choose unique wrapping per item", "Great when items have different feels", "Each surprise is revealed separately"],
    highlight: false,
  },
  {
    id: "multi_recipient" as PackagingMode,
    title: "Send to Different People",
    subtitle: "Each item goes to a different recipient",
    image: null,
    badge: "Multi-Gifting",
    badgeColor: "bg-emerald-400/90 text-emerald-950",
    pros: ["Birthday + anniversary in one order", "Each recipient gets a personal note", "One checkout, multiple addresses"],
    highlight: false,
  },
];

export default function PackagingDecision({ cartItems, onConfirm }: PackagingDecisionProps) {
  const [selected, setSelected] = useState<PackagingMode | null>(null);
  const [hamperWrap, setHamperWrap] = useState<WrapType>("none");
  const [perItemWraps, setPerItemWraps] = useState<PerItemWrap[]>(
    cartItems.map((item) => ({ productId: item.productId, wrap: "none" as WrapType }))
  );
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  function setItemWrap(productId: string, wrap: WrapType) {
    setPerItemWraps((prev) => prev.map((p) => (p.productId === productId ? { ...p, wrap } : p)));
  }

  const hamperWrapCost = WRAP_OPTIONS.find((o) => o.id === hamperWrap)?.price ?? 0;
  const individualWrapCost = perItemWraps.reduce((sum, p) => {
    const cost = WRAP_OPTIONS.find((o) => o.id === p.wrap)?.price ?? 0;
    return sum + cost;
  }, 0);

  const totalWrappingCost =
    selected === "hamper" ? hamperWrapCost :
    selected === "individual" ? individualWrapCost : 0;

  function handleConfirm() {
    if (!selected) return;
    onConfirm({
      mode: selected,
      hamperWrap,
      perItemWraps,
      totalWrappingCost,
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf8f4] via-white to-[#f4f7fd] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-brand/8 text-brand font-bold text-xs px-3 py-1.5 rounded-full mb-3 uppercase tracking-widest">
            <Package className="w-3.5 h-3.5" />
            {cartItems.length} items in your cart
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-deep leading-tight">
            How should we <br className="hidden sm:block" />present your gifts?
          </h1>
          <p className="text-brand-muted text-sm max-w-sm mx-auto">
            You have multiple items. Choose how we should package them before checkout.
          </p>
        </div>

        {/* Cart Items Preview */}
        <div className="bg-white rounded-2xl border border-black/6 shadow-sm p-4">
          <p className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-3">Your Items</p>
          <div className="flex flex-wrap gap-3">
            {cartItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2 border border-black/5">
                {item.image_url && (
                  <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-brand-deep leading-tight line-clamp-1 max-w-[120px]">{item.name}</p>
                  <p className="text-[10px] text-brand-muted">
                    Qty: {item.quantity} · KSh {(item.price * item.quantity).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {OPTION_CARDS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelected(opt.id)}
              className={`relative text-left rounded-3xl border-2 overflow-hidden transition-all duration-300 cursor-pointer group ${
                selected === opt.id
                  ? "border-brand shadow-[0_0_0_4px_rgba(var(--brand-rgb,212,175,55),0.12)] scale-[1.01]"
                  : "border-black/8 hover:border-brand/40 hover:shadow-md bg-white"
              }`}
            >
              {/* Badge */}
              <div className={`absolute top-3 left-3 z-10 text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${opt.badgeColor}`}>
                {opt.badge}
              </div>

              {/* Check indicator */}
              <div className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                selected === opt.id ? "bg-brand text-white scale-100" : "bg-white/70 border border-black/15 text-transparent scale-90"
              }`}>
                <Check className="w-3.5 h-3.5" />
              </div>

              {/* Image / Icon */}
              {opt.image ? (
                <div className="h-40 w-full relative overflow-hidden bg-gray-100">
                  <Image
                    src={opt.image}
                    alt={opt.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              ) : (
                <div className="h-40 w-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs text-emerald-600 font-semibold">Multi-Recipient</p>
                  </div>
                </div>
              )}

              {/* Text */}
              <div className="p-4 space-y-2 bg-white">
                <h3 className="font-bold text-brand-deep text-sm">{opt.title}</h3>
                <p className="text-xs text-brand-muted leading-relaxed">{opt.subtitle}</p>
                <ul className="space-y-1 pt-1">
                  {opt.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-brand-deep/70">
                      <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          ))}
        </div>

        {/* Conditional Sub-sections */}

        {/* HAMPER: single wrap selector */}
        {selected === "hamper" && (
          <div className="bg-white rounded-3xl border border-black/6 shadow-sm p-6 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-brand/8 rounded-xl flex items-center justify-center flex-shrink-0">
                <Gift className="w-4.5 h-4.5 text-brand" />
              </div>
              <div>
                <h2 className="font-bold text-brand-deep">Choose Hamper Presentation</h2>
                <p className="text-xs text-brand-muted mt-0.5">
                  All {cartItems.length} items will be arranged together inside your chosen packaging.
                </p>
              </div>
            </div>
            <GiftWrapSelector value={hamperWrap} onChange={setHamperWrap} theme="b2c" />
            {hamperWrapCost > 0 && (
              <div className="flex items-center gap-2 text-xs text-brand-muted bg-brand/5 rounded-xl px-4 py-2.5">
                <Info className="w-3.5 h-3.5 text-brand flex-shrink-0" />
                Hamper packaging +KSh {hamperWrapCost.toLocaleString("en-US")} added to your total.
              </div>
            )}
          </div>
        )}

        {/* INDIVIDUAL: per-item wrap selectors */}
        {selected === "individual" && (
          <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-brand-deep">Choose Wrapping Per Item</h2>
              <span className="text-xs text-brand-muted">
                Total wrap cost: <strong className="text-brand-deep">KSh {individualWrapCost.toLocaleString("en-US")}</strong>
              </span>
            </div>
            {cartItems.map((item, i) => {
              const itemWrap = perItemWraps.find((p) => p.productId === item.productId);
              const isExpanded = expandedItem === item.productId;
              return (
                <div key={i} className="bg-white rounded-2xl border border-black/6 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
                    onClick={() => setExpandedItem(isExpanded ? null : item.productId)}
                  >
                    {item.image_url && (
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                        <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-deep text-sm truncate">{item.name}</p>
                      <p className="text-xs text-brand-muted">
                        {itemWrap?.wrap === "none" || !itemWrap?.wrap
                          ? "No wrapping selected"
                          : `${WRAP_OPTIONS.find(o => o.id === itemWrap.wrap)?.label} · +KSh ${WRAP_OPTIONS.find(o => o.id === itemWrap.wrap)?.price?.toLocaleString("en-US")}`}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      itemWrap?.wrap && itemWrap.wrap !== "none"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {itemWrap?.wrap && itemWrap.wrap !== "none" ? <Check className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                      {itemWrap?.wrap && itemWrap.wrap !== "none" ? "Selected" : "Choose"}
                      {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-black/5 p-4 bg-gray-50/40">
                      <GiftWrapSelector
                        value={itemWrap?.wrap ?? "none"}
                        onChange={(wrap) => setItemWrap(item.productId, wrap)}
                        theme="b2c"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MULTI-RECIPIENT: info callout */}
        {selected === "multi_recipient" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-emerald-900 mb-1">Multi-Recipient Mode</h3>
                <p className="text-sm text-emerald-700 leading-relaxed">
                  On the next screen, you'll be able to assign each item to a different recipient with their own delivery address and personal note. 
                  Wrapping can be selected per-item on the following step.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="sticky bottom-4 z-30">
          <button
            type="button"
            disabled={!selected}
            onClick={handleConfirm}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
              selected
                ? "bg-brand text-white shadow-lg hover:bg-brand-dark hover:shadow-xl hover:-translate-y-0.5"
                : "bg-black/8 text-black/30 cursor-not-allowed"
            }`}
          >
            {selected ? (
              <>
                Continue to Checkout
                <ArrowRight className="w-5 h-5" />
                {totalWrappingCost > 0 && (
                  <span className="text-sm font-normal opacity-80">
                    +KSh {totalWrappingCost.toLocaleString("en-US")} wrapping
                  </span>
                )}
              </>
            ) : (
              "Select how you'd like to package your gifts"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
