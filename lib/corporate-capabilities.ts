/**
 * Corporate capabilities — the four questions a corporate buyer actually asks,
 * in the order they ask them.
 *
 * Replaces a six-card FEATURES list that described the same automation three
 * times ("Magic Link Delivery", "CSV Employee Roster" and the Milestones
 * section were all the same promise) and claimed capabilities that don't exist
 * yet ("Send 500 gift links in one click", "track who's opened their gift in
 * real time", "white-label the unboxing").
 *
 * Every card now carries an explicit state. `live` means a buyer can use it
 * today. `building` means it is on the roadmap and we say so. This is the whole
 * point: the previous copy made the portal sound finished because nothing on
 * the page distinguished the two.
 *
 * Statuses are maintained here, not per-component, so the hub and the portal
 * can't disagree about what ships.
 */

export type CapabilityState = "live" | "building";

export type Capability = {
  id: string;
  /** Verb-first — this is what the buyer does, not what the feature is called. */
  title: string;
  question: string;
  desc: string;
  state: CapabilityState;
  /** Roadmap phase this maps to, for internal reference. */
  phase?: string;
};

export const CAPABILITIES: Capability[] = [
  {
    id: "send",
    title: "Send",
    question: "How do I get a gift to 200 people?",
    desc: "Upload a roster and send individually addressed gift links by email, SMS or WhatsApp. Each recipient opens their own unboxing and picks delivery.",
    state: "live",
  },
  {
    id: "brand",
    title: "Brand",
    question: "Can it carry our logo?",
    desc: "Design in the browser — upload artwork, place it on the product, preview the branding effect per material — then push it to cart as fulfillment data.",
    state: "live",
    phase: "Studio",
  },
  {
    id: "track",
    title: "Track",
    question: "What happens after I send?",
    desc: "See which gifts were opened, delivered and redeemed. Ops works every request from one quote desk instead of a shared inbox.",
    state: "live",
    phase: "Phase 1",
  },
  {
    id: "pay",
    title: "Pay",
    question: "How do we settle up?",
    desc: "M-Pesa for smaller runs, bank transfer with invoicing for procurement, and LPO references captured against your account.",
    state: "building",
    phase: "Phase 5",
  },
  {
    id: "automate",
    title: "Automate",
    question: "Do I have to do this every time?",
    desc: "Triggers for anniversaries, birthdays and milestones, fired from a roster instead of a spreadsheet.",
    state: "building",
    phase: "Phase 9",
  },
];

export const CAPABILITY_STATE_LABEL: Record<CapabilityState, string> = {
  live: "Live",
  building: "In build",
};
