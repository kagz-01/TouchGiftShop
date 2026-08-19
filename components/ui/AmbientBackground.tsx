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
          ? "#0D0510" // very deep plum-black base
          : "#FDF5EE", // warm cream base
      }}
    >
      {isDark ? (
        <>
          {/* DARK MODE — vivid 5-orb colour blend */}

          {/* Orb 1 — Rich Magenta (top-left) */}
          <div
            className="absolute top-[-15%] left-[-15%] w-[55vw] h-[55vw] rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #9B1B5A 0%, #6D1340 50%, transparent 80%)",
              opacity: 0.7,
              filter: "blur(90px)",
              animationDuration: "9s",
            }}
          />

          {/* Orb 2 — Deep Purple (bottom-right) */}
          <div
            className="absolute bottom-[-20%] right-[-15%] w-[65vw] h-[65vw] rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #5B0EA6 0%, #2D0050 50%, transparent 80%)",
              opacity: 0.65,
              filter: "blur(100px)",
              animationDuration: "13s",
            }}
          />

          {/* Orb 3 — Warm Gold (center-right, blending with magenta) */}
          <div
            className="absolute top-[25%] right-[5%] w-[40vw] h-[40vw] rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #D4A853 0%, #A07030 50%, transparent 80%)",
              opacity: 0.35,
              filter: "blur(80px)",
              animationDuration: "11s",
              animationDelay: "2s",
            }}
          />

          {/* Orb 4 — Crimson-rose bridging magenta & purple (center-left) */}
          <div
            className="absolute top-[40%] left-[5%] w-[35vw] h-[35vw] rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #C4297A 0%, #7B1044 50%, transparent 80%)",
              opacity: 0.5,
              filter: "blur(70px)",
              animationDuration: "15s",
              animationDelay: "4s",
            }}
          />

          {/* Orb 5 — Indigo accent (top-right, linking purple to gold) */}
          <div
            className="absolute top-[5%] right-[20%] w-[28vw] h-[28vw] rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #7C3AED 0%, #4C1D95 60%, transparent 80%)",
              opacity: 0.4,
              filter: "blur(60px)",
              animationDuration: "7s",
              animationDelay: "1s",
            }}
          />

          {/* Mesh overlay to help the blending */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(155,27,90,0.08) 0%, transparent 70%)",
            }}
          />
        </>
      ) : (
        <>
          {/* LIGHT MODE — warm cream-gold-blush blend */}

          {/* Orb 1 — Warm blush-rose (top-left) */}
          <div
            className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #FFDDE8 0%, #F9C0CF 50%, transparent 80%)",
              opacity: 0.85,
              filter: "blur(80px)",
              animationDuration: "10s",
            }}
          />

          {/* Orb 2 — Warm amber-cream (bottom-right) */}
          <div
            className="absolute bottom-[-15%] right-[-15%] w-[65vw] h-[65vw] rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #FFE8C8 0%, #F5CB8A 50%, transparent 80%)",
              opacity: 0.75,
              filter: "blur(100px)",
              animationDuration: "14s",
            }}
          />

          {/* Orb 3 — Soft vanilla-ivory (center) */}
          <div
            className="absolute top-[30%] left-[20%] w-[50vw] h-[50vw] rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #FFF9F0 0%, #FDECD5 50%, transparent 80%)",
              opacity: 0.9,
              filter: "blur(90px)",
              animationDuration: "12s",
              animationDelay: "3s",
            }}
          />

          {/* Orb 4 — Dusty rose-magenta tint (top-right) */}
          <div
            className="absolute top-[5%] right-[10%] w-[30vw] h-[30vw] rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #FAD4E0 0%, #F5B8CC 60%, transparent 80%)",
              opacity: 0.6,
              filter: "blur(60px)",
              animationDuration: "8s",
              animationDelay: "1.5s",
            }}
          />

          {/* Orb 5 — Gold highlight (bottom-left) */}
          <div
            className="absolute bottom-[10%] left-[5%] w-[28vw] h-[28vw] rounded-full animate-pulse"
            style={{
              background: "radial-gradient(circle, #FDE68A 0%, #F9C44A 60%, transparent 80%)",
              opacity: 0.45,
              filter: "blur(55px)",
              animationDuration: "11s",
              animationDelay: "5s",
            }}
          />
        </>
      )}
    </div>
  );
}
