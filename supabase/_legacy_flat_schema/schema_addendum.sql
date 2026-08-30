-- ============================================================
-- Ruach Tabernacle — Schema Addendum
-- Run AFTER schema.sql in the Supabase SQL Editor
-- Adds: sermons, series, stream_settings, service_schedule,
--       sermon_notes, church_info, faqs, chat_sessions + storage
-- ============================================================

-- ============================================================
-- A1. SERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS series (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         text        NOT NULL,
  description   text,
  thumbnail_url text,
  start_date    date,
  end_date      date,
  status        text        NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','completed','upcoming')),
  created_by    uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- A2. SERMONS
-- ============================================================
CREATE TABLE IF NOT EXISTS sermons (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             text        NOT NULL,
  speaker           text        NOT NULL DEFAULT 'Pastor Enoch Kyula',
  description       text,
  series_id         uuid        REFERENCES series(id) ON DELETE SET NULL,
  thumbnail_url     text,
  youtube_url       text,
  youtube_video_id  text        GENERATED ALWAYS AS (
                      CASE
                        WHEN youtube_url LIKE '%youtu.be/%'
                          THEN split_part(split_part(youtube_url, 'youtu.be/', 2), '?', 1)
                        WHEN youtube_url LIKE '%youtube.com/watch%'
                          THEN substring(youtube_url FROM 'v=([^&]+)')
                        WHEN youtube_url LIKE '%youtube.com/embed/%'
                          THEN split_part(split_part(youtube_url, 'embed/', 2), '?', 1)
                        ELSE NULL
                      END
                    ) STORED,
  duration_seconds  int,
  sermon_date       date        NOT NULL DEFAULT CURRENT_DATE,
  tags              text[]      NOT NULL DEFAULT '{}',
  scripture_ref     text,
  is_featured       boolean     NOT NULL DEFAULT false,
  view_count        int         NOT NULL DEFAULT 0,
  published         boolean     NOT NULL DEFAULT true,
  created_by        uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER sermons_updated_at
  BEFORE UPDATE ON sermons
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE INDEX IF NOT EXISTS sermons_date_idx ON sermons (sermon_date DESC);
CREATE INDEX IF NOT EXISTS sermons_series_idx ON sermons (series_id);
CREATE INDEX IF NOT EXISTS sermons_featured_idx ON sermons (is_featured, published, sermon_date DESC);
CREATE INDEX IF NOT EXISTS sermons_search_idx ON sermons
  USING gin (to_tsvector('english',
    coalesce(title,'') || ' ' || coalesce(speaker,'') || ' ' ||
    coalesce(description,'') || ' ' || coalesce(scripture_ref,'')
  ));

-- ============================================================
-- A3. STREAM SETTINGS (one row, id = 1)
-- ============================================================
CREATE TABLE IF NOT EXISTS stream_settings (
  id                  int         PRIMARY KEY DEFAULT 1,
  live_url            text        NOT NULL DEFAULT '',
  is_live             boolean     NOT NULL DEFAULT false,
  default_youtube_url text        NOT NULL DEFAULT '',
  stream_title        text        NOT NULL DEFAULT 'Sunday Service',
  stream_description  text,
  updated_at          timestamptz NOT NULL DEFAULT now(),
  updated_by          uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Seed the single settings row
INSERT INTO stream_settings (id, live_url, is_live, default_youtube_url)
VALUES (1, '', false, '')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- A4. SERVICE SCHEDULE
-- ============================================================
CREATE TABLE IF NOT EXISTS service_schedule (
  id          uuid  PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week text  NOT NULL CHECK (day_of_week IN ('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')),
  service_name text NOT NULL,
  start_time  time  NOT NULL,
  end_time    time,
  location    text  NOT NULL DEFAULT 'Rhema Grounds, Nairobi',
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  int     NOT NULL DEFAULT 0
);

-- Seed default services
INSERT INTO service_schedule (day_of_week, service_name, start_time, end_time, location, sort_order) VALUES
  ('Sunday', 'First Service',   '08:00', '09:45', 'Rhema Grounds, Nairobi', 1),
  ('Sunday', 'Second Service',  '10:00', '12:00', 'Rhema Grounds, Nairobi', 2),
  ('Sunday', 'Third Service',   '12:30', '14:30', 'Rhema Grounds, Nairobi', 3),
  ('Wednesday', 'Midweek Service', '18:30', '20:00', 'Rhema Grounds, Nairobi', 4)
ON CONFLICT DO NOTHING;

-- ============================================================
-- A5. SERMON NOTES (live page notes, per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS sermon_notes (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sermon_id   uuid        REFERENCES sermons(id) ON DELETE SET NULL,
  content     text        NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER sermon_notes_updated_at
  BEFORE UPDATE ON sermon_notes
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE INDEX IF NOT EXISTS sermon_notes_user_idx ON sermon_notes (user_id, updated_at DESC);

ALTER TABLE sermon_notes ENABLE ROW LEVEL SECURITY;

-- Users can only read and write their own notes
CREATE POLICY sermon_notes_own ON sermon_notes FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can read all notes
CREATE POLICY sermon_notes_admin ON sermon_notes FOR SELECT
  USING (is_admin());

-- ============================================================
-- A6. CHURCH INFO (for Ask Ruach CMS)
-- ============================================================
CREATE TABLE IF NOT EXISTS church_info (
  key         text PRIMARY KEY,
  value       text NOT NULL,
  category    text NOT NULL DEFAULT 'general'
                CHECK (category IN ('general','services','contact','beliefs','staff','location')),
  description text,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid        REFERENCES profiles(id) ON DELETE SET NULL
);

-- Seed core church info
INSERT INTO church_info (key, category, value) VALUES
  ('church_name',      'general',   'Ruach Tabernacle Assembly'),
  ('senior_pastor',    'staff',     'Pastor Enoch Kyula'),
  ('service_times',    'services',  'Sunday: 8:00 AM, 10:00 AM, 12:30 PM'),
  ('location',         'location',  'Rhema Grounds, Nairobi, Kenya'),
  ('phone',            'contact',   '+254 700 000 000'),
  ('email',            'contact',   'info@ruachtabernacle.org'),
  ('website',          'contact',   'https://ruachtabernacle.org'),
  ('vision',           'beliefs',   'A House of Prayer for All Nations'),
  ('mission',          'beliefs',   'To build Kingdom disciples who transform their world')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- A7. FAQS
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  question    text        NOT NULL,
  answer      text        NOT NULL,
  category    text        NOT NULL DEFAULT 'general'
                CHECK (category IN ('general','connect','discipleship','crosspoints','giving','services')),
  sort_order  int         NOT NULL DEFAULT 0,
  published   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- A8. ASK RUACH CHAT SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  session_key text        NOT NULL,  -- anonymous session identifier
  messages    jsonb       NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE INDEX IF NOT EXISTS chat_sessions_user_idx ON chat_sessions (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS chat_sessions_key_idx  ON chat_sessions (session_key);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_sessions_own ON chat_sessions FOR ALL
  USING (
    (user_id IS NULL AND session_key = current_setting('app.session_key', true))
    OR user_id = auth.uid()
    OR is_admin()
  );

-- ============================================================
-- A9. RLS FOR NEW PUBLIC TABLES
-- ============================================================

-- Sermons & series: anyone can read published ones; staff can write
ALTER TABLE series  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE church_info      ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs             ENABLE ROW LEVEL SECURITY;

CREATE POLICY series_public_read ON series FOR SELECT USING (true);
CREATE POLICY series_staff_write ON series FOR ALL USING (is_staff());

CREATE POLICY sermons_public_read ON sermons FOR SELECT USING (published = true OR is_staff());
CREATE POLICY sermons_staff_write ON sermons FOR ALL USING (is_staff());

CREATE POLICY service_schedule_read ON service_schedule FOR SELECT USING (true);
CREATE POLICY service_schedule_write ON service_schedule FOR ALL USING (is_admin());

CREATE POLICY church_info_read ON church_info FOR SELECT USING (true);
CREATE POLICY church_info_write ON church_info FOR ALL USING (is_admin());

CREATE POLICY faqs_public_read ON faqs FOR SELECT USING (published = true OR is_staff());
CREATE POLICY faqs_staff_write ON faqs FOR ALL USING (is_staff());

-- stream_settings: anyone can read (needed for live page); only admin can write
ALTER TABLE stream_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY stream_settings_read  ON stream_settings FOR SELECT USING (true);
CREATE POLICY stream_settings_write ON stream_settings FOR ALL USING (is_admin());

-- ============================================================
-- A10. STORAGE BUCKETS
-- Run each INSERT separately if needed; idempotent.
-- ============================================================

-- Create storage buckets (run in Supabase Dashboard → Storage → New Bucket,
-- or via this SQL if using the storage schema extension)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('sermon-thumbnails',  'sermon-thumbnails',  true,  5242880,   ARRAY['image/jpeg','image/jpg','image/png','image/webp']),
  ('series-thumbnails',  'series-thumbnails',  true,  5242880,   ARRAY['image/jpeg','image/jpg','image/png','image/webp']),
  ('profile-photos',     'profile-photos',     false, 2097152,   ARRAY['image/jpeg','image/jpg','image/png','image/webp']),
  ('church-photos',      'church-photos',      true,  10485760,  ARRAY['image/jpeg','image/jpg','image/png','image/webp']),
  ('connect-resources',  'connect-resources',  false, 52428800,  ARRAY['application/pdf','video/mp4','video/webm']),
  ('certificates',       'certificates',       false, 10485760,  ARRAY['image/png','image/jpeg','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "sermon-thumbnails public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sermon-thumbnails');

CREATE POLICY "sermon-thumbnails staff upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sermon-thumbnails' AND is_staff());

CREATE POLICY "series-thumbnails public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'series-thumbnails');

CREATE POLICY "series-thumbnails staff upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'series-thumbnails' AND is_staff());

CREATE POLICY "profile-photos own read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "profile-photos own upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "church-photos public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'church-photos');

CREATE POLICY "church-photos admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'church-photos' AND is_admin());

CREATE POLICY "connect-resources authenticated read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'connect-resources' AND auth.uid() IS NOT NULL);

CREATE POLICY "connect-resources staff upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'connect-resources' AND is_staff());

CREATE POLICY "certificates own read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates' AND auth.uid() IS NOT NULL);

CREATE POLICY "certificates staff upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates' AND is_staff());

-- ============================================================
-- END OF ADDENDUM
-- ============================================================
-- To add the first admin account:
--   1. Go to Supabase Dashboard → Authentication → Users → Add user
--   2. Enter the admin's email + password
--   3. Run: UPDATE profiles SET role = 'admin' WHERE email = 'admin@ruach.church';
-- ============================================================
