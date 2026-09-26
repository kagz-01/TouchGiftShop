// Supabase Storage renders images on demand:
//   /storage/v1/object/public/<bucket>/<path>            → original file
//   /storage/v1/render/image/public/<bucket>/<path>?...  → resized re-encode
//
// measured on 6 real product images (raw webp → width=640&quality=75&format=webp):
//   745,652 B → 181,406 B   (-76%), cache-control: public, max-age=3600
//
// We keep images.unoptimized = true in next.config.js (so nothing goes through
// /_next/image) and rewrite the URL at the data layer instead — one helper,
// every consumer benefits.

const OBJECT_PATH = "/storage/v1/object/public/";
const RENDER_PATH = "/storage/v1/render/image/public/";

/** Bucket we are allowed to re-encode. Everything else is passed through. */
const OPTIMIZED_BUCKET = "products";

function isTransformable(url: string): boolean {
  const objectIdx = url.indexOf(OBJECT_PATH);
  if (objectIdx === -1) return false;
  if (url.includes(RENDER_PATH)) return false;
  const rest = url.slice(objectIdx + OBJECT_PATH.length);
  const bucket = rest.split("/")[0];
  return bucket === OPTIMIZED_BUCKET;
}

/**
 * Rewrite a Supabase storage URL to the on-demand render endpoint.
 * Returns the input unchanged for anything that is not a product image.
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  width = 640
): string | null | undefined {
  if (!url || !isTransformable(url)) return url;
  const [path, query] = url.split("?");
  if (query && /(^|&)width=/.test(query)) return url;
  return `${path.replace(OBJECT_PATH, RENDER_PATH)}?width=${width}&quality=75&format=webp`;
}

/** Rewrite every string entry of an `images` array, leaving other types alone. */
export function optimizeImageArray<T>(images: T[] | undefined, width = 640): T[] | undefined {
  if (!images) return images;
  return images.map((img) =>
    typeof img === "string" ? ((optimizeImageUrl(img, width) ?? img) as T) : img
  );
}

function optimizeImageList(
  images: unknown,
  width: number
): unknown {
  if (!Array.isArray(images)) return images;
  return images.map((img) => (typeof img === "string" ? optimizeImageUrl(img, width) ?? img : img));
}

/**
 * Rewrite `image_url` and the `images` array in place on a product-like row.
 * Safe to call on rows from other tables — unmatched URLs are left alone.
 */
export function optimizeProductImages<T extends { image_url?: string | null; images?: unknown }>(
  row: T | null | undefined,
  width = 640
): T | null | undefined {
  if (!row) return row;
  row.image_url = optimizeImageUrl(row.image_url, width);
  if (row.images !== undefined) row.images = optimizeImageList(row.images, width);
  return row;
}

/** Same, for an array of rows. */
export function optimizeProductImagesList<T extends { image_url?: string | null; images?: unknown }>(
  rows: T[] | null | undefined,
  width = 640
): T[] | null | undefined {
  if (!rows) return rows;
  for (const row of rows) optimizeProductImages(row, width);
  return rows;
}
