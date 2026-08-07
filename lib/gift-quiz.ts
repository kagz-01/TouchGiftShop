export type QuizAnswer = {
  recipient: string;
  occasion: string;
  budget: string;
  interests: string[];
};

export type QuizRecommendation = {
  categories: string[];
  message: string;
};

// Maps quiz answers to recommended categories
export function getRecommendation(answers: QuizAnswer): QuizRecommendation {
  const { recipient, occasion, budget, interests } = answers;

  // Base categories from recipient
  const baseCategories: string[] = [];

  if (recipient === "her") {
    baseCategories.push("for-her", "flowers", "jewelry-fine-pieces", "luxury-perfumes-fragrance-collection");
  } else if (recipient === "him") {
    baseCategories.push("for-him", "watches-timepieces", "wallets-cardholders", "grooming-gift-sets");
  } else if (recipient === "couple") {
    baseCategories.push("weddings", "anniversaries", "date-night", "experience-gifts");
  } else if (recipient === "parents") {
    baseCategories.push("anniversaries", "home-lifestyle", "wellness-self-care-hampers", "experience-gifts");
  } else if (recipient === "child") {
    baseCategories.push("kids-baby-gifts", "early-education-toys", "board-games-puzzles");
  } else if (recipient === "baby") {
    baseCategories.push("baby-shower-gifts", "newborn-essentials", "kids-baby-gifts");
  } else if (recipient === "colleague") {
    baseCategories.push("corporate", "personalized-gifts", "gourmet-gifts");
  } else if (recipient === "friend") {
    baseCategories.push("just-because", "hampers-gift-sets", "chocolates-sweets-gifts");
  }

  // Add occasion-based categories
  if (occasion === "birthday") {
    baseCategories.push("birthdays", "balloons-gifts", "chocolates-sweets-gifts");
  } else if (occasion === "wedding") {
    baseCategories.push("weddings", "wedding-gifts", "home-lifestyle");
  } else if (occasion === "anniversary") {
    baseCategories.push("anniversaries", "romantic-gifts", "flowers");
  } else if (occasion === "baby-shower") {
    baseCategories.push("baby-shower-gifts", "newborn-essentials");
  } else if (occasion === "graduation") {
    baseCategories.push("graduation-gifts", "personalized-gifts", "tech-gadgets");
  } else if (occasion === "valentines") {
    baseCategories.push("valentines-day-gifts", "flowers", "chocolates-sweets-gifts");
  } else if (occasion === "christmas") {
    baseCategories.push("christmas-gifts", "hampers-gift-sets", "stocking-fillers");
  } else if (occasion === "thank-you") {
    baseCategories.push("thank-you-gifts", "flowers", "hampers-gift-sets");
  } else if (occasion === "just-because") {
    baseCategories.push("just-because", "thinking-of-you");
  }

  // Add interest-based categories
  if (interests.includes("food")) {
    baseCategories.push("gourmet-gifts", "chocolates-sweets-gifts", "hampers-gift-sets");
  }
  if (interests.includes("wellness")) {
    baseCategories.push("spa-experience-vouchers", "wellness-self-care-hampers", "bath-body-gifts");
  }
  if (interests.includes("fashion")) {
    baseCategories.push("fashion-accessories", "scarves-wraps-shawls", "sunglasses-fashion-essentials");
  }
  if (interests.includes("tech")) {
    baseCategories.push("tech-gadgets", "smart-home-gifts");
  }
  if (interests.includes("books")) {
    baseCategories.push("books-magazines-gifts", "personalized-journals-notebooks");
  }
  if (interests.includes("home")) {
    baseCategories.push("home-lifestyle", "candles-diffusers", "kitchen-gadgets");
  }
  if (interests.includes("experience")) {
    baseCategories.push("experience-gifts", "spa-experience-vouchers", "adventure-experiences");
  }

  // Budget filtering
  let budgetMessage = "";
  if (budget === "under-2k") {
    budgetMessage = "budget-friendly picks under KSh 2,000";
  } else if (budget === "2k-5k") {
    budgetMessage = "quality gifts between KSh 2,000 and 5,000";
  } else if (budget === "5k-10k") {
    budgetMessage = "premium gifts between KSh 5,000 and 10,000";
  } else if (budget === "10k+") {
    budgetMessage = "luxury gifts over KSh 10,000";
  } else {
    budgetMessage = "gifts at every price point";
  }

  // Build recommendation message
  const recipientName = recipient === "her" ? "her"
    : recipient === "him" ? "him"
    : recipient === "couple" ? "the couple"
    : recipient === "parents" ? "your parents"
    : recipient === "child" ? "them"
    : recipient === "baby" ? "the little one"
    : recipient === "colleague" ? "your colleague"
    : "your friend";

  const message = `We found ${budgetMessage} perfect for ${recipientName}${occasion !== "any" ? ` on ${occasion.replace("-", " ")}` : ""}.`;

  // Remove duplicates and limit to 8 categories
  const uniqueCategories = [...new Set(baseCategories)].slice(0, 8);

  return {
    categories: uniqueCategories,
    message,
  };
}
