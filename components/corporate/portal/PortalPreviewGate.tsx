import Link from "next/link";
import PortalState from "@/components/corporate/portal/PortalState";

/**
 * One signed-out stand-in for every portal data area.
 *
 * Two flavours, because there are two honest answers:
 *
 *   locked=false  the area exists for guests too — quotes, orders, invoices —
 *                 so it gets an empty state and the links that do work without
 *                 an account (browse the catalog, send a roster).
 *   locked=true   spend, people and settings are account data by definition —
 *                 money, membership and company records. Those say sign-in
 *                 instead of showing an empty frame that implies "you have no
 *                 invoices yet", which would be a statement about a company
 *                 that never signed in.
 *
 * It never reads the database: a guest has no account id to read with, and
 * inventing a row to make the screen look lived-in is the fabrication this
 * portal was written to avoid.
 */
export default function PortalPreviewGate({
  title,
  intro,
  locked,
  bodyTitle,
  body,
  primaryAction,
  secondaryAction,
  next,
}: {
  title: string;
  intro?: string;
  locked: boolean;
  bodyTitle: string;
  body: string;
  /** The action that works right now, without an account. */
  primaryAction?: { href: string; label: string };
  secondaryAction?: { href: string; label: string };
  next: string;
}) {
  const signIn = {
    href: `/corporate/portal/sign-in?next=${encodeURIComponent(next)}`,
    label: "Sign in to continue",
  };

  /* Two open links max: PortalState takes exactly two actions. The sign-in
     button stays in the header and the banner, so an area with two working
     guest links does not have to spend one of them repeating it. */
  const openLinks = [primaryAction, secondaryAction].filter(Boolean) as {
    href: string;
    label: string;
  }[];

  const action = locked ? signIn : (openLinks[0] ?? signIn);
  const second = locked
    ? openLinks[0]
    : openLinks[0]
    ? (openLinks[1] ?? signIn)
    : undefined;

  return (
    <>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold leading-tight">{title}</h1>
        {intro && (
          <p className="mt-1.5 text-sm text-[color:var(--portal-text-muted)]">{intro}</p>
        )}
      </header>

      <PortalState
        kind={locked ? "no-access" : "empty"}
        title={bodyTitle}
        body={body}
        action={action}
        secondaryAction={second}
      />

      <p className="mt-6 text-xs text-[color:var(--portal-text-faint)]">
        Not a TouchGift client yet?{" "}
        <Link href="/corporate" className="text-[color:var(--portal-accent)] hover:underline">
          Request access
        </Link>{" "}
        and your account manager will invite you.
      </p>
    </>
  );
}
