/**
 * Run once to create the 'reviews' storage bucket.
 * npx tsx scripts/setup-reviews-bucket.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

config({ path: resolve(__dirname, "../.env.local") });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const BUCKET = "reviews";

  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);

  if (exists) {
    console.log(`Bucket "${BUCKET}" already exists — skipping.`);
    return;
  }

  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    allowedMimeTypes: [
      "image/webp",
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/webm",
    ],
  });

  if (error) {
    console.error("Failed to create bucket:", error.message);
    process.exit(1);
  }

  console.log(`✓ Bucket "${BUCKET}" created (public, 10 MB limit, images + video).`);
}

main();
