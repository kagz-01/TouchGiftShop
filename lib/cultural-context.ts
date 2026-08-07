export type CulturalOccasion = {
  id: string;
  name: string;
  nameLocal: string; // Swahili / local language
  description: string;
  giftGuidelines: string[];
  budgetRange: string;
  dos: string[];
  donts: string[];
  suggestedCategories: string[];
  typicalGifts: string[];
  etiquette: string;
};

export const KENYA_OCCASIONS: CulturalOccasion[] = [
  {
    id: "ruracio",
    name: "Ruracio (Engagement)",
    nameLocal: "Ruracio",
    description:
      "The formal introduction of the groom's family to the bride's family. Gift-giving is central — the groom's family brings gifts for the bride's family.",
    giftGuidelines: [
      "Bring gifts for the bride's mother, aunties, and sisters",
      "KSh 10,000-50,000+ depending on community expectations",
      "Food hampers and household items are traditional",
      "Always include something for the elders (tea, sugar, clothes)",
    ],
    budgetRange: "KSh 20,000 - 100,000+",
    dos: [
      "Present gifts wrapped in colourful fabric (lessa/leso)",
      "Include traditional items (tea, sugar, cooking oil)",
      "Respect the bride's family's specific requests",
      "Bring enough for all female relatives",
    ],
    donts: [
      "Don't come empty-handed — it's deeply disrespectful",
      "Don't rush the gift presentation",
      "Don't bring alcohol unless specifically requested",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "wine-whiskey-beverage-hampers",
      "personalized-gifts",
      "household",
    ],
    typicalGifts: [
      "Tea and sugar hampers",
      "Cooking oil and flour packages",
      "Cloth/leso for the women",
      "Cash gifts (shrubu)",
      "Bread and milk",
    ],
    etiquette:
      "Gifts are presented formally by the groom's family spokesperson. Each gift is announced and handed over with respect. The bride's family acknowledges each gift.",
  },
  {
    id: "dowry",
    name: "Dowry Payment",
    nameLocal: "Mahari",
    description:
      "The payment made by the groom's family to the bride's family. While declining in urban areas, it remains important in many communities.",
    giftGuidelines: [
      "This is a negotiated amount — not a fixed price",
      "Can include livestock, cash, and household items",
      "Urban families often accept cash instead",
      "Show willingness to negotiate respectfully",
    ],
    budgetRange: "KSh 50,000 - 500,000+",
    dos: [
      "Negotiate respectfully through family representatives",
      "Bring what was agreed upon",
      "Include symbolic gifts beyond the main payment",
      "Be present and humble during the process",
    ],
    donts: [
      "Don't treat it as a 'purchase' — it's about family unity",
      "Don't renegotiate at the last minute",
      "Don't skip the process if it's important to the families",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "household",
      "wine-whiskey-beverage-hampers",
      "personalized-gifts",
    ],
    typicalGifts: [
      "Livestock (cows, goats)",
      "Cash payment",
      "Household items",
      "Clothes for the bride",
      "Food hampers",
    ],
    etiquette:
      "The process is led by elders from both sides. The groom's family must show respect and willingness. Gifts are presented publicly.",
  },
  {
    id: "circumcision",
    name: "Circumcision Ceremony",
    nameLocal: "Utumbu / Irua",
    description:
      "A significant cultural rite of passage in many Kenyan communities (Kikuyu, Kalenjin, Maasai, etc.). It marks the transition to adulthood.",
    giftGuidelines: [
      "Gifts are for the initiate (mururuti/murit)",
      "Practical gifts for their new life are appreciated",
      "Respect the community's specific traditions",
      "Cash gifts are common and appreciated",
    ],
    budgetRange: "KSh 5,000 - 30,000",
    dos: [
      "Bring gifts that help them transition to adulthood",
      "Clothes, shoes, and school supplies are common",
      "Cash in envelopes is standard",
      "Respect the family's specific customs",
    ],
    donts: [
      "Don't bring gifts that mock the process",
      "Don't discuss the ceremony details publicly",
      "Don't arrive late — timing matters",
    ],
    suggestedCategories: [
      "personalized-gifts",
      "clothing-accessories",
      "books-magazines-gifts",
      "hampers-gift-sets",
    ],
    typicalGifts: [
      "New clothes and shoes",
      "Cash gifts",
      "School supplies",
      "Watches and accessories",
      "Food hampers",
    ],
    etiquette:
      "Gifts are presented after the ceremony or during the celebration. The initiate may receive guests individually.",
  },
  {
    id: "funeral",
    name: "Funeral / Condolence",
    nameLocal: "Mazishi",
    description:
      "Community support during mourning. Kenyans rally together with food, cash, and practical support for the bereaved family.",
    giftGuidelines: [
      "Cash is the most common and practical gift",
      "Food hampers help feed mourners",
      "Flowers are appropriate for the service",
      "Support with practical needs (cooking, cleaning)",
    ],
    budgetRange: "KSh 1,000 - 20,000",
    dos: [
      "Bring cash in a white envelope",
      "Offer practical help (cooking, childcare)",
      "Bring food for the household",
      "Attend the burial if possible",
    ],
    donts: [
      "Don't bring alcohol",
      "Don't wear bright colours (black or dark colours preferred)",
      "Don't make the visit about yourself",
      "Don't leave without offering help",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "food-drink-vouchers",
      "flowers",
      "gourmet-gifts",
    ],
    typicalGifts: [
      "Cash in white envelopes",
      "Food hampers (rice, maize flour, cooking oil)",
      "Flowers",
      "Cooking for the family",
      "Household essentials",
    ],
    etiquette:
      "Visit the home, not just the funeral service. Sit quietly, offer condolences, and leave your contribution. Don't overstay.",
  },
  {
    id: "christening",
    name: "Christening / Naming Ceremony",
    nameLocal: "Sakramenti ya Ubatizo",
    description:
      "The formal naming and blessing of a child, usually within the first few weeks of birth. Family and friends gather to celebrate.",
    giftGuidelines: [
      "Gifts are for the baby and parents",
      "Practical baby items are most welcome",
      "Cash in envelopes is common",
      "Religious items (bibles, crosses) are traditional",
    ],
    budgetRange: "KSh 3,000 - 25,000",
    dos: [
      "Bring gifts wrapped in baby-themed paper",
      "Include something for the parents too",
      "Respect the religious ceremony",
      "Offer prayers and blessings",
    ],
    donts: [
      "Don't bring alcohol to the ceremony",
      "Don't be late to the church service",
      "Don't forget to register your gift",
    ],
    suggestedCategories: [
      "newborn-essentials",
      "baby-toys",
      "baby-keepsakes",
      "personalized-gifts",
    ],
    typicalGifts: [
      "Baby clothes and shoes",
      "Blankets and swaddles",
      "Baby monitors and carriers",
      "Cash gifts",
      "Bibles and religious items",
    ],
    etiquette:
      "Present gifts after the ceremony or during the reception. The baby is presented to the community, and gifts are a sign of blessing.",
  },
  {
    id: "housewarming",
    name: "Housewarming",
    nameLocal: "Kujiwekea Nyumba",
    description:
      "Celebrating when someone moves into a new home. Kenyans bring practical gifts to help them settle in.",
    giftGuidelines: [
      "Practical household items are most appreciated",
      "Kitchen appliances and utensils are common",
      "Cash helps with moving costs",
      "Avoid empty-handed visits",
    ],
    budgetRange: "KSh 2,000 - 20,000",
    dos: [
      "Bring something for the kitchen or living room",
      "Offer to help with setup",
      "Bring food or drinks for the celebration",
      "Respect the home — remove shoes if asked",
    ],
    donts: [
      "Don't bring sharp objects (knives, scissors) — bad omen",
      "Don't bring mirrors for the same reason",
      "Don't criticize the home or decor",
    ],
    suggestedCategories: [
      "kitchen",
      "home-decor",
      "candle-holders-lanterns",
      "hampers-gift-sets",
    ],
    typicalGifts: [
      "Kitchen appliances (blender, toaster)",
      "Cookware sets",
      "Curtains and bedding",
      "Plants",
      "Cash gifts",
    ],
    etiquette:
      "Visit after the family has settled in (not on moving day). Bring a practical gift and stay for a meal if invited.",
  },
  {
    id: "graduation",
    name: "Graduation",
    nameLocal: "Kumaliza Masomo",
    description:
      "Celebrating academic achievement. Family and friends honour the graduate with gifts and congratulations.",
    giftGuidelines: [
      "Gifts that support their next chapter",
      "Cash for job hunting or further studies",
      "Professional items (laptop bag, portfolio)",
      "Experience gifts (travel, dinner)",
    ],
    budgetRange: "KSh 3,000 - 30,000",
    dos: [
      "Bring a card with a heartfelt message",
      "Gift something practical for their career",
      "Offer mentorship if you can",
      "Celebrate their achievement publicly",
    ],
    donts: [
      "Don't bring gifts that imply they need to study more",
      "Don't make it about yourself",
      "Don't forget to congratulate them",
    ],
    suggestedCategories: [
      "personalized-gifts",
      "experience-gifts",
      "clothing-accessories",
      "electronics",
    ],
    typicalGifts: [
      "Cash gifts",
      "Laptop bags and accessories",
      "Watches",
      "Experience vouchers",
      "Professional clothing",
    ],
    etiquette:
      "Present gifts at the graduation ceremony or the celebration party. Focus on encouragement and pride.",
  },
];

export function getCulturalOccasion(id: string): CulturalOccasion | undefined {
  return KENYA_OCCASIONS.find((o) => o.id === id);
}

export function searchCulturalOccasions(query: string): CulturalOccasion[] {
  const q = query.toLowerCase();
  return KENYA_OCCASIONS.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.nameLocal.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q)
  );
}
