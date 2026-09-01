export type GiftingContext = {
  urgency: "now" | "today" | "this-week" | "no-rush";
  mood?: "stressed" | "celebrating" | "romantic" | "grateful" | "sympathy" | "just-because";
  relationship: "partner" | "parent" | "friend" | "colleague" | "child" | "baby" | "client";
  occasion: string;
  timeOfDay?: "morning" | "afternoon" | "evening";
};

type SmartSuggestion = {
  categories: string[];
  message: string;
  tags: string[];
};

// Map context to smart suggestions
export function getSmartSuggestions(ctx: GiftingContext): SmartSuggestion {
  const tags: string[] = [];
  let categories: string[] = [];
  let message = "";

  // 1. Urgency filtering (B3: Last-minute genius)
  if (ctx.urgency === "now") {
    tags.push("same-day");
    message = "Gifts available for same-day delivery in Nairobi. Order now for fast delivery!";
    categories = [...categories, "same-day-delivery"];
  } else if (ctx.urgency === "today") {
    tags.push("express");
    message = "Express delivery available — your gift arrives tomorrow.";
    categories = [...categories, "express-delivery"];
  }

  // 2. Mood-based suggestions (B4)
  const moodMap: Record<string, { categories: string[]; message: string }> = {
    stressed: {
      categories: ["spa-experience-vouchers", "wellness-self-care-hampers", "candle-holders-lanterns", "bath-body-gifts"],
      message: "They need to unwind. Here are gifts that say 'take a break'.",
    },
    celebrating: {
      categories: ["wine-whiskey-beverage-hampers", "chocolates-sweets-gifts", "flowers", "experience-gifts"],
      message: "Time to celebrate! Champagne, flowers, and sweet treats.",
    },
    romantic: {
      categories: ["flowers", "jewelry-fine-pieces", "chocolates-sweets-gifts", "experience-gifts"],
      message: "Set the mood with romantic gifts they'll cherish.",
    },
    grateful: {
      categories: ["personalized-gifts", "hampers-gift-sets", "flowers", "greeting-cards-note-cards"],
      message: "Show your appreciation with a thoughtful, personal gift.",
    },
    sympathy: {
      categories: ["flowers", "hampers-gift-sets", "greeting-cards-note-cards", "candle-holders-lanterns"],
      message: "Something gentle to show you care during this time.",
    },
    "just-because": {
      categories: ["just-because", "chocolates-sweets-gifts", "flowers", "personalized-gifts"],
      message: "No occasion needed. Just because is the best reason.",
    },
  };

  if (ctx.mood && moodMap[ctx.mood]) {
    const mood = moodMap[ctx.mood];
    categories = [...categories, ...mood.categories];
    if (!message) message: mood.message;
    tags.push(`mood-${ctx.mood}`);
  }

  // 3. Relationship-aware (B5)
  const relMap: Record<string, { categories: string[]; avoid: string[]; tags: string[] }> = {
    partner: {
      categories: ["jewelry-fine-pieces", "experience-gifts", "flowers", "luxury-perfumes-fragrance-collection"],
      avoid: ["corporate", "funny-novelties"],
      tags: ["romantic", "premium"],
    },
    parent: {
      categories: ["home-lifestyle", "wellness-self-care-hampers", "experience-gifts", "personalized-gifts"],
      avoid: ["party-supplies"],
      tags: ["respectful", "thoughtful"],
    },
    friend: {
      categories: ["chocolates-sweets-gifts", "hampers-gift-sets", "experience-gifts", "books-magazines-gifts"],
      avoid: ["jewelry-fine-pieces"],
      tags: ["fun", "casual"],
    },
    colleague: {
      categories: ["personalized-gifts", "hampers-gift-sets", "gourmet-gifts", "greeting-cards-note-cards"],
      avoid: ["romantic", "intimate"],
      tags: ["professional", "safe"],
    },
    child: {
      categories: ["kids-baby-gifts", "early-education-toys", "board-games-puzzles", "books-magazines-gifts"],
      avoid: ["wine-whiskey-beverage-hampers", "luxury-perfumes-fragrance-collection"],
      tags: ["age-appropriate", "fun"],
    },
    baby: {
      categories: ["newborn-essentials", "baby-toys", "baby-keepsakes", "baby-shower-gifts"],
      avoid: ["adult", "fragile"],
      tags: ["safe", "practical"],
    },
    client: {
      categories: ["hampers-gift-sets", "corporate", "wine-whiskey-beverage-hampers", "personalized-gifts"],
      avoid: ["romantic", "intimate", "funny"],
      tags: ["professional", "premium"],
    },
  };

  const rel = relMap[ctx.relationship] || relMap.friend;
  categories = [...categories, ...rel.categories];
  tags.push(...rel.tags);

  // Remove duplicates
  categories = [...new Set(categories)];

  // Default message if none set
  if (!message) {
    message: `Great gifts for your ${ctx.relationship} on this ${ctx.occasion.replace("-", " ")}.`;
  }

  return { categories, message, tags };
}

// Time-aware suggestions
export function getTimeContext(): { timeOfDay: "morning" | "afternoon" | "evening"; suggestion: string } {
  const hour = new Date().getHours();

  if (hour < 12) {
    return {
      timeOfDay: "morning",
      suggestion: "Good morning! Planning ahead? We've got you covered.",
    };
  } else if (hour < 17) {
    return {
      timeOfDay: "afternoon",
      suggestion: "Afternoon! Same-day delivery available in Nairobi.",
    };
  } else {
    return {
      timeOfDay: "evening",
      suggestion: "Evening! Order now for tomorrow's delivery.",
    };
  }
}
