"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

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
  const [items, setItems] = useState<Item[]>([]);
  const [repelOffsets, setRepelOffsets] = useState<Record<number, { x: number; y: number }>>({});
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/wrappers')
      .then((r) => r.json())
      .then((list: any[]) => {
        if (!mounted) return;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const maxItems = vw < 640 ? 8 : vw < 1024 ? 12 : 17;
        const uniqueSources = Array.from(new Map((list || []).map((entry: any) => {
          const src = typeof entry === 'string' ? entry : entry.src;
          return [src, src];
        })).values());

        const created: Item[] = uniqueSources.slice(0, maxItems).map((src, index) => {
          // slightly smaller base sizes so wrappers don't crowd the text
          const baseSize = vw < 640 ? 36 : vw < 1024 ? 52 : 68;
          const size = Math.min(110, baseSize + (index % 3) * 6);
          const xPositions = [12, 26, 64, 78, 52, 18, 70, 88, 10, 33, 58, 82, 22, 48, 74, 14, 90];
          const yPositions = [18, 28, 18, 32, 56, 72, 72, 58, 44, 12, 62, 18, 84, 80, 42, 66, 70];

          return {
            src,
            x: xPositions[index % xPositions.length],
            y: yPositions[index % yPositions.length],
            size,
            rot: (index % 7) * 7 - 18,
            // further reduce drift amplitude to avoid sweeping over copy
            driftAmp: 6 + (index % 4) * 4,
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
          img.fetchPriority = 'high';
        });

        setItems(created);
      })
      .catch(() => {});
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
            className="absolute inset-0 w-full h-full rounded-[26px] border border-white/20 shadow-[0_18px_36px_rgba(14,9,20,0.25)] object-cover"
            style={{
              objectPosition: it.objectPosition,
              opacity: typeof window !== 'undefined' && window.innerWidth < 640 ? 0.46 : 0.6,
              filter: 'saturate(0.92) brightness(1.05) contrast(0.98)',
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{
              opacity: 1,
              x: motionX(index, 0, it.driftAmp),
              y: motionY(index, 0, it.driftAmp * 0.6),
              rotate: [it.rot - 8, it.rot + 8, it.rot - 10, it.rot + 6, it.rot],
              scale: [0.95, 1.04, 0.98, 1.06, 1],
            }}
            transition={{
              duration: 14 + index * 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.12,
              opacity: { duration: 0.32, ease: 'easeOut' },
            }}
          />
        </div>
      ))}
    </div>
  );
}
