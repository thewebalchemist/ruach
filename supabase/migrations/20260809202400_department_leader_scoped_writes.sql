-- Mirrors 20260809200210_crosspoint_leader_scoped_writes.sql for departments:
-- notices/events write policies are is_staff()-only, but department leaders
-- are ordinary profiles granted leadership via department_memberships, so
-- they could never post a department notice or schedule a department event
-- from their own portal. Layer a narrowly-scoped policy on top.

CREATE POLICY notices_department_leader_write ON notices FOR ALL
  USING (
    scope = 'department'
    AND target_id IN (
      SELECT department_id FROM department_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant') AND status = 'active'
    )
  )
  WITH CHECK (
    scope = 'department'
    AND target_id IN (
      SELECT department_id FROM department_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant') AND status = 'active'
    )
  );

CREATE POLICY events_department_leader_write ON events FOR ALL
  USING (
    type = 'department'
    AND department_id IN (
      SELECT department_id FROM department_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant') AND status = 'active'
    )
  )
  WITH CHECK (
    type = 'department'
    AND department_id IN (
      SELECT department_id FROM department_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant') AND status = 'active'
    )
  );

CREATE POLICY department_memberships_leader_write ON department_memberships FOR ALL
  USING (
    department_id IN (
      SELECT department_id FROM department_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant') AND status = 'active'
    )
  )
  WITH CHECK (
    department_id IN (
      SELECT department_id FROM department_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant') AND status = 'active'
    )
  );
