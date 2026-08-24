export type GiftWrappingStyle = "classic" | "premium" | "luxury";

export interface GiftWrappingOption {
  style: GiftWrappingStyle;
  label: string;
  price: number;
  description: string;
  emoji: string;
}

export const GIFT_WRAPPING_OPTIONS: GiftWrappingOption[] = [
  {
    style: "classic",
    label: "Classic Wrap",
    price: 200,
    description: "Elegant tissue paper with ribbon bow",
    emoji: "🎀",
  },
  {
    style: "premium",
    label: "Premium Box",
    price: 500,
    description: "Keepsake gift box with satin lining and hand-written tag",
    emoji: "🎁",
  },
  {
    style: "luxury",
    label: "Luxury Experience",
    price: 1000,
    description: "Custom branded box, dried flowers, luxury ribbon, and video message card",
    emoji: "✨",
  },
];

export function getWrappingPrice(style: GiftWrappingStyle): number {
  return GIFT_WRAPPING_OPTIONS.find((o) => o.style === style)?.price ?? 0;
}
