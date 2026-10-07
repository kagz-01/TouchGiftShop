-- E-Commerce Shop Core Tables: Vibe Engine & Blind Gifting

CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  vibe_tags TEXT[] NOT NULL DEFAULT '{}',
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES shop_products(id),
  buyer_id TEXT, -- User ID (if authenticated)
  buyer_email TEXT,
  buyer_phone TEXT,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment', -- pending_payment, pending_address, processing, shipped
  payment_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shop_gift_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES shop_orders(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  recipient_name TEXT,
  recipient_phone TEXT,
  delivery_address TEXT,
  unboxed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Data for Vibe Engine
INSERT INTO shop_products (name, description, price, vibe_tags, media_urls, stock, is_active)
VALUES
('The Sunday Reset Box', 'A curated selection of luxury bath salts, a silk eye mask, and a hand-poured soy candle to reset your week.', 8500, ARRAY['Sunday Reset', 'Relaxation', 'Self-Care'], ARRAY['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=800&auto=format&fit=crop'], 50, true),
('Main Character Energy Kit', 'Start your day like a CEO. Includes a premium leather journal, an artisanal pour-over coffee set, and a sleek matte black pen.', 12000, ARRAY['Main Character Energy', 'Corporate Conqueror', 'Hustle'], ARRAY['https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?q=80&w=800&auto=format&fit=crop'], 30, true),
('The Tech Minimalist Desk Set', 'Declutter your space with this wireless charging walnut desk pad, minimalist aluminum laptop stand, and cable management kit.', 18000, ARRAY['The Tech Minimalist', 'WFH Upgrade', 'Geek'], ARRAY['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800&auto=format&fit=crop'], 20, true),
('Wanderlust Essentials', 'For the frequent flyer. A personalized leather passport holder, noise-isolating travel earbuds, and a luxury silk neck pillow.', 15500, ARRAY['Wanderlust', 'Travel', 'Adventure'], ARRAY['https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop'], 40, true),
('The Midnight Sommelier', 'An exquisite crystal decanter set, twin heavy-base whiskey glasses, and a curated assortment of dark artisan chocolates.', 22000, ARRAY['Evening Wind Down', 'Luxury', 'Celebration'], ARRAY['https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?q=80&w=800&auto=format&fit=crop'], 15, true);
