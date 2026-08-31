"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Depth = "bg" | "ambient" | "content" | "foreground";

const DEPTH_CLASS: Record<Depth, string> = {
  bg: "parallax-bg",
  ambient: "parallax-amb",
  content: "parallax-content",
  foreground: "parallax-fg",
};

interface ParallaxLayerProps {
  depth: Depth;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Wraps children in a parallax depth layer.
 * Reads --px/--py CSS variables set by useParallax hook.
 */
export function ParallaxLayer({ depth, children, className, style }: ParallaxLayerProps) {
  return (
    <div className={cn(DEPTH_CLASS[depth], "will-change-transform", className)} style={style}>
      {children}
    </div>
  );
}
