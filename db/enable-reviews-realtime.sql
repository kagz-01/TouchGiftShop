-- Run this in Supabase SQL Editor to enable real-time + webhook for reviews.
-- https://supabase.com/dashboard/project/vuspfwmhqgbddosauvtj/sql/new

-- 1. Enable real-time on the reviews table
--    (frontend subscribes to live changes via supabase.channel())
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;

-- 2. (Optional) Create a webhook for server-side notifications
--    Go to: Database → Webhooks → Create webhook
--    Name: review-notifications
--    Table: reviews
--    Events: INSERT
--    URL: https://touch-gift-shop.vercel.app/api/webhooks/reviews
--    HTTP method: POST
--    Secret: (generate one and add to .env.local as SUPABASE_WEBHOOK_SECRET)
