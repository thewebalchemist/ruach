-- connect_students had only a staff-only INSERT policy (with_check: is_staff()),
-- unlike its sibling discipleship_students which already has a proper
-- discipleship_students_self_insert (user_id = auth.uid()) policy. That means
-- the actual public Connect Class self-registration flow (pages/connect/
-- register.tsx, called with the plain browser client, not a service-role
-- route) has been rejected by RLS for every real, non-staff registrant —
-- not a UI bug, a database-level 403 on the core "join Connect Class" path.
-- UPDATE is deliberately left staff-only, mirroring discipleship_students
-- (student-facing writes like attendance/exam scores go through dedicated
-- service-role API routes, not direct client updates).
CREATE POLICY connect_students_self_insert ON connect_students FOR INSERT
  WITH CHECK (user_id = auth.uid());
