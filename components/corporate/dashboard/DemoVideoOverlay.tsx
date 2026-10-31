"use client";

import { X } from "lucide-react";

/**
 * Simple overlay that will host a demo video explaining the dashboard features.
 * The actual video source will be injected later by the product team.
 * For now we render a placeholder with a close button.
 */
export default function DemoVideoOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="relative w-11/12 max-w-4xl bg-var(--portal-surface) rounded-xl p-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-var(--portal-text-muted) hover:text-var(--portal-text)"
        >
          <X className="w-5 h-5" />
        </button>
        {/* Placeholder for video – replace with <video> or <iframe> when ready */}
        <div className="aspect-video bg-var(--portal-border) flex items-center justify-center text-sm text-var(--portal-text-muted)">
          Demo video goes here – upload and replace this block.
        </div>
      </div>
    </div>
  );
}

