-- Create missing corporate tables

CREATE TABLE IF NOT EXISTS corporate_brand_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  brand_color TEXT DEFAULT '#9B1B5A',
  logo_url TEXT,
  custom_domain TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_corporate_brand_configs_user_id ON corporate_brand_configs(user_id);

CREATE TABLE IF NOT EXISTS milestone_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  gift_budget NUMERIC NOT NULL,
  gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  gift_template_id UUID,
  custom_message_template TEXT,
  auto_order BOOLEAN NOT NULL DEFAULT false,
  auto_pool BOOLEAN NOT NULL DEFAULT false,
  notify_hr BOOLEAN NOT NULL DEFAULT true,
  send_whatsapp BOOLEAN NOT NULL DEFAULT true,
  trigger_days_before INTEGER NOT NULL DEFAULT 0,
  trigger_time TIME NOT NULL DEFAULT '09:00:00',
  escalation_enabled BOOLEAN NOT NULL DEFAULT false,
  escalation_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_triggered INTEGER NOT NULL DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS corporate_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corporate_account_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT,
  recipient_phone TEXT,
  department TEXT,
  role TEXT,
  gift_budget NUMERIC,
  gift_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  gift_template_id UUID,
  custom_message TEXT,
  auto_order BOOLEAN NOT NULL DEFAULT false,
  auto_pool BOOLEAN NOT NULL DEFAULT false,
  reminder_days_before INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS corporate_whatsapp_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id TEXT NOT NULL,
  corporate_account_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  trigger_rule TEXT NOT NULL,
  message_template TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_corp_wa_flows_unique ON corporate_whatsapp_flows(corporate_account_id, flow_id);

-- Storage bucket for brand logos (if not exists)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
