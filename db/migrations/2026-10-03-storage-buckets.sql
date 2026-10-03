-- Migration: storage buckets the app expects
-- Run this on production DB (Postgres)
--
-- Only `products` and `reviews` existed. AccountClient uploads profile pictures
-- to `avatars` with no fallback, so avatar upload failed for everyone. Creating
-- the bucket here is more reliable than relying on the lazy create in
-- app/api/customizations/upload.

BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', true, 2097152,
  ARRAY['image/png','image/jpeg','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customizations', 'customizations', true, 5242880,
  ARRAY['image/png','image/jpeg','image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

COMMIT;

-- Public read policies so getPublicUrl resolves. The upload path is authorised
-- by the application, not by these.
--
--   CREATE POLICY "avatars public read" ON storage.objects
--     FOR SELECT USING (bucket_id = 'avatars');
--
--   CREATE POLICY "customizations public read" ON storage.objects
--     FOR SELECT USING (bucket_id = 'customizations');