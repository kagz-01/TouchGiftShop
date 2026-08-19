"use client";

import { useTheme } from "@/components/ui/ThemeProvider";

export default function AmbientBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-700"
      style={{
        background: isDark
          ? "#120018" // deep plum-maroon, NOT pitch black
          : "#FDF5EE",
      }}
    >
        <>
          {/* ═══════════════════════════════════════════
              DARK MODE — Clean Deep Purple with Falling Stars
              ═══════════════════════════════════════════ */}

          {/* Very smooth, deep clean background gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, #1A002A 0%, #290845 40%, #120018 100%)",
          }} />

          {/* Glow at the top so it feels illuminated from above */}
          <div style={{
            position: "absolute",
            top: "-20%", left: "-10%",
            width: "120%", height: "60%",
            background: "radial-gradient(ellipse at 50% 0%, rgba(155, 27, 90, 0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }} />

          {/* ── Falling Light Trails / Stars ── */}
          {/* 20 individual falling stars with stable values for SSR hydration */}
          {[
            { left: 5, delay: 0.2, duration: 18, opacity: 0.4, h: 25, w: 1 },
            { left: 15, delay: 3.5, duration: 22, opacity: 0.6, h: 40, w: 2 },
            { left: 25, delay: 1.1, duration: 16, opacity: 0.3, h: 30, w: 1 },
            { left: 32, delay: 5.4, duration: 25, opacity: 0.7, h: 50, w: 1 },
            { left: 45, delay: 2.3, duration: 19, opacity: 0.5, h: 35, w: 2 },
            { left: 55, delay: 6.8, duration: 21, opacity: 0.8, h: 45, w: 1 },
            { left: 62, delay: 0.9, duration: 17, opacity: 0.4, h: 28, w: 1 },
            { left: 75, delay: 4.2, duration: 24, opacity: 0.6, h: 42, w: 2 },
            { left: 85, delay: 1.7, duration: 20, opacity: 0.5, h: 32, w: 1 },
            { left: 95, delay: 7.1, duration: 23, opacity: 0.7, h: 48, w: 1 },
            { left: 8, delay: 8.5, duration: 15, opacity: 0.3, h: 22, w: 1 },
            { left: 18, delay: 4.9, duration: 26, opacity: 0.6, h: 38, w: 2 },
            { left: 28, delay: 2.8, duration: 19, opacity: 0.5, h: 33, w: 1 },
            { left: 38, delay: 7.6, duration: 21, opacity: 0.8, h: 46, w: 1 },
            { left: 48, delay: 1.4, duration: 18, opacity: 0.4, h: 29, w: 2 },
            { left: 58, delay: 9.2, duration: 27, opacity: 0.7, h: 55, w: 1 },
            { left: 68, delay: 3.7, duration: 22, opacity: 0.5, h: 36, w: 1 },
            { left: 78, delay: 6.3, duration: 20, opacity: 0.6, h: 41, w: 2 },
            { left: 88, delay: 2.1, duration: 25, opacity: 0.4, h: 31, w: 1 },
            { left: 98, delay: 8.9, duration: 17, opacity: 0.8, h: 44, w: 1 },
          ].map((star, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${star.left}%`,
                  top: 0,
                  width: `${star.w}px`,
                  height: `${star.h}vh`,
                  background: "linear-gradient(to bottom, transparent, rgba(255, 180, 220, 0.8), #FFF)",
                  opacity: star.opacity,
                  transform: "translateY(-100vh)", // Start offscreen top
                  animation: `star-fall ${star.duration}s linear ${star.delay}s infinite`,
                  boxShadow: "0 0 10px rgba(255, 180, 220, 0.5)",
                  borderRadius: "50%",
                }}
              >
                {/* Bright tip at the bottom of the trail */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "4px",
                  height: "4px",
                  background: "#FFF",
                  borderRadius: "50%",
                  boxShadow: "0 0 8px 2px #E060A8",
                  animation: `star-glow 3s ease-in-out infinite alternate ${star.delay}s`,
                }} />
              </div>
            ))}

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
              LIGHT MODE — warm cream/blush/gold blend
              ═══════════════════════════════════════════ */}

          {/* Orb 1 — blush-rose top-left */}
          <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full animate-pulse" style={{
            background: "radial-gradient(circle, #FFDDE8 0%, #F9C0CF 50%, transparent 80%)",
            opacity: 0.85, filter: "blur(80px)", animationDuration: "10s",
          }} />

          {/* Orb 2 — amber-cream bottom-right */}
          <div className="absolute bottom-[-15%] right-[-15%] w-[65vw] h-[65vw] rounded-full animate-pulse" style={{
            background: "radial-gradient(circle, #FFE8C8 0%, #F5CB8A 50%, transparent 80%)",
            opacity: 0.75, filter: "blur(100px)", animationDuration: "14s",
          }} />

          {/* Orb 3 — vanilla centre */}
          <div className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] rounded-full animate-pulse" style={{
            background: "radial-gradient(circle, #FFF9F0 0%, #FDECD5 50%, transparent 80%)",
            opacity: 0.9, filter: "blur(90px)", animationDuration: "12s", animationDelay: "3s",
          }} />

          {/* Orb 4 — dusty rose top-right */}
          <div className="absolute top-[5%] right-[10%] w-[30vw] h-[30vw] rounded-full animate-pulse" style={{
            background: "radial-gradient(circle, #FAD4E0 0%, #F5B8CC 60%, transparent 80%)",
            opacity: 0.6, filter: "blur(60px)", animationDuration: "8s", animationDelay: "1.5s",
          }} />

          {/* Orb 5 — gold bottom-left */}
          <div className="absolute bottom-[10%] left-[5%] w-[28vw] h-[28vw] rounded-full animate-pulse" style={{
            background: "radial-gradient(circle, #FDE68A 0%, #F9C44A 60%, transparent 80%)",
            opacity: 0.45, filter: "blur(55px)", animationDuration: "11s", animationDelay: "5s",
          }} />
        </>
      )}
    </div>
  );
}
