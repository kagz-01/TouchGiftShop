"use client";

import { Check, Package, Gift, Crown } from "lucide-react";
import Image from "next/image";

export type WrapType = "none" | "classic" | "woven" | "premium_box";

export const WRAP_OPTIONS = [
  {
    id: "none",
    label: "No Wrapping",
    desc: "Delivered in secure standard eco-packaging.",
    price: 0,
    icon: Package,
    image: null,
  },
  {
    id: "classic",
    label: "Classic Wrap",
    desc: "Elegant minimalist wrapping paper with a silk ribbon.",
    price: 200,
    icon: Gift,
    image: "/images/wraps/classic.png",
  },
  {
    id: "woven",
    label: "Artisan Woven Basket",
    desc: "Premium African woven sisal basket (Kiondo). Ideal for hampers.",
    price: 500,
    icon: Package,
    image: "/images/wraps/woven.png",
  },
  {
    id: "premium_box",
    label: "Luxury Magnetic Box",
    desc: "Matte black hardcover box with emerald satin ribbon.",
    price: 1000,
    icon: Crown,
    image: "/images/wraps/premium_box.png",
  },
] as const;

interface Props {
  value: WrapType;
  onChange: (value: WrapType) => void;
  theme?: "b2c" | "corporate";
}

export default function GiftWrapSelector({ value, onChange, theme = "b2c" }: Props) {
  const isCorp = theme === "corporate";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`font-display font-bold ${isCorp ? "text-white text-xl" : "text-brand-deep text-lg"}`}>
            Presentation & Wrapping
          </h3>
          <p className={`text-sm mt-1 ${isCorp ? "text-white/60" : "text-brand-muted"}`}>
            How should we package your order?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {WRAP_OPTIONS.map((opt) => {
          const isSelected = value === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id as WrapType)}
              className={`relative overflow-hidden cursor-pointer rounded-2xl border transition-all duration-300 group flex flex-col ${
                isSelected
                  ? isCorp
                    ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                    : "border-brand bg-brand/5 shadow-md"
                  : isCorp
                  ? "border-white/10 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                  : "border-black/10 bg-white hover:border-black/20 hover:shadow-sm"
              }`}
            >
              {/* Checkbox indicator */}
              <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border flex items-center justify-center z-10 transition-colors ${
                isSelected 
                  ? isCorp ? "bg-emerald-500 border-emerald-500 text-[#050304]" : "bg-brand border-brand text-white" 
                  : isCorp ? "border-white/20 bg-black/40 text-transparent" : "border-black/20 bg-white/50 text-transparent"
              }`}>
                <Check className="w-3.5 h-3.5" />
              </div>

              {/* Image Section */}
              {opt.image ? (
                <div className="h-36 w-full relative overflow-hidden bg-black/5">
                  <Image 
                    src={opt.image} 
                    alt={opt.label} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {/* Price Tag */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white font-semibold text-sm backdrop-blur-md bg-white/10 px-2.5 py-1 rounded border border-white/20">
                      +KSh {opt.price.toLocaleString("en-US")}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`h-36 w-full flex flex-col items-center justify-center ${isCorp ? "bg-white/5" : "bg-gray-50"}`}>
                  <opt.icon className={`w-8 h-8 mb-2 ${isCorp ? "text-white/20" : "text-black/20"}`} />
                  <span className={`font-semibold text-sm ${isCorp ? "text-white/60" : "text-black/50"}`}>Free</span>
                </div>
              )}

              {/* Info Section */}
              <div className="p-4 flex-1 flex flex-col">
                <h4 className={`font-bold mb-1 flex items-center gap-2 ${isCorp ? "text-white" : "text-brand-deep"}`}>
                  {opt.label}
                </h4>
                <p className={`text-xs leading-relaxed ${isCorp ? "text-white/50" : "text-brand-muted"}`}>
                  {opt.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
