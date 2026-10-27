"use client";

import { useEffect } from "react";

/**
 * The proforma is meant to be a one-click document. Opening it with
 * `?print=1` opens the browser's print dialog once the seller details and
 * prices have painted, so the buyer can save it as a PDF without hunting for a
 * button. The visible print button remains for anyone who dismisses it.
 */
export default function ProformaAutoPrint({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setTimeout(() => window.print(), 450);
    return () => window.clearTimeout(timer);
  }, [enabled]);

  return null;
}
