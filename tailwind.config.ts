import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#9B1B5A",
          light: "#C4297A",
          dark: "#6D1340",
          muted: "#8B7B84",
          bg: "#FFF5F8",
          deep: "#1A1A2E",
        },
        gold: {
          DEFAULT: "#D4A853",
          light: "#E8C97A",
          dark: "#B08A3A",
        },
        coral: {
          DEFAULT: "#FF6B6B",
          light: "#FF9B9B",
        },
        blush: {
          DEFAULT: "#FFF0F5",
          dark: "#FFE0EB",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#FAF8F9",
          warm: "#FDF8F4",
          border: "#F0E8EC",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "none": "0",
        "sm": "0.5rem",
        DEFAULT: "0.75rem",
        "md": "1rem",
        "lg": "1.25rem",
        "xl": "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        "full": "9999px",
      },
      boxShadow: {
        "soft": "0 2px 12px rgba(155, 27, 90, 0.08)",
        "card": "0 4px 20px rgba(155, 27, 90, 0.06)",
        "card-hover": "0 12px 40px rgba(155, 27, 90, 0.12)",
        "glow": "0 0 30px rgba(155, 27, 90, 0.2)",
        "gold": "0 4px 20px rgba(212, 168, 83, 0.3)",
        "ribbon": "0 4px 6px -1px rgba(155, 27, 90, 0.2)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "slide-in-right": "slideInRight 0.4s ease-out forwards",
        "scale-in": "scaleIn 0.3s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "wiggle": "wiggle 0.3s ease-in-out",
        "pop": "pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "ribbon-unfold": "ribbonUnfold 0.6s ease-out forwards",
        "gift-bounce": "giftBounce 0.5s ease-out",
        "confetti": "confetti 0.8s ease-out forwards",
        "typewriter": "typewriter 3s steps(40) forwards",
        "blink": "blink 0.7s step-end infinite",
        "spin-slow": "spin 3s linear infinite",
        "marquee": "marquee 25s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        pop: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        ribbonUnfold: {
          "0%": { transform: "scaleX(0)", transformOrigin: "left" },
          "100%": { transform: "scaleX(1)", transformOrigin: "left" },
        },
        giftBounce: {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.25)" },
          "50%": { transform: "scale(0.9)" },
          "70%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        confetti: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(-100px) rotate(720deg)", opacity: "0" },
        },
        typewriter: {
          "0%": { width: "0" },
          "100%": { width: "100%" },
        },
        blink: {
          "0%, 100%": { borderColor: "transparent" },
          "50%": { borderColor: "#9B1B5A" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #9B1B5A 0%, #D4A853 100%)",
        "gradient-brand-reverse": "linear-gradient(135deg, #D4A853 0%, #9B1B5A 100%)",
        "gradient-warm": "linear-gradient(135deg, #FFF5F8 0%, #FDF8F4 100%)",
        "gradient-dark": "linear-gradient(135deg, #1A1A2E 0%, #2D2D44 100%)",
        "gradient-gold": "linear-gradient(135deg, #D4A853 0%, #E8C97A 100%)",
        "shimmer-gradient": "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      },
    },
  },
  plugins: [],
};
export default config;
