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
          DEFAULT: "#B8336A",    // Warm magenta — gifting, celebration
          light: "#E8457E",      // Lighter variant
          dark: "#8C1D4F",       // Darker variant
          muted: "#6B7280",      // Gray for secondary text
          bg: "#FFF5F8",         // Light pink tint for backgrounds
        },
        accent: {
          DEFAULT: "#FFB703",    // Golden amber — warmth, premium
          light: "#FFC940",
        },
        success: {
          DEFAULT: "#06D6A0",    // Teal green — success states
          light: "#D4F5ED",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F9FAFB",
          border: "#E5E7EB",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        display: ['"Inter"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "xl": "0.875rem",
        "2xl": "1rem",
      },
      boxShadow: {
        "soft": "0 2px 8px rgba(0, 0, 0, 0.06)",
        "card": "0 1px 3px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
