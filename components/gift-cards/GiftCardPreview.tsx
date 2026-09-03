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
  isAnonymous?: boolean;
  alias?: string | null;
  message?: string;
  code?: string;
  pin?: string;
  style?: GiftCardStyle;
  flipped?: boolean;
  className?: string;
  onFlip?: () => void;
  showConfetti?: boolean;
  confettiOnFlip?: boolean;
  bowSvg?: string | React.ReactNode;
};

export default function GiftCardPreview({
  amount = 2000,
  recipientName = "Recipient Name",
  senderName = "A friend",
  isAnonymous = false,
  alias = null,
  message = "A gift, their choice.",
  code = "1234 5678 9012 3456",
  pin = "123456",
  style,
  flipped: controlledFlip,
  className = "",
  onFlip,
  showConfetti = false,
  confettiOnFlip = false,
  bowSvg,
}: GiftCardProps) {
  const [internalFlip, setInternalFlip] = useState(false);
  const flipped = controlledFlip ?? internalFlip;
  const [confettiActive, setConfettiActive] = useState(false);

  const flip = () => {
    if (onFlip) onFlip();
    else setInternalFlip((v) => !v);
    if (confettiOnFlip) {
      setConfettiActive(true);
      window.setTimeout(() => setConfettiActive(false), 1400);
    }
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
        <article className={`gc-face gc-front ${bowSvg ? 'has-bow-svg' : ''}`} style={{ background: s.bg }}>
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

          <div className="gc-sender" aria-hidden={isAnonymous ? "true" : "false"}>
            <span className="gc-sender-label">FROM</span>
            <span className={isAnonymous ? "gc-sender-value anonymous" : "gc-sender-value"}>
              {isAnonymous ? (alias || "Anonymous") : senderName}
            </span>
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

          {/* Bow: either provided SVG/image or CSS fallback */}
          {bowSvg ? (
            typeof bowSvg === 'string' ? (
              <img src={bowSvg} alt="bow" className="gc-bow-svg" />
            ) : (
              <div className="gc-bow-svg-wrapper">{bowSvg}</div>
            )
          ) : (
            <div className="gc-bow" aria-hidden="true">
              <span className="gc-bow-loop gc-bow-left" />
              <span className="gc-bow-loop gc-bow-right" />
              <span className="gc-bow-knot" />
              <span className="gc-bow-tail gc-tail-left" />
              <span className="gc-bow-tail gc-tail-right" />
            </div>
          )}

          <div className="gc-shine" />
          <div className={`gc-confetti ${confettiActive || showConfetti ? 'active' : ''}`} aria-hidden="true">
            <span className="c piece p1" />
            <span className="c piece p2" />
            <span className="c piece p3" />
            <span className="c piece p4" />
            <span className="c piece p5" />
          </div>
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

        /* Amount (refined gold typography) */
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
          transform: translateY(-6px);
          opacity: 0.95;
        }
        .gc-amount strong {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(36px, 5.2vw, 72px);
          line-height: 0.92;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #ffd66a 0%, #f0b62e 45%, #ffd66a 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 4px 18px rgba(0,0,0,0.32);
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

        /* Sender (separate label + value; anonymous state disabled) */
        .gc-sender {
          position: absolute;
          left: 7%;
          bottom: 3.5%;
          display: flex;
          gap: 8px;
          align-items: center;
          z-index: 4;
        }
        .gc-sender-label {
          font: 600 clamp(7px, 0.8vw, 9px)/1 Arial, sans-serif;
          letter-spacing: 0.15em;
          color: #f2d37a;
          opacity: 0.95;
        }
        .gc-sender-value {
          font-family: Georgia, serif;
          font-size: clamp(12px, 1.5vw, 18px);
          color: #f5d477;
          font-weight: 500;
        }
        .gc-sender-value.anonymous {
          opacity: 0.48;
          font-style: italic;
          pointer-events: none;
          user-select: none;
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

        /* Bow (richer metallic look) */
        .gc-bow {
          position: absolute;
          right: 4%;
          top: -4%;
          width: 120px;
          height: 120px;
          z-index: 6;
          pointer-events: none;
        }
        .gc-bow-loop {
          position: absolute;
          top: 6%;
          width: 46%;
          height: 60%;
          border-radius: 60% 45% 55% 40%;
          background: radial-gradient(circle at 30% 25%, #fff6d8 0%, #f7da84 20%, #b77b18 70%);
          box-shadow: inset -6px -7px 14px rgba(90,50,0,0.28), 0 6px 18px rgba(0,0,0,0.18);
        }
        .gc-bow-left { left: 0; transform: rotate(22deg); }
        .gc-bow-right { right: 0; transform: rotate(-22deg) scaleX(-1); }
        .gc-bow-knot {
          position: absolute;
          left: 42%;
          top: 30%;
          width: 22%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: linear-gradient(135deg,#d39a2b,#f7d36d);
          box-shadow: 0 3px 8px rgba(0,0,0,0.25);
          z-index: 2;
        }
        .gc-bow-tail {
          position: absolute;
          top: 52%;
          width: 20%;
          height: 46%;
          background: linear-gradient(180deg,#e5b950,#9d6412);
          clip-path: polygon(50% 0, 100% 100%, 0 82%);
        }
        .gc-tail-left { left: 30%; transform: rotate(18deg); }
        .gc-tail-right { right: 28%; transform: rotate(-18deg); }

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

        /* Confetti */
        .gc-confetti { position: absolute; inset: 0; pointer-events: none; z-index: 8; }
        .gc-confetti .c { position: absolute; width: 8px; height: 12px; border-radius: 2px; opacity: 0; transform: translateY(0) rotate(0); }
        .gc-confetti .p1 { left: 20%; top: 10%; background: #f94144; }
        .gc-confetti .p2 { left: 40%; top: 8%; background: #f9c74f; }
        .gc-confetti .p3 { left: 60%; top: 6%; background: #90be6d; }
        .gc-confetti .p4 { left: 75%; top: 12%; background: #577590; }
        .gc-confetti .p5 { left: 30%; top: 4%; background: #f3722c; }

        .gc-confetti.active .p1 { animation: conf1 900ms ease-out 200ms forwards; }
        .gc-confetti.active .p2 { animation: conf2 1000ms ease-out 160ms forwards; }
        .gc-confetti.active .p3 { animation: conf3 1100ms ease-out 120ms forwards; }
        .gc-confetti.active .p4 { animation: conf4 950ms ease-out 220ms forwards; }
        .gc-confetti.active .p5 { animation: conf5 1050ms ease-out 180ms forwards; }

        @keyframes conf1 { to { opacity: 1; transform: translateY(-200px) rotate(360deg); } }
        @keyframes conf2 { to { opacity: 1; transform: translateY(-190px) rotate(270deg); } }
        @keyframes conf3 { to { opacity: 1; transform: translateY(-220px) rotate(450deg); } }
        @keyframes conf4 { to { opacity: 1; transform: translateY(-210px) rotate(300deg); } }
        @keyframes conf5 { to { opacity: 1; transform: translateY(-205px) rotate(330deg); } }

        /* Bow SVG wrapper */
        .gc-bow-svg { position: absolute; right: 4%; top: -6%; width: 120px; height: auto; z-index: 6; pointer-events: none; }
        .gc-bow-svg-wrapper { position: absolute; right: 4%; top: -6%; width: 120px; height: 120px; z-index: 6; pointer-events: none; }
        .has-bow-svg .gc-bow { display: none; }

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
