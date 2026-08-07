export type CulturalOccasion = {
  id: string;
  name: string;
  nameLocal: string;
  community: string; // "all" | "kikuyu" | "luo" | "kalenjin" | "maasai" | "coastal" | "luhya" | "meru"
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
  // ─── UNIVERSAL (all communities) ────────────────────────────
  {
    id: "ruracio",
    name: "Ruracio (Engagement)",
    nameLocal: "Ruracio",
    community: "all",
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
    community: "all",
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
    id: "funeral",
    name: "Funeral / Condolence",
    nameLocal: "Mazishi",
    community: "all",
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
    community: "all",
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
    community: "all",
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
    community: "all",
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

  // ─── KIKUYU ─────────────────────────────────────────────────
  {
    id: "irua",
    name: "Irua (Circumcision)",
    nameLocal: "Irua",
    community: "kikuyu",
    description:
      "The Kikuyu rite of passage marking the transition to adulthood. A significant community event with specific protocols.",
    giftGuidelines: [
      "Gifts are for the initiate (mururuti)",
      "Cash in envelopes is the standard gift",
      "Clothes and shoes for the new adult",
      "Respect the family's specific customs",
    ],
    budgetRange: "KSh 5,000 - 30,000",
    dos: [
      "Bring cash in a clean envelope",
      "Gift practical items for adulthood",
      "Respect the ceremony timing",
      "Congratulate the family publicly",
    ],
    donts: [
      "Don't discuss the ceremony details outside the family",
      "Don't arrive late",
      "Don't bring gifts that mock the process",
    ],
    suggestedCategories: [
      "personalized-gifts",
      "clothing-accessories",
      "books-magazines-gifts",
      "hampers-gift-sets",
    ],
    typicalGifts: [
      "Cash gifts",
      "New clothes and shoes",
      "Watches and accessories",
      "School supplies",
      "Food hampers",
    ],
    etiquette:
      "Gifts are presented after the ceremony. The initiate may receive guests individually. Respect the family's specific timeline.",
  },
  {
    id: "kikuyu-wedding",
    name: "Kikuyu Wedding",
    nameLocal: "Ruracio na Ngurario",
    community: "kikuyu",
    description:
      "The Kikuyu wedding process involves multiple stages: ruracio (introduction), ngurario (main wedding), and various ceremonies in between.",
    giftGuidelines: [
      "Each stage has its own gift expectations",
      "Ruracio: household items, food hampers for the bride's family",
      "Ngurario: cash gifts for the couple",
      "The more stages you attend, the more gifts expected",
    ],
    budgetRange: "KSh 5,000 - 50,000 per stage",
    dos: [
      "Attend as many stages as invited",
      "Give cash gifts in envelopes",
      "Bring food items for communal cooking",
      "Respect the elders' guidance",
    ],
    donts: [
      "Don't skip ruracio if invited — it's disrespectful",
      "Don't bring alcohol unless specifically asked",
      "Don't argue about gift amounts",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "wine-whiskey-beverage-hampers",
      "personalized-gifts",
      "household",
    ],
    typicalGifts: [
      "Tea, sugar, cooking oil hampers",
      "Cash gifts",
      "Household items",
      "Clothes for the bride",
      "Food contributions",
    ],
    etiquette:
      "Follow the lead of the family spokesperson. Present gifts in order of seniority. Be prepared for multiple ceremonies.",
  },

  // ─── LUO ────────────────────────────────────────────────────
  {
    id: "luo-dowry",
    name: "Luo Dowry",
    nameLocal: "Mag",
    community: "luo",
    description:
      "The Luo dowry process (mag) is a multi-day negotiation between families. It involves specific rituals and gift exchanges.",
    giftGuidelines: [
      "The negotiation is led by family representatives (nyuol)",
      "Gifts include livestock, cash, and household items",
      "The process can take several days",
      "Each family has specific requirements",
    ],
    budgetRange: "KSh 100,000 - 500,000+",
    dos: [
      "Send representatives who can negotiate well",
      "Bring what was agreed upon",
      "Be patient — the process is thorough",
      "Show respect to the bride's family",
    ],
    donts: [
      "Don't try to rush the negotiation",
      "Don't send unprepared representatives",
      "Don't argue publicly",
      "Don't skip any agreed-upon gifts",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "household",
      "wine-whiskey-beverage-hampers",
      "personalized-gifts",
    ],
    typicalGifts: [
      "Livestock (cows, goats, sheep)",
      "Cash payment",
      "Household items",
      "Clothes for the bride and her family",
      "Food and drinks for the celebration",
    ],
    etiquette:
      "The negotiation is formal and led by elders. The groom's family must be patient and respectful. Gifts are presented publicly after agreement.",
  },
  {
    id: "luo-funeral",
    name: "Luo Funeral Customs",
    nameLocal: "Chinjiko",
    community: "luo",
    description:
      "Luo funerals are major community events. The community rallies to support the bereaved family with food, cash, and presence.",
    giftGuidelines: [
      "Cash is the primary gift — given to the family",
      "Food contributions for the funeral feast",
      "Attend the burial if possible — presence matters",
      "Support with logistics (cooking, setup)",
    ],
    budgetRange: "KSh 2,000 - 30,000",
    dos: [
      "Bring cash in an envelope",
      "Contribute food or drinks",
      "Stay for the entire ceremony if possible",
      "Help with practical tasks",
    ],
    donts: [
      "Don't leave early — it's disrespectful",
      "Don't bring alcohol during mourning",
      "Don't wear bright colours",
      "Don't make the visit about yourself",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "food-drink-vouchers",
      "flowers",
      "gourmet-gifts",
    ],
    typicalGifts: [
      "Cash contributions",
      "Food hampers (rice, flour, cooking oil)",
      "Drinks for the funeral feast",
      "Flowers",
      "Household essentials",
    ],
    etiquette:
      "Luo funerals are community events. Stay for the duration, help with tasks, and contribute to the collective support.",
  },

  // ─── KALENJIN ───────────────────────────────────────────────
  {
    id: "kalenjin-circumcision",
    name: "Kalenjin Circumcision",
    nameLocal: "Saket Ap Kipkoitoi",
    community: "kalenjin",
    description:
      "The Kalenjin rite of passage marking the transition to adulthood. Traditionally done in groups during specific seasons.",
    giftGuidelines: [
      "Gifts are for the initiate and the family",
      "Cash gifts are standard",
      "Practical items for the new adult",
      "Respect the traditional timing",
    ],
    budgetRange: "KSh 5,000 - 25,000",
    dos: [
      "Bring cash in envelopes",
      "Gift items useful for adulthood",
      "Respect the family's customs",
      "Congratulate the initiate",
    ],
    donts: [
      "Don't discuss the ceremony outside the family",
      "Don't arrive late",
      "Don't bring inappropriate gifts",
    ],
    suggestedCategories: [
      "personalized-gifts",
      "clothing-accessories",
      "hampers-gift-sets",
      "electronics",
    ],
    typicalGifts: [
      "Cash gifts",
      "Clothes and shoes",
      "Watches",
      "School supplies",
      "Food hampers",
    ],
    etiquette:
      "Gifts are presented after the ceremony. The initiate is treated with new respect — they are now adults.",
  },
  {
    id: "kalenjin-wedding",
    name: "Kalenjin Wedding",
    nameLocal: "Kokwet",
    community: "kalenjin",
    description:
      "Kalenjin weddings involve specific traditions including the bride price negotiation and the wedding ceremony itself.",
    giftGuidelines: [
      "Bride price includes livestock and cash",
      "The negotiation is led by family elders",
      "Gifts for the bride's family are expected",
      "The wedding celebration involves the whole community",
    ],
    budgetRange: "KSh 30,000 - 200,000+",
    dos: [
      "Send family representatives for negotiation",
      "Bring agreed-upon gifts",
      "Contribute to the celebration",
      "Respect the elders' decisions",
    ],
    donts: [
      "Don't try to negotiate alone",
      "Don't skip the traditional process",
      "Don't bring gifts that disrespect the culture",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "household",
      "wine-whiskey-beverage-hampers",
      "personalized-gifts",
    ],
    typicalGifts: [
      "Livestock",
      "Cash gifts",
      "Household items",
      "Clothes for the bride",
      "Food and drinks",
    ],
    etiquette:
      "Follow the lead of the family elders. The process is formal and should be treated with respect.",
  },

  // ─── MAASAI ─────────────────────────────────────────────────
  {
    id: "eunoto",
    name: "Eunoto (Warrior Graduation)",
    nameLocal: "Eunoto",
    community: "maasai",
    description:
      "The Maasai ceremony where warriors (moran) graduate to junior elders. A major community celebration with specific gift expectations.",
    giftGuidelines: [
      "Gifts are for the graduating warrior and family",
      "Livestock is the most traditional gift",
      "Cash gifts are increasingly common",
      "Food contributions for the celebration",
    ],
    budgetRange: "KSh 10,000 - 50,000",
    dos: [
      "Bring livestock if possible (cows, goats)",
      "Contribute food for the celebration",
      "Respect the traditional ceremonies",
      "Stay for the duration of the event",
    ],
    donts: [
      "Don't interfere with the traditional ceremonies",
      "Don't bring alcohol during the ceremony",
      "Don't wear inappropriate clothing",
      "Don't leave early",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "gourmet-gifts",
      "personalized-gifts",
      "household",
    ],
    typicalGifts: [
      "Livestock (cows, goats, sheep)",
      "Cash gifts",
      "Food contributions",
      "Household items",
      "Clothes for the warrior",
    ],
    etiquette:
      "The ceremony is led by elders. Respect the traditional protocols and stay for the entire event.",
  },
  {
    id: "enkipeata",
    name: "Enkipaata (Circumcision)",
    nameLocal: "Enkipaata",
    community: "maasai",
    description:
      "The Maasai circumcision ceremony marking the transition to warriorhood. A deeply traditional event with specific protocols.",
    giftGuidelines: [
      "Gifts are for the initiate and family",
      "Livestock is the most valued gift",
      "Cash gifts are acceptable",
      "Food contributions for the community feast",
    ],
    budgetRange: "KSh 5,000 - 30,000",
    dos: [
      "Bring livestock or cash",
      "Contribute food for the feast",
      "Respect the traditional ceremonies",
      "Stay for the duration",
    ],
    donts: [
      "Don't interfere with the ceremonies",
      "Don't bring alcohol",
      "Don't wear inappropriate clothing",
      "Don't leave early",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "gourmet-gifts",
      "personalized-gifts",
      "household",
    ],
    typicalGifts: [
      "Livestock",
      "Cash gifts",
      "Food contributions",
      "Household items",
      "Clothes for the initiate",
    ],
    etiquette:
      "Follow the guidance of the elders. The ceremony is sacred and should be treated with utmost respect.",
  },

  // ─── COASTAL / SWAHILI ──────────────────────────────────────
  {
    id: "halwa",
    name: "Halwa Ceremony",
    nameLocal: "Harusi ya Halwa",
    community: "coastal",
    description:
      "The Swahili pre-wedding ceremony where the groom's family presents halwa (sweet confection) and other gifts to the bride's family.",
    giftGuidelines: [
      "Halwa is the centrepiece — order from a reputable supplier",
      "Other sweets and dry fruits are traditional",
      "Cash gifts for the couple",
      "Household items for the new home",
    ],
    budgetRange: "KSh 10,000 - 50,000",
    dos: [
      "Present halwa beautifully wrapped",
      "Include other traditional sweets",
      "Dress in traditional Swahili attire",
      "Respect the Islamic customs if applicable",
    ],
    donts: [
      "Don't come without halwa — it's the main gift",
      "Don't bring alcohol",
      "Don't dress inappropriately",
      "Don't skip the ceremony if invited",
    ],
    suggestedCategories: [
      "chocolates-sweets-gifts",
      "hampers-gift-sets",
      "personalized-gifts",
      "household",
    ],
    typicalGifts: [
      "Halwa (sweet confection)",
      "Dry fruits and nuts",
      "Cash gifts",
      "Household items",
      "Clothes for the bride",
    ],
    etiquette:
      "The ceremony is led by family elders. Present gifts in the traditional order. Respect the Islamic customs.",
  },
  {
    id: "swahili-wedding",
    name: "Swahili Wedding",
    nameLocal: "Harusi",
    community: "coastal",
    description:
      "The Swahili wedding is a grand affair with specific traditions including the nikah (Islamic marriage contract) and the walima (feast).",
    giftGuidelines: [
      "Cash gifts are the most common",
      "Gold jewellery for the bride is traditional",
      "Household items for the new home",
      "Contribute to the walima (feast)",
    ],
    budgetRange: "KSh 10,000 - 100,000+",
    dos: [
      "Dress in traditional Swahili attire",
      "Bring cash gifts in envelopes",
      "Contribute to the walima",
      "Respect the Islamic customs",
    ],
    donts: [
      "Don't bring alcohol",
      "Don't dress inappropriately",
      "Don't skip the nikah if invited",
      "Don't argue about gift amounts",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "jewelry-fine-pieces",
      "personalized-gifts",
      "household",
    ],
    typicalGifts: [
      "Cash gifts",
      "Gold jewellery",
      "Household items",
      "Clothes for the couple",
      "Food contributions",
    ],
    etiquette:
      "The nikah is a religious ceremony — dress modestly and respect the proceedings. The walima is the celebration feast.",
  },

  // ─── LUHYA ──────────────────────────────────────────────────
  {
    id: "luhya-circumcision",
    name: "Luhya Circumcision",
    nameLocal: "Khukhwea",
    community: "luhya",
    description:
      "The Luhya rite of passage marking the transition to adulthood. Traditionally done in groups during specific seasons.",
    giftGuidelines: [
      "Gifts are for the initiate and the family",
      "Cash gifts are standard",
      "Practical items for the new adult",
      "Respect the traditional timing",
    ],
    budgetRange: "KSh 5,000 - 25,000",
    dos: [
      "Bring cash in envelopes",
      "Gift items useful for adulthood",
      "Respect the family's customs",
      "Congratulate the initiate",
    ],
    donts: [
      "Don't discuss the ceremony outside the family",
      "Don't arrive late",
      "Don't bring inappropriate gifts",
    ],
    suggestedCategories: [
      "personalized-gifts",
      "clothing-accessories",
      "hampers-gift-sets",
      "books-magazines-gifts",
    ],
    typicalGifts: [
      "Cash gifts",
      "Clothes and shoes",
      "Watches",
      "School supplies",
      "Food hampers",
    ],
    etiquette:
      "Gifts are presented after the ceremony. The initiate is treated with new respect — they are now adults.",
  },
  {
    id: "luhya-dowry",
    name: "Luhya Dowry",
    nameLocal: "Khukhwea Inachi",
    community: "luhya",
    description:
      "The Luhya dowry process involves negotiation between families with specific gift expectations.",
    giftGuidelines: [
      "The negotiation is led by family elders",
      "Livestock and cash are traditional",
      "Household items for the couple",
      "The process can take several meetings",
    ],
    budgetRange: "KSh 30,000 - 200,000+",
    dos: [
      "Send family representatives",
      "Bring agreed-upon gifts",
      "Be patient with the process",
      "Show respect to the bride's family",
    ],
    donts: [
      "Don't try to rush the negotiation",
      "Don't send unprepared representatives",
      "Don't argue publicly",
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
      "Food and drinks",
    ],
    etiquette:
      "The negotiation is formal and led by elders. The groom's family must be patient and respectful.",
  },

  // ─── MERU ───────────────────────────────────────────────────
  {
    id: "meru-circumcision",
    name: "Meru Circumcision",
    nameLocal: "Kuura",
    community: "meru",
    description:
      "The Meru rite of passage marking the transition to adulthood. A significant community event with specific protocols.",
    giftGuidelines: [
      "Gifts are for the initiate and the family",
      "Cash gifts are standard",
      "Practical items for the new adult",
      "Respect the traditional timing",
    ],
    budgetRange: "KSh 5,000 - 25,000",
    dos: [
      "Bring cash in envelopes",
      "Gift items useful for adulthood",
      "Respect the family's customs",
      "Congratulate the initiate",
    ],
    donts: [
      "Don't discuss the ceremony outside the family",
      "Don't arrive late",
      "Don't bring inappropriate gifts",
    ],
    suggestedCategories: [
      "personalized-gifts",
      "clothing-accessories",
      "hampers-gift-sets",
      "electronics",
    ],
    typicalGifts: [
      "Cash gifts",
      "Clothes and shoes",
      "Watches",
      "School supplies",
      "Food hampers",
    ],
    etiquette:
      "Gifts are presented after the ceremony. The initiate is treated with new respect — they are now adults.",
  },
  {
    id: "meru-wedding",
    name: "Meru Wedding",
    nameLocal: "Kuima",
    community: "meru",
    description:
      "The Meru wedding involves specific traditions including the bride price negotiation and the wedding celebration.",
    giftGuidelines: [
      "Bride price includes livestock and cash",
      "The negotiation is led by family elders",
      "Gifts for the bride's family are expected",
      "The wedding celebration involves the whole community",
    ],
    budgetRange: "KSh 30,000 - 200,000+",
    dos: [
      "Send family representatives for negotiation",
      "Bring agreed-upon gifts",
      "Contribute to the celebration",
      "Respect the elders' decisions",
    ],
    donts: [
      "Don't try to negotiate alone",
      "Don't skip the traditional process",
      "Don't bring gifts that disrespect the culture",
    ],
    suggestedCategories: [
      "hampers-gift-sets",
      "household",
      "wine-whiskey-beverage-hampers",
      "personalized-gifts",
    ],
    typicalGifts: [
      "Livestock",
      "Cash gifts",
      "Household items",
      "Clothes for the bride",
      "Food and drinks",
    ],
    etiquette:
      "Follow the lead of the family elders. The process is formal and should be treated with respect.",
  },
];

export function getCulturalOccasion(id: string): CulturalOccasion | undefined {
  return KENYA_OCCASIONS.find((o) => o.id === id);
}

export function getOccasionsByCommunity(community: string): CulturalOccasion[] {
  return KENYA_OCCASIONS.filter(
    (o) => o.community === community || o.community === "all"
  );
}

export function searchCulturalOccasions(query: string): CulturalOccasion[] {
  const q = query.toLowerCase();
  return KENYA_OCCASIONS.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.nameLocal.toLowerCase().includes(q) ||
      o.description.toLowerCase().includes(q) ||
      o.community.toLowerCase().includes(q)
  );
}

export const COMMUNITIES = [
  { id: "all", label: "All Communities", emoji: "🇰🇪" },
  { id: "kikuyu", label: "Kikuyu", emoji: "🏔️" },
  { id: "luo", label: "Luo", emoji: "🐟" },
  { id: "kalenjin", label: "Kalenjin", emoji: "🏃" },
  { id: "maasai", label: "Maasai", emoji: "🦁" },
  { id: "coastal", label: "Coastal / Swahili", emoji: "🌊" },
  { id: "luhya", label: "Luhya", emoji: "🌽" },
  { id: "meru", label: "Meru", emoji: "⛰️" },
] as const;
