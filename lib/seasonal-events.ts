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
  daysBefore: number;
  tags: string[];
  group: "kenyan" | "international" | "religious" | "life";
};

export const SEASONAL_EVENTS: SeasonalEvent[] = [
  // ─── KENYAN NATIONAL HOLIDAYS ───────────────────────────────
  {
    id: "madaraka",
    name: "Madaraka Day",
    nameSw: "Siku ya Madaraka",
    date: "06-01",
    month: 6,
    day: 1,
    categories: ["hampers-gift-sets", "personalized-gifts", "gourmet-gifts"],
    message: "Self-rule, self-pride. Celebrate how far we've come with a gift that says 'I see you, Kenya.'",
    icon: "🇰🇪",
    daysBefore: 7,
    tags: ["national", "kenyan"],
    group: "kenyan",
  },
  {
    id: "mashujaa",
    name: "Mashujaa Day",
    nameSw: "Siku ya Mashujaa",
    date: "10-20",
    month: 10,
    day: 20,
    categories: ["hampers-gift-sets", "personalized-gifts", "experience-gifts"],
    message: "Every family has a hero. Honour the ones who fought for us — and the ones who fight for us daily.",
    icon: "🛡️",
    daysBefore: 7,
    tags: ["national", "kenyan", "family"],
    group: "kenyan",
  },
  {
    id: "utamaduni",
    name: "Utamaduni Day",
    nameSw: "Siku ya Utamaduni",
    date: "10-10",
    month: 10,
    day: 10,
    categories: ["personalized-gifts", "hampers-gift-sets", "gourmet-gifts"],
    message: "Our culture is our strength. Celebrate Kenyan heritage with gifts that tell our story.",
    icon: "🎭",
    daysBefore: 7,
    tags: ["national", "kenyan", "cultural"],
    group: "kenyan",
  },
  {
    id: "jamhuri",
    name: "Jamhuri Day",
    nameSw: "Siku ya Jamhuri",
    date: "12-12",
    month: 12,
    day: 12,
    categories: ["hampers-gift-sets", "personalized-gifts", "gourmet-gifts"],
    message: "Independence day! 60+ years of Kenya. Gift something that screams 'Made in Kenya.'",
    icon: "🇰🇪",
    daysBefore: 7,
    tags: ["national", "kenyan"],
    group: "kenyan",
  },
  {
    id: "labour-day",
    name: "Labour Day",
    nameSw: "Siku ya Wafanyakazi",
    date: "05-01",
    month: 5,
    day: 1,
    categories: ["hampers-gift-sets", "wellness-self-care-hampers", "personalized-gifts"],
    message: "Hard work deserves recognition. Thank the workers in your life — your mum, your shosho, your driver.",
    icon: "⚒️",
    daysBefore: 7,
    tags: ["national", "kenyan", "appreciation"],
    group: "kenyan",
  },
  {
    id: "international-womens",
    name: "International Women's Day",
    nameSw: "Siku ya Kimataifa ya Wanawake",
    date: "03-08",
    month: 3,
    day: 8,
    categories: ["flowers", "jewelry-fine-pieces", "wellness-self-care-hampers", "personalized-gifts"],
    message: "She runs the house, the office, the world. Show up for the women who show up for everyone.",
    icon: "💪",
    daysBefore: 7,
    tags: ["women", "appreciation", "kenyan"],
    group: "kenyan",
  },

  // ─── INTERNATIONAL HOLIDAYS ─────────────────────────────────
  {
    id: "valentines",
    name: "Valentine's Day",
    nameSw: "Siku ya Wapendanao",
    date: "02-14",
    month: 2,
    day: 14,
    categories: ["flowers", "chocolates-sweets-gifts", "jewelry-fine-pieces", "experience-gifts"],
    message: "Love isn't just Feb 14. But since everyone's watching — make it count.",
    icon: "❤️",
    daysBefore: 14,
    tags: ["romantic", "partner"],
    group: "international",
  },
  {
    id: "mothers-day",
    name: "Mother's Day",
    nameSw: "Siku ya Mama",
    date: "05-11",
    month: 5,
    day: 11,
    categories: ["personalized-gifts", "flowers", "wellness-self-care-hampers", "experience-gifts"],
    message: "Mama doesn't want 'just anything.' She wants to know you thought about her. Prove it.",
    icon: "👩",
    daysBefore: 14,
    tags: ["parent", "family"],
    group: "international",
  },
  {
    id: "fathers-day",
    name: "Father's Day",
    nameSw: "Siku ya Baba",
    date: "06-15",
    month: 6,
    day: 15,
    categories: ["experience-gifts", "whisky-spirits-hampers", "gadgets", "personalized-gifts"],
    message: "Dad says 'I don't need anything.' He's lying. Get him that thing he'd never buy himself.",
    icon: "👨",
    daysBefore: 14,
    tags: ["parent", "family"],
    group: "international",
  },
  {
    id: "christmas",
    name: "Christmas",
    nameSw: "Krismasi",
    date: "12-25",
    month: 12,
    day: 25,
    categories: ["christmas", "hampers-gift-sets", "chocolates-sweets-gifts", "experience-gifts"],
    message: "Kenyans don't do Christmas small. Big hampers, bigger love, biggest family gatherings.",
    icon: "🎄",
    daysBefore: 30,
    tags: ["holiday", "family", "friends"],
    group: "international",
  },
  {
    id: "new-year",
    name: "New Year",
    nameSw: "Mwaka Mpya",
    date: "01-01",
    month: 1,
    day: 1,
    categories: ["experience-gifts", "wellness-self-care-hampers", "hampers-gift-sets"],
    message: "New year, new vibes. Start 2026 with intention — gift something meaningful.",
    icon: "🎆",
    daysBefore: 14,
    tags: ["holiday", "new beginnings"],
    group: "international",
  },
  {
    id: "easter",
    name: "Easter",
    nameSw: "Pasaka",
    date: "04-20",
    month: 4,
    day: 20,
    categories: ["chocolates-sweets-gifts", "kids-baby-gifts", "hampers-gift-sets"],
    message: "Easter is family time. Chocolate hampers for the kids, something special for the folks.",
    icon: "🐣",
    daysBefore: 14,
    tags: ["religious", "family"],
    group: "religious",
  },

  // ─── RELIGIOUS / CULTURAL ───────────────────────────────────
  {
    id: "eid-al-fitr",
    name: "Eid al-Fitr",
    nameSw: "Eid el-Fitr",
    date: "03-30", // Approximate — varies by lunar calendar
    month: 3,
    day: 30,
    categories: ["hampers-gift-sets", "chocolates-sweets-gifts", "personalized-gifts", "gourmet-gifts"],
    message: "Eid Mubarak! After a month of reflection, celebrate with sweets, gifts, and joy.",
    icon: "🌙",
    daysBefore: 7,
    tags: ["religious", "muslim", "family"],
    group: "religious",
  },
  {
    id: "eid-al-adha",
    name: "Eid al-Adha",
    nameSw: "Eid el-Adha",
    date: "06-06", // Approximate — varies by lunar calendar
    month: 6,
    day: 6,
    categories: ["hampers-gift-sets", "gourmet-gifts", "wine-whiskey-beverage-hampers", "personalized-gifts"],
    message: "Eid Mubarak! A time of sacrifice and generosity. Share the blessing with loved ones.",
    icon: "🕌",
    daysBefore: 7,
    tags: ["religious", "muslim", "family"],
    group: "religious",
  },
  {
    id: "diwali",
    name: "Diwali",
    nameSw: "Diwali",
    date: "10-20", // Approximate — varies
    month: 10,
    day: 20,
    categories: ["chocolates-sweets-gifts", "hampers-gift-sets", "personalized-gifts", "candles"],
    message: "Happy Diwali! Light up someone's world with sweets and thoughtful gifts.",
    icon: "🪔",
    daysBefore: 7,
    tags: ["religious", "hindu", "family"],
    group: "religious",
  },

  // ─── LIFE MOMENTS ───────────────────────────────────────────
  {
    id: "school-opening",
    name: "School Opening",
    nameSw: "Fungua Shule",
    date: "01-06",
    month: 1,
    day: 6,
    categories: ["kids-baby-gifts", "early-education-toys", "books-magazines-gifts"],
    message: "New term, new energy. Gift the kids something that makes them excited to learn.",
    icon: "📚",
    daysBefore: 10,
    tags: ["kids", "education"],
    group: "life",
  },
  {
    id: "ruracio-season",
    name: "Ruracio Season",
    nameSw: "Msimu wa Ruracio",
    date: "11-15",
    month: 11,
    day: 15,
    categories: ["hampers-gift-sets", "wine-whiskey-beverage-hampers", "personalized-gifts"],
    message: "Engagement season is here! The families are meeting — bring the right gifts.",
    icon: "💍",
    daysBefore: 21,
    tags: ["cultural", "wedding", "kenyan"],
    group: "life",
  },
  {
    id: "festive-season",
    name: "Festive Season",
    nameSw: "Msimu wa Sherehe",
    date: "12-15",
    month: 12,
    day: 15,
    categories: ["hampers-gift-sets", "wine-whiskey-beverage-hampers", "chocolates-sweets-gifts"],
    message: "December in Nairobi hits different. Corporate hampers, family gifts, end-of-year vibes.",
    icon: "🥂",
    daysBefore: 21,
    tags: ["corporate", "family", "holiday"],
    group: "life",
  },
];

export function getUpcomingEvents(withinDays: number = 30): SeasonalEvent[] {
  const now = new Date();
  const upcoming: SeasonalEvent[] = [];

  for (const event of SEASONAL_EVENTS) {
    const thisYear = now.getFullYear();
    const eventDate = new Date(thisYear, event.month - 1, event.day);

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

  upcoming.sort((a, b) => a.daysBefore - b.daysBefore);
  return upcoming;
}

export function getEventsByGroup(group: SeasonalEvent["group"]): SeasonalEvent[] {
  return SEASONAL_EVENTS.filter((e) => e.group === group);
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
  if (hour < 8 || hour > 21) return false;
  return true;
}
