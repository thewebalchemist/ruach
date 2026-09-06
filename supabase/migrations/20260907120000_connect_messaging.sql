-- Connect Class messaging — replaces the mock conversations in
-- pages/connect/messages.tsx with a real, RLS-backed schema.
--
-- Model: one thread per (cohort, student) pair, where student_id IS NULL
-- means the cohort-wide broadcast/group thread and a non-null student_id
-- means a 1:1 thread between that student and their cohort's teacher.
-- Both the teacher and the enrolled student can post into either thread
-- type (mirrors the mock UI, where students post into the group chat too).
--
-- Pin/read state is per-viewer (a teacher pinning a thread shouldn't pin
-- it for the student on the other end), so it lives in its own table
-- rather than on connect_messages itself.

CREATE TABLE IF NOT EXISTS connect_messages (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id   uuid        NOT NULL REFERENCES connect_cohorts(id) ON DELETE CASCADE,
  student_id  uuid        REFERENCES connect_students(id) ON DELETE CASCADE,
  sender_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_role text        NOT NULL CHECK (sender_role IN ('teacher','student')),
  content     text        NOT NULL CHECK (char_length(trim(content)) > 0),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS connect_messages_thread_idx
  ON connect_messages (cohort_id, student_id, created_at);

CREATE TABLE IF NOT EXISTS connect_conversation_state (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id     uuid        NOT NULL REFERENCES connect_cohorts(id) ON DELETE CASCADE,
  student_id    uuid        REFERENCES connect_students(id) ON DELETE CASCADE,
  pinned        boolean     NOT NULL DEFAULT false,
  last_read_at  timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Nullable student_id can't be part of a normal UNIQUE/PK constraint, so
-- uniqueness is split across two partial indexes (group thread vs DM thread).
CREATE UNIQUE INDEX IF NOT EXISTS connect_conversation_state_group_uniq
  ON connect_conversation_state (user_id, cohort_id) WHERE student_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS connect_conversation_state_dm_uniq
  ON connect_conversation_state (user_id, cohort_id, student_id) WHERE student_id IS NOT NULL;

CREATE OR REPLACE TRIGGER connect_conversation_state_updated_at
  BEFORE UPDATE ON connect_conversation_state
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

ALTER TABLE connect_messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_conversation_state  ENABLE ROW LEVEL SECURITY;

-- ── connect_messages ──────────────────────────────────────────────────────
-- Teacher of the cohort sees/sends everything in it (group + every DM).
-- A student sees/sends only the group thread and their own DM thread.
CREATE POLICY connect_messages_select ON connect_messages FOR SELECT
  USING (
    is_staff()
    OR EXISTS (SELECT 1 FROM connect_cohorts c WHERE c.id = cohort_id AND c.teacher_id = auth.uid())
    OR (
      student_id IN (SELECT id FROM connect_students WHERE user_id = auth.uid())
    )
    OR (
      -- group thread: any student enrolled in this cohort can read it
      student_id IS NULL
      AND EXISTS (SELECT 1 FROM connect_students s WHERE s.cohort_id = connect_messages.cohort_id AND s.user_id = auth.uid())
    )
  );

CREATE POLICY connect_messages_insert ON connect_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      -- teacher posting into their own cohort (group or any DM within it)
      (sender_role = 'teacher' AND EXISTS (
        SELECT 1 FROM connect_cohorts c WHERE c.id = cohort_id AND c.teacher_id = auth.uid()
      ))
      OR
      -- student posting into their own DM thread or their cohort's group thread
      (sender_role = 'student' AND EXISTS (
        SELECT 1 FROM connect_students s
        WHERE s.user_id = auth.uid() AND s.cohort_id = connect_messages.cohort_id
          AND (connect_messages.student_id IS NULL OR connect_messages.student_id = s.id)
      ))
    )
  );

-- ── connect_conversation_state ───────────────────────────────────────────
-- Purely per-viewer preference/read-state — self-service only.
CREATE POLICY connect_conversation_state_own ON connect_conversation_state FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
