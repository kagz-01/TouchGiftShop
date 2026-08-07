"use client";

import { useState, useEffect } from "react";
import { getUpcomingEvents, formatCountdown, type SeasonalEvent } from "@/lib/seasonal-events";

export default function SeasonalPromptBar() {
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

  function handleNext() {
    setCurrent((c) => c + 1);
  }

  function handleShop() {
    // Navigate to category page
    const category = event.categories[0] || "gifts";
    window.location.href = `/category/${category}`;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 p-4 text-white shadow-lg">
      {/* Background decoration */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-20 select-none">
        {event.icon}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{event.icon}</span>
            <span className="text-xs font-medium uppercase tracking-wide text-white/70">
              {formatCountdown(event.daysBefore)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {events.length > 1 && (
              <>
                <button
                  onClick={handleDismiss}
                  className="rounded-full p-1 text-white/50 hover:text-white/80"
                  title="Dismiss"
                >
                  ✕
                </button>
                <button
                  onClick={handleNext}
                  className="rounded-full p-1 text-white/50 hover:text-white/80"
                  title="Next event"
                >
                  →
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold">{event.name}</h3>
        {event.nameSw && (
          <p className="text-xs text-white/60">{event.nameSw}</p>
        )}
        <p className="mt-1 text-sm text-white/80">{event.message}</p>

        {/* CTA */}
        <button
          onClick={handleShop}
          className="mt-3 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm hover:bg-white/90"
        >
          Shop Now →
        </button>
      </div>
    </div>
  );
}
