-- ============================================================
-- Migration: Add 'media' role
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- 1. Widen the CHECK constraint on profiles.role
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student','member','leader','teacher','admin','pastor','media'));

-- 2. Additive RLS policies so media can write to content tables
--    (is_staff() only covers teacher/admin/pastor — we add media separately
--    to avoid giving media access to connect/discipleship member data)

-- Sermons
CREATE POLICY sermons_media_write ON sermons FOR ALL
  USING (get_user_role() = 'media');

-- Series
CREATE POLICY series_media_write ON series FOR ALL
  USING (get_user_role() = 'media');

-- Events
CREATE POLICY events_media_write ON events FOR ALL
  USING (get_user_role() = 'media');

-- Stream settings (media controls the live stream)
CREATE POLICY stream_settings_media ON stream_settings FOR ALL
  USING (get_user_role() = 'media');

-- Storage: sermon thumbnails
CREATE POLICY "sermon-thumbnails media upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sermon-thumbnails' AND get_user_role() = 'media');

CREATE POLICY "sermon-thumbnails media update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'sermon-thumbnails' AND get_user_role() = 'media');

-- Storage: series thumbnails
CREATE POLICY "series-thumbnails media upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'series-thumbnails' AND get_user_role() = 'media');

CREATE POLICY "series-thumbnails media update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'series-thumbnails' AND get_user_role() = 'media');
