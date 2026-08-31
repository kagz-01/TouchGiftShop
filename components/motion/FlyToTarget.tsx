"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface FlyToTargetProps {
  /** The source element rect (from getBoundingClientRect) */
  sourceRect: DOMRect | null;
  /** The target element ref to fly toward */
  targetRef: React.RefObject<HTMLElement>;
  /** Image or content to fly */
  children?: React.ReactNode;
  imageUrl?: string;
  /** Trigger the animation */
  active: boolean;
  onDone: () => void;
}

/**
 * Animates a product image from its position to a target (hamper/cart).
 * Creates a temporary clone that flies along a curved path.
 */
export function FlyToTarget({
  sourceRect,
  targetRef,
  children,
  imageUrl,
  active,
  onDone,
}: FlyToTargetProps) {
  const reduced = useReducedMotion();
  const [animating, setAnimating] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!active || !sourceRect || !targetRef.current || reduced) {
      if (active && reduced) onDone();
      return;
    }

    const target = targetRef.current.getBoundingClientRect();
    const dx = target.left + target.width / 2 - (sourceRect.left + sourceRect.width / 2);
    const dy = target.top + target.height / 2 - (sourceRect.top + sourceRect.height / 2);

    setStyle({
      position: "fixed",
      left: sourceRect.left,
      top: sourceRect.top,
      width: sourceRect.width,
      height: sourceRect.height,
      zIndex: 9999,
      pointerEvents: "none",
    });
    setAnimating(true);

    const t = setTimeout(() => {
      setAnimating(false);
      setStyle({});
      onDone();
    }, 650);

    return () => clearTimeout(t);
  }, [active, sourceRect, targetRef, reduced, onDone]);

  if (!animating) return null;

  const target = targetRef.current?.getBoundingClientRect();
  if (!target || !sourceRect) return null;

  return (
    <AnimatePresence>
      {animating && (
        <motion.div
          style={style}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{
            x: target.left - sourceRect.left + (target.width / 2 - sourceRect.width / 2),
            y: target.top - sourceRect.top + (target.height / 2 - sourceRect.height / 2),
            scale: 0.35,
            rotate: 5,
            opacity: 0.8,
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 0.8, 0.25, 1] }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="w-full h-full object-cover rounded-xl shadow-lg" />
          ) : (
            children
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
