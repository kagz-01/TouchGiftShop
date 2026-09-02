"use client";
import React, { useState, useRef, useEffect } from "react";

type Props = {
  amount: number;
  recipientName: string;
  fromLabel: string;
  template?: "premium" | "classic" | "minimal";
  code?: string | null;
};

export default function GiftCardPreview({ amount, recipientName, fromLabel, template = "premium", code }: Props) {
  const formatted = new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount);

  const [flipped, setFlipped] = useState(false);
  const [view, setView] = useState<"front" | "back" | "tilt" | "usage">("front");
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tiltTransform, setTiltTransform] = useState<string>("rotateX(0deg) rotateY(0deg)");

  useEffect(() => {
    setFlipped(view === "back");
  }, [view]);

  // Auto-tilt or celebration for certain views
  useEffect(() => {
    if (view === "tilt") {
      setTiltTransform("rotateX(6deg) rotateY(-8deg)");
    } else if (view === "usage") {
      // quick pop tilt then reset
      setTiltTransform("rotateX(-6deg) rotateY(6deg)");
      const t = setTimeout(() => setTiltTransform("rotateX(0deg) rotateY(0deg)"), 900);
      return () => clearTimeout(t);
    } else {
      setTiltTransform("rotateX(0deg) rotateY(0deg)");
    }
  }, [view]);

  const cardNumber = code ? `${code.padEnd(16, "0")}` : "1234 5678 9012 3456";
  const pin = "123456";

  function handlePointerMove(e: React.PointerEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = (-y / rect.height) * 10; // rotateX
    const ry = (x / rect.width) * 12; // rotateY
    const t = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    setTiltTransform(t);
  }

  function handlePointerLeave() {
    setTiltTransform("rotateX(0deg) rotateY(0deg)");
  }

  const innerStyle: React.CSSProperties = {
    transform: `${tiltTransform} ${flipped ? " rotateY(180deg)" : ""}`,
    transformStyle: "preserve-3d",
    transition: "transform 280ms var(--motion-smooth)",
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-7">
          <div className="tilt-card perspective-1000">
            <div
              ref={cardRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              className={`tilt-card-inner gift-card shape-premium-card p-8 relative preserve-3d backface-hidden`}
              style={innerStyle}
              onClick={() => setView(view === "back" ? "front" : "back")}
            >
              {/* Front face */}
              <div className="absolute inset-0 backface-hidden">
                <div className="absolute -top-6 -right-10 transform -rotate-20 pointer-events-none">
                  <svg width="260" height="120" viewBox="0 0 260 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                    <rect x="0" y="20" width="260" height="60" rx="24" fill="url(#r)" />
                    <defs>
                      <linearGradient id="r" x1="0" x2="1">
                        <stop offset="0%" stopColor="#D4A853" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#E8C97A" stopOpacity="0.85" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="flex justify-between items-start text-white">
                  <div>
                    <div className="text-sm tracking-widest opacity-90">TOUCHGIFT</div>
                    <div className="heading-elegant text-2xl mt-2">Gift Card</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-80">KSH</div>
                    <div className="text-5xl font-extrabold text-gold leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>{formatted.replace(/KES|\s/g, "")}</div>
                  </div>
                </div>

                <div className="mt-8 text-white">
                  <div className="text-lg text-theme-accent">A gift, their choice.</div>
                  <div className="text-3xl font-medium mt-4 heading-elegant">{recipientName || "Recipient Name"}</div>
                </div>

                <div className="mt-10 flex justify-between items-center text-white">
                  <div className="text-sm opacity-80">From</div>
                  <div className="font-medium">{fromLabel || "A friend"}</div>
                </div>

                <div className="absolute bottom-4 left-6 text-xs opacity-80 text-white">{code ? `Code: ${code}` : "Code will appear after purchase"}</div>
              </div>

              {/* Back face */}
              <div className="absolute inset-0 rotate-y-180 backface-hidden bg-gradient-to-br from-[#2c0b12] to-[#5b0f26] text-white p-6 transform rotateY(180deg)">
                <div className="text-sm opacity-80">TOUCHGIFT</div>
                <div className="mt-6 bg-white/10 p-4 rounded-md">
                  <div className="text-xs opacity-80">Card number</div>
                  <div className="text-lg font-mono mt-1 tracking-widest">{cardNumber}</div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <div className="text-xs opacity-80">PIN</div>
                    <div className="font-mono text-lg">{pin}</div>
                  </div>
                  <div className="text-xs opacity-80">Valid 12 months</div>
                </div>
                <div className="absolute bottom-4 left-6 text-xs opacity-60">Redeem at touchgift.shop</div>
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="mt-6 flex gap-4 items-center">
            <button className="w-20 h-12 shape-premium-image bg-gradient-to-br from-[#5b0f26] to-[#8b2546] rounded-lg shadow-sm" onClick={() => setView("front")} aria-label="Front view"></button>
            <button className="w-20 h-12 shape-premium-image bg-gradient-to-br from-[#6e132f] to-[#a13b63] rounded-lg shadow-sm" onClick={() => setView("back")} aria-label="Back view"></button>
            <button className="w-20 h-12 shape-premium-image bg-gradient-to-br from-[#7a1a3a] to-[#b65b7a] rounded-lg shadow-sm" onClick={() => setView("tilt")} aria-label="Tilted view"></button>
            <button className="w-20 h-12 shape-premium-image bg-gradient-to-br from-[#8b1f46] to-[#c86b8d] rounded-lg shadow-sm" onClick={() => setView("usage")} aria-label="Usage animation"></button>
          </div>
        </div>

        <div className="col-span-5 flex flex-col gap-4">
          <div className="rounded-xl p-4 card-theme">
            <div className="text-sm text-theme-muted">Instant delivery • Secure payment • 12‑month validity</div>
            <div className="mt-4">
              <div className="text-xs text-theme-muted">Selected amount</div>
              <div className="text-2xl font-bold mt-1">{formatted}</div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-theme-muted">Message</div>
              <div className="mt-1 text-theme-body">{((recipientName || fromLabel) && "") || "Add a personal message"}</div>
            </div>
            <div className="mt-6">
              <button className="btn-brand w-full">Continue to checkout →</button>
            </div>
          </div>

          <div className="text-sm text-theme-muted">Drag to explore • Click to flip</div>
        </div>
      </div>
    </div>
  );
}
