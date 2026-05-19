-- ============================================================
-- RuachConnect — Complete Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- Safe to re-run: all objects use IF NOT EXISTS / OR REPLACE
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- trigram search
CREATE EXTENSION IF NOT EXISTS "unaccent";        -- accent-insensitive search

-- ── Search helper (immutable, used in GIN indexes) ───────────────────────────
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
  RETURNS text LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE AS
$$SELECT unaccent($1)$$;

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 text        NOT NULL UNIQUE,
  phone                 text,
  first_name            text        NOT NULL DEFAULT '',
  last_name             text        NOT NULL DEFAULT '',
  full_name             text        GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  role                  text        NOT NULL DEFAULT 'student'
                          CHECK (role IN ('student','member','leader','teacher','admin','pastor')),
  status                text        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','active','suspended','inactive')),
  avatar_url            text,
  gender                text        CHECK (gender IN ('male','female')),
  date_of_birth         date,
  address               text,
  occupation            text,
  marital_status        text        CHECK (marital_status IN ('single','married','widowed','divorced')),
  branch                text        NOT NULL DEFAULT 'Nairobi',
  crosspoint_zone       text        CHECK (crosspoint_zone IN ('south','east','north','west')),
  joined_ruach_date     date,
  is_in_crosspoint      boolean     NOT NULL DEFAULT false,
  member_id             text        UNIQUE,
  member_since          date,
  connect_cohort_id     uuid,
  connect_graduated_at  timestamptz,
  is_legacy_member      boolean     NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- Full-text search index on profiles
CREATE INDEX IF NOT EXISTS profiles_search_idx ON profiles
  USING gin (to_tsvector('english',
    coalesce(first_name,'') || ' ' || coalesce(last_name,'') || ' ' ||
    coalesce(email,'') || ' ' || coalesce(phone,'') || ' ' || coalesce(member_id,'')
  ));

-- Trigram indexes for fuzzy search
CREATE INDEX IF NOT EXISTS profiles_name_trgm ON profiles USING gin (full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_email_trgm ON profiles USING gin (email gin_trgm_ops);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
  RETURNS trigger LANGUAGE plpgsql AS
$$BEGIN NEW.updated_at = now(); RETURN NEW; END;$$;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- 2. MEMBER ID GENERATION
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS member_id_seq START 1000;
CREATE SEQUENCE IF NOT EXISTS legacy_member_id_seq START 1000;

CREATE OR REPLACE FUNCTION generate_member_id(p_is_legacy boolean DEFAULT false)
  RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS
$$
DECLARE
  v_prefix  text;
  v_num     bigint;
BEGIN
  IF p_is_legacy THEN
    v_prefix := 'LM';
    v_num    := nextval('legacy_member_id_seq');
  ELSE
    v_prefix := 'RM';
    v_num    := nextval('member_id_seq');
  END IF;
  RETURN v_prefix || '-' || to_char(v_num, 'FM00000');
END;
$$;

-- ============================================================
-- 3. UTILITY FUNCTIONS (role helpers)
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_role()
  RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS
$$SELECT role FROM profiles WHERE id = auth.uid()$$;

CREATE OR REPLACE FUNCTION is_staff()
  RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS
$$SELECT role IN ('teacher','admin','pastor') FROM profiles WHERE id = auth.uid()$$;

CREATE OR REPLACE FUNCTION is_admin()
  RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS
$$SELECT role IN ('admin','pastor') FROM profiles WHERE id = auth.uid()$$;

-- ============================================================
-- 4. CONNECT CLASS SYSTEM
-- ============================================================

-- 4a. Cohorts
CREATE TABLE IF NOT EXISTS connect_cohorts (
  id                      uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    text        NOT NULL,
  year                    int         NOT NULL,
  cohort_number           int         NOT NULL,
  description             text,
  start_date              date        NOT NULL,
  end_date                date        NOT NULL,
  registration_deadline   date        NOT NULL,
  status                  text        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','registration-open','active','completed','cancelled')),
  teacher_id              uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  assistant_teacher_ids   uuid[]      NOT NULL DEFAULT '{}',
  whatsapp_link           text,
  max_capacity            int         NOT NULL DEFAULT 40,
  enrolled_count          int         NOT NULL DEFAULT 0,
  min_attendance_percent  int         NOT NULL DEFAULT 80,
  min_exam_score          int         NOT NULL DEFAULT 60,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  UNIQUE (year, cohort_number)
);

CREATE OR REPLACE TRIGGER connect_cohorts_updated_at
  BEFORE UPDATE ON connect_cohorts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- 4b. Sessions
CREATE TABLE IF NOT EXISTS connect_sessions (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id       uuid        NOT NULL REFERENCES connect_cohorts(id) ON DELETE CASCADE,
  session_number  int         NOT NULL,
  title           text        NOT NULL,
  description     text,
  date            date        NOT NULL,
  start_time      time        NOT NULL,
  end_time        time        NOT NULL,
  type            text        NOT NULL DEFAULT 'virtual'
                    CHECK (type IN ('physical','virtual')),
  meeting_link    text,
  venue           text,
  notes           text,
  is_completed    boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, session_number)
);

-- 4c. Session resources
CREATE TABLE IF NOT EXISTS connect_resources (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  uuid        NOT NULL REFERENCES connect_sessions(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  type        text        NOT NULL CHECK (type IN ('pdf','video','link','document')),
  url         text        NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- 4d. Admission number sequence
CREATE SEQUENCE IF NOT EXISTS connect_admission_seq START 1;

CREATE OR REPLACE FUNCTION generate_connect_admission_number(p_year int)
  RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS
$$BEGIN
  RETURN 'CC' || p_year || '-' || to_char(nextval('connect_admission_seq'), 'FM0000');
END;$$;

-- 4e. Students
CREATE TABLE IF NOT EXISTS connect_students (
  id                        uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id                 uuid        NOT NULL REFERENCES connect_cohorts(id) ON DELETE RESTRICT,
  admission_number          text        NOT NULL UNIQUE,
  preferred_class_type      text        NOT NULL DEFAULT 'virtual'
                              CHECK (preferred_class_type IN ('physical','virtual')),
  accepted_jesus            text        NOT NULL DEFAULT 'not-sure'
                              CHECK (accepted_jesus IN ('yes','no','not-sure')),
  status                    text        NOT NULL DEFAULT 'registered'
                              CHECK (status IN ('registered','enrolled','in-progress','completed','failed','dropped')),
  enrolled_at               timestamptz NOT NULL DEFAULT now(),
  total_attendance_percent  numeric(5,2) NOT NULL DEFAULT 0,
  average_exam_score        numeric(5,2) NOT NULL DEFAULT 0,
  can_graduate              boolean     NOT NULL DEFAULT false,
  graduated_at              timestamptz,
  certificate_issued        boolean     NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, cohort_id)
);

CREATE OR REPLACE TRIGGER connect_students_updated_at
  BEFORE UPDATE ON connect_students
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Increment enrolled_count when a student is added
CREATE OR REPLACE FUNCTION connect_cohort_enrollment_count()
  RETURNS trigger LANGUAGE plpgsql AS
$$BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE connect_cohorts SET enrolled_count = enrolled_count + 1 WHERE id = NEW.cohort_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE connect_cohorts SET enrolled_count = GREATEST(0, enrolled_count - 1) WHERE id = OLD.cohort_id;
  END IF;
  RETURN NULL;
END;$$;

CREATE OR REPLACE TRIGGER connect_enrollment_count
  AFTER INSERT OR DELETE ON connect_students
  FOR EACH ROW EXECUTE FUNCTION connect_cohort_enrollment_count();

-- 4f. Attendance
CREATE TABLE IF NOT EXISTS connect_attendance (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  uuid        NOT NULL REFERENCES connect_students(id) ON DELETE CASCADE,
  session_id  uuid        NOT NULL REFERENCES connect_sessions(id) ON DELETE CASCADE,
  present     boolean     NOT NULL DEFAULT false,
  marked_by   uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  marked_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, session_id)
);

-- 4g. Warnings
CREATE TABLE IF NOT EXISTS connect_warnings (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  uuid        NOT NULL REFERENCES connect_students(id) ON DELETE CASCADE,
  type        text        NOT NULL CHECK (type IN ('attendance','exam','general')),
  message     text        NOT NULL,
  sent_by     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  sent_at     timestamptz NOT NULL DEFAULT now()
);

-- 4h. Exams
CREATE TABLE IF NOT EXISTS connect_exams (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id         uuid        NOT NULL REFERENCES connect_cohorts(id) ON DELETE CASCADE,
  session_id        uuid        REFERENCES connect_sessions(id) ON DELETE SET NULL,
  title             text        NOT NULL,
  description       text,
  total_marks       int         NOT NULL DEFAULT 100,
  passing_marks     int         NOT NULL DEFAULT 60,
  duration_minutes  int         NOT NULL DEFAULT 30,
  available_from    timestamptz,
  available_until   timestamptz,
  status            text        NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','published','closed')),
  created_by        uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER connect_exams_updated_at
  BEFORE UPDATE ON connect_exams
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- 4i. Exam questions
CREATE TABLE IF NOT EXISTS connect_exam_questions (
  id              uuid  PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id         uuid  NOT NULL REFERENCES connect_exams(id) ON DELETE CASCADE,
  question_number int   NOT NULL,
  type            text  NOT NULL CHECK (type IN ('multiple-choice','true-false')),
  question        text  NOT NULL,
  options         text[] NOT NULL DEFAULT '{}',
  correct_answer  int   NOT NULL,   -- 0-based index into options
  marks           int   NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, question_number)
);

-- 4j. Exam results (one per student per exam)
CREATE TABLE IF NOT EXISTS connect_exam_results (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id       uuid        NOT NULL REFERENCES connect_exams(id) ON DELETE CASCADE,
  student_id    uuid        NOT NULL REFERENCES connect_students(id) ON DELETE CASCADE,
  score         int         NOT NULL DEFAULT 0,
  total_marks   int         NOT NULL,
  percentage    numeric(5,2) NOT NULL DEFAULT 0,
  passed        boolean     NOT NULL DEFAULT false,
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  graded_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id)
);

-- 4k. Exam answers (one per question per result)
CREATE TABLE IF NOT EXISTS connect_exam_answers (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id       uuid NOT NULL REFERENCES connect_exam_results(id) ON DELETE CASCADE,
  question_id     uuid NOT NULL REFERENCES connect_exam_questions(id) ON DELETE CASCADE,
  selected_answer int  NOT NULL,
  UNIQUE (result_id, question_id)
);

-- 4l. Auto-update average_exam_score on connect_students after each result
CREATE OR REPLACE FUNCTION update_connect_student_exam_score()
  RETURNS trigger LANGUAGE plpgsql AS
$$BEGIN
  UPDATE connect_students
  SET average_exam_score = (
    SELECT COALESCE(AVG(percentage), 0)
    FROM connect_exam_results
    WHERE student_id = NEW.student_id
  )
  WHERE id = NEW.student_id;
  RETURN NEW;
END;$$;

CREATE OR REPLACE TRIGGER connect_exam_score_update
  AFTER INSERT OR UPDATE ON connect_exam_results
  FOR EACH ROW EXECUTE FUNCTION update_connect_student_exam_score();

-- 4m. Auto-update total_attendance_percent on connect_students
CREATE OR REPLACE FUNCTION update_connect_student_attendance()
  RETURNS trigger LANGUAGE plpgsql AS
$$DECLARE
  v_total   int;
  v_present int;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE present)
  INTO v_total, v_present
  FROM connect_attendance
  WHERE student_id = COALESCE(NEW.student_id, OLD.student_id);

  UPDATE connect_students
  SET total_attendance_percent = CASE WHEN v_total = 0 THEN 0 ELSE ROUND((v_present::numeric / v_total) * 100, 2) END
  WHERE id = COALESCE(NEW.student_id, OLD.student_id);
  RETURN NEW;
END;$$;

CREATE OR REPLACE TRIGGER connect_attendance_pct_update
  AFTER INSERT OR UPDATE OR DELETE ON connect_attendance
  FOR EACH ROW EXECUTE FUNCTION update_connect_student_attendance();

-- 4n. Auto-set can_graduate when both thresholds met
CREATE OR REPLACE FUNCTION update_connect_can_graduate()
  RETURNS trigger LANGUAGE plpgsql AS
$$BEGIN
  NEW.can_graduate :=
    NEW.total_attendance_percent >= (
      SELECT min_attendance_percent FROM connect_cohorts WHERE id = NEW.cohort_id
    ) AND
    NEW.average_exam_score >= (
      SELECT min_exam_score FROM connect_cohorts WHERE id = NEW.cohort_id
    );
  RETURN NEW;
END;$$;

CREATE OR REPLACE TRIGGER connect_graduate_check
  BEFORE UPDATE OF total_attendance_percent, average_exam_score ON connect_students
  FOR EACH ROW EXECUTE FUNCTION update_connect_can_graduate();

-- 4o. Legacy member requests (Connect)
CREATE TABLE IF NOT EXISTS legacy_member_requests (
  id                   uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  full_name            text        NOT NULL,
  email                text        NOT NULL,
  phone                text        NOT NULL,
  cohort_attended      text        NOT NULL,
  year_joined          int         NOT NULL,
  years_as_member      int         NOT NULL,
  branch               text        NOT NULL,
  crosspoint_zone      text,
  additional_info      text,
  status               text        NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','verified','rejected')),
  reviewed_by          uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at          timestamptz,
  review_notes         text,
  assigned_member_id   text,
  requested_at         timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. DISCIPLESHIP SYSTEM (KDC Levels 1–3)
-- ============================================================

-- 5a. Courses (one per level)
CREATE TABLE IF NOT EXISTS discipleship_courses (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  level               int         NOT NULL CHECK (level IN (1,2,3)),
  title               text        NOT NULL,
  description         text        NOT NULL DEFAULT '',
  total_sessions      int         NOT NULL DEFAULT 12,
  duration_weeks      int         NOT NULL DEFAULT 12,
  prerequisite_level  int         CHECK (prerequisite_level IN (1,2)),
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (level)
);

-- Seed the three KDC courses
INSERT INTO discipleship_courses (level, title, description, total_sessions, duration_weeks, prerequisite_level)
VALUES
  (1, 'KDC Level 1 — Foundations of Faith',
   'Core Christian foundations: salvation, baptism, the Holy Spirit, prayer, and the Word.',
   12, 12, NULL),
  (2, 'KDC Level 2 — Growing in Grace',
   'Deeper discipleship: spiritual warfare, financial stewardship, family, and servant leadership.',
   12, 12, 1),
  (3, 'KDC Level 3 — Kingdom Impact',
   'Ministry training: church planting, evangelism, leadership, and community transformation.',
   12, 12, 2)
ON CONFLICT (level) DO NOTHING;

-- 5b. Cohorts
CREATE TABLE IF NOT EXISTS discipleship_cohorts (
  id                      uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id               uuid        NOT NULL REFERENCES discipleship_courses(id) ON DELETE RESTRICT,
  level                   int         NOT NULL CHECK (level IN (1,2,3)),
  name                    text        NOT NULL,
  year                    int         NOT NULL,
  start_date              date        NOT NULL,
  end_date                date        NOT NULL,
  registration_deadline   date        NOT NULL,
  schedule                text        NOT NULL DEFAULT 'Saturdays 9AM–12PM',
  teacher_id              uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  assistant_teacher_ids   uuid[]      NOT NULL DEFAULT '{}',
  whatsapp_link           text,
  max_capacity            int         NOT NULL DEFAULT 30,
  enrolled_count          int         NOT NULL DEFAULT 0,
  status                  text        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft','registration-open','active','completed')),
  min_attendance_percent  int         NOT NULL DEFAULT 80,
  min_exam_score          int         NOT NULL DEFAULT 60,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER discipleship_cohorts_updated_at
  BEFORE UPDATE ON discipleship_cohorts
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- 5c. Sessions
CREATE TABLE IF NOT EXISTS discipleship_sessions (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id       uuid        NOT NULL REFERENCES discipleship_cohorts(id) ON DELETE CASCADE,
  session_number  int         NOT NULL,
  title           text        NOT NULL,
  description     text,
  date            date        NOT NULL,
  start_time      time        NOT NULL,
  end_time        time        NOT NULL,
  type            text        NOT NULL DEFAULT 'physical'
                    CHECK (type IN ('physical','virtual')),
  meeting_link    text,
  venue           text,
  notes           text,
  is_completed    boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, session_number)
);

-- 5d. Resources
CREATE TABLE IF NOT EXISTS discipleship_resources (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  uuid        NOT NULL REFERENCES discipleship_sessions(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  type        text        NOT NULL CHECK (type IN ('pdf','video','link','document')),
  url         text        NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- 5e. Admission numbers
CREATE SEQUENCE IF NOT EXISTS discipleship_admission_seq START 1;

CREATE OR REPLACE FUNCTION generate_discipleship_admission_number(p_year int)
  RETURNS text LANGUAGE plpgsql SECURITY DEFINER AS
$$BEGIN
  RETURN 'KDC' || p_year || '-' || to_char(nextval('discipleship_admission_seq'), 'FM0000');
END;$$;

-- 5f. Students
CREATE TABLE IF NOT EXISTS discipleship_students (
  id                        uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id                 uuid        NOT NULL REFERENCES discipleship_cohorts(id) ON DELETE RESTRICT,
  level                     int         NOT NULL CHECK (level IN (1,2,3)),
  admission_number          text        NOT NULL UNIQUE,
  status                    text        NOT NULL DEFAULT 'registered'
                              CHECK (status IN ('registered','enrolled','in-progress','completed','failed','dropped')),
  enrolled_at               timestamptz NOT NULL DEFAULT now(),
  total_attendance_percent  numeric(5,2) NOT NULL DEFAULT 0,
  average_exam_score        numeric(5,2) NOT NULL DEFAULT 0,
  can_graduate              boolean     NOT NULL DEFAULT false,
  graduated_at              timestamptz,
  certificate_issued        boolean     NOT NULL DEFAULT false,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, cohort_id)
);

CREATE OR REPLACE TRIGGER discipleship_students_updated_at
  BEFORE UPDATE ON discipleship_students
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- Enrollment count triggers
CREATE OR REPLACE FUNCTION discipleship_cohort_enrollment_count()
  RETURNS trigger LANGUAGE plpgsql AS
$$BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE discipleship_cohorts SET enrolled_count = enrolled_count + 1 WHERE id = NEW.cohort_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE discipleship_cohorts SET enrolled_count = GREATEST(0, enrolled_count - 1) WHERE id = OLD.cohort_id;
  END IF;
  RETURN NULL;
END;$$;

CREATE OR REPLACE TRIGGER discipleship_enrollment_count
  AFTER INSERT OR DELETE ON discipleship_students
  FOR EACH ROW EXECUTE FUNCTION discipleship_cohort_enrollment_count();

-- 5g. Attendance
CREATE TABLE IF NOT EXISTS discipleship_attendance (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  uuid        NOT NULL REFERENCES discipleship_students(id) ON DELETE CASCADE,
  session_id  uuid        NOT NULL REFERENCES discipleship_sessions(id) ON DELETE CASCADE,
  present     boolean     NOT NULL DEFAULT false,
  marked_by   uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  marked_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, session_id)
);

CREATE OR REPLACE FUNCTION update_discipleship_student_attendance()
  RETURNS trigger LANGUAGE plpgsql AS
$$DECLARE v_total int; v_present int;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE present)
  INTO v_total, v_present
  FROM discipleship_attendance
  WHERE student_id = COALESCE(NEW.student_id, OLD.student_id);
  UPDATE discipleship_students
  SET total_attendance_percent = CASE WHEN v_total = 0 THEN 0 ELSE ROUND((v_present::numeric / v_total) * 100, 2) END
  WHERE id = COALESCE(NEW.student_id, OLD.student_id);
  RETURN NEW;
END;$$;

CREATE OR REPLACE TRIGGER discipleship_attendance_pct
  AFTER INSERT OR UPDATE OR DELETE ON discipleship_attendance
  FOR EACH ROW EXECUTE FUNCTION update_discipleship_student_attendance();

-- 5h. Warnings
CREATE TABLE IF NOT EXISTS discipleship_warnings (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  uuid        NOT NULL REFERENCES discipleship_students(id) ON DELETE CASCADE,
  type        text        NOT NULL CHECK (type IN ('attendance','exam','general')),
  message     text        NOT NULL,
  sent_by     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  sent_at     timestamptz NOT NULL DEFAULT now()
);

-- 5i. Exams
CREATE TABLE IF NOT EXISTS discipleship_exams (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id         uuid        NOT NULL REFERENCES discipleship_cohorts(id) ON DELETE CASCADE,
  session_id        uuid        REFERENCES discipleship_sessions(id) ON DELETE SET NULL,
  level             int         NOT NULL CHECK (level IN (1,2,3)),
  title             text        NOT NULL,
  description       text,
  total_marks       int         NOT NULL DEFAULT 100,
  passing_marks     int         NOT NULL DEFAULT 60,
  duration_minutes  int         NOT NULL DEFAULT 30,
  available_from    timestamptz,
  available_until   timestamptz,
  status            text        NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','published','closed')),
  created_by        uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER discipleship_exams_updated_at
  BEFORE UPDATE ON discipleship_exams
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- 5j. Exam questions
CREATE TABLE IF NOT EXISTS discipleship_exam_questions (
  id              uuid  PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id         uuid  NOT NULL REFERENCES discipleship_exams(id) ON DELETE CASCADE,
  question_number int   NOT NULL,
  type            text  NOT NULL CHECK (type IN ('multiple-choice','true-false')),
  question        text  NOT NULL,
  options         text[] NOT NULL DEFAULT '{}',
  correct_answer  int   NOT NULL,
  marks           int   NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, question_number)
);

-- 5k. Exam results
CREATE TABLE IF NOT EXISTS discipleship_exam_results (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id       uuid        NOT NULL REFERENCES discipleship_exams(id) ON DELETE CASCADE,
  student_id    uuid        NOT NULL REFERENCES discipleship_students(id) ON DELETE CASCADE,
  score         int         NOT NULL DEFAULT 0,
  total_marks   int         NOT NULL,
  percentage    numeric(5,2) NOT NULL DEFAULT 0,
  passed        boolean     NOT NULL DEFAULT false,
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  graded_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, student_id)
);

-- 5l. Exam answers
CREATE TABLE IF NOT EXISTS discipleship_exam_answers (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  result_id       uuid NOT NULL REFERENCES discipleship_exam_results(id) ON DELETE CASCADE,
  question_id     uuid NOT NULL REFERENCES discipleship_exam_questions(id) ON DELETE CASCADE,
  selected_answer int  NOT NULL,
  UNIQUE (result_id, question_id)
);

-- 5m. Update average score trigger
CREATE OR REPLACE FUNCTION update_discipleship_student_exam_score()
  RETURNS trigger LANGUAGE plpgsql AS
$$BEGIN
  UPDATE discipleship_students
  SET average_exam_score = (SELECT COALESCE(AVG(percentage), 0) FROM discipleship_exam_results WHERE student_id = NEW.student_id)
  WHERE id = NEW.student_id;
  RETURN NEW;
END;$$;

CREATE OR REPLACE TRIGGER discipleship_exam_score_update
  AFTER INSERT OR UPDATE ON discipleship_exam_results
  FOR EACH ROW EXECUTE FUNCTION update_discipleship_student_exam_score();

-- 5n. Legacy discipleship requests
CREATE TABLE IF NOT EXISTS discipleship_legacy_requests (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  level           int         NOT NULL CHECK (level IN (1,2,3)),
  cohort_name     text        NOT NULL,
  year_completed  int         NOT NULL,
  teacher_name    text,
  additional_info text,
  status          text        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','verified','rejected')),
  reviewed_by     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  review_notes    text,
  requested_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. CROSSPOINT (Home Church Groups)
-- ============================================================

-- 6a. Crosspoints
CREATE TABLE IF NOT EXISTS crosspoints (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          text        NOT NULL,
  zone          text        NOT NULL CHECK (zone IN ('south','east','north','west')),
  area          text        NOT NULL,
  location      text        NOT NULL,
  status        text        NOT NULL DEFAULT 'forming'
                  CHECK (status IN ('active','inactive','forming')),
  max_members   int         NOT NULL DEFAULT 25,
  member_count  int         NOT NULL DEFAULT 0,
  leader_id     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  assistant_id  uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  treasurer_id  uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  meeting_day   text,
  meeting_time  time,
  venue         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER crosspoints_updated_at
  BEFORE UPDATE ON crosspoints
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- 6b. Crosspoint memberships
CREATE TABLE IF NOT EXISTS crosspoint_memberships (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  crosspoint_id   uuid        NOT NULL REFERENCES crosspoints(id) ON DELETE CASCADE,
  role            text        NOT NULL DEFAULT 'member'
                    CHECK (role IN ('member','leader','assistant','treasurer')),
  joined_date     date        NOT NULL DEFAULT CURRENT_DATE,
  status          text        NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','inactive')),
  UNIQUE (user_id, crosspoint_id)
);

-- Sync member_count
CREATE OR REPLACE FUNCTION sync_crosspoint_member_count()
  RETURNS trigger LANGUAGE plpgsql AS
$$BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE crosspoints SET member_count = member_count + 1 WHERE id = NEW.crosspoint_id;
    UPDATE profiles SET is_in_crosspoint = true WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE crosspoints SET member_count = GREATEST(0, member_count - 1) WHERE id = OLD.crosspoint_id;
  END IF;
  RETURN NULL;
END;$$;

CREATE OR REPLACE TRIGGER crosspoint_membership_count
  AFTER INSERT OR DELETE ON crosspoint_memberships
  FOR EACH ROW EXECUTE FUNCTION sync_crosspoint_member_count();

-- 6c. Transfer requests
CREATE TABLE IF NOT EXISTS transfer_requests (
  id                  uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_crosspoint_id  uuid        NOT NULL REFERENCES crosspoints(id) ON DELETE RESTRICT,
  to_crosspoint_id    uuid        NOT NULL REFERENCES crosspoints(id) ON DELETE RESTRICT,
  reason              text        NOT NULL,
  status              text        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','approved','declined')),
  request_date        date        NOT NULL DEFAULT CURRENT_DATE,
  reviewed_by         uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at         timestamptz
);

-- 6d. Crosspoint Modules (weekly sermon integration)
CREATE TABLE IF NOT EXISTS crosspoint_modules (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           text        NOT NULL,
  series_name     text,
  description     text,
  status          text        NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','published','archived')),
  published_at    timestamptz,
  total_weeks     int         NOT NULL DEFAULT 4,
  scripture_ref   text,
  created_by      uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER crosspoint_modules_updated_at
  BEFORE UPDATE ON crosspoint_modules
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- 6e. Module weeks (content per week)
CREATE TABLE IF NOT EXISTS crosspoint_module_weeks (
  id              uuid  PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id       uuid  NOT NULL REFERENCES crosspoint_modules(id) ON DELETE CASCADE,
  week_number     int   NOT NULL,
  title           text  NOT NULL,
  scripture       text,
  lesson_content  text  NOT NULL DEFAULT '',
  discussion_qs   text[] NOT NULL DEFAULT '{}',
  prayer_points   text[] NOT NULL DEFAULT '{}',
  leader_tips     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (module_id, week_number)
);

-- 6f. Track which crosspoints are using which module week
CREATE TABLE IF NOT EXISTS crosspoint_module_progress (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  crosspoint_id   uuid        NOT NULL REFERENCES crosspoints(id) ON DELETE CASCADE,
  module_id       uuid        NOT NULL REFERENCES crosspoint_modules(id) ON DELETE CASCADE,
  current_week    int         NOT NULL DEFAULT 1,
  started_at      timestamptz NOT NULL DEFAULT now(),
  completed_at    timestamptz,
  UNIQUE (crosspoint_id, module_id)
);

-- ============================================================
-- 7. DEPARTMENTS (Serving Teams)
-- ============================================================

CREATE TABLE IF NOT EXISTS departments (
  id          text        PRIMARY KEY,   -- slug: 'worship', 'media', etc.
  name        text        NOT NULL,
  description text,
  icon        text,
  leader_id   uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Seed core departments
INSERT INTO departments (id, name, description, icon) VALUES
  ('worship',     'Worship & Choir',         'Sunday worship team and choir ministry', 'Music'),
  ('media',       'Media & Tech',            'Sound, lighting, livestream, and graphics', 'Monitor'),
  ('ushering',    'Ushering & Protocol',     'Welcoming and seating ministry', 'Users'),
  ('children',    'Childrens Church',        'Sunday school and kids ministry', 'Heart'),
  ('youth',       'Youth Ministry',          'KAMA youth discipleship and events', 'Zap'),
  ('prayer',      'Prayer Warriors',         'Intercession and prayer ministry', 'BookOpen'),
  ('outreach',    'Outreach & Evangelism',   'Community evangelism and missions', 'Globe'),
  ('hospitality', 'Hospitality',             'Events, food, and guest relations', 'Coffee')
ON CONFLICT (id) DO NOTHING;

-- Department sub-teams
CREATE TABLE IF NOT EXISTS department_sub_teams (
  id            uuid  PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id text  NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  name          text  NOT NULL,
  description   text,
  leader_id     uuid  REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (department_id, name)
);

-- Department memberships
CREATE TABLE IF NOT EXISTS department_memberships (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id   text        NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  role            text        NOT NULL DEFAULT 'member'
                    CHECK (role IN ('member','leader','assistant')),
  sub_team_id     uuid        REFERENCES department_sub_teams(id) ON DELETE SET NULL,
  joined_date     date        NOT NULL DEFAULT CURRENT_DATE,
  status          text        NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','inactive')),
  UNIQUE (user_id, department_id)
);

-- Department join requests
CREATE TABLE IF NOT EXISTS department_join_requests (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department_id   text        NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  sub_team_id     uuid        REFERENCES department_sub_teams(id) ON DELETE SET NULL,
  message         text,
  status          text        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','declined')),
  request_date    date        NOT NULL DEFAULT CURRENT_DATE,
  reviewed_by     uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     timestamptz
);

-- ============================================================
-- 8. EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id                    uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 text        NOT NULL,
  description           text,
  type                  text        NOT NULL CHECK (type IN ('church-wide','department','crosspoint')),
  department_id         text        REFERENCES departments(id) ON DELETE SET NULL,
  crosspoint_id         uuid        REFERENCES crosspoints(id) ON DELETE SET NULL,
  start_date            date        NOT NULL,
  end_date              date,
  time                  time,
  venue                 text,
  capacity              int,
  requires_registration boolean     NOT NULL DEFAULT false,
  registered_count      int         NOT NULL DEFAULT 0,
  status                text        NOT NULL DEFAULT 'upcoming'
                          CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  created_by            uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- Event registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id    uuid        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

CREATE OR REPLACE FUNCTION sync_event_registration_count()
  RETURNS trigger LANGUAGE plpgsql AS
$$BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events SET registered_count = registered_count + 1 WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events SET registered_count = GREATEST(0, registered_count - 1) WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;$$;

CREATE OR REPLACE TRIGGER event_registration_count
  AFTER INSERT OR DELETE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION sync_event_registration_count();

-- ============================================================
-- 9. NOTICES & ANNOUNCEMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       text        NOT NULL,
  content     text        NOT NULL,
  scope       text        NOT NULL DEFAULT 'all'
                CHECK (scope IN ('all','members','leaders','department','crosspoint','connect-cohort','discipleship-cohort')),
  target_id   text,       -- dept slug, uuid, etc. depending on scope
  priority    text        NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low','medium','high')),
  published_at  timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz,
  author_id     uuid      REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS notices_scope_idx ON notices (scope, target_id);
CREATE INDEX IF NOT EXISTS notices_priority_idx ON notices (priority, published_at DESC);

-- ============================================================
-- 10. PRAYER WALL
-- ============================================================
CREATE TABLE IF NOT EXISTS prayer_requests (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  is_anonymous  boolean     NOT NULL DEFAULT false,
  category      text        NOT NULL DEFAULT 'other'
                  CHECK (category IN ('healing','provision','guidance','family','thanksgiving','other')),
  request       text        NOT NULL,
  is_urgent     boolean     NOT NULL DEFAULT false,
  status        text        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','praying','answered')),
  pray_count    int         NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Track who prayed (prevents double-count)
CREATE TABLE IF NOT EXISTS prayer_reactions (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  uuid        NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reacted_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, user_id)
);

CREATE OR REPLACE FUNCTION sync_pray_count()
  RETURNS trigger LANGUAGE plpgsql AS
$$BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prayer_requests SET pray_count = pray_count + 1 WHERE id = NEW.request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prayer_requests SET pray_count = GREATEST(0, pray_count - 1) WHERE id = OLD.request_id;
  END IF;
  RETURN NULL;
END;$$;

CREATE OR REPLACE TRIGGER prayer_react_count
  AFTER INSERT OR DELETE ON prayer_reactions
  FOR EACH ROW EXECUTE FUNCTION sync_pray_count();

-- ============================================================
-- 11. SUGGESTIONS & COMPLAINTS BOX
-- ============================================================
CREATE TABLE IF NOT EXISTS suggestions (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  is_anonymous  boolean     NOT NULL DEFAULT false,
  type          text        NOT NULL CHECK (type IN ('suggestion','complaint','feedback')),
  category      text        NOT NULL DEFAULT 'general'
                  CHECK (category IN ('general','crosspoint','service','department')),
  subject       text        NOT NULL,
  message       text        NOT NULL,
  status        text        NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','reviewing','resolved')),
  admin_response text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. GUESTS (Visitor Tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS guests (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name        text        NOT NULL,
  last_name         text        NOT NULL,
  phone             text        NOT NULL,
  email             text,
  visit_date        date        NOT NULL DEFAULT CURRENT_DATE,
  source            text        NOT NULL DEFAULT 'walk-in'
                      CHECK (source IN ('walk-in','invite','online','event')),
  invited_by        uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  follow_up_status  text        NOT NULL DEFAULT 'pending'
                      CHECK (follow_up_status IN ('pending','contacted','converted','declined')),
  notes             text,
  branch            text        NOT NULL DEFAULT 'Nairobi',
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. FOOD BANK
-- ============================================================
CREATE TABLE IF NOT EXISTS food_bank_requests (
  id                uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  crosspoint_id     uuid        REFERENCES crosspoints(id) ON DELETE SET NULL,
  requested_by_id   uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  request_date      date        NOT NULL DEFAULT CURRENT_DATE,
  status            text        NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','approved','fulfilled','declined')),
  notes             text
);

CREATE TABLE IF NOT EXISTS food_bank_beneficiaries (
  id          uuid  PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id  uuid  NOT NULL REFERENCES food_bank_requests(id) ON DELETE CASCADE,
  user_id     uuid  REFERENCES profiles(id) ON DELETE SET NULL,
  name        text  NOT NULL
);

-- ============================================================
-- 14. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text        NOT NULL CHECK (type IN (
                'exam_result','attendance','warning','notice','event',
                'graduation','prayer','broadcast','system'
              )),
  title       text        NOT NULL,
  body        text        NOT NULL,
  action_url  text,       -- deep link: '/connect/student', etc.
  is_read     boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_unread ON notifications (user_id, is_read, created_at DESC);

-- Enable Realtime on notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- 15. BROADCASTS (Bulk Communication)
-- ============================================================
CREATE TABLE IF NOT EXISTS broadcasts (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           text        NOT NULL,
  message         text        NOT NULL,
  audience        text        NOT NULL DEFAULT 'all'
                    CHECK (audience IN ('all','members','leaders','connect-cohort','discipleship','crosspoint','department')),
  audience_id     text,       -- specific cohort/dept/crosspoint id if targeted
  channels        text[]      NOT NULL DEFAULT '{"in-app"}',
  status          text        NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','scheduled')),
  scheduled_for   timestamptz,
  sent_at         timestamptz,
  created_by      uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  recipient_count int         NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS broadcast_recipients (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  broadcast_id    uuid        NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delivered_at    timestamptz,
  read_at         timestamptz,
  UNIQUE (broadcast_id, user_id)
);

-- ============================================================
-- 16. GIVING / DONATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS giving_transactions (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  amount_kes      numeric(12,2) NOT NULL CHECK (amount_kes > 0),
  giving_type     text        NOT NULL DEFAULT 'tithe'
                    CHECK (giving_type IN ('tithe','offering','building','missions','thanksgiving','other')),
  reference       text        UNIQUE,   -- payment provider reference
  provider        text        NOT NULL DEFAULT 'mpesa'
                    CHECK (provider IN ('mpesa','card','bank')),
  status          text        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','completed','failed','refunded')),
  note            text,
  transaction_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS giving_user_idx ON giving_transactions (user_id, transaction_at DESC);

-- ============================================================
-- 17. REAL-TIME CLASSROOM (Supabase Realtime)
-- ============================================================

-- Room (maps to a connect_session or discipleship_session)
CREATE TABLE IF NOT EXISTS classroom_rooms (
  id              uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      uuid,       -- nullable so room can be ad-hoc
  session_type    text        NOT NULL DEFAULT 'connect'
                    CHECK (session_type IN ('connect','discipleship')),
  cohort_id       uuid,
  title           text        NOT NULL,
  host_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status          text        NOT NULL DEFAULT 'waiting'
                    CHECK (status IN ('waiting','live','ended')),
  started_at      timestamptz,
  ended_at        timestamptz,
  duration_secs   int,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Participants in a room
CREATE TABLE IF NOT EXISTS classroom_participants (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id       uuid        NOT NULL REFERENCES classroom_rooms(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role          text        NOT NULL DEFAULT 'student'
                  CHECK (role IN ('teacher','student')),
  is_audio_on   boolean     NOT NULL DEFAULT false,
  is_video_on   boolean     NOT NULL DEFAULT false,
  hand_raised   boolean     NOT NULL DEFAULT false,
  joined_at     timestamptz NOT NULL DEFAULT now(),
  left_at       timestamptz,
  UNIQUE (room_id, user_id)
);

-- Real-time chat messages
CREATE TABLE IF NOT EXISTS classroom_messages (
  id          uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id     uuid        NOT NULL REFERENCES classroom_rooms(id) ON DELETE CASCADE,
  sender_id   uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message     text        NOT NULL,
  sent_at     timestamptz NOT NULL DEFAULT now()
);

-- WebRTC signaling (offer/answer/ice exchange)
CREATE TABLE IF NOT EXISTS classroom_signaling (
  id            uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id       uuid        NOT NULL REFERENCES classroom_rooms(id) ON DELETE CASCADE,
  from_user_id  uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          text        NOT NULL CHECK (type IN ('offer','answer','ice-candidate')),
  payload       jsonb       NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Enable Supabase Realtime for classroom tables
ALTER PUBLICATION supabase_realtime ADD TABLE classroom_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE classroom_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE classroom_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE classroom_signaling;

-- Cleanup old signaling (older than 10 minutes) — run via pg_cron if available
-- SELECT cron.schedule('cleanup-signaling', '*/10 * * * *', $$DELETE FROM classroom_signaling WHERE created_at < now() - interval '10 minutes'$$);

-- ============================================================
-- 18. PROFILE AUTO-CREATION (on auth.users insert)
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS
$$
DECLARE
  v_first text;
  v_last  text;
BEGIN
  v_first := COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1));
  v_last  := COALESCE(NEW.raw_user_meta_data->>'last_name', '');
  INSERT INTO profiles (id, email, phone, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    v_first,
    v_last,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 19. ROW-LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_cohorts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_sessions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_resources            ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_students             ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_attendance           ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_warnings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_exams                ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_exam_questions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_exam_results         ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_exam_answers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_member_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_courses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_cohorts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_resources       ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_students        ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_attendance      ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_warnings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_exams           ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_exam_questions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_exam_results    ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_exam_answers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipleship_legacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE crosspoints                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE crosspoint_memberships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE crosspoint_modules           ENABLE ROW LEVEL SECURITY;
ALTER TABLE crosspoint_module_weeks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE crosspoint_module_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_sub_teams         ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_memberships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE department_join_requests     ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests              ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_reactions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_bank_requests           ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_bank_beneficiaries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications                ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_recipients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE giving_transactions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_rooms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_participants       ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_signaling          ENABLE ROW LEVEL SECURITY;

-- ── Profiles ─────────────────────────────────────────────────────────────────
CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY profiles_insert ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_staff());

CREATE POLICY profiles_admin_all ON profiles FOR ALL
  USING (is_admin());

-- ── Notifications (own only) ──────────────────────────────────────────────────
CREATE POLICY notifications_own ON notifications FOR ALL
  USING (user_id = auth.uid());

-- ── Connect: students see own data, staff see all ────────────────────────────
CREATE POLICY connect_students_select ON connect_students FOR SELECT
  USING (user_id = auth.uid() OR is_staff());

CREATE POLICY connect_students_insert ON connect_students FOR INSERT
  WITH CHECK (is_staff());

CREATE POLICY connect_students_update ON connect_students FOR UPDATE
  USING (is_staff());

-- ── Connect exams: students can only see published exams ─────────────────────
CREATE POLICY connect_exams_student ON connect_exams FOR SELECT
  USING (status = 'published' OR is_staff());

CREATE POLICY connect_exam_questions_student ON connect_exam_questions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM connect_exams e WHERE e.id = exam_id AND (e.status = 'published' OR is_staff()))
  );

-- Students can insert their own results; staff can see all
CREATE POLICY connect_exam_results_insert ON connect_exam_results FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM connect_students WHERE user_id = auth.uid())
  );

CREATE POLICY connect_exam_results_select ON connect_exam_results FOR SELECT
  USING (
    student_id IN (SELECT id FROM connect_students WHERE user_id = auth.uid())
    OR is_staff()
  );

CREATE POLICY connect_exam_answers_insert ON connect_exam_answers FOR INSERT
  WITH CHECK (
    result_id IN (
      SELECT r.id FROM connect_exam_results r
      JOIN connect_students s ON s.id = r.student_id
      WHERE s.user_id = auth.uid()
    )
  );

-- ── Connect cohorts / sessions — authenticated users can read ─────────────────
CREATE POLICY connect_cohorts_select ON connect_cohorts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY connect_sessions_select ON connect_sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY connect_resources_select ON connect_resources FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Staff can mutate cohorts/sessions
CREATE POLICY connect_cohorts_write ON connect_cohorts FOR ALL
  USING (is_staff());

CREATE POLICY connect_sessions_write ON connect_sessions FOR ALL
  USING (is_staff());

-- ── Discipleship: mirror connect patterns ────────────────────────────────────
CREATE POLICY discipleship_courses_select ON discipleship_courses FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY discipleship_cohorts_select ON discipleship_cohorts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY discipleship_cohorts_write ON discipleship_cohorts FOR ALL
  USING (is_staff());

CREATE POLICY discipleship_sessions_select ON discipleship_sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY discipleship_students_select ON discipleship_students FOR SELECT
  USING (user_id = auth.uid() OR is_staff());

CREATE POLICY discipleship_students_write ON discipleship_students FOR ALL
  USING (is_staff());

CREATE POLICY discipleship_exams_student ON discipleship_exams FOR SELECT
  USING (status = 'published' OR is_staff());

CREATE POLICY discipleship_exam_results_insert ON discipleship_exam_results FOR INSERT
  WITH CHECK (
    student_id IN (SELECT id FROM discipleship_students WHERE user_id = auth.uid())
  );

CREATE POLICY discipleship_exam_results_select ON discipleship_exam_results FOR SELECT
  USING (
    student_id IN (SELECT id FROM discipleship_students WHERE user_id = auth.uid())
    OR is_staff()
  );

-- ── Crosspoints — authenticated read, leaders/staff write ────────────────────
CREATE POLICY crosspoints_select ON crosspoints FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY crosspoints_write ON crosspoints FOR ALL
  USING (is_staff());

CREATE POLICY crosspoint_memberships_select ON crosspoint_memberships FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY crosspoint_modules_select ON crosspoint_modules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY crosspoint_modules_write ON crosspoint_modules FOR ALL
  USING (is_staff());

CREATE POLICY crosspoint_module_weeks_select ON crosspoint_module_weeks FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── Departments ───────────────────────────────────────────────────────────────
CREATE POLICY departments_select ON departments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY department_memberships_select ON department_memberships FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── Notices, Events (authenticated read) ─────────────────────────────────────
CREATE POLICY notices_select ON notices FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY notices_write ON notices FOR ALL
  USING (is_staff());

CREATE POLICY events_select ON events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY events_write ON events FOR ALL
  USING (is_staff());

CREATE POLICY event_registrations_own ON event_registrations FOR ALL
  USING (user_id = auth.uid() OR is_staff());

-- ── Prayer requests (own + non-anonymous are public) ─────────────────────────
CREATE POLICY prayer_requests_select ON prayer_requests FOR SELECT
  USING (
    (NOT is_anonymous)
    OR user_id = auth.uid()
    OR is_staff()
  );

CREATE POLICY prayer_requests_insert ON prayer_requests FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY prayer_requests_update ON prayer_requests FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY prayer_reactions_own ON prayer_reactions FOR ALL
  USING (user_id = auth.uid());

-- ── Suggestions (own only, staff see all) ────────────────────────────────────
CREATE POLICY suggestions_select ON suggestions FOR SELECT
  USING (user_id = auth.uid() OR is_staff());

CREATE POLICY suggestions_insert ON suggestions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── Giving (own only, admin sees all) ────────────────────────────────────────
CREATE POLICY giving_own ON giving_transactions FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY giving_insert ON giving_transactions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ── Classroom rooms — participants of the room can see/write ─────────────────
CREATE POLICY classroom_rooms_select ON classroom_rooms FOR SELECT
  USING (
    host_id = auth.uid()
    OR EXISTS (SELECT 1 FROM classroom_participants p WHERE p.room_id = id AND p.user_id = auth.uid())
    OR is_staff()
  );

CREATE POLICY classroom_rooms_insert ON classroom_rooms FOR INSERT
  WITH CHECK (is_staff());

CREATE POLICY classroom_participants_all ON classroom_participants FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM classroom_rooms r WHERE r.id = room_id AND r.host_id = auth.uid())
    OR is_staff()
  );

CREATE POLICY classroom_messages_all ON classroom_messages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM classroom_participants p WHERE p.room_id = room_id AND p.user_id = auth.uid())
    OR is_staff()
  );

CREATE POLICY classroom_signaling_all ON classroom_signaling FOR ALL
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- ── Broadcasts (staff write, recipients read own) ────────────────────────────
CREATE POLICY broadcasts_select ON broadcasts FOR SELECT
  USING (is_staff());

CREATE POLICY broadcasts_write ON broadcasts FOR ALL
  USING (is_staff());

CREATE POLICY broadcast_recipients_select ON broadcast_recipients FOR SELECT
  USING (user_id = auth.uid() OR is_staff());

-- ── Guests (staff only) ───────────────────────────────────────────────────────
CREATE POLICY guests_all ON guests FOR ALL
  USING (is_staff());

-- ── Food bank (staff only) ────────────────────────────────────────────────────
CREATE POLICY food_bank_requests_all ON food_bank_requests FOR ALL
  USING (is_staff() OR requested_by_id = auth.uid());

-- ============================================================
-- 20. GLOBAL SEARCH FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION search_members(p_query text, p_limit int DEFAULT 20)
  RETURNS TABLE (
    id          uuid,
    full_name   text,
    email       text,
    phone       text,
    role        text,
    status      text,
    member_id   text,
    avatar_url  text,
    rank        float4
  )
  LANGUAGE sql STABLE SECURITY DEFINER AS
$$
SELECT
  p.id, p.full_name, p.email, p.phone, p.role, p.status, p.member_id, p.avatar_url,
  ts_rank(
    to_tsvector('english',
      coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'') || ' ' ||
      coalesce(p.email,'') || ' ' || coalesce(p.phone,'') || ' ' || coalesce(p.member_id,'')
    ),
    plainto_tsquery('english', p_query)
  ) +
  similarity(p.full_name, p_query) * 0.5 AS rank
FROM profiles p
WHERE
  to_tsvector('english',
    coalesce(p.first_name,'') || ' ' || coalesce(p.last_name,'') || ' ' ||
    coalesce(p.email,'') || ' ' || coalesce(p.phone,'') || ' ' || coalesce(p.member_id,'')
  ) @@ plainto_tsquery('english', p_query)
  OR similarity(p.full_name, p_query) > 0.2
  OR p.email ILIKE '%' || p_query || '%'
  OR p.phone ILIKE '%' || p_query || '%'
  OR p.member_id ILIKE '%' || p_query || '%'
ORDER BY rank DESC
LIMIT p_limit;
$$;

-- ============================================================
-- 21. STATS VIEWS (for admin dashboard)
-- ============================================================
CREATE OR REPLACE VIEW v_platform_stats AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE status = 'active')           AS active_members,
  (SELECT COUNT(*) FROM profiles WHERE role = 'student')            AS students,
  (SELECT COUNT(*) FROM connect_cohorts WHERE status = 'active')    AS active_connect_cohorts,
  (SELECT COUNT(*) FROM discipleship_cohorts WHERE status = 'active') AS active_kdc_cohorts,
  (SELECT COUNT(*) FROM crosspoints WHERE status = 'active')        AS active_crosspoints,
  (SELECT COUNT(*) FROM guests WHERE created_at > now() - interval '30 days') AS guests_30d,
  (SELECT COALESCE(SUM(amount_kes),0) FROM giving_transactions WHERE status = 'completed' AND transaction_at > date_trunc('month', now())) AS giving_this_month_kes;

-- Grant select on the view to authenticated users via service-role calls
GRANT SELECT ON v_platform_stats TO authenticated;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
-- Next steps:
--   1. Run this script in Supabase SQL Editor
--   2. Set up pg_cron for classroom_signaling cleanup if needed
--   3. Enable Realtime in Supabase Dashboard → Database → Replication
--      and ensure supabase_realtime publication is enabled
--   4. Run: SELECT * FROM v_platform_stats; to verify
-- ============================================================
