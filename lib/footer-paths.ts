/**
 * Routes that carry the full marketing footer.
 *
 * Kept in one place because two components have to agree on it: the Footer
 * itself, and the LegalStrip that covers everything it skips. Before this was
 * shared, the footer rendered on exactly these seven routes and nowhere else —
 * so /shop, /catalog, /product/[id], /orders and /account had no terms link,
 * no contact route and no way to see who they were paying.
 */
export const SHOW_FOOTER_PATHS = [
  "/",
  "/corporate",
  "/terms",
  "/privacy",
  "/returns",
  "/delivery",
  "/login",
];

export const showsFullFooter = (pathname: string) => SHOW_FOOTER_PATHS.includes(pathname);

/**
 * Corporate routes that are internal tools, not customer-facing surfaces.
 * These get neither the footer nor the legal strip: they are staff screens on a
 * dark ground, and a cream strip pinned under an ops dashboard helps nobody.
 *
 * Everything else under /corporate — the catalogue, the showroom, the hamper
 * builder, bulk upload — is a page a client sits on while deciding whether to
 * spend money with us, and therefore owes them the same disclosure.
 */
const INTERNAL_CORPORATE = [
  "/corporate/dashboard",
  "/corporate/clients",
  "/corporate/calendar",
  "/corporate/milestones",
  "/corporate/pools",
  "/corporate/pool/create",
  "/corporate/reports",
  "/corporate/marketplace",
  "/corporate/whatsapp",
  "/corporate/whitelabel",
  "/corporate/portal",
  "/corporate/pool",
];

export const isInternalCorporate = (pathname: string) =>
  INTERNAL_CORPORATE.some((p) => pathname.startsWith(p));

/** The client portal and a shared gift pool carry their own chrome. */
export const hasOwnChrome = (pathname: string) =>
  pathname.startsWith("/corporate/portal") || pathname.startsWith("/corporate/pool");