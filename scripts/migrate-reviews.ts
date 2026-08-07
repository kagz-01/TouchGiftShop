/**
 * Run reviews schema migration via direct PostgreSQL connection.
 * npx tsx scripts/migrate-reviews.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import postgres from "postgres";

config({ path: resolve(__dirname, "../.env.local") });

const sql = postgres(process.env.DIRECT_DATABASE_URL!);

const MIGRATION = `
CREATE TYPE review_status_enum AS ENUM ('pending', 'approved', 'flagged', 'rejected');

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    body TEXT,
    reviewer_name VARCHAR(100) NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    status review_status_enum DEFAULT 'approved',
    seller_reply TEXT,
    seller_replied_at TIMESTAMPTZ,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    voter_ip INET NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(review_id, voter_ip)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_order_id ON reviews(order_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_review_media_review_id ON review_media(review_id);
CREATE INDEX idx_review_votes_review_id ON review_votes(review_id);

CREATE OR REPLACE FUNCTION increment_helpful_count(review_id_param UUID)
RETURNS VOID AS $$
  UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = review_id_param;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION decrement_helpful_count(review_id_param UUID)
RETURNS VOID AS $$
  UPDATE reviews SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = review_id_param;
$$ LANGUAGE sql;
`;

async function main() {
  console.log("Connecting to database...");

  const statements = MIGRATION.split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  let success = 0;
  let failed = 0;

  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
      success++;
      const preview = stmt.substring(0, 55).replace(/\n/g, " ");
      console.log(`  ✓ ${preview}...`);
    } catch (err: any) {
      if (err.message?.includes("already exists")) {
        success++;
        console.log(`  ✓ (already exists)`);
      } else {
        failed++;
        console.error(`  ✗ ${err.message}`);
      }
    }
  }

  await sql.end();
  console.log(`\nDone: ${success} succeeded, ${failed} failed.`);
}

main();
