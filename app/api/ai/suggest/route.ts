import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "4");

  // Mock AI Logic based on keywords
  let suggestions = [];

  const lowerQ = q.toLowerCase();
  
  if (lowerQ.includes("cooking") || lowerQ.includes("chef") || lowerQ.includes("kitchen")) {
    suggestions = [
      { name: "Premium Cast Iron Skillet Set", price: 8500, image: "" },
      { name: "Artisan Spice Blends Collection", price: 4200, image: "" },
      { name: "Professional Chef Knife", price: 12000, image: "" },
      { name: "Pasta Making Masterclass", price: 6000, image: "" },
    ];
  } else if (lowerQ.includes("tech") || lowerQ.includes("gadget") || lowerQ.includes("geek")) {
    suggestions = [
      { name: "Noise Cancelling Headphones", price: 25000, image: "" },
      { name: "Smart Home Starter Kit", price: 15000, image: "" },
      { name: "Wireless Charging Desk Pad", price: 4500, image: "" },
      { name: "Mechanical Keyboard", price: 18000, image: "" },
    ];
  } else if (lowerQ.includes("relax") || lowerQ.includes("spa") || lowerQ.includes("wellness")) {
    suggestions = [
      { name: "Luxury Spa Day Package", price: 12000, image: "" },
      { name: "Aromatherapy Diffuser & Oils", price: 5500, image: "" },
      { name: "Premium Silk Sleep Set", price: 8000, image: "" },
      { name: "Handcrafted Bath Bombs Box", price: 3500, image: "" },
    ];
  } else {
    // Default suggestions
    suggestions = [
      { name: "Curated Wine & Cheese Hamper", price: 9500, image: "" },
      { name: "Luxury Leather Weekender Bag", price: 18000, image: "" },
      { name: "Personalized Engraved Watch", price: 15000, image: "" },
      { name: "Boutique Coffee Tasting Kit", price: 6000, image: "" },
    ];
  }

  return NextResponse.json({
    suggestions: suggestions.slice(0, limit)
  });
}
