export type SeasonalEvent = {
  id: string;
  name: string;
  nameSw?: string;
  date: string; // MM-DD format
  month: number;
  day: number;
  categories: string[];
  message: string;
  icon: string;
 daysBefore: number; // Days before to start prompting
  tags: string[];
};

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: "valentines",
    name: "Valentine's Day",
    nameSw: "Siku ya Wapendanao",
    date: "02-14",
    month: 2,
    day: 14,
    categories: ["flowers", "chocolates-sweets-gifts", "jewelry-fine-pieces", "experience-gifts"],
    message: "Valentine's Day is coming up! Show your love with the perfect gift.",
    icon: "❤️",
    daysBefore: 14,
    tags: ["romantic", "partner"],
  },
  {
    id: "mothers-day",
    name: "Mother's Day",
    nameSw: "Siku ya Mama",
    date: "05-11", // Second Sunday of May (approx)
    month: 5,
    day: 11,
    categories: ["personalized-gifts", "flowers", "wellness-self-care-hampers", "experience-gifts"],
    message: "Mother's Day is near! Thank the most important woman in your life.",
    icon: "👩",
    daysBefore: 14,
    tags: ["parent", "family"],
  },
  {
    id: "fathers-day",
    name: "Father's Day",
    nameSw: "Siku ya Baba",
    date: "06-15", // Third Sunday of June (approx)
    month: 6,
    day: 15,
    categories: ["experience-gifts", "whisky-spirits-hampers", "gadgets", "personalized-gifts"],
    message: "Father's Day is coming! Get Dad something he'll actually love.",
    icon: "👨",
    daysBefore: 14,
    tags: ["parent", "family"],
  },
  {
    id: "madaraka",
    name: "Madaraka Day",
    nameSw: "Siku ya Madaraka",
    date: "06-01",
    month: 6,
    day: 1,
    categories: ["hampers-gift-sets", "personalized-gifts", "gourmet-gifts"],
    message: "Celebrate Kenya's independence! Send a patriotic gift.",
    icon: "🇰🇪",
    daysBefore: 7,
    tags: ["national", "kenyan"],
  },
  {
    id: "harambee",
    name: "Harambee Day",
    nameSw: "Siku ya Harambee",
    date: "10-20",
    month: 10,
    day: 20,
    categories: ["hampers-gift-sets", "corporate", "personalized-gifts"],
    message: "Harambee Day! Celebrate unity with thoughtful gifts.",
    icon: "🤲",
    daysBefore: 7,
    tags: ["national", "kenyan", "corporate"],
  },
  {
    id: "jamhuri",
    name: "Jamhuri Day",
    nameSw: "Siku ya Jamhuri",
    date: "12-12",
    month: 12,
    day: 12,
    categories: ["hampers-gift-sets", "personalized-gifts", "gourmet-gifts"],
    message: "Jamhuri Day! Celebrate Kenya's democracy with gifts that unite.",
    icon: "🇰🇪",
    daysBefore: 7,
    tags: ["national", "kenyan"],
  },
  {
    id: "christmas",
    name: "Christmas",
    nameSw: "Krismasi",
    date: "12-25",
    month: 12,
    day: 25,
    categories: ["christmas", "hampers-gift-sets", "chocolates-sweets-gifts", "experience-gifts"],
    message: "Christmas is coming! Spread joy with perfect gifts for everyone.",
    icon: "🎄",
    daysBefore: 30,
    tags: ["holiday", "family", "friends"],
  },
  {
    id: "new-year",
    name: "New Year",
    nameSw: "Mwaka Mpya",
    date: "01-01",
    month: 1,
    day: 1,
    categories: ["experience-gifts", "wellness-self-care-hampers", "hampers-gift-sets"],
    message: "New Year, new gifts! Start the year with thoughtful surprises.",
    icon: "🎆",
    daysBefore: 14,
    tags: ["holiday", "new beginnings"],
  },
  {
    id: "easter",
    name: "Easter",
    nameSw: "Pasaka",
    date: "04-20", // Approximate
    month: 4,
    day: 20,
    categories: ["chocolates-sweets-gifts", "kids-baby-gifts", "hampers-gift-sets"],
    message: "Easter blessings! Chocolate hampers and gifts for the family.",
    icon: "🐣",
    daysBefore: 14,
    tags: ["religious", "family"],
  },
  {
    id: "school-opening",
    name: "School Opening",
    nameSw: "Fungua Shule",
    date: "01-06", // Approximate
    month: 1,
    day: 6,
    categories: ["kids-baby-gifts", "early-education-toys", "books-magazines-gifts"],
    message: "School is opening! Gift useful stationery and learning toys.",
    icon: "📚",
    daysBefore: 10,
    tags: ["kids", "education"],
  },
  {
    id: "ruracio",
    name: "Ruracio Season",
    nameSw: "Msimu wa Ruracio",
    date: "11-15", // Engagement season
    month: 11,
    day: 15,
    categories: ["hampers-gift-sets", "wine-whiskey-beverage-hampers", "personalized-gifts"],
    message: "Ruracio season! Bring the perfect gift for the families.",
    icon: "💍",
    daysBefore: 21,
    tags: ["cultural", "wedding", "kenyan"],
  },
  {
    id: "festive-season",
    name: "Festive Season",
    nameSw: "Msimu wa Sherehe",
    date: "12-15", // December festive
    month: 12,
    day: 15,
    categories: ["hampers-gift-sets", "wine-whiskey-beverage-hampers", "chocolates-sweets-gifts"],
    message: "Festive season is here! Corporate hampers and family gifts.",
    icon: "🥂",
    daysBefore: 21,
    tags: ["corporate", "family", "holiday"],
  },
];

export function getUpcomingEvents(withinDays: number = 30): SeasonalEvent[] {
  const now = new Date();
  const upcoming: SeasonalEvent[] = [];

  for (const event of SEASONAL_EVENTS) {
    const thisYear = now.getFullYear();
    const eventDate = new Date(thisYear, event.month - 1, event.day);

    // If event already passed this year, check next year
    if (eventDate < now) {
      eventDate.setFullYear(thisYear + 1);
    }

    const daysUntil = Math.ceil(
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil <= withinDays && daysUntil > 0) {
      upcoming.push({ ...event, daysBefore: daysUntil });
    }
  }

  // Sort by date (nearest first)
  upcoming.sort((a, b) => a.daysBefore - b.daysBefore);
  return upcoming;
}

export function getEventById(id: string): SeasonalEvent | undefined {
  return SEASONAL_EVENTS.find((e) => e.id === id);
}

export function formatCountdown(days: number): string {
  if (days === 1) return "Tomorrow!";
  if (days <= 7) return `${days} days away`;
  if (days <= 14) return "Next week";
  return `${days} days away`;
}

export function shouldShowPrompt(event: SeasonalEvent): boolean {
  const now = new Date();
  const hour = now.getHours();

  // Don't show during sleeping hours
  if (hour < 8 || hour > 21) return false;

  return true;
}
