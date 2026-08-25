"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Target, Zap, MapPin, EyeOff, Camera, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface BrandPillarsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PILLARS = [
  {
    icon: <Target className="w-6 h-6 text-gold" />,
    title: "Bespoke Curation",
    desc: "Each piece is hand-selected for uncompromising quality and elegance.",
  },
  {
    icon: <Zap className="w-6 h-6 text-brand" />,
    title: "Impeccable Timing",
    desc: "Swift, seamless delivery across Nairobi, arriving exactly when it matters.",
  },
  {
    icon: <MapPin className="w-6 h-6 text-coral" />,
    title: "The Mystery Pin-Drop",
    desc: "We discreetly coordinate the delivery location with them, preserving the surprise.",
  },
  {
    icon: <EyeOff className="w-6 h-6 text-brand-light" />,
    title: "Absolute Discretion",
    desc: "Price tags and sender details are entirely removed.",
  },
  {
    icon: <Camera className="w-6 h-6 text-success" />,
    title: "A Glimpse of Joy",
    desc: "Receive a photograph of the exquisitely wrapped gift just before it begins its journey.",
  },
];

export function BrandPillarsModal({ isOpen, onClose }: BrandPillarsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Small delay to allow display:block before adding opacity/transform classes
      requestAnimationFrame(() => setAnimateIn(true));
    } else {
      document.body.style.overflow = "unset";
      setAnimateIn(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;
  if (!isOpen && !animateIn) return null;

  const handleHomeClick = () => {
    onClose();
    router.push("/");
  };

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-all duration-700 ease-out",
        animateIn ? "opacity-100 backdrop-blur-md bg-black/40" : "opacity-0 backdrop-blur-none bg-black/0"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-4xl max-h-[90vh] overflow-y-auto card-theme rounded-3xl p-8 md:p-12 shadow-2xl transition-all duration-700 delay-100 ease-out transform",
          animateIn ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-theme-muted hover:text-theme-heading hover:bg-theme-surface/50 transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content Container */}
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          {/* Animated Logo */}
          <div
            className={cn(
              "relative w-24 h-24 mb-6 transition-all duration-1000 delay-300",
              animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="absolute inset-0 bg-brand/20 blur-2xl rounded-full animate-pulse" />
            <Image
              src="/logo.webp"
              alt="TouchGift Logo"
              fill
              className="object-contain drop-shadow-2xl animate-float"
              priority
            />
          </div>

          <h2
            className={cn(
              "font-display text-3xl md:text-4xl font-bold text-theme-heading mb-4 tracking-tight transition-all duration-700 delay-400",
              animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            The TouchGift Promise
          </h2>
          
          <p
            className={cn(
              "text-theme-body text-lg mb-12 transition-all duration-700 delay-500",
              animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Kenya's premier gifting platform. We transform ordinary moments into unforgettable memories through our five pillars of excellence.
          </p>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mb-12">
            {PILLARS.map((pillar, idx) => (
              <div
                key={pillar.title}
                className={cn(
                  "bento-card-theme p-6 rounded-2xl transition-all duration-700 transform",
                  animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                )}
                style={{ transitionDelay: `${600 + idx * 100}ms` }}
              >
                <div className="mb-4 p-3 rounded-full bg-theme-surface inline-block shadow-sm">
                  {pillar.icon}
                </div>
                <h3 className="font-display font-bold text-lg text-theme-heading mb-2">
                  {pillar.title}
                </h3>
                <p className="text-theme-body text-sm leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <button
            onClick={handleHomeClick}
            className={cn(
              "group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-theme-heading text-theme-bg font-bold overflow-hidden transition-all duration-700 transform",
              animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
            style={{ transitionDelay: "1100ms" }}
          >
            <span className="absolute inset-0 w-full h-full bg-brand group-hover:bg-brand-deep transition-colors duration-300" />
            <span className="relative text-white flex items-center gap-2">
              Continue to Home <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
