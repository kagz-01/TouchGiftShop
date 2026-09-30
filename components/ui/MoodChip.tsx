"use client";

import Link from "next/link";
import { useMood, MOODS } from "@/context/MoodContext";
import { X } from "lucide-react";

/**
 * The mood palette repaints the whole site, but it used to be invisible and
 * impossible to undo once you left the hero. This chip makes the state legible
 * and gives it an exit.
 *
 * It only appears for a mood the visitor actually chose — the hero's 7s
 * auto-rotation no longer pins a palette.
 */

/** Only moods with an honest category behind them get a destination. */
const MOOD_SHOP_HREF: Record<string, string> = {
  corporate: "/shop?category=gift-sets",
  corp_appreciation: "/shop?category=gift-sets",
  corp_milestone: "/shop?category=awards-trophies",
  corp_welcome: "/shop?category=gift-sets",
  hampers: "/shop?category=gift-sets",
  flowers: "/shop?category=gift-sets",
  perfumes: "/shop?category=perfumes",
  liquor: "/shop?category=drinkware",
  default: "/shop",
};

export default function MoodChip() {
  const { mood, moodMeta, selectedByUser, clearMood } = useMood();

  if (!selectedByUser || mood === "default") return null;

  const href = MOOD_SHOP_HREF[mood];
  // Custom vibes have no honest category mapping, so they get no link.
  const label = moodMeta?.label ?? "Mood";

  return (
    <div className="flex items-center gap-1 pl-1 pr-0.5 py-1 rounded-full bg-brand/8 dark:bg-white/10 border border-brand/15 dark:border-white/15 flex-shrink-0">
      {href ? (
        <Link
          href={href}
          className="flex items-center gap-1.5 px-2 text-xs font-semibold text-theme-heading hover:text-brand transition-colors whitespace-nowrap"
          title={`Shop gifts for “${label}”`}
        >
          <span aria-hidden>{moodMeta?.emoji}</span>
          <span className="max-w-[110px] truncate">{label}</span>
        </Link>
      ) : (
        <span
          className="flex items-center gap-1.5 px-2 text-xs font-semibold text-theme-heading whitespace-nowrap"
          title="Your custom vibe"
        >
          <span aria-hidden>{moodMeta?.emoji}</span>
          <span className="max-w-[110px] truncate">{label}</span>
        </span>
      )}
      <button
        type="button"
        onClick={clearMood}
        aria-label={`Clear the “${label}” mood and return to the default palette`}
        title="Clear mood"
        className="w-5 h-5 rounded-full flex items-center justify-center text-theme-body hover:text-brand hover:bg-brand/10 transition-colors flex-shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}