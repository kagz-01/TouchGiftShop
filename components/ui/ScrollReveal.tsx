"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "scale";
}

/**
 * Wraps children in an IntersectionObserver-triggered reveal animation.
 * Uses existing tailwind keyframes: fadeInUp, fadeIn, pop.
 */
export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const baseStyle: React.CSSProperties = {
    transitionDelay: `${delay}ms`,
    transitionProperty: "opacity, transform",
    transitionDuration: "600ms",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  };

  const hiddenStyle: React.CSSProperties = {
    opacity: 0,
    transform:
      direction === "up"
        ? "translateY(28px)"
        : direction === "left"
        ? "translateX(-24px)"
        : direction === "right"
        ? "translateX(24px)"
        : "scale(0.94)",
  };

  const visibleStyle: React.CSSProperties = {
    opacity: 1,
    transform: "translateY(0) translateX(0) scale(1)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...baseStyle, ...(visible ? visibleStyle : hiddenStyle) }}
    >
      {children}
    </div>
  );
}

/**
 * Stagger-reveals a list of children one by one as the container scrolls into view.
 */
export function StaggerReveal({
  children,
  className = "",
  staggerMs = 80,
}: {
  children: ReactNode[];
  className?: string;
  staggerMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          style={{
            transitionDelay: `${i * staggerMs}ms`,
            transitionProperty: "opacity, transform",
            transitionDuration: "550ms",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
