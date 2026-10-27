import Link from "next/link";

/**
 * The legal strip.
 *
 * Not a substitute for the footer — it is what keeps the legal disclosure
 * reachable from the pages the footer skips. A shopper who is about to pay on
 * /shop has to be able to find out who they are paying, read the terms, and
 * reach a human, without the site having to put a marketing footer on every
 * browsing page.
 *
 * One line, one weight, no navigation. It is deliberately quiet: it is not a
 * call to action, it is a fact.
 */
export default function LegalStrip({
  entity = process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME || "Touchline Branding",
  kraPin,
  regNo,
}: {
  entity?: string;
  kraPin?: string | null;
  regNo?: string | null;
}) {
  return (
    <div className="border-t border-black/5 bg-[var(--portal-bg-alt,#F4F1ED)]">
      {/* pb-24 on mobile: the bottom nav is fixed, and this strip is the last
          thing in the document flow, so without it the entity line sits
          underneath the nav and is unreadable on exactly the devices that need
          to read it. */}
      <div className="page-container-capped flex flex-col gap-2 pb-24 pt-5 text-xs text-[color:var(--portal-text-muted,#5C534B)] md:flex-row md:items-center md:justify-between md:pb-5">
        <p className="leading-relaxed">
          TouchGift is a storefront operated by {entity}
          {kraPin ? ` · KRA PIN ${kraPin}` : ""}
          {regNo ? ` · Reg. No. ${regNo}` : ""}.
        </p>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link href="/terms" className="transition-colors hover:text-[color:var(--portal-text,#1A1410)]">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-[color:var(--portal-text,#1A1410)]">
            Privacy
          </Link>
          <Link href="/returns" className="transition-colors hover:text-[color:var(--portal-text,#1A1410)]">
            Returns
          </Link>
          <Link href="/delivery" className="transition-colors hover:text-[color:var(--portal-text,#1A1410)]">
            Delivery
          </Link>
          <a
            href="https://wa.me/254183172111"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[color:var(--portal-text,#1A1410)]"
          >
            Contact
          </a>
        </nav>
      </div>
    </div>
  );
}