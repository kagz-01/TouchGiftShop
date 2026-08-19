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
      {isDark ? (
        <>
          {/* ═══════════════════════════════════════════
              DARK MODE — 3D flowing ribbon effect
              Our brand colors: Magenta · Deep Rose · Plum
              Not all dark — uses lighter shades for 3D pop
              ═══════════════════════════════════════════ */}

          {/* Base glow — warm plum radial from centre, lifts the darkness */}
          <div style={{
            position: "absolute", inset: 0,
            background:
              "radial-gradient(ellipse 130% 90% at 35% 55%, #3D0A55 0%, #200030 45%, #120018 80%)",
          }} />

          {/* ── Ribbon 1 — large ribbon sweeping bottom-left → top-right
              Cross-section gradient mimics 3D lighting:
              dark edge → deep rose → bright highlight → deep rose → dark edge */}
          <div style={{
            position: "absolute",
            width: "160%",
            height: "42%",
            bottom: "-8%",
            left: "-30%",
            transform: "rotate(-20deg)",
            background:
              "linear-gradient(to top, " +
              "#0A000F 0%, " +           // shadow underside
              "#2D0038 8%, " +            // deep shadow
              "#6D1340 22%, " +           // deep rose
              "#9B1B5A 38%, " +           // brand magenta
              "#C4297A 52%, " +           // mid highlight
              "#E060A8 63%, " +           // bright highlight peak
              "#F5A0CC 70%, " +           // specular (light catching)
              "#E060A8 76%, " +           // fade back
              "#9B1B5A 84%, " +           // back to mid
              "#4A0830 93%, " +           // shadow
              "#0A000F 100%)",            // dark edge
            filter: "blur(6px)",
            opacity: 0.92,
            animation: "ribbon-drift 18s ease-in-out infinite alternate",
          }} />

          {/* ── Ribbon 2 — slimmer ribbon crossing above ribbon 1, slightly different angle */}
          <div style={{
            position: "absolute",
            width: "160%",
            height: "28%",
            bottom: "22%",
            left: "-25%",
            transform: "rotate(-25deg)",
            background:
              "linear-gradient(to top, " +
              "#0A000F 0%, " +
              "#350045 10%, " +           // purple-plum shadow
              "#7B1258 25%, " +           // rose mid
              "#B0206A 45%, " +           // lighter rose
              "#D94080 60%, " +           // brighter
              "#F080B8 72%, " +           // bright highlight
              "#FFB8DC 78%, " +           // specular peak
              "#F080B8 83%, " +
              "#8B1558 92%, " +
              "#0A000F 100%)",
            filter: "blur(10px)",
            opacity: 0.78,
            animation: "ribbon-drift 22s ease-in-out infinite alternate-reverse",
          }} />

          {/* ── Ribbon 3 — top area, shallower ribbon adds upper depth */}
          <div style={{
            position: "absolute",
            width: "140%",
            height: "25%",
            top: "-2%",
            left: "-20%",
            transform: "rotate(-15deg)",
            background:
              "linear-gradient(to top, " +
              "#0A000F 0%, " +
              "#2A0035 12%, " +
              "#5D1045 28%, " +
              "#8B1B52 44%, " +
              "#BA2870 60%, " +
              "#DC5098 72%, " +           // highlight
              "#F090C0 78%, " +           // specular
              "#DC5098 84%, " +
              "#6D1340 92%, " +
              "#0A000F 100%)",
            filter: "blur(14px)",
            opacity: 0.65,
            animation: "ribbon-drift 26s ease-in-out infinite alternate",
          }} />

          {/* ── Gold accent ribbon — thin warm stripe linking the rose bands */}
          <div style={{
            position: "absolute",
            width: "120%",
            height: "10%",
            top: "52%",
            left: "-10%",
            transform: "rotate(-18deg)",
            background:
              "linear-gradient(to top, " +
              "transparent 0%, " +
              "#8B5A10 20%, " +
              "#D4A853 48%, " +
              "#F0C870 60%, " +           // gold specular
              "#D4A853 72%, " +
              "#8B5A10 88%, " +
              "transparent 100%)",
            filter: "blur(18px)",
            opacity: 0.35,
          }} />

          {/* ── Specular pop-highlights — tiny bright streaks where light peaks */}
          <div style={{
            position: "absolute",
            width: "35%", height: "5%",
            bottom: "34%", left: "15%",
            transform: "rotate(-22deg)",
            background:
              "linear-gradient(to right, transparent, rgba(255,190,230,0.7), transparent)",
            filter: "blur(4px)",
          }} />
          <div style={{
            position: "absolute",
            width: "28%", height: "4%",
            bottom: "13%", left: "48%",
            transform: "rotate(-20deg)",
            background:
              "linear-gradient(to right, transparent, rgba(255,210,240,0.55), transparent)",
            filter: "blur(5px)",
          }} />
          <div style={{
            position: "absolute",
            width: "22%", height: "3%",
            top: "8%", left: "30%",
            transform: "rotate(-14deg)",
            background:
              "linear-gradient(to right, transparent, rgba(255,180,220,0.5), transparent)",
            filter: "blur(4px)",
          }} />

          {/* ── Edge vignette — darkens borders so centre ribbons pop */}
          <div style={{
            position: "absolute", inset: 0,
            background:
              "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 25%, rgba(10,0,20,0.55) 100%)",
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
