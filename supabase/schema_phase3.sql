-- =============================================================================
-- Ruach Tabernacle — Schema Phase 3
-- Reconcile column names between schema and application code
-- Run AFTER schema.sql + schema_addendum.sql + schema_phase2.sql
-- =============================================================================

-- ── 1. EVENTS TABLE ──────────────────────────────────────────────────────────

-- Rename columns to match what the application code uses
ALTER TABLE events RENAME COLUMN start_date TO event_date;
ALTER TABLE events RENAME COLUMN "time"     TO start_time;
ALTER TABLE events RENAME COLUMN venue      TO location;

-- The legacy 'type' column has no DEFAULT; give it one so new INSERTs that
-- only provide 'category' (added in phase 2) don't fail the NOT NULL check.
ALTER TABLE events ALTER COLUMN type SET DEFAULT 'church-wide';

-- Add remaining columns the application code expects
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS end_time        time,
  ADD COLUMN IF NOT EXISTS chatbot_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS image_url       text;

-- ── 2. SERMONS TABLE ─────────────────────────────────────────────────────────

-- speaker → preacher (used in control-panel + member dashboard)
ALTER TABLE sermons RENAME COLUMN speaker           TO preacher;

-- sermon_date → service_date (used in control-panel + sitemap)
ALTER TABLE sermons RENAME COLUMN sermon_date       TO service_date;

-- youtube_video_id → youtube_id (used in member dashboard)
ALTER TABLE sermons RENAME COLUMN youtube_video_id  TO youtube_id;

-- Add slug column (used in control-panel, sitemap, and sermon detail pages)
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS slug text;

-- Auto-generate slugs for any pre-existing rows
UPDATE sermons
SET slug = lower(
  regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  )
) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Unique constraint (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sermons_slug_unique'
  ) THEN
    ALTER TABLE sermons ADD CONSTRAINT sermons_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- Rebuild indexes that referenced old column names
DROP INDEX IF EXISTS sermons_search_idx;
CREATE INDEX sermons_search_idx ON sermons
  USING gin(to_tsvector('english',
    coalesce(title,'')        || ' ' ||
    coalesce(preacher,'')     || ' ' ||
    coalesce(description,'')  || ' ' ||
    coalesce(scripture_ref,'')
  ));

DROP INDEX IF EXISTS sermons_date_idx;
CREATE INDEX sermons_date_idx ON sermons (service_date DESC);

DROP INDEX IF EXISTS sermons_featured_idx;
CREATE INDEX sermons_featured_idx ON sermons (is_featured, published, service_date DESC);

-- ── 3. SERIES TABLE ──────────────────────────────────────────────────────────

-- Add slug column (used in sitemap + series detail pages)
ALTER TABLE series ADD COLUMN IF NOT EXISTS slug text;

-- Auto-generate slugs for any pre-existing rows
UPDATE series
SET slug = lower(
  regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  )
) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Unique constraint (idempotent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'series_slug_unique'
  ) THEN
    ALTER TABLE series ADD CONSTRAINT series_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- =============================================================================
-- END OF PHASE 3
-- Summary of changes:
--   events:  start_date→event_date, time→start_time, venue→location,
--            type gets DEFAULT 'church-wide', added end_time/chatbot_enabled/image_url
--   sermons: speaker→preacher, sermon_date→service_date,
--            youtube_video_id→youtube_id, added slug
--   series:  added slug
-- =============================================================================
