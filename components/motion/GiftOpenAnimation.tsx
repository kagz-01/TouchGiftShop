"use client";

import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SparkleBurst } from "./SparkleBurst";

interface GiftOpenAnimationProps {
  /** Trigger the opening sequence */
  open: boolean;
  /** Callback when animation completes */
  onOpen?: () => void;
  /** The gift card/preview before opening */
  children: ReactNode;
  /** Content revealed after opening */
  revealContent: ReactNode;
  className?: string;
}

/**
 * Signature TouchGift gift opening experience.
 * Stages: card enlarges → dims → glow → sparkles → reveal.
 * Total duration ~1100ms.
 */
export function GiftOpenAnimation({
  open,
  onOpen,
  children,
  revealContent,
  className,
}: GiftOpenAnimationProps) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<"closed" | "glow" | "reveal" | "done">("closed");

  useEffect(() => {
    if (!open || reduced) {
      if (open && reduced) { setStage("done"); onOpen?.(); }
      return;
    }

    setStage("glow");
    const t1 = setTimeout(() => setStage("reveal"), 550);
    const t2 = setTimeout(() => { setStage("done"); onOpen?.(); }, 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [open, reduced, onOpen]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <AnimatePresence mode="wait">
        {stage === "done" ? (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {revealContent}
          </motion.div>
        ) : (
          <motion.div
            key="gift"
            animate={
              stage === "glow"
                ? { scale: [1, 1.03, 1], filter: "brightness(1.05)" }
                : { scale: 1, filter: "brightness(1)" }
            }
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="relative"
          >
            {children}

            {/* Glow overlay */}
            {stage === "glow" && (
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1.3, 1.7] }}
                  transition={{ duration: 1.0, ease: "easeOut" }}
                  className="absolute inset-0 bg-gradient-to-br from-gold/30 via-brand/20 to-gold/30"
                />
              </div>
            )}

            {/* Sparkles at glow stage */}
            <SparkleBurst active={stage === "glow"} count={8} duration={600} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
