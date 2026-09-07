"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useMood, type Mood } from "@/context/MoodContext";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// ── Mood-aware message banks ─────────────────────────────────────────────────
// Each message can reference {name} which gets replaced with the user's name
type PresenceMessage = {
  text: string;
  emoji: string;
  cta?: string;
  ctaHref?: string;
};

const PRESENCE_MESSAGES: Record<Mood | "custom", PresenceMessage[]> = {
  default: [
    { text: "{name}, thought you ghosted on me 👀", emoji: "👀", cta: "Still browsing?", ctaHref: "/shop" },
    { text: "Still here, {name}? Great gifts are waiting.", emoji: "🎁", cta: "See what's new", ctaHref: "/shop" },
    { text: "Hey {name} — your perfect gift isn't going to find itself 😄", emoji: "💡", cta: "Let's find it", ctaHref: "/gift-finder" },
    { text: "Need a hand picking something, {name}?", emoji: "🤝", cta: "Try Gift Match", ctaHref: "/gift-finder" },
  ],
  romantic: [
    { text: "Still dreaming about the perfect gesture, {name}? 💕", emoji: "💕", cta: "Send some love", ctaHref: "/shop" },
    { text: "{name}, they deserve to feel special today.", emoji: "🌹", cta: "Shop romance", ctaHref: "/shop" },
    { text: "Don't let the moment pass, {name}. Love waits for no one 🌷", emoji: "🌷", cta: "Pick something beautiful", ctaHref: "/shop" },
  ],
  apology: [
    { text: "Still thinking, {name}? The sooner the better. 🙏", emoji: "🙏", cta: "Fix it now", ctaHref: "/shop", },
    { text: "{name}, we promise same-day delivery. No excuses needed.", emoji: "⚡", cta: "Make it right", ctaHref: "/shop" },
    { text: "The clock is ticking, {name}. Let's sort this out 💌", emoji: "⏰", cta: "See fast gifts", ctaHref: "/shop" },
  ],
  celebratory: [
    { text: "Don't let the party start without the perfect gift, {name}! 🎉", emoji: "🎉", cta: "Let's celebrate", ctaHref: "/shop" },
    { text: "{name}, this is a BIG moment. Make it unforgettable.", emoji: "🥳", cta: "Shop celebrations", ctaHref: "/shop" },
    { text: "Still here, {name}? The confetti is waiting 🎊", emoji: "🎊", cta: "Shop now", ctaHref: "/shop" },
  ],
  corporate: [
    { text: "{name}, great impression starts with the right gift.", emoji: "🏢", cta: "View corporate gifts", ctaHref: "/corporate" },
    { text: "Your team deserves to feel valued, {name}.", emoji: "📊", cta: "Explore bulk gifts", ctaHref: "/corporate" },
    { text: "Still reviewing, {name}? We handle delivery for your entire team.", emoji: "✅", cta: "Talk to us", ctaHref: "/corporate" },
  ],
  custom: [
    { text: "Hey {name}, still looking for the perfect gift? ✨", emoji: "✨", cta: "Keep exploring", ctaHref: "/shop" },
    { text: "{name}, your vibe is unique — so should the gift be.", emoji: "🌟", cta: "Browse gifts", ctaHref: "/shop" },
    { text: "Still here, {name}? Let's find something truly special.", emoji: "💫", cta: "Explore now", ctaHref: "/shop" },
  ],
};

// Return time messages — shown when user returns after inactivity
const RETURN_MESSAGES: Record<Mood | "custom", string[]> = {
  default:      ["Welcome back, {name}! 🎁 Ready to find something special?", "Missed you, {name}! Let's pick up where we left off."],
  romantic:     ["You came back, {name} 💕 Love doesn't give up!",  "Welcome back, {name} — they'll love what you choose."],
  apology:      ["Back again, {name}? Let's make this right. 🙏",   "Still time to fix it, {name}. We've got you."],
  celebratory:  ["The party's still going, {name}! 🎉",              "You came back — time to make it unforgettable, {name}!"],
  corporate:    ["Good timing, {name}. Your team is counting on you.", "Welcome back, {name}. Let's close this with the perfect gift."],
  custom:       ["Good to see you back, {name}! ✨",                  "Hey {name}, welcome back — let's find that gift."],
};

// ── Idle thresholds ──────────────────────────────────────────────────────────
const IDLE_MS = 60_000;      // show idle popup after 60s of inactivity
const DISMISS_COOLDOWN = 120_000; // don't show again for 2 min after dismiss

interface Props {
  userName?: string | null; // pass user's first name if available
}

export default function MoodPresenceToast({ userName }: Props) {
  const { mood, moodMeta } = useMood();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<PresenceMessage | null>(null);
  const [isReturn, setIsReturn] = useState(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownRef = useRef(false);
  const lastActiveRef = useRef(Date.now());
  const wasHiddenRef = useRef(false);

  const name = userName?.split(" ")[0] || "you";

  function interpolate(text: string) {
    return text.replace("{name}", name === "you" ? "you" : name);
  }

  const pickMessage = useCallback((bank: PresenceMessage[]) => {
    return bank[Math.floor(Math.random() * bank.length)];
  }, []);

  const show = useCallback((returnVisit = false) => {
    if (cooldownRef.current) return;
    const moodKey = (mood === "custom" ? "custom" : mood) as Mood | "custom";

    if (returnVisit) {
      const texts = RETURN_MESSAGES[moodKey] ?? RETURN_MESSAGES.default;
      const text = texts[Math.floor(Math.random() * texts.length)];
      setMessage({ text, emoji: moodMeta.emoji, cta: "Continue browsing", ctaHref: "/shop" });
      setIsReturn(true);
    } else {
      const bank = PRESENCE_MESSAGES[moodKey] ?? PRESENCE_MESSAGES.default;
      setMessage(pickMessage(bank));
      setIsReturn(false);
    }
    setVisible(true);
  }, [mood, moodMeta.emoji, pickMessage]);

  const dismiss = useCallback(() => {
    setVisible(false);
    cooldownRef.current = true;
    setTimeout(() => { cooldownRef.current = false; }, DISMISS_COOLDOWN);
  }, []);

  // Idle detection
  useEffect(() => {
    function resetTimer() {
      lastActiveRef.current = Date.now();
      if (visible) return; // don't restart if toast is up
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => show(false), IDLE_MS);
    }

    const events = ["mousemove", "keydown", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    idleTimer.current = setTimeout(() => show(false), IDLE_MS);

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [show, visible]);

  // Page visibility — "return from another tab/app"
  useEffect(() => {
    function onVisChange() {
      if (document.hidden) {
        wasHiddenRef.current = true;
      } else if (wasHiddenRef.current) {
        wasHiddenRef.current = false;
        const away = Date.now() - lastActiveRef.current;
        if (away > 30_000) show(true); // away > 30s → return toast
      }
    }
    document.addEventListener("visibilitychange", onVisChange);
    return () => document.removeEventListener("visibilitychange", onVisChange);
  }, [show]);

  // Auto-dismiss after 8s
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(dismiss, 8000);
    return () => clearTimeout(t);
  }, [visible, dismiss]);

  if (!visible || !message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[300] max-w-[320px] w-[calc(100vw-2rem)]",
        "rounded-2xl border shadow-2xl overflow-hidden",
        "backdrop-blur-xl",
        "animate-in slide-in-from-bottom-4 fade-in duration-500",
      )}
      style={{
        background: "color-mix(in srgb, var(--bg-base) 85%, transparent)",
        borderColor: "var(--card-border)",
        boxShadow: `0 24px 60px rgba(0,0,0,0.2), 0 0 0 1px var(--card-border), 0 4px 40px var(--mood-glow, rgba(155,27,90,0.15))`,
      }}
    >
      {/* Mood gradient top bar */}
      <div
        className="h-1"
        style={{ background: "var(--mood-gradient, linear-gradient(90deg,var(--color-brand),var(--color-gold)))" }}
      />

      <div className="p-4">
        {/* Message row */}
        <div className="flex items-start gap-3">
          <span
            className="text-2xl flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--mood-glow, rgba(155,27,90,0.1))" }}
          >
            {message.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-theme-heading leading-snug">
              {interpolate(message.text)}
            </p>
            {isReturn && (
              <p className="text-[10px] text-theme-muted mt-0.5">
                {moodMeta.label} mode is still active ✨
              </p>
            )}
          </div>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-theme-muted hover:text-theme-heading hover:bg-white/10 transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CTA */}
        {message.cta && message.ctaHref && (
          <a
            href={message.ctaHref}
            onClick={dismiss}
            className="mt-3 flex items-center justify-center gap-1.5 w-full h-9 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "var(--mood-gradient, linear-gradient(135deg,var(--color-brand),var(--color-gold)))",
              boxShadow: "0 4px 12px var(--mood-glow, rgba(155,27,90,0.25))",
            }}
          >
            {message.cta} →
          </a>
        )}
      </div>
    </div>
  );
}
