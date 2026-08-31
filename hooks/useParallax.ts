"use client";

import { useEffect, useRef } from "react";

/**
 * Drives --px / --py CSS variables on the document root
 * based on pointer movement. Uses requestAnimationFrame
 * for smooth 60fps updates without React re-renders.
 */
export function useParallax(enabled = true) {
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const onPointerMove = (e: PointerEvent) => {
      targetX.current = e.clientX / window.innerWidth - 0.5;
      targetY.current = e.clientY / window.innerHeight - 0.5;
    };

    const frame = () => {
      currentX.current += (targetX.current - currentX.current) * 0.08;
      currentY.current += (targetY.current - currentY.current) * 0.08;
      document.documentElement.style.setProperty("--px", `${currentX.current}`);
      document.documentElement.style.setProperty("--py", `${currentY.current}`);
      raf.current = requestAnimationFrame(frame);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    raf.current = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled]);
}
