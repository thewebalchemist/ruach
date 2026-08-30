-- ============================================================
-- Crosspoint had no attendance table at all (unlike Connect/Discipleship's
-- connect_attendance/discipleship_attendance) — "Take Attendance" had
-- nothing to write to. Crosspoints don't have discrete session rows like
-- Connect/Discipleship cohorts do (they meet on a recurring weekly
-- schedule), so this is scoped by crosspoint_id + date instead of a
-- session_id foreign key.
-- ============================================================

-- uuid-ossp installs into the `extensions` schema on Supabase; this
-- connection's search_path doesn't include it by default.
SET search_path TO public, extensions;

CREATE TABLE IF NOT EXISTS crosspoint_attendance (
  id             uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  crosspoint_id  uuid        NOT NULL REFERENCES crosspoints(id) ON DELETE CASCADE,
  user_id        uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meeting_date   date        NOT NULL,
  present        boolean     NOT NULL DEFAULT true,
  marked_by      uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  marked_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (crosspoint_id, user_id, meeting_date)
);

ALTER TABLE crosspoint_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY crosspoint_attendance_select ON crosspoint_attendance FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_staff()
    OR crosspoint_id IN (
      SELECT crosspoint_id FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  );

CREATE POLICY crosspoint_attendance_write ON crosspoint_attendance FOR ALL
  USING (
    is_staff()
    OR crosspoint_id IN (
      SELECT crosspoint_id FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  );

-- ── Remaining gaps found while wiring the module ──────────────────────────────
CREATE POLICY crosspoint_module_weeks_write ON crosspoint_module_weeks FOR ALL
  USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY crosspoint_module_progress_select ON crosspoint_module_progress FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY crosspoint_module_progress_write ON crosspoint_module_progress FOR ALL
  USING (
    is_staff()
    OR crosspoint_id IN (
      SELECT crosspoint_id FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  );

CREATE POLICY food_bank_beneficiaries_all ON food_bank_beneficiaries FOR ALL
  USING (is_staff());
