-- ============================================================
-- Ruach Tabernacle — Phase 2 Schema
-- Run in Supabase SQL Editor AFTER schema.sql + schema_addendum.sql
-- ============================================================

-- ── Multi-select exam support ─────────────────────────────────────────────────
-- Add correct_answers int[] (authoritative). Old correct_answer int stays for
-- backwards compat but is no longer written by new code.

ALTER TABLE connect_exam_questions
  ADD COLUMN IF NOT EXISTS correct_answers int[] NOT NULL DEFAULT '{}';

ALTER TABLE discipleship_exam_questions
  ADD COLUMN IF NOT EXISTS correct_answers int[] NOT NULL DEFAULT '{}';

-- Migrate existing single-answer data → array
UPDATE connect_exam_questions
  SET correct_answers = ARRAY[correct_answer]
  WHERE array_length(correct_answers, 1) IS NULL OR array_length(correct_answers, 1) = 0;

UPDATE discipleship_exam_questions
  SET correct_answers = ARRAY[correct_answer]
  WHERE array_length(correct_answers, 1) IS NULL OR array_length(correct_answers, 1) = 0;

-- question_type column so teacher can mark multi vs single
ALTER TABLE connect_exam_questions
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'single'
    CHECK (question_type IN ('single','multi','true-false'));

ALTER TABLE discipleship_exam_questions
  ADD COLUMN IF NOT EXISTS question_type text NOT NULL DEFAULT 'single'
    CHECK (question_type IN ('single','multi','true-false'));

-- ── Gamification columns on profiles ─────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS points               int         NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS badge_slugs          text[]      NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_complete  boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_feedback_at     timestamptz,
  ADD COLUMN IF NOT EXISTS discipleship_intent  boolean     NOT NULL DEFAULT false;

-- ── Achievement registry ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS achievements (
  slug          text PRIMARY KEY,
  title         text NOT NULL,
  description   text NOT NULL,
  icon          text NOT NULL,
  points        int  NOT NULL DEFAULT 0,
  trigger_event text NOT NULL
);

INSERT INTO achievements (slug, title, description, icon, points, trigger_event) VALUES
  ('first_step',         'First Step',          'Joined a Connect cohort',             'Footprints',     100, 'cohort_join'),
  ('first_class',        'In the Room',         'Attended your first class',           'Video',           50, 'class_attend'),
  ('consistent',         'Consistent',          'Attended 3 classes in a row',         'Flame',          150, 'streak_3'),
  ('exam_taker',         'Test Ready',          'Submitted your first exam',           'ClipboardCheck',  75, 'exam_submit'),
  ('honour_roll',        'Honour Roll',         'Scored 90%+ on an exam',              'Trophy',         200, 'exam_90'),
  ('connect_graduate',   'Connect Graduate',    'Completed Connect Class',             'GraduationCap',  500, 'graduated'),
  ('crosspoint_member',  'Community Member',    'Joined a Crosspoint home church',     'Home',           200, 'crosspoint_join'),
  ('prayer_warrior',     'Prayer Warrior',      'Submitted 5 prayer requests',         'HandsPraying',    50, 'prayer_5'),
  ('faithful_attendee',  'Faithful Attendee',   'Attended 10 classes total',           'Star',           300, 'attend_10'),
  ('kdc1_graduate',      'KDC Level 1',         'Completed KDC Level 1 — Foundations', 'BookOpen',       400, 'kdc1_graduated'),
  ('kdc2_graduate',      'KDC Level 2',         'Completed KDC Level 2 — Grace',       'BookOpen',       400, 'kdc2_graduated'),
  ('kdc3_graduate',      'KDC Level 3',         'Completed KDC Level 3 — Impact',      'BookOpen',       500, 'kdc3_graduated')
ON CONFLICT (slug) DO NOTHING;

-- ── User achievements ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_achievements (
  id               uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_slug text        NOT NULL REFERENCES achievements(slug),
  earned_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_slug)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_achievements_own ON user_achievements FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY user_achievements_admin ON user_achievements FOR SELECT
  USING (is_admin());

-- ── Sermon enhancements ───────────────────────────────────────────────────────
ALTER TABLE sermons
  ADD COLUMN IF NOT EXISTS spotify_url text,
  ADD COLUMN IF NOT EXISTS category    text NOT NULL DEFAULT 'other'
    CHECK (category IN ('faith','prayer','family','leadership','kingdom','worship','evangelism','other')),
  ADD COLUMN IF NOT EXISTS notes       text;

-- ── Member feedback (one-time post-onboarding survey) ────────────────────────
CREATE TABLE IF NOT EXISTS member_feedback (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teachings_score int         NOT NULL CHECK (teachings_score BETWEEN 1 AND 5),
  worship_score   int         NOT NULL CHECK (worship_score   BETWEEN 1 AND 5),
  community_score int         NOT NULL CHECK (community_score BETWEEN 1 AND 5),
  comments        text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE member_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY member_feedback_own ON member_feedback FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY member_feedback_admin ON member_feedback FOR SELECT
  USING (is_admin());

-- ── Classroom violation log (anti-cheat) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_violations (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_id     uuid        NOT NULL,
  cohort_type text        NOT NULL CHECK (cohort_type IN ('connect','discipleship')),
  type        text        NOT NULL CHECK (type IN ('tab_switch','blur','fullscreen_exit')),
  count       int         NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE exam_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY exam_violations_student ON exam_violations FOR INSERT
  WITH CHECK (student_id = auth.uid());
CREATE POLICY exam_violations_staff ON exam_violations FOR SELECT
  USING (is_staff());

-- ── Events: ensure category and is_public columns exist ──────────────────────
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS category  text NOT NULL DEFAULT 'church-wide',
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT true;

-- ── LiveKit classroom room name tracking ──────────────────────────────────────
-- classroom_rooms already exists from schema.sql; just ensure livekit_room_name
ALTER TABLE classroom_rooms
  ADD COLUMN IF NOT EXISTS livekit_room_name text;

-- ── RLS for achievements (public read) ───────────────────────────────────────
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY achievements_read ON achievements FOR SELECT USING (true);

-- ============================================================
-- END schema_phase2.sql
-- ============================================================
