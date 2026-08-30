-- department_sub_teams had RLS enabled with zero policies (deny-all, including
-- staff) — same "RLS enabled, zero policies" pattern found repeatedly elsewhere.
CREATE POLICY department_sub_teams_select ON department_sub_teams FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY department_sub_teams_write ON department_sub_teams FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());
