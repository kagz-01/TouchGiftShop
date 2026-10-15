/**
 * Customer-facing status wording, in one place.
 *
 * The internal enum is a pipeline, not a sentence. A client does not know what
 * "pending" means inside our ops screen, and "Awaiting your decision" does —
 * the same word in two places drifting apart is how a portal starts lying.
 */
export type PortalStatus = "pending" | "quoted" | "accepted" | "declined";

export const statusLabel = (status: string) =>
  ({
    pending: "With our team",
    quoted: "Awaiting your decision",
    accepted: "Accepted",
    declined: "Declined",
  })[status] ?? status;

export const statusColour = (status: string) =>
  ({
    pending: "var(--portal-text-faint)",
    quoted: "var(--portal-accent)",
    accepted: "var(--portal-positive)",
    declined: "var(--portal-stop)",
  })[status] ?? "var(--portal-text-faint)";

/** A client may only respond to these states. Mirrors the server's ALLOWED map. */
export const canRespond = (status: string) =>
  ["quoted", "accepted", "declined"].includes(status);
