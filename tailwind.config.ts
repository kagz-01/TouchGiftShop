import type { Config } from "tailwindcss";

// TODO(design pass): replace with the real TouchGift token system
// (named hex palette, display/body/utility type pairing) before Stage 1 ships.
// Keeping neutral placeholders here so the scaffold isn't mistaken for final design.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#111111", // placeholder — pending brand palette
          muted: "#6b7280",
        },
      },
    },
  },
  plugins: [],
};
export default config;
