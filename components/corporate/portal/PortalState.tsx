import Link from "next/link";

/**
 * One component for all three honest answers a data surface can have:
 * nothing yet, something broke, or you are not allowed in. Each one says what
 * to do next — a blank panel reads as a bug and trains people not to trust the
 * screen.
 */
export default function PortalState({
  kind,
  title,
  body,
  action,
  secondaryAction,
}: {
  kind: "empty" | "error" | "no-access";
  title: string;
  body: string;
  action?: { href: string; label: string };
  secondaryAction?: { href: string; label: string };
}) {
  const tone =
    kind === "error"
      ? { dot: "var(--portal-stop)", wash: "var(--portal-stop-tint)" }
      : kind === "no-access"
      ? { dot: "var(--portal-warn)", wash: "var(--portal-warn-tint)" }
      : { dot: "var(--portal-text-faint)", wash: "var(--portal-surface-2)" };

  return (
    <div
      className="rounded-2xl border p-6 text-center sm:p-8"
      style={{ background: tone.wash, borderColor: "var(--portal-border-soft)" }}
    >
      <span
        className="mx-auto block h-2 w-2 rounded-full"
        style={{ background: tone.dot }}
        aria-hidden
      />
      <h2 className="font-display mt-4 text-lg font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
        {body}
      </p>
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Link
              href={action.href}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
              style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}
            >
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ borderColor: "var(--portal-border)", color: "var(--portal-text-muted)" }}
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
