"use client";

import { useEffect, useState } from "react";

export default function PoolProgressBar({
  current,
  target,
}: {
  current: number;
  target: number;
}) {
  const [width, setWidth] = useState(0);
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-gold transition-all duration-1000 ease-out"
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-brand-muted">
          KSh {current.toLocaleString()} raised
        </p>
        <p className="text-xs text-brand-muted">
          of KSh {target.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
