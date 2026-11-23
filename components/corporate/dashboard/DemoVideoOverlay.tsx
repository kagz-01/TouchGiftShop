"use client";

import { X } from "lucide-react";
import { useEscapeKey } from "@/hooks/useEscapeKey";

/**
 * Simple overlay that will host a demo video explaining the dashboard features.
 * The actual video source will be injected later by the product team.
 * For now we render a placeholder with a close button.
 */
export default function DemoVideoOverlay({ onClose }: { onClose: () => void }) {
  useEscapeKey(onClose);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Dashboard demo video"
        onClick={(e) => e.stopPropagation()}
        className="relative w-11/12 max-w-4xl bg-[var(--portal-surface)] rounded-xl p-4"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close demo video"
          className="absolute top-1 right-1 w-10 h-10 flex items-center justify-center text-[var(--portal-text-muted)] hover:text-[var(--portal-text)]"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Placeholder for video – replace with <video> or <iframe> when ready */}
        <div className="aspect-video bg-[var(--portal-border)] flex items-center justify-center text-sm text-[var(--portal-text-muted)]">
          Demo video goes here – upload and replace this block.
        </div>
      </div>
    </div>
  );
}

