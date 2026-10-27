"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const CUTOFF_MINUTES = 18 * 60;

/* Nairobi is UTC+3 all year, but formatting through Intl keeps this correct
   without hardcoding an offset or depending on the visitor's own timezone. */
function nairobiMinutesOfDay() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export default function CutoffCountdown({
  variant = "default",
  className,
}: {
  variant?: "default" | "onBrand";
  className?: string;
}) {
  /* null on the server and on first render: the markup must be identical on
     both sides, and a clock reads as "closed" far worse than a static promise. */
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setMinutes(nairobiMinutesOfDay());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const beforeCutoff = minutes !== null && minutes < CUTOFF_MINUTES;
  const left = minutes === null ? null : CUTOFF_MINUTES - minutes;
  const hours = left === null ? 0 : Math.floor(left / 60);
  const mins = left === null ? 0 : left % 60;

  const label =
    minutes === null
      ? "Order by 6 PM for same-day Nairobi"
      : beforeCutoff
        ? `Same-day closes in ${hours > 0 ? `${hours}h ` : ""}${mins}m`
        : "Same-day closed — order now for tomorrow";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold",
        variant === "onBrand"
          ? "border-white/20 bg-white/15 text-white"
          : beforeCutoff
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300"
            : "border-surface-border bg-white/70 text-theme-body dark:border-white/10 dark:bg-white/5",
        className
      )}
    >
      <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}
