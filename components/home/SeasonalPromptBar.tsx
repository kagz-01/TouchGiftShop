"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUpcomingEvents, formatCountdown, type SeasonalEvent } from "@/lib/seasonal-events";
import { X, ArrowRight, Gift } from "lucide-react";

export default function SeasonalPromptBar() {
  const router = useRouter();
  const [events, setEvents] = useState<SeasonalEvent[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const upcoming = getUpcomingEvents(30);
    // Filter dismissed
    const stored = localStorage.getItem("touchgift_dismissed_seasonal");
    const dismissedIds: string[] = stored ? JSON.parse(stored) : [];
    setDismissed(dismissedIds);
    setEvents(upcoming.filter((e) => !dismissedIds.includes(e.id)));
  }, []);

  if (events.length === 0) return null;

  const event = events[current % events.length];

  function handleDismiss() {
    const newDismissed = [...dismissed, event.id];
    setDismissed(newDismissed);
    localStorage.setItem("touchgift_dismissed_seasonal", JSON.stringify(newDismissed));

    const nextEvents = events.filter((e) => e.id !== event.id);
    if (nextEvents.length === 0) {
      setEvents([]);
    } else {
      setCurrent((c) => c + 1);
    }
  }

  function handleShop() {
    router.push("/shop");
  }

  return (
    <div className="relative bg-gradient-to-r from-[#9B1B5A] to-[#6D1340] text-white">
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-2.5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Icon & Label */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm text-sm">
            {event.icon}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
            {formatCountdown(event.daysBefore)}
          </span>
        </div>

        {/* Center: Message & CTA */}
        <div className="flex-1 flex flex-wrap items-center justify-center gap-2 text-center text-sm font-medium">
          <span className="font-bold">{event.name}:</span>
          <span className="text-white/90">{event.message}</span>
          <button
            onClick={handleShop}
            className="group ml-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white hover:text-gold transition-colors"
          >
            Shop the Edit
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Right: Dismiss */}
        <div className="shrink-0 flex items-center justify-end">
          <button
            onClick={handleDismiss}
            className="p-1.5 -mr-1.5 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
