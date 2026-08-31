"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

interface SparkleBurstProps {
  active: boolean;
  /** Number of sparkles to emit (default: 6) */
  count?: number;
  /** Origin position relative to container */
  originX?: string;
  originY?: string;
  /** Auto-hide after ms (default: 800) */
  duration?: number;
  className?: string;
}

const COLORS = ["#D4A853", "#E8C97A", "#FF6B6B", "#C4297A", "#FFD6E8"];

/**
 * Short sparkle celebration for add, complete, success moments.
 * Respects reduced-motion.
 */
export function SparkleBurst({
  active,
  count = 6,
  originX = "50%",
  originY = "50%",
  duration = 800,
  className,
}: SparkleBurstProps) {
  const reduced = useReducedMotion();
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (!active) { setSparkles([]); return; }
    if (reduced) return;

    const newSparkles: Sparkle[] = Array.from({ length: count }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 80,
      y: (Math.random() - 0.5) * 80,
      size: 4 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.15,
    }));
    setSparkles(newSparkles);

    const t = setTimeout(() => setSparkles([]), duration);
    return () => clearTimeout(t);
  }, [active, count, duration, reduced]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className ?? ""}`}>
      <AnimatePresence>
        {sparkles.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1, x: s.x, y: s.y }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: s.delay, ease: "easeOut" }}
            className="absolute rounded-full"
            style={{
              left: originX,
              top: originY,
              width: s.size,
              height: s.size,
              backgroundColor: s.color,
              boxShadow: `0 0 6px 1px ${s.color}80`,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
