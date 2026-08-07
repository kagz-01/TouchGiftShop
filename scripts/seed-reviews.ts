/**
 * Seed 5 realistic test reviews via Supabase JS client.
 * Usage: npx tsx scripts/seed-reviews.ts [product-id]
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SEED_REVIEWS = [
  {
    reviewer_name: "Grace Mwangi",
    rating: 5,
    title: "Beautifully wrapped and delivered on time",
    body: "Ordered a birthday hamper for my sister and she loved it! The packaging was beautiful and the delivery was exactly when they said it would be. Will definitely use TouchGift again.",
    is_verified_purchase: true,
    days_ago: 14,
  },
  {
    reviewer_name: "David Ochieng",
    rating: 5,
    title: "Group gifting made easy",
    body: "Used Pool a Gift for my colleague's send-off and it was seamless. Everyone contributed via M-Pesa and the gift arrived perfectly. No awkward cash collection needed. The whole process took 5 minutes.",
    is_verified_purchase: false,
    days_ago: 28,
  },
  {
    reviewer_name: "Amina Hassan",
    rating: 5,
    title: "The AI gift finder actually works",
    body: "I was completely stuck on what to get my husband for our anniversary. The AI Gift Finder recommended the perfect watch and the handwritten note was such a beautiful touch. He was genuinely surprised.",
    is_verified_purchase: true,
    days_ago: 21,
  },
  {
    reviewer_name: "Brian Kipchoge",
    rating: 4,
    title: "Great service, minor delivery delay",
    body: "Ordered flowers for my mum on Mother's Day. The pin drop feature was genius because I did not know her exact address after she moved. Delivery was about an hour late but the flowers were fresh and gorgeous.",
    is_verified_purchase: true,
    days_ago: 45,
  },
  {
    reviewer_name: "Sarah Njeri",
    rating: 5,
    title: "Corporate order handled perfectly",
    body: "Sent personalized hampers to 15 employees for our end-of-year appreciation. Each person got their name on it. The bulk discount was a nice bonus and the CSV upload saved me hours of manual entry.",
    is_verified_purchase: true,
    days_ago: 7,
  },
];

async function main() {
  let targetProductId = process.argv[2];

  if (!targetProductId) {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("in_stock", true)
      .limit(1)
      .single();
    if (!data) {
      console.error("No in-stock products found. Provide a product ID.");
      process.exit(1);
    }
    targetProductId = data.id;
  }

  console.log(`Seeding reviews for product: ${targetProductId}\n`);

  for (const review of SEED_REVIEWS) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - review.days_ago);

    const { error } = await supabase.from("reviews").insert({
      product_id: targetProductId,
      rating: review.rating,
      title: review.title,
      body: review.body,
      reviewer_name: review.reviewer_name,
      is_verified_purchase: review.is_verified_purchase,
      status: "approved",
      created_at: createdAt.toISOString(),
    });

    if (error) {
      console.error(`  ✗ ${review.reviewer_name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${review.reviewer_name} — ${review.rating}★`);
    }
  }

  console.log("\nDone. 5 reviews seeded.");
}

main();
