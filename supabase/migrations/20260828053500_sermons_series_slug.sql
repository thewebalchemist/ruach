-- Found while investigating a homepage crash: pages/[slug].tsx, pages/sermons/*,
-- pages/series/*, and pages/control-panel/{sermons,series}.tsx all read/write
-- a `slug` column on sermons and series that was never in the schema (present
-- in the app code, absent from schema.sql/schema_addendum.sql from the start —
-- predates this engagement). Every sermon/series permalink has been broken
-- since before this migration workflow existed. Adding the column unblocks
-- the whole subsystem; existing rows (if any, on prod) get a slug generated
-- from their title so nothing is left NULL under the UNIQUE constraint.
ALTER TABLE sermons ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE series  ADD COLUMN IF NOT EXISTS slug text;

UPDATE sermons SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(id::text, 1, 8)
  WHERE slug IS NULL;
UPDATE series SET slug = lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(id::text, 1, 8)
  WHERE slug IS NULL;

ALTER TABLE sermons ALTER COLUMN slug SET NOT NULL;
ALTER TABLE series  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS sermons_slug_key ON sermons (slug);
CREATE UNIQUE INDEX IF NOT EXISTS series_slug_key  ON series (slug);
