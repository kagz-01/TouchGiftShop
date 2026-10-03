"use client";

import { useEffect, useId, useRef, useState } from "react";

export type GiftCardStyle = {
  /** Preset name, kept for display and stored with the card. */
  theme?: string;
  bg?: string;
  /** Flat colour behind the gradient. Needed because a solid hex is invalid
   *  inside `background-image`. */
  bgcolor?: string;
  accent?: string;
  textPrimary?: string;
  textSecondary?: string;
  bowColor?: string;
};

export const FONTS = ["Georgia", "Playfair Display", "Cormorant Garamond", "Arial"];

export const CARD_PRESETS: Record<string, GiftCardStyle> = {
  default: {
    bg: "linear-gradient(135deg,#b3174f,#7a1146 48%,#4d0b2a)",
    accent: "#e2bd66",
    textPrimary: "#fff3ea",
    textSecondary: "#e2bd66",
    bowColor: "linear-gradient(135deg,#f7da84,#b77b18)",
  },
  birthday: {
    bg: "linear-gradient(135deg,#e91e63,#c2185b 48%,#880e4f)",
    accent: "#ffd54f",
    textPrimary: "#fff3ea",
    textSecondary: "#ffd54f",
    bowColor: "linear-gradient(135deg,#ffd54f,#ff8f00)",
  },
  wedding: {
    bg: "linear-gradient(135deg,#f8bbd0,#f48fb1 48%,#ec407a)",
    accent: "#ffffff",
    textPrimary: "#ffffff",
    textSecondary: "#fce4ec",
    bowColor: "linear-gradient(135deg,#ffffff,#f8bbd0)",
  },
  corporate: {
    bg: "linear-gradient(135deg,#263238,#37474f 48%,#455a64)",
    accent: "#e2bd66",
    textPrimary: "#ffffff",
    textSecondary: "#e2bd66",
    bowColor: "linear-gradient(135deg,#cfd8dc,#78909c)",
  },
};

const money = (v: number) => (v > 0 ? new Intl.NumberFormat("en-KE").format(v) : "—");

/** Intrinsic card size from the reference design. Everything is authored against it. */
const CARD_W = 560;
const CARD_H = 322;

/** Gift-box motif used as the card's background texture. */
const GIFT_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96'%3E%3Cg fill='none' stroke='%23e2bd66' stroke-opacity='.1' stroke-width='1.2'%3E%3Crect x='10' y='26' width='24' height='16'/%3E%3Cpath d='M10 31h24M22 26v16M22 26c-3-7-10-4-7 0M22 26c3-7 10-4 7 0'/%3E%3Crect x='60' y='64' width='20' height='14'/%3E%3Cpath d='M60 69h20M70 64v14'/%3E%3C/g%3E%3C/svg%3E\")";

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

/**
 * Gift card rendered to match the "Touch Gift Shop – Gift cards" reference:
 * 560×322 face, bow occupying the right of the front, amount inset clear of it,
 * message on the back, gold edges and confetti.
 *
 * Sizes itself with container query units so it can drop into the large stage
 * and the 150px miniatures unchanged.
 */
export default function GiftCardPreview({
  amount = 2000,
  recipientName = "Recipient Name",
  senderName = "A friend",
  isAnonymous = false,
  alias = null,
  message = "",
  code = "",
  pin = "",
  style,
  flipped: controlledFlip,
  className = "",
  onFlip,
  confettiOnFlip = false,
}: GiftCardProps) {
  // The card is authored at a fixed 560x322 and scaled to fit whatever box it
  // lands in — the large stage or a ~120px tile. min()/calc() cannot express
  // length-per-length in CSS, so the factor is measured here.
  const boxRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setFit(Math.min(1, el.clientWidth / CARD_W));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [internalFlip, setInternalFlip] = useState(false);
  const flipped = controlledFlip ?? internalFlip;
  const [confettiActive, setConfettiActive] = useState(false);
  const uid = useId().replace(/:/g, "");

  useEffect(() => {
    if (!confettiOnFlip || !confettiActive) return;
    const t = window.setTimeout(() => setConfettiActive(false), 1400);
    return () => window.clearTimeout(t);
  }, [confettiActive, confettiOnFlip]);

  const flip = () => {
    if (onFlip) onFlip();
    else setInternalFlip((v) => !v);
    if (confettiOnFlip) setConfettiActive(true);
  };

  const s = { ...CARD_PRESETS.default, ...style };
  const amt = money(amount);
  const hasRecipient = Boolean(recipientName && recipientName !== "Recipient Name");
  const hasMessage = Boolean(message && message.trim());
  const maskedCode = code ? code.replace(/\S(?=\S{4})/g, "•").replace(/•{4}/g, "•••• ") : "";
  const maskedPin = pin ? pin.replace(/\S/g, "•") : "";

  return (
    <>


      <div className="gcface-box" ref={boxRef}>
        <div className="gcface-fit" style={{ transform: `scale(${fit})` }}>
          <div className={`gcface-card ${confettiActive ? "drag" : ""}`}>
            <div
              className={`gcface-flip ${flipped ? "flipped" : ""} ${className}`}
              onClick={flip}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  flip();
                }
              }}
              aria-label="Gift card. Click to flip."
            >
              {/* FRONT */}
              <div
                className="gcface-face gcface-front"
                style={
                  {
                    "--gcface-ink": s.textPrimary,
                    "--gcface-gold": s.textSecondary,
                    "--gcface-accent": s.accent,
                    "--gcface-bg": s.bg,
                    "--gcface-bgcolor": s.bgcolor ?? "transparent",
                  } as React.CSSProperties
                }
              >
                <span className="gcface-dm" style={{ right: 150, top: 20 }} />
                <span className="gcface-dm" style={{ right: 46, top: 170, width: 6, height: 6 }} />
                <span className="gcface-dm" style={{ left: 300, top: 150, width: 6, height: 6 }} />

                <svg className="gc-bow" viewBox="360 0 200 200" aria-hidden="true"
                  style={{ position: "absolute", left: 360, top: 0, width: 200, height: 200, filter: "drop-shadow(2px 5px 5px rgba(0,0,0,.4))" }}>
                  <defs>
                    <linearGradient id={`gs-${uid}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#f6e3a4" /><stop offset=".25" stopColor="#c9962f" />
                      <stop offset=".5" stopColor="#f2d57e" /><stop offset=".75" stopColor="#b07f22" />
                      <stop offset="1" stopColor="#e7c667" />
                    </linearGradient>
                    <linearGradient id={`gb-${uid}`} gradientUnits="userSpaceOnUse" x1="394" y1="16" x2="430" y2="-16">
                      <stop offset="0" stopColor="#8f6218" /><stop offset=".18" stopColor="#e3be5c" />
                      <stop offset=".36" stopColor="#fff0b0" /><stop offset=".52" stopColor="#e0b44c" />
                      <stop offset=".8" stopColor="#b07b22" /><stop offset="1" stopColor="#85580f" />
                    </linearGradient>
                    <linearGradient id={`gt-${uid}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#a87a25" /><stop offset=".45" stopColor="#f1d37a" />
                      <stop offset="1" stopColor="#946818" />
                    </linearGradient>
                    <linearGradient id={`gd2-${uid}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#6d4a0e" /><stop offset="1" stopColor="#b98a2e" />
                    </linearGradient>
                  </defs>
                  <polygon points="430,-16 578,152 542,184 394,16" fill={`url(#gb-${uid})`} stroke="#7a5214" strokeOpacity=".5" />
                  <polygon points="471,82 497,98 449,180 443,160 423,164" fill={`url(#gt-${uid})`} stroke="#7a5214" strokeOpacity=".6" />
                  <polygon points="470,95 498,85 526,163 507,155 498,173" fill={`url(#gt-${uid})`} stroke="#7a5214" strokeOpacity=".6" />
                  <path d="M484 82C448 22 380 40 394 78C404 106 456 108 484 90Z" fill={`url(#gs-${uid})`} stroke="#7a5214" strokeWidth="1.2" />
                  <path d="M478 82C452 46 408 54 414 76C420 92 452 94 478 88Z" fill={`url(#gd2-${uid})`} />
                  <path d="M484 82C510 28 556 38 548 74C542 98 508 100 484 90Z" fill={`url(#gs-${uid})`} stroke="#7a5214" strokeWidth="1.2" />
                  <path d="M490 82C506 52 534 52 534 70C532 86 510 90 490 88Z" fill={`url(#gd2-${uid})`} />
                  <path d="M468 52C440 36 408 46 410 62M500 50C520 36 540 42 542 56" fill="none" stroke="#fff3c4" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />
                  <ellipse cx="484" cy="87" rx="15" ry="13" fill={`url(#gs-${uid})`} stroke="#7a5214" strokeWidth="1.2" />
                  <path d="M476 82c4-5 10-6 16-3" fill="none" stroke="#fff6cf" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <div className="gcface-wm">
                  TOUCH GIFT SHOP<small>GIFT CARD</small>
                </div>

                <div className={`gcface-amt ${amt.length > 5 ? "sm" : ""}`}>
                  <small>KSH</small>
                  <span>{amt}</span>
                </div>

                <div className="gcface-tag">
                  A gift, their choice.<span>Endless joy, one card.</span>
                </div>

                <div className="gcface-rc">
                  <small>RECIPIENT</small>
                  <span className={`gcface-rn ${hasRecipient ? "" : "gcface-ph"}`}>{recipientName}</span>
                  <div className="gcface-from">
                    {isAnonymous ? `From ${alias || "Anonymous"}` : senderName ? `From ${senderName}` : "From a friend"}
                  </div>
                </div>

                <svg className="gcface-gi" viewBox="0 0 64 64" aria-hidden="true">
                  <g fill="none" stroke={s.accent} strokeWidth="2" strokeLinejoin="round">
                    <rect x="7" y="24" width="50" height="10" rx="2" />
                    <rect x="10" y="34" width="44" height="24" rx="2" />
                    <path d="M28 24v34M36 24v34M32 24C24 6 10 10 16 20c3 4 10 4 16 4zM32 24C40 6 54 10 48 20c-3 4-10 4-16 4z" />
                  </g>
                  <path d="M57 6l1.3 3 3 1.3-3 1.3L57 14.6l-1.3-3-3-1.3 3-1.3z" fill={s.accent} />
                </svg>

                {confettiActive &&
                  ["🎁", "✦", "◆", "🎁", "✦", "◆", "✦", "🎁", "◆", "✦"].map((c, i) => (
                    <span key={i} className="gcface-cf on"
                      style={{
                        left: `${4 + i * 10}%`,
                        top: i % 2 ? "8%" : "70%",
                        animationDelay: `${i * 0.3}s`,
                        fontSize: `${14 + (i % 3) * 6}px`,
                      }}>
                      {c}
                    </span>
                  ))}
              </div>

              {/* BACK */}
              <div
                className="gcface-face gcface-back"
                style={
                  {
                    "--gcface-ink": s.textPrimary,
                    "--gcface-gold": s.textSecondary,
                    "--gcface-accent": s.accent,
                    "--gcface-bg": s.bg,
                    "--gcface-bgcolor": s.bgcolor ?? "transparent",
                  } as React.CSSProperties
                }
              >
                <div className="gcface-wm">TOUCH GIFT SHOP</div>
                <div className="gcface-gc">GIFT CARD</div>

                <div className="gcface-bk">
                  <small>MESSAGE</small>
                  <p className={hasMessage ? "" : "gcface-ph"}>
                    {hasMessage ? message : "Your message will appear here."}
                  </p>
                </div>

                {maskedCode && <div className="gcface-pill">{maskedCode}</div>}
                {maskedPin && <div className="gcface-pin">PIN&nbsp;&nbsp;{maskedPin}</div>}

                <div className="gcface-terms">
                  Code and PIN are shown on delivery.
                  <br />
                  Redeem at touchgiftshop.co.ke. Valid for 3 months.
                </div>
              </div>

              <div className="gcface-edge gcface-er" />
              <div className="gcface-edge gcface-el" />
              <div className="gcface-edge gcface-et" />
              <div className="gcface-edge gcface-eb" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export { CARD_W, CARD_H };