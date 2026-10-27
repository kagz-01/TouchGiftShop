import Link from "next/link";
import {
  ArrowRight, FileText, Package, ReceiptText, Wallet, Users, Settings, Sparkles,
} from "lucide-react";

/**
 * What a signed-out visitor sees at /corporate/portal.
 *
 * The portal used to bounce everyone who was not signed in to a sign-in form,
 * so a corporate buyer could never see what they would get for inviting their
 * team — they had to take our word for it. This is the walkthrough instead:
 * the same shell, the same seven areas, described honestly, with every link
 * that works without an account still working.
 *
 * Rules for this file, because it is the only screen some visitors will see:
 *   · no numbers that could be mistaken for a client's figures
 *   · no "sample" quotes, orders or invoices — a made-up row is a claim
 *   · anything account-specific says plainly that it is behind sign-in
 */

type Area = {
  icon: typeof FileText;
  label: string;
  href: string;
  body: string;
  locked: boolean;
};

const AREAS: Area[] = [
  {
    icon: FileText,
    label: "Quotes",
    href: "/corporate/portal/quotes",
    body: "Every quote we send, with its reference, validity date and your accept or decline in one step.",
    locked: false,
  },
  {
    icon: Package,
    label: "Orders",
    href: "/corporate/portal/orders",
    body: "Bulk and hamper orders from production through dispatch to photo proof of delivery.",
    locked: false,
  },
  {
    icon: ReceiptText,
    label: "Invoices",
    href: "/corporate/portal/invoices",
    body: "Each invoice we issue, printable or saveable as a PDF for your finance team.",
    locked: false,
  },
  {
    icon: Wallet,
    label: "Spend",
    href: "/corporate/portal/spend",
    body: "Committed spend, bulk discounts earned and quotes still awaiting a decision.",
    locked: true,
  },
  {
    icon: Users,
    label: "People",
    href: "/corporate/portal/people",
    body: "Who at your company can use this portal, plus your saved recipients for milestone gifting.",
    locked: true,
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/corporate/portal/settings",
    body: "Your sign-in, company details and payment terms — the details that appear on your invoices.",
    locked: true,
  },
];

export default function PortalPreviewOverview({ pathname = "/corporate/portal" }: { pathname?: string }) {
  const signIn = `/corporate/portal/sign-in?next=${encodeURIComponent(pathname)}`;

  return (
    <>
      <header className="mb-8">
        <p className="text-xs text-[color:var(--portal-text-faint)]">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="font-display mt-1 text-3xl font-bold leading-tight sm:text-4xl">
          The client portal,
          <br className="sm:hidden" /> before you sign in
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
          Quotes, orders and invoices for your company, in one place instead of a
          mailbox. This is a walkthrough — nothing below is a client&apos;s data.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {AREAS.map((area) => {
          const Icon = area.icon;
          const card = (
            <div className="portal-card flex h-full flex-col p-5 transition-colors">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: "var(--portal-accent-tint)", color: "var(--portal-accent)" }}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="font-display font-bold">{area.label}</span>
                {area.locked && (
                  <span className="ml-auto rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ borderColor: "var(--portal-border)", color: "var(--portal-text-faint)" }}>
                    Sign-in
                  </span>
                )}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
                {area.body}
              </p>
            </div>
          );

          return area.locked ? (
            <div key={area.label}>{card}</div>
          ) : (
            <Link key={area.label} href={area.href} className="block group">
              <div className="transition-transform group-hover:-translate-y-0.5">{card}</div>
            </Link>
          );
        })}
      </div>

      {/* ── What works without an account ── */}
      <section className="mt-10">
        <h2 className="font-display mb-1 text-xl font-bold">Open right now, no account needed</h2>
        <p className="mb-4 text-sm text-[color:var(--portal-text-muted)]">
          The same public tools your team can use before anyone is invited in.
        </p>
        <ul className="portal-card divide-y overflow-hidden" style={{ borderColor: "var(--portal-border-soft)" }}>
          {[
            { href: "/corporate#packs", label: "Price a gift pack", note: "Volume calculator with a printable proforma" },
            { href: "/corporate/catalog", label: "Browse the corporate catalog", note: "Product, MOQ and live branding studio" },
            { href: "/corporate/bulk-upload", label: "Send a roster", note: "Bulk gifting enquiry for a team list" },
            { href: "/corporate/build", label: "Build a hamper", note: "Assemble a hamper in the browser" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[color:var(--portal-surface-2)]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-[color:var(--portal-text-faint)]">{item.note}</span>
                </span>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-[color:var(--portal-accent)]" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Sign-in ── */}
      <section
        className="mt-8 rounded-2xl border p-6"
        style={{ background: "var(--portal-accent-tint)", borderColor: "var(--portal-accent)" }}
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ background: "var(--portal-surface)" }}
          >
            <Sparkles className="h-4 w-4" style={{ color: "var(--portal-accent)" }} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display font-bold">Your company&apos;s data, one sign-in away</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--portal-text-muted)]">
              Access is invited by your TouchGift account manager and redeemed with a
              link to your work email — we never open an account from a company name
              typed into a form, because that is how one client would end up seeing
              another client&apos;s invoices.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={signIn}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: "var(--portal-accent)", color: "var(--portal-accent-text)" }}
              >
                Sign in with your work email
              </Link>
              <Link
                href="/corporate"
                className="rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
                style={{ borderColor: "var(--portal-border)", color: "var(--portal-text-muted)" }}
              >
                Request access
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
