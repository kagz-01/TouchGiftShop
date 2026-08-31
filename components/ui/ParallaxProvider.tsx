"use client";

import { useParallax } from "@/hooks/useParallax";

/**
 * Initializes the global pointer parallax system.
 * Renders nothing — just sets --px/--py CSS variables on <html>.
 */
export default function ParallaxProvider() {
  useParallax();
  return null;
}
