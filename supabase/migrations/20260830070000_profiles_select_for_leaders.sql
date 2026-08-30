-- Found via live click-through as a real, non-staff department leader
-- (mary.wanjiku — role 'member', leads Worship & Choir only through a
-- department_memberships row, not through profiles.role). Her own
-- department's "Members" page showed her own row correctly but every
-- other member as a completely blank row — no name, no initials, no
-- contact info, just the role/joined-date columns that come from
-- department_memberships itself rather than profiles.
--
-- Root cause: profiles_select (tightened in
-- 20260809132121_tighten_profiles_select_rls.sql) is `id = auth.uid() OR
-- is_staff()`. A department or Crosspoint leader who isn't ALSO global
-- staff (admin/pastor/teacher) can see that fellow members exist via
-- department_memberships/crosspoint_memberships, but RLS silently blocks
-- reading anything about who they actually are. This affects every
-- non-staff leader in the seed data (mary.wanjiku, john.otieno for
-- departments; jane.kamau, peter.ochieng for Crosspoints) and would affect
-- any real one going forward.
--
-- Two new SELECT policies, each scoped narrowly to "a leader/assistant can
-- see the profile of an active member of the same department/crosspoint
-- they lead" — not a blanket loosening of profiles_select, and mirrors the
-- existing is_department_leader() SECURITY DEFINER pattern used for the
-- same recursion-safety reason on department_memberships' own policies.

CREATE OR REPLACE FUNCTION is_crosspoint_leader(p_crosspoint_id uuid)
  RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS
$$
  SELECT EXISTS (
    SELECT 1 FROM crosspoint_memberships
    WHERE user_id = auth.uid() AND crosspoint_id = p_crosspoint_id
      AND role IN ('leader','assistant','treasurer') AND status = 'active'
  )
$$;

CREATE POLICY profiles_select_department_members ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM department_memberships dm
      WHERE dm.user_id = profiles.id AND dm.status = 'active'
        AND is_department_leader(dm.department_id)
    )
  );

CREATE POLICY profiles_select_crosspoint_members ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crosspoint_memberships cm
      WHERE cm.user_id = profiles.id AND cm.status = 'active'
        AND is_crosspoint_leader(cm.crosspoint_id)
    )
  );
