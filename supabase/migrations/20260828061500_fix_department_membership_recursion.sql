-- Bug: department_memberships_leader_write (added in
-- 20260809202400_department_leader_scoped_writes.sql) queries
-- department_memberships from within a policy defined ON
-- department_memberships — Postgres re-applies RLS to that inner SELECT,
-- which re-evaluates the same policy, forever: "infinite recursion
-- detected in policy for relation department_memberships" (42P17). This
-- breaks every query that touches the table, including unrelated ones
-- (events, notices) whose own leader-scoped policies reference it.
--
-- Fix: move the membership check into a SECURITY DEFINER function (same
-- pattern as is_staff()), so the inner lookup bypasses RLS instead of
-- re-triggering it.

CREATE OR REPLACE FUNCTION is_department_leader(p_department_id text)
  RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS
$$
  SELECT EXISTS (
    SELECT 1 FROM department_memberships
    WHERE user_id = auth.uid() AND department_id = p_department_id
      AND role IN ('leader','assistant') AND status = 'active'
  )
$$;

DROP POLICY IF EXISTS department_memberships_leader_write ON department_memberships;
CREATE POLICY department_memberships_leader_write ON department_memberships FOR ALL
  USING (is_department_leader(department_id))
  WITH CHECK (is_department_leader(department_id));
