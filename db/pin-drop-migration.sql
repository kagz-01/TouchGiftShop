-- Pin Drop feature migration
-- Run this in Supabase SQL Editor to add pin-drop support to the orders table.
-- https://supabase.com/dashboard/project/vuspfwmhqgbddosauvtj/sql/new

-- Add pin-drop columns (IF NOT EXISTS for safe re-runs)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pin_drop_token VARCHAR(64) UNIQUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10,8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11,8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_landmark TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_time_window VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_pin_requested BOOLEAN DEFAULT FALSE;

-- Index for token lookups (the pin-drop API validates token on every request)
CREATE INDEX IF NOT EXISTS idx_orders_pin_drop_token ON orders(pin_drop_token);

-- Enable real-time on the orders table so senders get live updates
-- when the recipient drops their pin.
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
