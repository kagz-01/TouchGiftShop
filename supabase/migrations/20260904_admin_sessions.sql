-- Admin sessions table for persistent auth across serverless instances
create table if not exists admin_sessions (
  token text primary key,
  expires_at timestamptz not null
);

-- Auto-cleanup expired sessions (run periodically or on each check)
-- ALTER TABLE admin_sessions ADD CONSTRAINT expires_at_check CHECK (expires_at > now());
