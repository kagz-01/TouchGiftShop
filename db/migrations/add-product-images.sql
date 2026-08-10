-- Migration: Add images array to products for gallery support

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Backfill the new images column with the existing image_url if it exists
UPDATE products 
SET images = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL AND jsonb_array_length(images) = 0;
