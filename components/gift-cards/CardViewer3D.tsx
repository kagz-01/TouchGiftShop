"use client";

import { useRef, useState, useCallback } from "react";
import GiftCardPreview, { GiftCardStyle } from "@/components/gift-cards/GiftCardPreview";

interface CardViewer3DProps {
  amount: number;
  recipientName: string;
  senderName: string;
  message: string;
  code?: string;
  style?: GiftCardStyle;
}

// Snap views for thumbnails
const SNAP_VIEWS = [
  { label: "Front View",  rotX: 0,   rotY: 0,   flipped: false },
  { label: "Back View",   rotX: 0,   rotY: 0,   flipped: true  },
  { label: "Tilted View", rotX: 14,  rotY: -28, flipped: false },
  { label: "Usage Angle", rotX: 8,   rotY: -50, flipped: false },
];

// ── Mini thumbnail: static card at a preset angle ─────────────────────────────
function MiniCard({
  view,
  isActive,
  onClick,
  amount,
  recipientName,
  senderName,
  message,
  code,
  style,
}: {
  view: typeof SNAP_VIEWS[number];
  isActive: boolean;
  onClick: () => void;
  amount: number;
  recipientName: string;
  senderName: string;
  message: string;
  code?: string;
  style?: GiftCardStyle;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "10px",
        borderRadius: "16px",
        border: `2px solid ${isActive ? "rgba(142,18,71,0.6)" : "transparent"}`,
        background: isActive ? "rgba(142,18,71,0.06)" : "rgba(255,255,255,0.5)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* Mini 3D card container */}
      <div style={{ width: "100%", perspective: "500px" }}>
        <div
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateX(${view.rotX}deg) rotateY(${view.rotY + (view.flipped ? 180 : 0)}deg)`,
            transition: "transform 0.5s ease",
          }}
        >
          <GiftCardPreview
            amount={amount}
            recipientName={recipientName}
            senderName={senderName}
            message={message}
            code={code}
            style={style}
            flipped={view.flipped}
          />
        </div>
      </div>
      <span style={{
        fontSize: "9px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        color: isActive ? "#8e1247" : "#999",
        whiteSpace: "nowrap",
      }}>
        {view.label}
      </span>
    </button>
  );
}

// ── Main 3D Viewer (interaction model from the guide) ─────────────────────────
export default function CardViewer3D({
  amount,
  recipientName,
  senderName,
  message,
  code,
  style,
}: CardViewer3DProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const startRef = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [hasPointer, setHasPointer] = useState(false);
  const [activeView, setActiveView] = useState("Front View");

  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  // ── Guide's exact pointer handlers ───────────────────────────────────────

  // Mouse hover tilt (not during drag)
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || dragging) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const y = (px - 0.5) * 18;
    const x = (0.5 - py) * 14;
    setRotation({ x: clamp(x, -10, 10), y: clamp(y, -14, 14) });
    setHasPointer(true);
    setActiveView("");
  }, [dragging]);

  const resetPointer = useCallback(() => {
    if (!dragging) {
      setRotation({ x: 0, y: 0 });
      setHasPointer(false);
    }
  }, [dragging]);

  // Pointer down — start drag
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    setDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, rotX: rotation.x, rotY: rotation.y };
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
  }, [rotation]);

  // Pointer drag
  const handlePointerDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setRotation({
      x: clamp(startRef.current.rotX - dy * 0.22, -28, 28),
      y: clamp(startRef.current.rotY + dx * 0.28, -35, 35),
    });
    setActiveView("");
  }, [dragging]);

  // Pointer up — if tap (< 8px movement), flip card
  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 8) {
      setFlipped((v) => !v);
      setRotation({ x: 0, y: 0 });
      setActiveView((prev) => prev === "Front View" ? "Back View" : "Front View");
    }
  }, [dragging]);

  // Keyboard support from guide
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setFlipped((v) => !v);
    }
  }, []);

  // Snap to a thumbnail view
  const snapTo = (view: typeof SNAP_VIEWS[number]) => {
    setFlipped(view.flipped);
    setRotation({ x: view.rotX, y: view.rotY });
    setActiveView(view.label);
    setHasPointer(false);
  };

  const cardTransform = `rotateX(${rotation.x}deg) rotateY(${rotation.y + (flipped ? 180 : 0)}deg)`;

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Hero card stage ── */}
      <div
        ref={stageRef}
        role="button"
        tabIndex={0}
        aria-label="Interactive TouchGift card. Click to flip, drag to rotate."
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
        onPointerDown={handlePointerDown}
        onPointerMoveCapture={handlePointerDrag}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => { setDragging(false); setRotation({ x: 0, y: 0 }); }}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          aspectRatio: "1.586 / 1",
          position: "relative",
          perspective: "1600px",
          cursor: dragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          outline: "none",
        }}
      >
        {/* 3D Card */}
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            transformStyle: "preserve-3d",
            transition: dragging ? "none" : "transform 550ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            transform: cardTransform,
            zIndex: 2,
            willChange: "transform",
          }}
        >
          <GiftCardPreview
            amount={amount}
            recipientName={recipientName}
            senderName={senderName}
            message={message}
            code={code}
            style={style}
            flipped={flipped}
          />
        </div>

        {/* Drop shadow below card */}
        <div style={{
          position: "absolute",
          left: "8%", right: "8%",
          bottom: "-35px",
          height: "45px",
          background: "rgba(75,10,40,0.22)",
          filter: "blur(25px)",
          borderRadius: "50%",
          transition: "transform 500ms ease, opacity 500ms ease",
          transform: hasPointer || dragging ? "scale(0.85)" : "scale(1)",
          opacity: hasPointer || dragging ? 0.7 : 1,
        }}/>
      </div>

      {/* Interaction hint */}
      <p style={{
        textAlign: "center",
        fontSize: "11px",
        letterSpacing: "1.5px",
        color: "#8e1247",
        opacity: 0.55,
        margin: "-8px 0 0",
        userSelect: "none",
      }}>
        Drag to explore · Click to flip
      </p>

      {/* ── 4 Thumbnail snap views ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
        {SNAP_VIEWS.map((v) => (
          <MiniCard
            key={v.label}
            view={v}
            isActive={activeView === v.label}
            onClick={() => snapTo(v)}
            amount={amount}
            recipientName={recipientName}
            senderName={senderName}
            message={message}
            code={code}
            style={style}
          />
        ))}
      </div>
    </div>
  );
}
