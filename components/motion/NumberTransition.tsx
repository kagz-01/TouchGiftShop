"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface NumberTransitionProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

/**
 * Animated number that ticks upward smoothly.
 * Used for totals, contribution amounts, item counts.
 */
export function NumberTransition({
  value,
  prefix = "",
  suffix = "",
  className,
  duration = 400,
}: NumberTransitionProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    setDirection(value > display ? 1 : -1);
    const t = setTimeout(() => setDisplay(value), 50);
    return () => clearTimeout(t);
  }, [value, reduced]);

  if (reduced) return <span className={className}>{prefix}{value.toLocaleString()}{suffix}</span>;

  return (
    <span className={`inline-block overflow-hidden ${className ?? ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={display}
          initial={{ y: direction * 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction * -16, opacity: 0 }}
          transition={{ duration: duration / 1000, ease: [0.25, 0.1, 0.25, 1] }}
          className="inline-block"
        >
          {prefix}{display.toLocaleString()}{suffix}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
