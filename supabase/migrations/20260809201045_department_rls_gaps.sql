-- ============================================================
-- department_memberships had SELECT only — no write policy at all, so
-- nothing (not even staff) could ever add/remove a department member.
-- department_join_requests had RLS enabled with zero policies — deny-all,
-- so a member submitting "request to join a department" always silently
-- failed. Same "RLS enabled, zero policies" pattern found repeatedly
-- elsewhere in this codebase (crosspoint_attendance, discipleship exam
-- tables, etc.) — fixed the same way: is_staff() for admin writes, plus
-- a narrowly-scoped self policy for the member's own request/membership.
-- ============================================================

CREATE POLICY department_memberships_write ON department_memberships FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY department_join_requests_select ON department_join_requests FOR SELECT
  USING (user_id = auth.uid() OR is_staff());

CREATE POLICY department_join_requests_insert ON department_join_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY department_join_requests_update ON department_join_requests FOR UPDATE
  USING (is_staff());
