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
  placeholder?: string | null;
};

export default function HeroWrappers() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [offsets, setOffsets] = useState<{ x: number; y: number }[]>([]);
  const [driftOffsets, setDriftOffsets] = useState<{ dx: number; dy: number }[]>([]);
  const [rotOffsets, setRotOffsets] = useState<number[]>([]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/wrappers')
      .then((r) => r.json())
      .then((list: any[]) => {
        if (!mounted) return;
        const rect = ref.current?.getBoundingClientRect();
        const w = rect?.width || 1200;
        const h = rect?.height || 600;

        // Keep a larger set but auto-scale it for device size so it stays clean on all screens.
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const maxItems = vw < 640 ? 8 : vw < 1024 ? 12 : 17;

        const created: Item[] = (list || []).slice(0, maxItems).map((entry: any, i: number) => {
          const src = typeof entry === 'string' ? entry : entry.src;
          const placeholder = typeof entry === 'string' ? null : entry.placeholder;
          const baseSize = vw < 640 ? 48 : vw < 1024 ? 60 : 78;
          const size = baseSize + Math.round(Math.random() * (vw < 640 ? 20 : vw < 1024 ? 28 : 42));
          return {
            src,
            x: Math.round(Math.random() * (w - size)),
            y: Math.round(Math.random() * (h - size)),
            size,
            rot: (Math.random() - 0.5) * 20,
            driftAmp: 3 + Math.random() * 6,
            driftPhase: Math.random() * Math.PI * 2,
            parallaxDepth: 0.08 + Math.random() * 0.28,
            placeholder,
          };
        });

        setItems(created);
        setOffsets(created.map(() => ({ x: 0, y: 0 })));
        setDriftOffsets(created.map(() => ({ dx: 0, dy: 0 })));
        setRotOffsets(created.map(() => 0));
        setLoadedItems(created.map(() => false));
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  function handlePointerMove(e: React.PointerEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newOffsets = items.map((it) => {
      const cx = it.x + it.size / 2;
      const cy = it.y + it.size / 2;
      const dx = cx - px;
      const dy = cy - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = 160 + it.size / 2;
      let repelX = 0;
      let repelY = 0;
      if (dist > 0 && dist < threshold) {
        const strength = (threshold - dist) / threshold; // 0..1
        const repel = 40 * strength; // max displacement
        repelX = (dx / dist) * repel;
        repelY = (dy / dist) * repel;
      }

      // parallax relative to pointer position around center
      const parallaxX = ((px - centerX) / rect.width) * it.parallaxDepth * 80;
      const parallaxY = ((py - centerY) / rect.height) * it.parallaxDepth * 60;

      return { x: Math.round(repelX + parallaxX), y: Math.round(repelY + parallaxY) };
    });

    setOffsets(newOffsets);
  }

  function handlePointerLeave() {
    setOffsets(items.map(() => ({ x: 0, y: 0 })));
  }

  const [loadedItems, setLoadedItems] = React.useState<boolean[]>([]);
  function onImgLoad(idx: number) {
    setLoadedItems((s) => {
      const next = s.slice();
      next[idx] = true;
      return next;
    });
  }

  // drift animation using requestAnimationFrame to compute small per-item offsets
  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    function step(ts: number) {
      if (!start) start = ts;
      const t = (ts - start) / 1000; // seconds
      const next = items.map((it) => {
        const motionScale = typeof window !== 'undefined' && window.innerWidth < 640 ? 0.6 : 1;
        const dx = Math.sin(t * (0.2 + it.driftPhase * 0.01) + it.driftPhase) * it.driftAmp * motionScale;
        const dy = Math.cos(t * (0.18 + it.driftPhase * 0.008) + it.driftPhase * 1.3) * (it.driftAmp * 0.6) * motionScale;
        return { dx, dy };
      });
      const rotNext = items.map((it) => {
        const amp = 1.2 + (it.driftAmp * 0.12);
        return Math.sin(t * (0.5 + it.driftPhase * 0.02) + it.driftPhase) * amp;
      });
      setDriftOffsets(next);
      setRotOffsets(rotNext);
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ touchAction: 'none' }}
    >
      {items.map((it, i) => (
        <motion.img
          key={it.src + '-' + i}
          src={it.src}
          alt="wrapper"
          loading="lazy"
          decoding="async"
          className="absolute rounded-[26px] will-change-transform filter transition-filter duration-300 border border-white/20"
          style={{
            width: it.size,
            height: it.size,
            left: it.x,
            top: it.y,
            objectFit: 'cover',
            WebkitBackfaceVisibility: 'hidden',
            zIndex: Math.round(it.parallaxDepth * 100) + 1,
            boxShadow: '0 14px 30px rgba(14,9,20,0.28)',
            opacity: typeof window !== 'undefined' && window.innerWidth < 640 ? 0.6 : 0.72,
            filter: 'saturate(0.9) brightness(1.05) contrast(0.98)',
            backdropFilter: 'blur(1px)',
          }}
          initial={{ x: 0, y: 0, rotate: it.rot, scale: 1 }}
          onLoad={() => onImgLoad(i)}
          animate={{
            x: (offsets[i]?.x || 0) + (driftOffsets[i]?.dx || 0),
            y: (offsets[i]?.y || 0) + (driftOffsets[i]?.dy || 0),
            rotate: it.rot + (rotOffsets[i] || 0),
            scale: 1 + ((Math.abs(rotOffsets[i] || 0) / 18) ),
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        />
      ))}
      {/* placeholders as blurred backgrounds while image loads */}
      {items.map((it, i) => {
        if (!it.placeholder) return null;
        const loaded = loadedItems[i];
        return (
          <div
            key={`ph-${i}`}
            className="absolute rounded-[26px] overflow-hidden pointer-events-none border border-white/20"
            style={{
              left: it.x,
              top: it.y,
              width: it.size,
              height: it.size,
              transform: `translate(${(offsets[i]?.x || 0) + (driftOffsets[i]?.dx || 0)}px, ${(offsets[i]?.y || 0) + (driftOffsets[i]?.dy || 0)}px)`,
              transition: 'opacity 300ms ease',
              opacity: loaded ? 0 : 0.85,
              filter: 'blur(10px) saturate(0.8) contrast(0.95)',
              backgroundImage: `url(${it.placeholder})`,
              backgroundSize: 'cover',
              boxShadow: '0 14px 30px rgba(14,9,20,0.2)',
            }}
          />
        );
      })}
    </div>
  );
}
