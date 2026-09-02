"use client";

import { useEffect, useState } from "react";

export type GiftCardStyle = {
  bg?: string;
  accent?: string;
  textPrimary?: string;
  textSecondary?: string;
  bowColor?: string;
};

export const FONTS = ["Georgia", "Playfair Display", "Cormorant Garamond", "Arial"];

export const CARD_PRESETS: Record<string, GiftCardStyle> = {
  default: {
    bg: "linear-gradient(135deg, #a51b58 0%, #7b123f 45%, #4e092b 100%)",
    accent: "#d8a744",
    textPrimary: "#ffffff",
    textSecondary: "#f2d37a",
    bowColor: "linear-gradient(135deg, #f7da84, #b77b18)",
  },
  birthday: {
    bg: "linear-gradient(135deg, #e91e63 0%, #c2185b 45%, #880e4f 100%)",
    accent: "#ffd54f",
    textPrimary: "#ffffff",
    textSecondary: "#fff9c4",
    bowColor: "linear-gradient(135deg, #ffd54f, #ff8f00)",
  },
  wedding: {
    bg: "linear-gradient(135deg, #f8bbd0 0%, #f48fb1 45%, #ec407a 100%)",
    accent: "#ffffff",
    textPrimary: "#ffffff",
    textSecondary: "#fce4ec",
    bowColor: "linear-gradient(135deg, #ffffff, #f8bbd0)",
  },
  corporate: {
    bg: "linear-gradient(135deg, #263238 0%, #37474f 45%, #455a64 100%)",
    accent: "#cfd8dc",
    textPrimary: "#ffffff",
    textSecondary: "#b0bec5",
    bowColor: "linear-gradient(135deg, #cfd8dc, #78909c)",
  },
};

const money = (v: number) => new Intl.NumberFormat("en-KE").format(v);

export type GiftCardProps = {
  amount?: number;
  recipientName?: string;
  senderName?: string;
  message?: string;
  code?: string;
  pin?: string;
  style?: GiftCardStyle;
  flipped?: boolean;
  className?: string;
  onFlip?: () => void;
};

export default function GiftCardPreview({
  amount = 2000,
  recipientName = "Recipient Name",
  senderName = "A friend",
  message = "A gift, their choice.",
  code = "1234 5678 9012 3456",
  pin = "123456",
  style,
  flipped: controlledFlip,
  className = "",
  onFlip,
}: GiftCardProps) {
  const [internalFlip, setInternalFlip] = useState(false);
  const flipped = controlledFlip ?? internalFlip;

  const flip = () => {
    if (onFlip) onFlip();
    else setInternalFlip((v) => !v);
  };

  const s = { ...CARD_PRESETS.default, ...style };

  return (
    <>
      <div
        className={`gift-card-face-wrapper ${flipped ? "flipped" : ""} ${className}`}
        onClick={flip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flip();
          }
        }}
        aria-label="Gift card preview. Click to flip."
      >
        {/* FRONT */}
        <article className="gc-face gc-front" style={{ background: s.bg }}>
          <div className="gc-pattern" />
          <div className="gc-arc gc-arc-1" />
          <div className="gc-arc gc-arc-2" />

          <div className="gc-top">
            <div>
              <div className="gc-brand">TOUCHGIFT</div>
              <div className="gc-label">GIFT CARD</div>
            </div>
            <div className="gc-amount">
              <span className="gc-currency">KSH</span>
              <strong>{money(amount)}</strong>
            </div>
          </div>

          <div className="gc-copy">
            <h2>{message || "A gift, their choice."}</h2>
            <p>Endless joy, one card.</p>
          </div>

          <div className="gc-recipient">
            <span>RECIPIENT</span>
            <strong>{recipientName || "Recipient Name"}</strong>
            <div className="gc-recipient-line" />
          </div>

          <div className="gc-sender">
            FROM <span>{senderName}</span>
          </div>

          <div className="gc-gift-icon" aria-hidden="true">
            <svg viewBox="0 0 64 64" fill="none">
              <rect x="8" y="25" width="48" height="31" rx="4" stroke="currentColor" strokeWidth="3" />
              <path d="M32 25V56" stroke="currentColor" strokeWidth="3" />
              <path d="M8 35H56" stroke="currentColor" strokeWidth="3" />
              <path d="M32 25C25 25 16 22 16 15C16 11 19 9 23 10C28 11 32 18 32 25Z" stroke="currentColor" strokeWidth="3" />
              <path d="M32 25C39 25 48 22 48 15C48 11 45 9 41 10C36 11 32 18 32 25Z" stroke="currentColor" strokeWidth="3" />
            </svg>
          </div>

          <div className="gc-bow" aria-hidden="true">
            <span className="gc-bow-loop gc-bow-left" />
            <span className="gc-bow-loop gc-bow-right" />
            <span className="gc-bow-knot" />
            <span className="gc-bow-tail gc-tail-left" />
            <span className="gc-bow-tail gc-tail-right" />
          </div>

          <div className="gc-shine" />
        </article>

        {/* BACK */}
        <article className="gc-face gc-back" style={{ background: `linear-gradient(145deg, ${s.bg?.includes?.("#") ? "#671039" : "#671039"}, #3e0823)` }}>
          <div className="gc-pattern" />
          <div className="gc-back-brand">
            <span>TOUCHGIFT</span>
            <small>GIFT CARD</small>
          </div>
          <div className="gc-back-content">
            <p>Give someone the freedom to choose exactly what they love from TouchGift.</p>
            <div className="gc-card-code">
              <span>GIFT CARD NUMBER</span>
              <strong>{code}</strong>
            </div>
            <div className="gc-pin-row">
              <div>
                <span>PIN</span>
                <strong>{pin}</strong>
              </div>
              <div>
                <span>VALID</span>
                <strong>3 MONTHS</strong>
              </div>
            </div>
          </div>
          <div className="gc-back-footer">
            Redeem online at touchgiftshop.co.ke &bull; Non-refundable &bull; Valid for 3 months from purchase
          </div>
        </article>
      </div>

      <style jsx global>{`
        .gift-card-face-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1.72 / 1;
          transform-style: preserve-3d;
          transition: transform 600ms cubic-bezier(0.4, 0.0, 0.2, 1);
          cursor: pointer;
          outline: none;
          z-index: 2;
        }
        .gift-card-face-wrapper.flipped {
          transform: rotateY(180deg);
        }

        .gc-face {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 20px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          box-shadow:
            0 25px 60px rgba(79,12,43,0.25),
            0 8px 18px rgba(79,12,43,0.15),
            inset 0 1px 0 rgba(255,255,255,0.35);
          color: white;
        }

        .gc-front {
          background: radial-gradient(circle at 16% 20%, rgba(255,255,255,0.08), transparent 24%),
            linear-gradient(135deg, #a51b58 0%, #7b123f 45%, #4e092b 100%) !important;
        }

        .gc-back {
          transform: rotateY(180deg);
          padding: 7% 8%;
          background: linear-gradient(145deg, #671039, #3e0823) !important;
        }

        /* Pattern */
        .gc-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.11;
          background-image:
            radial-gradient(circle, transparent 0 9px, rgba(255,255,255,0.35) 10px 11px, transparent 12px),
            linear-gradient(45deg, transparent 48%, rgba(216,167,68,0.22) 49% 51%, transparent 52%);
          background-size: 78px 78px, 34px 34px;
          mask-image: linear-gradient(to bottom, black, transparent 85%);
        }

        /* Gold arcs */
        .gc-arc {
          position: absolute;
          width: 82%;
          height: 150%;
          border: 1px solid rgba(242,211,122,0.55);
          border-radius: 50%;
          transform: rotate(25deg);
          right: -32%;
          top: -55%;
          pointer-events: none;
        }
        .gc-arc-2 {
          width: 72%;
          right: -28%;
          top: -38%;
          opacity: 0.45;
        }

        /* Top section */
        .gc-top {
          position: absolute;
          left: 7%;
          right: 7%;
          top: 8%;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          z-index: 4;
        }
        .gc-brand {
          font-family: Arial, sans-serif;
          font-weight: 800;
          letter-spacing: 0.28em;
          font-size: clamp(11px, 1.5vw, 16px);
        }
        .gc-label {
          margin-top: 6px;
          font: 500 clamp(8px, 1vw, 11px)/1 Arial, sans-serif;
          letter-spacing: 0.22em;
          opacity: 0.75;
        }

        /* Amount */
        .gc-amount {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          position: relative;
          z-index: 5;
        }
        .gc-currency {
          font: 600 clamp(8px, 1vw, 11px)/1 Arial, sans-serif;
          letter-spacing: 0.16em;
          color: #f2d37a;
        }
        .gc-amount strong {
          font-size: clamp(32px, 5.2vw, 64px);
          line-height: 0.95;
          color: #ffe49a;
          text-shadow: 0 3px 12px rgba(0,0,0,0.22);
        }

        /* Message */
        .gc-copy {
          position: absolute;
          left: 7%;
          top: 38%;
          z-index: 3;
        }
        .gc-copy h2 {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(22px, 3.2vw, 40px);
          font-weight: 500;
          letter-spacing: -0.5px;
        }
        .gc-copy p {
          margin: 6px 0 0;
          font-family: Georgia, serif;
          color: #f3ce64;
          font-size: clamp(14px, 1.8vw, 22px);
        }

        /* Recipient */
        .gc-recipient {
          position: absolute;
          left: 7%;
          bottom: 8%;
          width: 52%;
          z-index: 4;
        }
        .gc-recipient span {
          display: block;
          font: 600 clamp(7px, 0.85vw, 10px)/1 Arial, sans-serif;
          letter-spacing: 0.2em;
          color: #e9c66c;
        }
        .gc-recipient strong {
          display: block;
          margin-top: 6px;
          font-family: Georgia, serif;
          font-size: clamp(18px, 2.5vw, 30px);
          font-style: italic;
          font-weight: 500;
        }
        .gc-recipient-line {
          height: 1px;
          margin-top: 6px;
          background: linear-gradient(90deg, #d9ad42, transparent);
        }

        /* Sender */
        .gc-sender {
          position: absolute;
          left: 7%;
          bottom: 3.5%;
          font: 400 clamp(7px, 0.8vw, 9px)/1 Arial, sans-serif;
          letter-spacing: 0.15em;
          opacity: 0.6;
          z-index: 4;
        }
        .gc-sender span {
          color: #f5d477;
        }

        /* Gift icon */
        .gc-gift-icon {
          position: absolute;
          right: 7%;
          bottom: 8%;
          width: clamp(30px, 3.8vw, 48px);
          height: clamp(30px, 3.8vw, 48px);
          color: #f4d36d;
          z-index: 4;
        }
        .gc-gift-icon svg {
          width: 100%;
          height: 100%;
        }

        /* Bow */
        .gc-bow {
          position: absolute;
          right: 2%;
          top: -2%;
          width: 22%;
          height: 32%;
          z-index: 6;
        }
        .gc-bow-loop {
          position: absolute;
          top: 4%;
          width: 44%;
          height: 58%;
          border-radius: 60% 45% 55% 40%;
          background: linear-gradient(135deg, #f7da84, #b77b18);
          box-shadow: inset -6px -7px 10px rgba(90,50,0,0.2);
        }
        .gc-bow-left {
          left: 0;
          transform: rotate(25deg);
        }
        .gc-bow-right {
          right: 0;
          transform: rotate(-25deg) scaleX(-1);
        }
        .gc-bow-knot {
          position: absolute;
          left: 40%;
          top: 26%;
          width: 20%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #d39a2b;
          z-index: 2;
        }
        .gc-bow-tail {
          position: absolute;
          top: 47%;
          width: 19%;
          height: 45%;
          background: linear-gradient(135deg, #e5b950, #9d6412);
          clip-path: polygon(50% 0, 100% 100%, 0 82%);
        }
        .gc-tail-left {
          left: 31%;
          transform: rotate(14deg);
        }
        .gc-tail-right {
          right: 29%;
          transform: rotate(-14deg);
        }

        /* Shine */
        .gc-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.16) 48%, transparent 60%);
          transform: translateX(-110%);
          animation: gcShine 5s infinite;
          pointer-events: none;
          border-radius: 20px;
        }
        @keyframes gcShine {
          0%, 65% { transform: translateX(-110%); }
          85%, 100% { transform: translateX(110%); }
        }

        /* Back face */
        .gc-back-brand {
          position: absolute;
          top: 7%;
          left: 7%;
          display: flex;
          flex-direction: column;
        }
        .gc-back-brand span {
          font: 800 clamp(11px, 1.4vw, 16px)/1 Arial, sans-serif;
          letter-spacing: 0.25em;
          color: #f2d37a;
        }
        .gc-back-brand small {
          margin-top: 6px;
          font: 500 clamp(8px, 1vw, 11px)/1 Arial, sans-serif;
          letter-spacing: 0.2em;
          opacity: 0.7;
        }
        .gc-back-content {
          position: absolute;
          top: 28%;
          left: 7%;
          right: 7%;
        }
        .gc-back-content > p {
          max-width: 90%;
          font: 400 clamp(11px, 1.4vw, 16px)/1.55 Arial, sans-serif;
          color: #f5df9b;
          margin: 0 0 10%;
        }
        .gc-card-code {
          padding: 5% 6%;
          border-radius: 14px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .gc-card-code span, .gc-pin-row span {
          display: block;
          font: 600 clamp(7px, 0.85vw, 10px)/1 Arial, sans-serif;
          letter-spacing: 0.2em;
          color: #e9bf5d;
        }
        .gc-card-code strong {
          display: block;
          margin-top: 6px;
          font: 600 clamp(14px, 1.9vw, 22px)/1 Arial, sans-serif;
          letter-spacing: 0.08em;
        }
        .gc-pin-row {
          display: flex;
          justify-content: space-between;
          margin-top: 5%;
        }
        .gc-pin-row strong {
          display: block;
          margin-top: 5px;
          font: 600 clamp(11px, 1.4vw, 16px)/1 Arial, sans-serif;
        }
        .gc-back-footer {
          position: absolute;
          left: 7%;
          right: 7%;
          bottom: 6%;
          padding-top: 4%;
          border-top: 1px solid rgba(255,255,255,0.14);
          font: 400 clamp(7px, 0.9vw, 10px)/1.4 Arial, sans-serif;
          opacity: 0.65;
        }

        @media (max-width: 600px) {
          .gc-copy { top: 36%; }
          .gc-recipient { width: 58%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .gc-shine { animation: none !important; }
        }
      `}</style>
    </>
  );
}
