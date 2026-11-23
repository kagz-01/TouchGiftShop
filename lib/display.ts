/**
 * Display helpers. Data stays as stored; these only clean what is shown.
 */

// A leading emoji (plus joiners/variation selectors) followed by spaces,
// e.g. "🎂 Birthday" -> "Birthday". Older pools were saved with the emoji
// inside the occasion string, so we strip it at display time instead of
// changing stored values.
const LEADING_EMOJI = /^(?:[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{2705}\u{274C}][\u{FE0F}\u{200D}]*)+\s*/u;

export function stripLeadingEmoji(text: string | null | undefined): string {
  return (text ?? "").replace(LEADING_EMOJI, "");
}
