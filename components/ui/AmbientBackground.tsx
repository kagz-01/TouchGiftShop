"use client";

import { useTheme } from "@/components/ui/ThemeProvider";
import { Gift, Heart, Sparkles, Star } from "lucide-react";

export default function AmbientBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  // Falling icons configuration
  const fallingItems = [
    { left: 5, delay: 0.2, duration: 22, opacity: 0.4, scale: 0.8, Icon: Gift },
    { left: 15, delay: 3.5, duration: 25, opacity: 0.6, scale: 1.2, Icon: Sparkles },
    { left: 25, delay: 1.1, duration: 19, opacity: 0.3, scale: 0.7, Icon: Heart },
    { left: 32, delay: 5.4, duration: 28, opacity: 0.7, scale: 1.5, Icon: Star },
    { left: 45, delay: 2.3, duration: 21, opacity: 0.5, scale: 1.0, Icon: Gift },
    { left: 55, delay: 6.8, duration: 24, opacity: 0.8, scale: 1.3, Icon: Heart },
    { left: 62, delay: 0.9, duration: 18, opacity: 0.4, scale: 0.9, Icon: Sparkles },
    { left: 75, delay: 4.2, duration: 26, opacity: 0.6, scale: 1.1, Icon: Gift },
    { left: 85, delay: 1.7, duration: 20, opacity: 0.5, scale: 0.8, Icon: Star },
    { left: 95, delay: 7.1, duration: 25, opacity: 0.7, scale: 1.4, Icon: Heart },
    { left: 8, delay: 8.5, duration: 19, opacity: 0.3, scale: 0.7, Icon: Sparkles },
    { left: 18, delay: 4.9, duration: 27, opacity: 0.6, scale: 1.2, Icon: Gift },
    { left: 28, delay: 2.8, duration: 21, opacity: 0.5, scale: 0.9, Icon: Heart },
    { left: 38, delay: 7.6, duration: 23, opacity: 0.8, scale: 1.5, Icon: Star },
    { left: 48, delay: 1.4, duration: 17, opacity: 0.4, scale: 0.8, Icon: Sparkles },
    { left: 58, delay: 9.2, duration: 29, opacity: 0.7, scale: 1.3, Icon: Gift },
    { left: 68, delay: 3.7, duration: 24, opacity: 0.5, scale: 1.0, Icon: Heart },
    { left: 78, delay: 6.3, duration: 22, opacity: 0.6, scale: 1.1, Icon: Sparkles },
    { left: 88, delay: 2.1, duration: 26, opacity: 0.4, scale: 0.9, Icon: Gift },
    { left: 98, delay: 8.9, duration: 18, opacity: 0.8, scale: 1.4, Icon: Star },
  ];

  return (
    <div
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-700"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #1A002A 0%, #290845 50%, #120018 100%)"
          : "linear-gradient(135deg, #FFF9F0 0%, #FDF5EE 50%, #FDECD5 100%)",
      }}
    >
      {/* ── Falling Gifts & Sparkles ── */}
      {fallingItems.map((item, i) => {
        const Icon = item.Icon;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${item.left}%`,
              top: 0,
              opacity: item.opacity,
              transform: `translateY(-100vh) scale(${item.scale})`,
              animation: `star-fall ${item.duration}s linear ${item.delay}s infinite`,
              color: isDark ? "rgba(255, 180, 220, 0.7)" : "rgba(212, 168, 83, 0.6)",
              filter: isDark ? "drop-shadow(0 0 8px rgba(224, 96, 168, 0.6))" : "none",
            }}
          >
            <Icon size={24} strokeWidth={1.5} />
          </div>
        );
      })}

      {isDark ? (
        <>
          {/* ═══════════════════════════════════════════
              DARK MODE — Additional glows
              ═══════════════════════════════════════════ */}
          {/* Glow at the top so it feels illuminated from above */}
          <div style={{
            position: "absolute",
            top: "-20%", left: "-10%",
            width: "120%", height: "60%",
            background: "radial-gradient(ellipse at 50% 0%, rgba(155, 27, 90, 0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }} />

          {/* ── Optional: Subtle noise overlay for the background itself (already on cards) ── */}
          <div style={{
            position: "absolute", inset: 0,
            opacity: 0.15,
            backgroundImage: "var(--noise-texture)",
            mixBlendMode: "overlay",
          }} />
        </>
      ) : (
        <>
          {/* ═══════════════════════════════════════════
              LIGHT MODE — Subtle warm glows
              ═══════════════════════════════════════════ */}
          <div style={{
            position: "absolute",
            top: "-20%", left: "-10%",
            width: "120%", height: "60%",
            background: "radial-gradient(ellipse at 50% 0%, rgba(212, 168, 83, 0.2) 0%, transparent 70%)",
            filter: "blur(60px)",
          }} />
        </>
      )}
    </div>
  );
}
