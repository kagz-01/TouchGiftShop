"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type Item = {
  src: string;
  x: number;
  y: number;
  size: number;
  rot: number;
  driftAmp: number;
  driftPhase: number;
  parallaxDepth: number;
  zIndex: number;
  objectPosition: string;
};

export default function HeroWrappers() {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [items, setItems] = useState<Item[]>([]);
  const [repelOffsets, setRepelOffsets] = useState<Record<number, { x: number; y: number }>>({});
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/wrappers');
        if (!res.ok) throw new Error(`wrappers API ${res.status}`);
        const list: any[] = await res.json();
        if (!mounted) return;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const maxItems = vw < 640 ? 8 : vw < 1024 ? 10 : 12; // reduce count to avoid clutter
        const uniqueSources = Array.from(new Map((list || []).map((entry: any) => {
          const src = typeof entry === 'string' ? entry : entry.src;
          return [src, src];
        })).values());

        const created: Item[] = uniqueSources.slice(0, maxItems).map((src, index) => {
          // slightly smaller base sizes so wrappers don't crowd the text
          const baseSize = vw < 640 ? 32 : vw < 1024 ? 48 : 64;
          const size = Math.min(100, baseSize + (index % 3) * 6);
          const xPositions = [12, 26, 64, 78, 52, 18, 70, 88, 10, 33, 58, 82, 22, 48, 74, 14, 90];
          const yPositions = [18, 28, 18, 32, 56, 72, 72, 58, 44, 12, 62, 18, 84, 80, 42, 66, 70];

          return {
            src,
            x: xPositions[index % xPositions.length],
            y: yPositions[index % yPositions.length],
            size,
            rot: (index % 7) * 7 - 18,
            // further reduce drift amplitude to avoid sweeping over copy
            driftAmp: 4 + (index % 3) * 3,
            driftPhase: (index % 9) * 0.8,
            parallaxDepth: 0.08 + (index % 5) * 0.07,
            zIndex: 1 + (index % 10),
            objectPosition: ['center', 'center top', 'center bottom', 'left center', 'right center'][index % 5],
          };
        });

        created.forEach((item) => {
          const img = new Image();
          img.src = item.src;
          img.decoding = 'sync';
          // @ts-ignore - fetchPriority is supported by modern browsers
          img.fetchPriority = 'high';
        });

        setItems(created);
      } catch (err) {
        // log the fetch error for debugging and avoid throwing to the boundary
        // (the app's error boundary previously surfaced a generic "fetch failed")
        // keep the hero silent and don't block rendering
        // eslint-disable-next-line no-console
        console.error('HeroWrappers: failed to load wrappers', err);
        if (mounted) setItems([]);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const motionX = (index: number, value: number, amp: number) => {
    const phase = (index % 5) * 1.3;
    return [value - amp, value + amp * 0.7, value + amp * 0.35, value - amp * 0.8, value];
  };

  const motionY = (index: number, value: number, amp: number) => {
    const phase = (index % 4) * 1.1;
    return [value - amp * 0.6, value + amp * 0.9, value + amp * 0.4, value - amp * 0.8, value];
  };

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      onPointerMove={(e) => {
        // pointer-based repel: compute offsets per item and schedule update via rAF
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          const newOffsets: Record<number, { x: number; y: number }> = {};
          const threshold = Math.max(140, Math.min(rect.width, rect.height) * 0.18);
          const maxRepel = 26; // px
          items.forEach((it, i) => {
            const centerX = (it.x / 100) * rect.width;
            const centerY = (it.y / 100) * rect.height;
            const dx = centerX - px;
            const dy = centerY - py;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            if (dist < threshold) {
              const strength = (threshold - dist) / threshold;
              const nx = (dx / dist) * strength * maxRepel;
              const ny = (dy / dist) * strength * maxRepel;
              newOffsets[i] = { x: nx, y: ny };
            }
          });
          setRepelOffsets(newOffsets);
        });
      }}
      onPointerLeave={() => { setRepelOffsets({}); if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } }}
    >
      {items.map((it, index) => (
        <div
          key={`${it.src}-${index}`}
          className="absolute rounded-[26px] will-change-transform"
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            width: it.size,
            height: it.size,
            transform: `translate(-50%, -50%) translate(${repelOffsets[index]?.x || 0}px, ${repelOffsets[index]?.y || 0}px)`,
            zIndex: it.zIndex,
            pointerEvents: 'none',
          }}
        >
          <motion.img
            src={it.src}
            alt=""
            loading="eager"
            decoding="sync"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full rounded-[26px] border border-white/14 shadow-[0_8px_18px_rgba(14,9,20,0.12)] object-cover"
            style={{
              objectPosition: it.objectPosition,
              opacity: typeof window !== 'undefined' && window.innerWidth < 640 ? 0.42 : 0.56,
              filter: 'saturate(0.95) brightness(1.03) contrast(0.99)',
            }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={
              prefersReducedMotion
                ? { opacity: 1, x: 0, y: 0, rotate: it.rot, scale: 1 }
                : {
                    opacity: 1,
                    x: motionX(index, 0, it.driftAmp),
                    y: motionY(index, 0, it.driftAmp * 0.6),
                    rotate: [it.rot - 6, it.rot + 6, it.rot - 8, it.rot + 4, it.rot],
                    scale: [0.97, 1.03, 0.99, 1.02, 1],
                  }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : {
                    duration: 12 + index * 0.45,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.08,
                    opacity: { duration: 0.28, ease: 'easeOut' },
                  }
            }
          />
        </div>
      ))}
    </div>
  );
}
