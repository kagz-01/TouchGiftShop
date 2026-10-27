/**
 * Corporate gift packs — the tangible offer behind the price.
 *
 * The old corporate page advertised abstract "tiers" with no contents, no MOQ
 * and no way to see what a budget actually buys. These packs are the fix:
 * a fixed price per box, an explicit MOQ, and a visible list of what lands on
 * the recipient's desk.
 *
 * Prices are indicative retail, VAT-inclusive when the seller is VAT
 * registered (see lib/invoicing.ts). Final quotes confirm branding, delivery
 * and stock. Do not add a pack without a real, repeatable contents list —
 * "premium selection" with no definition is the thing buyers cannot compare.
 */

export type PackId = "onboarding" | "celebration" | "executive";

export type CorporatePack = {
  id: PackId;
  name: string;
  eyebrow: string;
  blurb: string;
  /** Indicative price per box, in KES. */
  price: number;
  /** Minimum order quantity, in boxes. */
  moq: number;
  bestFor: string;
  includes: string[];
  /** One line the buyer can repeat to their finance team. */
  outcome: string;
};

export const CORPORATE_PACKS: CorporatePack[] = [
  {
    id: "onboarding",
    name: "Onboarding",
    eyebrow: "Day one",
    blurb: "A warm welcome that makes a new hire feel expected, not processed.",
    price: 3500,
    moq: 10,
    bestFor: "New hires, interns and first-week welcome kits",
    includes: [
      "Branded drinkware",
      "Softcover notebook and pen",
      "Welcome card with your message",
      "Gift box and tissue wrap",
    ],
    outcome: "A day-one kit that survives the desk clear-out.",
  },
  {
    id: "celebration",
    name: "Celebration",
    eyebrow: "The milestone",
    blurb: "For the moments a card alone undersells — anniversaries, wins and thank-yous.",
    price: 6500,
    moq: 10,
    bestFor: "Work anniversaries, team wins, client thank-yous",
    includes: [
      "Insulated tumbler or premium drinkware",
      "Gourmet treat selection",
      "Desk accessory",
      "Celebration card with your message",
      "Rigid gift box",
    ],
    outcome: "A gift that gets photographed, not filed away.",
  },
  {
    id: "executive",
    name: "Executive",
    eyebrow: "Top table",
    blurb: "A considered, understated gift for the people who close the deal.",
    price: 12500,
    moq: 10,
    bestFor: "C-suite, board members and key clients",
    includes: [
      "Leather-look folio or desk piece",
      "Vacuum flask",
      "Single-origin coffee or tea",
      "Premium notebook",
      "Handwritten card",
      "Keepsake presentation box",
    ],
    outcome: "A gift that reads as judgement, not spend.",
  },
];

export type VolumeBand = {
  min: number;
  /** null means no upper bound. */
  max: number | null;
  /** Discount off the per-box list price. */
  pct: number;
};

/**
 * Volume bands apply to every pack. They are deliberately simple and published
 * on the page — a buyer should be able to check our arithmetic without asking.
 * Keep the first band at 0% and the bands contiguous: `volumeBand` assumes it.
 */
export const VOLUME_BANDS: VolumeBand[] = [
  { min: 10, max: 24, pct: 0 },
  { min: 25, max: 49, pct: 5 },
  { min: 50, max: 99, pct: 8 },
  { min: 100, max: 249, pct: 12 },
  { min: 250, max: null, pct: 15 },
];

export const MIN_PACK_QTY = VOLUME_BANDS[0].min;
export const MAX_PACK_QTY = 500;

export function getPack(id: string | null | undefined): CorporatePack {
  return CORPORATE_PACKS.find((p) => p.id === id) ?? CORPORATE_PACKS[1];
}

export function volumeBand(qty: number): VolumeBand {
  const q = clampQty(qty);
  return VOLUME_BANDS.find((b) => q >= b.min && (b.max === null || q <= b.max)) ?? VOLUME_BANDS[0];
}

export function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return MIN_PACK_QTY;
  return Math.min(MAX_PACK_QTY, Math.max(MIN_PACK_QTY, Math.round(qty)));
}

export type PackQuote = {
  pack: CorporatePack;
  qty: number;
  band: VolumeBand;
  /** List price per box, after the volume discount. */
  unitPrice: number;
  /** What the same boxes would cost at list, for the savings line. */
  listTotal: number;
  subtotal: number;
  savings: number;
};

/**
 * All money is rounded to whole shillings at the unit level and then
 * multiplied, so the line total always equals unit × qty exactly — a proforma
 * that does not add up is worse than no proforma.
 */
export function calculatePack(pack: CorporatePack, qty: number): PackQuote {
  const q = clampQty(qty);
  const band = volumeBand(q);
  const unitPrice = Math.round(pack.price * (1 - band.pct / 100));
  const subtotal = unitPrice * q;
  const listTotal = pack.price * q;

  return {
    pack,
    qty: q,
    band,
    unitPrice,
    listTotal,
    subtotal,
    savings: listTotal - subtotal,
  };
}

/**
 * Split a VAT-inclusive total into the net and tax components. The seller
 * config decides whether VAT applies at all; this helper only does the maths
 * for the case where it does.
 */
export function vatBreakdown(total: number, rate: number) {
  if (rate <= 0) return { net: total, vat: 0, total };
  const net = Math.round((total * 100) / (100 + rate));
  return { net, vat: total - net, total };
}
