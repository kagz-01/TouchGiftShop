"use client";

// TODO: real box sizes + item catalog with running total, from /api/products.
const BOX_SIZES = ["Small", "Medium", "Large"];

export default function HamperBuilder() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {BOX_SIZES.map((size) => (
          <button
            key={size}
            className="rounded-full border border-gray-300 px-4 py-1.5 text-sm"
          >
            {size}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-gray-200 p-4 text-sm text-brand-muted">
        Tap-to-add item list placeholder — no 3D canvas, per implementation
        plan Section 2 (cut list).
      </div>
    </div>
  );
}
