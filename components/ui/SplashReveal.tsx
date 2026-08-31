"use client";

import { useEffect, useState, useMemo } from "react";
import { Gift, Heart, Sparkles, Star } from "lucide-react";

const TEXT = "Welcome to TouchGift";
const CHAR_DELAY = 55;
const DISPLAY_DURATION = 2200;
const FADE_IN = 300;
const FADE_OUT = 500;

const FALLING_ICONS = [Gift, Heart, Sparkles, Star, Gift, Heart, Gift, Star];

export default function SplashReveal({ active, onDone }: { active: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<"idle" | "enter" | "type" | "hold" | "exit">("idle");
  const [typed, setTyped] = useState(0);

  // Pre-generate falling items once
  const fallingItems = useMemo(() =>
    Array.from({ length: 14 }).map((_, i) => ({
      left: 5 + (i * 7) % 90,
      delay: Math.random() * 2.5,
      duration: 4 + Math.random() * 3,
      size: 14 + Math.random() * 14,
      opacity: 0.12 + Math.random() * 0.18,
      Icon: FALLING_ICONS[i % FALLING_ICONS.length],
    })), []);

  const sparkles = useMemo(() =>
    Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: 20 + Math.random() * 60,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 3,
      dur: 1.5 + Math.random() * 2,
    })), []);

  useEffect(() => {
    if (!active) { setPhase("idle"); setTyped(0); return; }
    setPhase("enter");
    setTyped(0);
    const t = setTimeout(() => setPhase("type"), FADE_IN);
    return () => clearTimeout(t);
  }, [active]);

  useEffect(() => {
    if (phase !== "type") return;
    if (typed >= TEXT.length) { setPhase("hold"); return; }
    const t = setTimeout(() => setTyped(c => c + 1), CHAR_DELAY);
    return () => clearTimeout(t);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "hold") return;
    const t = setTimeout(() => setPhase("exit"), DISPLAY_DURATION);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "exit") return;
    const t = setTimeout(() => onDone(), FADE_OUT);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  if (!active && phase === "idle") return null;

  const visible = phase !== "idle";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: `opacity ${phase === "exit" ? FADE_OUT : FADE_IN}ms ease` }}
    >
      {/* Blurry backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(255,245,248,0.88)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}
      />

      {/* Falling gifts — blurred & faded */}
      <div className="absolute inset-0 overflow-hidden" style={{ filter: "blur(1.5px)" }}>
        {fallingItems.map((item, i) => {
          const Icon = item.Icon;
          return (
            <div
              key={`fall-${i}`}
              className="absolute"
              style={{
                left: `${item.left}%`,
                top: "-40px",
                opacity: item.opacity,
                animation: `splash-fall ${item.duration}s linear ${item.delay}s infinite`,
              }}
            >
              <Icon size={item.size} className="text-brand/40" strokeWidth={1.5} />
            </div>
          );
        })}
      </div>

      {/* Sparkle dots */}
      <div className="absolute inset-0 overflow-hidden">
        {sparkles.map((s, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute rounded-full bg-gold/50 animate-pulse"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
              boxShadow: "0 0 6px 1px rgba(212,175,55,0.3)",
            }}
          />
        ))}
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center px-4">
        {/* Animated gift icon */}
        <div
          className="mx-auto mb-5 w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center"
          style={{
            opacity: phase === "hold" || phase === "exit" ? 1 : 0,
            transform: phase === "hold" || phase === "exit" ? "scale(1) rotate(0deg)" : "scale(0.3) rotate(-30deg)",
            transition: "all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <Gift className="w-8 h-8 text-brand" />
        </div>

        {/* Typewriter text */}
        <p
          className="font-display text-3xl md:text-5xl font-bold italic text-brand-deep"
          style={{ letterSpacing: "-0.02em" }}
        >
          {TEXT.slice(0, typed)}
          {typed < TEXT.length && (
            <span className="inline-block w-[3px] h-[1em] bg-brand ml-1 align-middle animate-pulse" />
          )}
        </p>

        {/* Subtitle */}
        {typed >= TEXT.length && (
          <p
            className="mt-4 text-sm text-brand-deep/50 tracking-widest uppercase"
            style={{
              opacity: phase === "hold" || phase === "exit" ? 1 : 0,
              transform: phase === "hold" || phase === "exit" ? "translateY(0)" : "translateY(8px)",
              transition: "all 500ms ease 200ms",
            }}
          >
            Kenya&apos;s Gift Platform
          </p>
        )}

        {/* Decorative line */}
        <div
          className="mt-5 mx-auto h-[2px] rounded-full bg-gradient-to-r from-transparent via-brand/30 to-transparent"
          style={{
            width: typed >= TEXT.length ? "180px" : "0px",
            transition: "width 600ms ease 300ms",
          }}
        />
      </div>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes splash-fall {
          0% { transform: translateY(-40px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
