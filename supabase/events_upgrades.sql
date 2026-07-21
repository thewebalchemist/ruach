-- ============================================================
-- Ruach Tabernacle — Events upgrades
-- Run ONCE in the Supabase SQL editor (additive, safe, non-destructive).
-- Adds the CTA button + Google Maps directions columns the events form and
-- the public /r-events page expect. Without these, the events page query
-- errored on the missing columns and showed NO events.
-- ============================================================

alter table events add column if not exists link_url   text;  -- CTA button URL (Register / Zoom / Learn more)
alter table events add column if not exists link_label text;  -- CTA button label
alter table events add column if not exists map_url    text;  -- Google Maps directions link for the venue
