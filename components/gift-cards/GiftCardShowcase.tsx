"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import GiftCardPreview from "@/components/gift-cards/GiftCardPreview";
import type { GiftCardStyle } from "@/components/gift-cards/GiftCardPreview";

const PRESET_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 15000];
const money = (v: number) => new Intl.NumberFormat("en-KE").format(v);

/** Must match the zod schema in app/api/gift-cards/route.ts */
const MIN_AMOUNT = 500;
const MAX_MESSAGE = 200;

const isEmailContact = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/* ── Card colours ── */

/** Ready-made colourways. `bg` is the flat colour a gradient is built from. */
const COLOR_PRESETS = [
  { key: "berry", label: "Berry", bg: "#b3174f", accent: "#e2bd66" },
  { key: "blush", label: "Blush", bg: "#d98aa4", accent: "#7a1146" },
  { key: "forest", label: "Forest", bg: "#1f4d3d", accent: "#e6c86a" },
  { key: "midnight", label: "Midnight", bg: "#1b2340", accent: "#d8b25e" },
  { key: "sunset", label: "Sunset", bg: "#c2410c", accent: "#fde68a" },
  { key: "cocoa", label: "Cocoa", bg: "#3f2a1d", accent: "#e0b980" },
] as const;

const clampChannel = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

const toRgb = (hex: string): [number, number, number] => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (rgb: [number, number, number]) =>
  "#" + rgb.map((c) => clampChannel(c).toString(16).padStart(2, "0")).join("");

/** Mixes a colour toward `target` by `amount` (0–1). */
const mix = (hex: string, target: [number, number, number], amount: number) => {
  const a = toRgb(hex);
  return toHex([
    a[0] + (target[0] - a[0]) * amount,
    a[1] + (target[1] - a[1]) * amount,
    a[2] + (target[2] - a[2]) * amount,
  ]);
};

/** Gives a flat colour the same depth as the reference gradient. */
const shade = (hex: string) =>
  `linear-gradient(135deg, ${mix(hex, [255, 255, 255], 0.16)} 0%, ${hex} 45%, ${mix(hex, [0, 0, 0], 0.34)} 100%)`;

/** Relative luminance, to keep the card readable whatever colour is chosen. */
const isDark = (hex: string) => {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.4;
};

/**
 * Builds the card style from the chosen colours. Text colour follows the
 * background so a pale card does not end up with pale text on it, and the
 * accent is nudged for contrast against the ink.
 */
const buildCardStyle = (bg: string, accent: string): GiftCardStyle => {
  const dark = isDark(bg);
  return {
    theme: "custom",
    bg: shade(bg),
    bgcolor: bg,
    accent,
    textPrimary: dark ? "#fff3ea" : "#43102a",
    textSecondary: dark ? accent : mix(accent, [0, 0, 0], 0.25),
  };
};

/** yyyy-mm-dd for tomorrow, the earliest schedulable send date. */
const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
})();

/** Fixed card width used to scale the mini previews down uniformly. */
const CARD_W = 400;
const THUMB_W = 150;

const SNAP_VIEWS = [
  { key: "front", label: "FRONT VIEW", rotX: 0, rotY: 0, flipped: false, tilt: "", note: "" },
  // The preview owns the flip (its wrapper rotates and the back face is
  // pre-flipped), so the back view must not add a second 180deg here — that
  // would render the back mirrored.
  { key: "back", label: "BACK VIEW", rotX: 0, rotY: 0, flipped: true, tilt: "", note: "" },
  { key: "tilt", label: "TILTED VIEW", rotX: 10, rotY: -30, flipped: false, tilt: " t", note: "" },
  { key: "side", label: "SIDE VIEW", rotX: 6, rotY: -74, flipped: false, tilt: " sd", note: "" },
  { key: "party", label: "USAGE ANIMATION", rotX: -4, rotY: -12, flipped: false, tilt: " pt", note: "✦ ◆ 🎁" },
] as const;

const FEATURES = [
  { icon: "⚡", title: "INSTANT DELIVERY", desc: "Delivered to your email in seconds" },
  { icon: "🔒", title: "SECURE & SAFE", desc: "Encrypted & secure transactions" },
  { icon: "📅", title: "3-MONTH VALIDITY", desc: "Use anytime within 3 months" },
  { icon: "🎁", title: "FLEXIBLE REDEMPTION", desc: "Redeem across all products" },
];

export default function GiftCardShowcase() {
  const [amount, setAmount] = useState(2000);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [recipientContact, setRecipientContact] = useState("");
  const [sendDate, setSendDate] = useState("");
  const [message, setMessage] = useState("");
  const [delivery, setDelivery] = useState<"instant" | "schedule" | "send">("instant");
  const [presetKey, setPresetKey] = useState<string>(COLOR_PRESETS[0].key);
  const [cardBg, setCardBg] = useState<string>(COLOR_PRESETS[0].bg);
  const [cardAccent, setCardAccent] = useState<string>(COLOR_PRESETS[0].accent);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 3D viewer state
  const stageRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [hasPointer, setHasPointer] = useState(false);
  const [activeView, setActiveView] = useState("front");

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  const finalAmount = customAmount
    ? Math.max(MIN_AMOUNT, parseInt(customAmount, 10) || 0)
    : amount;

  /** What the card itself should display for the sender line. */
  const senderLabel = isAnonymous ? "Anonymous" : senderName.trim() || "A friend";

  /** Keeps the API payload to validated hex colours. */
  const cardStyle = useMemo(
    () => buildCardStyle(cardBg, cardAccent),
    [cardBg, cardAccent]
  );

  const applyPreset = (p: (typeof COLOR_PRESETS)[number]) => {
    setPresetKey(p.key);
    setCardBg(p.bg);
    setCardAccent(p.accent);
  };

  const validate = (): string => {
    if (finalAmount < MIN_AMOUNT) return `Minimum amount is KSh ${MIN_AMOUNT}`;
    if (!recipientName.trim()) return "Recipient name is required";
    if (!isAnonymous && !senderName.trim()) return "Your name is required";
    if (message.length > MAX_MESSAGE) return `Message cannot exceed ${MAX_MESSAGE} characters`;
    if (delivery === "schedule") {
      if (!sendDate) return "Choose a date to send on";
      if (new Date(sendDate) <= new Date()) return "Pick a date in the future";
    }
    if (delivery === "send") {
      const c = recipientContact.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
      const isPhone = /^(\+?254|0)(7|1)\d{8}$/.test(c.replace(/[\s-]/g, ""));
      if (!c) return "Add the recipient's email or phone";
      if (!isEmail && !isPhone) {
        return "Enter a valid email (name@example.com) or Kenyan phone (0712345678)";
      }
    }
    return "";
  };

  const handleCheckout = async () => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          recipientName: recipientName.trim(),
          senderName: isAnonymous ? undefined : senderName.trim(),
          ...(delivery === "send"
            ? isEmailContact(recipientContact)
              ? { recipientEmail: recipientContact.trim() }
              : { recipientPhone: recipientContact.trim().replace(/[\s-]/g, "") }
            : {}),
          message: message.trim() || undefined,
          isAnonymous,
          sendDate: delivery === "schedule" ? sendDate : undefined,
          style: {
            theme: cardStyle.theme,
            bg: cardBg,
            accent: cardAccent,
            textPrimary: cardStyle.textPrimary,
            textSecondary: cardStyle.textSecondary,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "Could not start checkout. Please try again.");
        setSubmitting(false);
        return;
      }
      if (data?.redirectUrl) {
        window.location.assign(data.redirectUrl);
      } else {
        setError("Checkout did not return a payment link.");
        setSubmitting(false);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  // Mouse hover tilt
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || dragging) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setRotation({ x: clamp((0.5 - py) * 14, -10, 10), y: clamp((px - 0.5) * 18, -14, 14) });
    setHasPointer(true);
    setActiveView("");
  }, [dragging]);

  const resetPointer = useCallback(() => {
    if (!dragging) { setRotation({ x: 0, y: 0 }); setHasPointer(false); }
  }, [dragging]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, rotX: rotation.x, rotY: rotation.y };
    (e.currentTarget).setPointerCapture?.(e.pointerId);
  }, [rotation]);

  const handlePointerDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setRotation({
      x: clamp(startRef.current.rotX - (e.clientY - startRef.current.y) * 0.22, -28, 28),
      y: clamp(startRef.current.rotY + (e.clientX - startRef.current.x) * 0.28, -35, 35),
    });
    setActiveView("");
  }, [dragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) < 8) {
      setFlipped((v) => !v);
      setRotation({ x: 0, y: 0 });
      setActiveView((prev) => (prev === "back" ? "front" : "back"));
    }
  }, [dragging]);

  const snapTo = (view: typeof SNAP_VIEWS[number]) => {
    setFlipped(view.flipped);
    setRotation({ x: view.rotX, y: view.rotY });
    setActiveView(view.key);
    setHasPointer(false);
  };

  // The flip itself is driven by the `flipped` prop on GiftCardPreview
  // (it rotates its own face wrapper), so no extra 180deg here.
  const cardTransform = `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`;

  return (
    <div className="gc-showcase">
      {/* ── Main layout: form + live preview ── */}
      <div className="gc-layout">
        {/* Left: Purchase form */}
        <div className="gc-form">
          {/* Amount picker */}
          <div className="gc-step">
            <h3 className="gc-step-title">1. Choose amount</h3>
            <p className="gc-step-sub">Select a preset or enter a custom amount <span className="gc-min">✓ Min. KSh 500</span></p>
            <div className="gc-amount-grid">
              {PRESET_AMOUNTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`gc-amount-btn ${amount === v && !customAmount ? "selected" : ""}`}
                  onClick={() => { setAmount(v); setCustomAmount(""); }}
                >
                  KSh {money(v)}
                  {amount === v && !customAmount && <span className="gc-check">✓</span>}
                </button>
              ))}
            </div>
            <div className="gc-custom-row">
              <span className="gc-custom-label">Custom amount</span>
              <div className="gc-custom-input-wrap">
                <span className="gc-custom-prefix">KSh</span>
                <input
                  type="number"
                  min={500}
                  step={500}
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="gc-custom-input"
                />
              </div>
            </div>
          </div>

          {/* Who is it for? */}
          <div className="gc-step">
            <h3 className="gc-step-title">2. Who is it for?</h3>
            <p className="gc-step-sub">Add the names to print on the card</p>

            <div className="gc-field">
              <label className="gc-field-label" htmlFor="gc-recipient">
                Recipient name <span className="gc-req">*</span>
              </label>
              <input
                id="gc-recipient"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Who are you gifting?"
                className="gc-input"
                autoComplete="name"
              />
            </div>

            <div className="gc-field">
              <label className="gc-field-label" htmlFor="gc-sender">
                Your name {!isAnonymous && <span className="gc-req">*</span>}
              </label>
              <input
                id="gc-sender"
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={isAnonymous ? "Hidden on the card" : "Your name"}
                className="gc-input"
                autoComplete="name"
                disabled={isAnonymous}
              />
            </div>

            <label className={`gc-toggle ${isAnonymous ? "on" : ""}`}>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="gc-toggle-input"
              />
              <span className="gc-toggle-track" aria-hidden="true">
                <span className="gc-toggle-knob" />
              </span>
              <span className="gc-toggle-text">
                <strong>Send anonymously</strong>
                <span>Your name will not appear on the card</span>
              </span>
            </label>
          </div>

          {/* Personal message */}
          <div className="gc-step">
            <h3 className="gc-step-title">3. Add a personal touch</h3>
            <p className="gc-step-sub">Add a message to make it special</p>
            <div className="gc-textarea-wrap">
              <textarea
                maxLength={MAX_MESSAGE}
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="gc-textarea"
              />
              <span className="gc-char-count">{message.length} / {MAX_MESSAGE}</span>
            </div>
          </div>

          {/* Delivery options */}
          <div className="gc-step">
            <h3 className="gc-step-title">4. Delivery option</h3>
            <div className="gc-delivery-grid">
              {[
                { key: "instant" as const, icon: "⚡", title: "Instant delivery", sub: "To your email" },
                { key: "schedule" as const, icon: "📅", title: "Schedule", sub: "Pick a date" },
                { key: "send" as const, icon: "✉️", title: "Send to recipient", sub: "They get it" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  className={`gc-delivery-btn ${delivery === opt.key ? "selected" : ""}`}
                  onClick={() => setDelivery(opt.key)}
                >
                  {delivery === opt.key && <span className="gc-delivery-check">✓</span>}
                  <span className="gc-delivery-icon">{opt.icon}</span>
                  <strong>{opt.title}</strong>
                  <span>{opt.sub}</span>
                </button>
              ))}
            </div>

            {delivery === "schedule" && (
            <div className="gc-field gc-field-inline">
              <label className="gc-field-label" htmlFor="gc-senddate">
                Send on <span className="gc-req">*</span>
              </label>
              <input
                id="gc-senddate"
                type="date"
                value={sendDate}
                min={tomorrow}
                onChange={(e) => setSendDate(e.target.value)}
                className="gc-input"
              />
              <p className="gc-field-hint">Valid for 3 months from the send date.</p>
            </div>
          )}

          {delivery === "send" && (
            <div className="gc-field gc-field-inline">
              <label className="gc-field-label" htmlFor="gc-contact">
                Recipient&rsquo;s email or phone
              </label>
              <input
                id="gc-contact"
                type="text"
                value={recipientContact}
                onChange={(e) => setRecipientContact(e.target.value)}
                placeholder="name@email.com or 07xx xxx xxx"
                className="gc-input"
                autoComplete="off"
              />
              <p className="gc-field-hint">
                We&rsquo;ll send them the claim link after payment.
              </p>
            </div>
)}
          </div>

          {/* Card colours */}
          <div className="gc-step">
            <h3 className="gc-step-title">5. Card colours</h3>
            <p className="gc-step-sub">
              Pick a colourway, or choose your own. Text colour adjusts so it stays readable.
            </p>

            <div className="gc-swatches" role="group" aria-label="Card colour presets">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  aria-label={p.label}
                  aria-pressed={presetKey === p.key}
                  className={`gc-swatch ${presetKey === p.key ? "active" : ""}`}
                  onClick={() => applyPreset(p)}
                  style={{ background: shade(p.bg) }}
                >
                  <span className="gc-swatch-dot" style={{ background: p.accent }} />
                  <span className="gc-swatch-label">{p.label}</span>
                </button>
              ))}
            </div>

            <div className="gc-pickers">
              <label className="gc-picker">
                <span className="gc-field-label">Card colour</span>
                <span className="gc-picker-row">
                  <input
                    type="color"
                    value={cardBg}
                    onChange={(e) => { setCardBg(e.target.value); setPresetKey("custom"); }}
                    aria-label="Card colour"
                  />
                  <code>{cardBg}</code>
                </span>
              </label>

              <label className="gc-picker">
                <span className="gc-field-label">Accent</span>
                <span className="gc-picker-row">
                  <input
                    type="color"
                    value={cardAccent}
                    onChange={(e) => { setCardAccent(e.target.value); setPresetKey("custom"); }}
                    aria-label="Accent colour"
                  />
                  <code>{cardAccent}</code>
                </span>
              </label>
            </div>
          </div>

          {error && (
            <p className="gc-error" role="alert">
              {error}
            </p>
          )}

          {/* Checkout button */}
          <button
            type="button"
            className="gc-checkout-btn"
            onClick={handleCheckout}
            disabled={submitting}
          >
            {submitting ? "Starting checkout…" : `Continue to checkout — KSh ${money(finalAmount)} →`}
          </button>
        </div>

        {/* Right: Live card preview */}
        <div className="gc-preview">
          <div
            ref={stageRef}
            role="button"
            tabIndex={0}
            aria-label="Interactive TouchGift card. Click to flip, drag to rotate."
            onPointerMove={handlePointerMove}
            onPointerLeave={resetPointer}
            onPointerDown={handlePointerDown}
            onPointerMoveCapture={handlePointerDrag}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => { setDragging(false); setRotation({ x: 0, y: 0 }); }}
            className="gc-stage"
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                position: "relative",
                transformStyle: "preserve-3d" as const,
                transition: dragging ? "none" : "transform 550ms cubic-bezier(0.2, 0.8, 0.2, 1)",
                transform: cardTransform,
                zIndex: 2,
                willChange: "transform",
              }}
            >
              <GiftCardPreview
                amount={finalAmount}
                recipientName={recipientName || "Recipient Name"}
                senderName={senderLabel}
                message={message || "A gift, their choice."}
                flipped={flipped}
                style={cardStyle}
              />
            </div>
            <div className="gc-shadow" />
          </div>
          <p className="gc-hint">Drag the card to rotate it. Click to flip.</p>

          {/* Card views — the card stays flat inside the tile and the tile
              itself carries the tilt, so each one is a true miniature. */}
          <div className="gc-thumbnails" role="group" aria-label="Card views">
            {SNAP_VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                aria-label={v.label}
                aria-pressed={activeView === v.key}
                className={`gc-thumb${v.tilt}${activeView === v.key ? " active" : ""}`}
                onClick={() => snapTo(v)}
              >
                <div className="gc-thumb-card">
                  <GiftCardPreview
                    amount={finalAmount}
                    recipientName={recipientName || "Recipient Name"}
                    senderName={senderLabel}
                    message={message}
                    flipped={v.flipped}
                  />
                </div>
                <span className="gc-thumb-label">{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features bar ── */}
      <div className="gc-features">
        {FEATURES.map((f) => (
          <div key={f.title} className="gc-feature">
            <span className="gc-feature-icon">{f.icon}</span>
            <div>
              <strong>{f.title}</strong>
              <span>{f.desc}</span>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .gc-showcase {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        .gc-layout {
          display: grid;
          grid-template-columns: minmax(0, 420px) minmax(0, 1fr);
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 980px) {
          .gc-layout { grid-template-columns: 1fr; }
          .gc-preview { order: -1; }
        }

        /* ── Form: white rounded card, as in the reference ── */
        .gc-form {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 32px 30px 30px;
          border-radius: 28px;
          background: var(--surface-primary, #fff);
          box-shadow: 0 20px 50px rgba(94, 15, 51, .09);
          border: 1px solid var(--surface-border, rgba(236, 217, 211, .9));
        }
        .gc-preview {
          position: sticky;
          top: 20px;
          min-width: 0;
        }
        @media (max-width: 980px) {
          .gc-preview { position: static; }
        }
        .gc-step-title {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: 22px;
          font-weight: 600;
          color: var(--heading-color, #1a1a2e);
          margin: 0 0 4px;
        }
        /* Reference uses a dotted rule between sections. */
        .gc-step + .gc-step {
          margin-top: 28px;
          padding-top: 26px;
          border-top: 1px dotted var(--surface-border, #ecd9d3);
        }
        .gc-step-sub {
          font-size: 13px;
          color: var(--text-muted, #8b8b9e);
          margin: 0 0 14px;
        }
        .gc-min {
          background: rgba(34,197,94,0.1);
          color: #16a34a;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 6px;
        }

        /* Amount grid */
        .gc-amount-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 14px;
        }
        .gc-amount-btn {
          position: relative;
          padding: 14px 8px;
          border: 2px solid var(--card-border, #e5e7eb);
          border-radius: 12px;
          background: var(--card-bg, #fff);
          font: 600 14px/1.2 Arial, sans-serif;
          color: var(--heading-color, #1a1a2e);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .gc-amount-btn:hover {
          border-color: var(--accent-color, #a51b58);
          background: var(--brand-5, rgba(165,27,88,0.04));
        }
        .gc-amount-btn.selected {
          border-color: var(--accent-color, #a51b58);
          background: var(--brand-5, rgba(165,27,88,0.08));
          color: var(--accent-color, #a51b58);
        }
        .gc-check {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-brand, #a51b58);
          color: white;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Custom amount */
        .gc-custom-row { display: flex; flex-direction: column; gap: 4px; }
        .gc-custom-label { font-size: 12px; color: var(--text-muted, #8b8b9e); font-weight: 500; }
        .gc-custom-input-wrap {
          display: flex;
          align-items: center;
          border: 2px solid var(--card-border, #e5e7eb);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .gc-custom-input-wrap:focus-within { border-color: var(--accent-color, #a51b58); }
        .gc-custom-prefix {
          padding: 10px 12px;
          background: var(--surface, #f8f9fa);
          font: 600 13px Arial, sans-serif;
          color: var(--text-muted, #8b8b9e);
          border-right: 1px solid var(--card-border, #e5e7eb);
        }
        .gc-custom-input {
          flex: 1;
          padding: 10px 12px;
          border: none;
          outline: none;
          font: 500 14px Arial, sans-serif;
          background: transparent;
          color: var(--heading-color, #1a1a2e);
        }

        /* Textarea */
        .gc-textarea-wrap {
          position: relative;
          border: 2px solid var(--card-border, #e5e7eb);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .gc-textarea-wrap:focus-within { border-color: var(--accent-color, #a51b58); }
        .gc-textarea {
          width: 100%;
          min-height: 90px;
          padding: 14px;
          border: none;
          outline: none;
          font: 400 14px/1.5 Arial, sans-serif;
          resize: vertical;
          background: transparent;
          color: var(--heading-color, #1a1a2e);
        }
        .gc-char-count {
          position: absolute;
          bottom: 8px;
          right: 12px;
          font-size: 11px;
          color: var(--text-muted, #8b8b9e);
        }

        /* Delivery */
        .gc-delivery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .gc-delivery-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 16px 8px;
          border: 2px solid var(--card-border, #e5e7eb);
          border-radius: 12px;
          background: var(--card-bg, #fff);
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }
        .gc-delivery-btn:hover { border-color: var(--accent-color, #a51b58); }
        .gc-delivery-btn.selected {
          border-color: var(--accent-color, #a51b58);
          background: var(--brand-5, rgba(165,27,88,0.06));
        }
        .gc-delivery-check {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--color-brand, #a51b58);
          color: white;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gc-delivery-icon { font-size: 22px; }
        .gc-delivery-btn strong {
          font-size: 12px;
          color: var(--heading-color, #1a1a2e);
        }
        .gc-delivery-btn span:last-child {
          font-size: 11px;
          color: var(--text-muted, #8b8b9e);
        }

        /* Checkout button */
        .gc-checkout-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          background: var(--color-brand, #a51b58);
          color: white;
          font: 700 15px/1 Arial, sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
        }
        .gc-checkout-btn:hover {
          background: var(--brand-dark, #7b123f);
          box-shadow: 0 4px 20px rgba(165,27,88,0.3);
          transform: translateY(-1px);
        }

        /* ── Preview ── */
        .gc-preview { display: flex; flex-direction: column; gap: 16px; }
        .gc-stage {
          width: 100%;
          aspect-ratio: 560 / 322;
          position: relative;
          perspective: 1600px;
          cursor: grab;
          touch-action: pan-y;
          user-select: none;
          outline: none;
        }
        .gc-shadow {
          position: absolute;
          left: 8%;
          right: 8%;
          bottom: -20px;
          height: 40px;
          background: rgba(75,10,40,0.22);
          filter: blur(22px);
          border-radius: 50%;
          z-index: 1;
        }
        .gc-hint {
          text-align: center;
          font-size: 11px;
          letter-spacing: 1.5px;
          color: var(--accent-color, #a51b58);
          opacity: 0.5;
          margin: 0;
        }

        /* Thumbnails */
        .gc-thumbnails {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 6px;
        }
        .gc-thumb {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px 10px 10px;
          border: 2px solid transparent;
          border-radius: 18px;
          background: var(--gc-tile, rgba(142,18,71,0.06));
          cursor: pointer;
          text-align: center;
          transition: border-color .2s ease;
        }
        .gc-thumb:hover { border-color: rgba(165,27,88,.35); }
        .gc-thumb.active { border-color: var(--accent-color, #a51b58); }
        .gc-thumb-card {
          position: relative;
          width: 100%;
          pointer-events: none;
        }
        /* The card renders flat; the tile supplies the perspective. */
        .gc-thumb.t .gc-thumb-card { transform: perspective(420px) rotateY(-26deg) rotateX(8deg); }
        .gc-thumb.sd .gc-thumb-card { transform: perspective(420px) rotateY(-68deg); }
        .gc-thumb.pt .gc-thumb-card { margin-top: 12px; }
        .gc-thumb.pt::before {
          content: "\\2606  \\25C6  \\1F381";
          position: absolute; top: 6px; left: 0; right: 0;
          color: var(--gc-gold, #d8a744);
          font-size: 12px; letter-spacing: 6px;
        }
        .gc-thumb-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .14em;
          color: var(--text-muted, #8b8b9e);
        }
        .gc-thumb.active .gc-thumb-label { color: var(--accent-color, #a51b58); }

        /* ── Form fields ── */
        .gc-field { margin-top: 16px; }
        .gc-field-inline {
          margin-top: 14px;
          padding: 14px;
          border-radius: 12px;
          background: var(--surface-subtle, rgba(142,18,71,0.05));
          border: 1px solid var(--surface-border, #e5e7eb);
        }
        .gc-field-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted, #8b8b9e);
          margin-bottom: 7px;
        }
        .gc-req { color: var(--accent-color, #a51b58); }
        .gc-input {
          width: 100%;
          padding: 12px 14px;
          font-size: 15px;
          font-family: inherit;
          color: var(--text-primary, #1a1a2e);
          background: var(--surface-primary, #fff);
          border: 1px solid var(--surface-border, #e5e7eb);
          border-radius: 10px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .gc-input:focus {
          outline: none;
          border-color: var(--accent-color, #a51b58);
          box-shadow: 0 0 0 3px rgba(165,27,88,0.14);
        }
        .gc-input:disabled { opacity: 0.55; cursor: not-allowed; }
        .gc-field-hint {
          margin: 8px 0 0;
          font-size: 12px;
          color: var(--text-muted, #8b8b9e);
        }

        /* Anonymity toggle */
        .gc-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1px solid var(--surface-border, #e5e7eb);
          background: var(--surface-subtle, rgba(142,18,71,0.05));
          cursor: pointer;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .gc-toggle.on {
          border-color: var(--accent-color, #a51b58);
          background: rgba(165,27,88,0.08);
        }
        .gc-toggle-input { position: absolute; opacity: 0; pointer-events: none; }
        .gc-toggle-track {
          flex: 0 0 auto;
          width: 44px;
          height: 25px;
          border-radius: 999px;
          background: var(--surface-border, #d5d5de);
          position: relative;
          transition: background 0.22s ease;
        }
        .gc-toggle.on .gc-toggle-track { background: var(--accent-color, #a51b58); }
        .gc-toggle-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 19px;
          height: 19px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
          transition: transform 0.22s ease;
        }
        .gc-toggle.on .gc-toggle-knob { transform: translateX(19px); }
        .gc-toggle-text { display: flex; flex-direction: column; gap: 2px; }
        .gc-toggle-text strong { font-size: 14px; color: var(--text-primary, #1a1a2e); }
        .gc-toggle-text span { font-size: 12px; color: var(--text-muted, #8b8b9e); }

        /* ── Card colour picker ── */
        .gc-swatches {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin: 4px 0 16px;
        }
        .gc-swatch {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          padding: 12px 8px 10px;
          border: 2px solid var(--surface-border, #e5e7eb);
          border-radius: 14px;
          cursor: pointer;
          transition: border-color .2s ease, transform .2s ease;
        }
        .gc-swatch:hover { transform: translateY(-1px); }
        .gc-swatch.active { border-color: var(--accent-color, #a51b58); }
        .gc-swatch-dot {
          width: 22px; height: 22px;
          border-radius: 50%;
          box-shadow: inset 0 0 0 1px rgba(0,0,0,.15);
        }
        .gc-swatch-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .04em;
          color: var(--text-muted, #8b8b9e);
        }
        .gc-swatch.active .gc-swatch-label { color: var(--text-primary, #1a1a2e); }
        .gc-pickers { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 520px) {
          .gc-swatches { grid-template-columns: repeat(2, 1fr); }
          .gc-pickers { grid-template-columns: 1fr; }
        }
        .gc-picker { display: block; }
        .gc-picker .gc-field-label { margin-bottom: 8px; }
        .gc-picker-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 10px;
          border: 1px solid var(--surface-border, #e5e7eb);
          border-radius: 10px;
        }
        .gc-picker input[type="color"] {
          width: 34px; height: 30px;
          padding: 0;
          border: 1px solid var(--surface-border, #e5e7eb);
          border-radius: 7px;
          background: none;
          cursor: pointer;
        }
        .gc-picker code {
          font-size: 12px;
          letter-spacing: .04em;
          color: var(--text-muted, #8b8b9e);
          text-transform: uppercase;
        }

        .gc-error {
          margin: 4px 0 12px;
          padding: 11px 14px;
          font-size: 13.5px;
          font-weight: 600;
          color: #b3261e;
          background: rgba(179,38,30,0.08);
          border: 1px solid rgba(179,38,30,0.25);
          border-radius: 10px;
        }
        .gc-checkout-btn:disabled {
          opacity: 0.6;
          cursor: progress;
          transform: none;
        }

        /* ── Features ── */
        .gc-features {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 40px;
          padding: 24px 0;
          border-top: 1px solid var(--surface-border, #e5e7eb);
        }
        @media (max-width: 700px) {
          .gc-features { grid-template-columns: repeat(2, 1fr); }
        }
        .gc-feature {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .gc-feature-icon { font-size: 24px; }
        .gc-feature strong {
          display: block;
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--heading-color, #1a1a2e);
        }
        .gc-feature span {
          font-size: 12px;
          color: var(--text-muted, #8b8b9e);
        }
      `}</style>
    </div>
  );
}
