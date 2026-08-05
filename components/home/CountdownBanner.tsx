"use client";

import { useState, useEffect } from "react";
import { isSameDayCutoffPassed } from "@/lib/utils";

export default function CountdownBanner() {
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number } | null>(
    null
  );
  const [cutoffPassed, setCutoffPassed] = useState(false);

  useEffect(() => {
    function update() {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setHours(14, 0, 0, 0); // 2pm cutoff

      if (now >= cutoff) {
        setCutoffPassed(true);
        setTimeLeft(null);
        return;
      }

      const diff = cutoff.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft({ h, m });
      setCutoffPassed(false);
    }

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (cutoffPassed) {
    return (
      <div className="rounded-lg bg-brand text-white text-sm px-4 py-2">
        Same-day delivery resumes tomorrow. Order now for next-day delivery.
      </div>
    );
  }

  if (!timeLeft) return null;

  return (
    <div className="rounded-lg bg-brand text-white text-sm px-4 py-2">
      Order in the next{" "}
      <strong>
        {timeLeft.h}h {timeLeft.m}m
      </strong>{" "}
      for same-day delivery in Nairobi.
    </div>
  );
}
