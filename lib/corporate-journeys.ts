/**
 * Corporate journeys — how the page is organised.
 *
 * `coporate side.txt` §"Practical UI ideas" asks for section tabs keyed to
 * *moments* (client / team / onboarding), not to product categories. Nobody
 * arrives on a corporate page thinking "I want a tote bag"; they arrive
 * thinking "thank a client" or "onboard a new hire". Category-first navigation
 * asks them to do our merchandising thinking for us.
 *
 * Every gift suggestion here points at a slug from lib/corporate-merch.ts, so
 * nothing on this page links to a category that doesn't exist or doesn't
 * filter. No style counts, no stock claims — the catalog is still unloaded.
 */

import { Gift, Users, UserPlus, type LucideIcon } from "lucide-react";
import { MERCH_CATEGORIES } from "@/lib/corporate-merch";

export type Journey = {
  id: string;
  /** Tab label. Keep short — this renders in a sticky bar. */
  tab: string;
  /** Section heading. */
  title: string;
  lede: string;
  icon: LucideIcon;
  /** 2–3 concrete moments inside this journey. */
  moments: { label: string; note: string; slugs: string[] }[];
  /**
   * Ops handoff script. Doc item 4: a gift order stays on TouchGift, anything
   * with uniforms or signage goes to TouchLine. Giving ops the exact wording
   * stops the two brands being quoted for the same job.
   */
  whatsappScript: string;
};

const slug = (key: string) =>
  MERCH_CATEGORIES.find((c) => c.key === key)?.slug ?? "apparel";

export const JOURNEYS: Journey[] = [
  {
    id: "client",
    tab: "Client gifts",
    title: "Close the deal. Keep the relationship.",
    lede: "The gesture that lands after the signature — thoughtful enough to be remembered, useful enough to be used.",
    icon: Gift,
    moments: [
      {
        label: "Thank a client",
        note: "End-of-project and contract-signature gestures, delivered to their door with your branding on it.",
        slugs: [slug("Branded Apparel"), slug("Branded Bags")],
      },
      {
        label: "Welcome a new account",
        note: "A first-meeting kit that makes you the vendor who remembered.",
        slugs: [slug("Desk Gifts"), slug("Travel Gifts")],
      },
      {
        label: "Festive & seasonal",
        note: "Year-end client gifts that don't land in a drawer.",
        slugs: [slug("Branded Accessories"), slug("Home & Comfort Gifts")],
      },
    ],
    whatsappScript:
      "Thanks for choosing us — your gifts go out with TouchGift (gift-ready range, same-day Nairobi). For uniforms, banners or signage we partner with TouchLine; I'll send you to them.",
  },
  {
    id: "team",
    tab: "Team gifts",
    title: "Reward the people who delivered.",
    lede: "Recognition that costs less than a retention problem. Triggers, not spreadsheets.",
    icon: Users,
    moments: [
      {
        label: "Hit a target",
        note: "Quarter and month-end wins, shipped to everyone who hit it.",
        slugs: [slug("Branded Headwear"), slug("Branded Apparel")],
      },
      {
        label: "Work anniversary",
        note: "One, three, five years. A keep-forever layer rather than a token.",
        slugs: [slug("Branded Outerwear"), slug("Branded Apparel")],
      },
      {
        label: "The long-hauler",
        note: "For the people who quietly kept things running.",
        slugs: [slug("Home & Comfort Gifts"), slug("Travel Gifts")],
      },
    ],
    whatsappScript:
      "Team rewards are gifts — they stay with TouchGift. If you also need staff uniforms or event kit, that's TouchLine.",
  },
  {
    id: "onboarding",
    tab: "Onboarding kits",
    title: "Make day one feel intentional.",
    lede: "Most people decide how they feel about a job in their first week. Kit it properly.",
    icon: UserPlus,
    moments: [
      {
        label: "Before they start",
        note: "Something waiting at their desk or delivered to their door on day one.",
        slugs: [slug("Branded Bags"), slug("Travel Gifts")],
      },
      {
        label: "First project shipped",
        note: "The small win that makes the first month feel like progress.",
        slugs: [slug("Desk Gifts"), slug("Branded Headwear")],
      },
      {
        label: "First 90 days",
        note: "A marker for the moment they stop being new.",
        slugs: [slug("Branded Apparel"), slug("Branded Accessories")],
      },
    ],
    whatsappScript:
      "Onboarding kits are gifts — TouchGift handles them end to end. Uniform sets for the whole cohort are a TouchLine job.",
  },
];

/** Section ids for the sticky tab bar, in page order. */
export const SECTION_IDS = [
  ...JOURNEYS.map((j) => ({ id: j.id, label: j.tab })),
  { id: "merch", label: "The range" },
  { id: "how", label: "How it works" },
] as const;
