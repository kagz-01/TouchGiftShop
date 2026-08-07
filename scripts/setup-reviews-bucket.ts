/**
 * Run once to create the 'reviews' storage bucket.
 * npx tsx scripts/setup-reviews-bucket.ts
 */
import { supabaseAdmin } from "@/lib/supabase";

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
