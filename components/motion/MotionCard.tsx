"use client";

import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  /** Enable pointer tilt effect (default: true) */
  tilt?: boolean;
}

// Hoisted so 24+ product cards don't re-allocate them on every render.
const HOVER_ON = { y: -6, scale: 1.015 } as const;
const HOVER_OFF = {} as const;
const TAP_ON = { scale: 0.975 } as const;
const HOVER_TRANSITION = { type: "spring", stiffness: 350, damping: 24 } as const;

/**
 * Product card with hover lift, pointer tilt, and tap compression.
 * Follows TouchGift spec: lift 4-7px, scale 1.015, tilt 2-4deg max.
 */
export function MotionCard({ children, className, onClick, tilt = true }: MotionCardProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-4, 4]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tilt || reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.article
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={reduced ? HOVER_OFF : HOVER_ON}
      whileTap={reduced ? HOVER_OFF : TAP_ON}
      transition={HOVER_TRANSITION}
      style={tilt && !reduced ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
      className={className}
    >
      {children}
    </motion.article>
  );
}
