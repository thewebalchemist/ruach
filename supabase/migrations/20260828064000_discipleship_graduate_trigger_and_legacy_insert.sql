-- Two gaps found during QA (staging click-through + data seeding):
--
-- 1. discipleship_students.can_graduate has no auto-computing trigger —
--    Connect Class has had update_connect_can_graduate()/connect_graduate_check
--    since the original schema; Discipleship never got the equivalent, so the
--    column just sits at its default false forever. Proven with real seeded
--    data: a student at 100% attendance / 100% exam average (cohort minimums
--    80%/60%) still reads can_graduate=false. The admin graduate flow
--    (pages/admin/discipleship/cohorts/[id]/graduate.tsx) was deliberately
--    built to recompute eligibility from the live percentage columns rather
--    than trust this flag, so that page is unaffected — but any other code
--    or future page that trusts discipleship_students.can_graduate directly
--    would be reading stale data. Mirrors Connect's trigger exactly.
--
-- 2. legacy_member_requests and discipleship_legacy_requests both only got
--    a SELECT policy (20260809184401_legacy_requests_rls.sql) — RLS defaults
--    to deny-all otherwise, so a real member submitting either self-service
--    "verify my past attendance" form gets a silent RLS-denied error.

CREATE OR REPLACE FUNCTION update_discipleship_can_graduate()
  RETURNS trigger LANGUAGE plpgsql AS
$$BEGIN
  NEW.can_graduate :=
    NEW.total_attendance_percent >= (
      SELECT min_attendance_percent FROM discipleship_cohorts WHERE id = NEW.cohort_id
    ) AND
    NEW.average_exam_score >= (
      SELECT min_exam_score FROM discipleship_cohorts WHERE id = NEW.cohort_id
    );
  RETURN NEW;
END;$$;

CREATE OR REPLACE TRIGGER discipleship_graduate_check
  BEFORE UPDATE OF total_attendance_percent, average_exam_score ON discipleship_students
  FOR EACH ROW EXECUTE FUNCTION update_discipleship_can_graduate();

-- Backfill existing rows once (trigger only fires on future UPDATEs of
-- those two columns, so anything already sitting at stale values needs a
-- one-time nudge — an UPDATE of a column to its own value still fires a
-- column-specific BEFORE UPDATE OF trigger).
UPDATE discipleship_students SET total_attendance_percent = total_attendance_percent;

CREATE POLICY legacy_member_requests_insert ON legacy_member_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY discipleship_legacy_requests_insert ON discipleship_legacy_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());
