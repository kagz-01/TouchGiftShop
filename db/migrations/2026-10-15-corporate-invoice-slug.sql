-- ─────────────────────────────────────────────────────────────────────────────
-- URL-safe invoice references
--
-- An invoice number is TLB/2026/1005, and a single dynamic route segment cannot
-- hold slashes: Next decodes %2F before matching, so /invoices/TLB%2F2026%2F1005
-- arrives as three segments and 404s. The printed document keeps its slashes;
-- links, emails and the portal use a dash form instead.
--
-- Split from the invoices migration rather than edited into it, because that
-- one has already been applied — an amended file that is recorded as run is a
-- lie the migration tool cannot detect.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE corporate_invoices
  ADD COLUMN IF NOT EXISTS invoice_slug TEXT UNIQUE;

-- Existing invoices get their slug now. Nullable deliberately: an invoice
-- issued before this migration still needs a row here, and backfilling by hand
-- is safer than leaving the portal unable to link to it at all.
UPDATE corporate_invoices
SET invoice_slug = regexp_replace(
  regexp_replace(
    regexp_replace(invoice_number, '[^A-Za-z0-9]+', '-', 'g'),
    '-+', '-', 'g'
  ),
  '^-|-$', '', 'g'
)
WHERE invoice_slug IS NULL;
