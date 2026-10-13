"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUpcomingEvents, formatCountdown, type SeasonalEvent } from "@/lib/seasonal-events";
import { X, ArrowRight, Sparkles } from "lucide-react";

export default function SeasonalPromptBar({
  announcements = [],
}: {
  announcements?: string[];
}) {
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

  /* This bar is now the ONLY promo strip in the header — it used to sit
     above a separate announcement bar, and the two overlapped because the
     header shell is fixed. Merging them means there is nothing left to bury
     a message under, and it buys back ~34px of a very tall header. */
  const totalSlides = events.length + announcements.length;

  useEffect(() => {
    if (totalSlides < 2) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % totalSlides), 5000);
    return () => clearInterval(t);
  }, [totalSlides]);

  if (totalSlides === 0) return null;

  const slideIndex = current % totalSlides;
  const event = events.length ? events[slideIndex % events.length] : null;
  const announcement = announcements.length ? announcements[slideIndex % announcements.length] : null;

  function handleDismiss() {
    if (!event) return;
    const newDismissed = [...dismissed, event.id];
    setDismissed(newDismissed);
    localStorage.setItem("touchgift_dismissed_seasonal", JSON.stringify(newDismissed));

    const nextEvents = events.filter((e) => e.id !== event.id);
    setEvents(nextEvents);
    setCurrent(0);
  }

  function handleShop() {
    router.push("/shop");
  }

  return (
    <div className="relative bg-gradient-to-r from-[#9B1B5A] to-[#6D1340] text-white">
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:16px_16px]" />

      <div className="relative max-w-7xl mx-auto px-4 py-1.5 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        {/* Left: Icon & Label */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm text-xs">
            {event ? event.icon : <Sparkles className="w-3 h-3" />}
          </span>
          {event && (
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
              {formatCountdown(event.daysBefore)}
            </span>
          )}
        </div>

        {/* Center: Message & CTA */}
        <div className="flex-1 min-w-0 flex items-center justify-center gap-2 text-center text-[13px] font-medium">
          {event ? (
            <>
              <span className="font-bold shrink-0">{event.name}:</span>
              <span className="text-white/90 truncate">{event.message}</span>
              <button
                onClick={handleShop}
                className="group shrink-0 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-white hover:text-gold transition-colors"
              >
                Shop the Edit
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </>
          ) : (
            <span className="truncate text-white/90">{announcement}</span>
          )}
        </div>

        {/* Right: Dismiss — only meaningful on a seasonal slide */}
        <div className="shrink-0 flex items-center justify-end w-5">
          {event && (
            <button
              onClick={handleDismiss}
              className="p-1 -mr-1 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
