-- ============================================================
-- crosspoints/notices/events/food_bank_* were all is_staff()-only for
-- writes (teacher/admin/pastor). Crosspoint leaders are ordinary
-- 'member'-role profiles granted leadership via crosspoint_memberships,
-- so none of them could actually use their own Settings/Notices/
-- Schedule/Food Bank pages. Same pattern as crosspoint_attendance_write
-- and crosspoint_module_progress_write (migration 20260809192711):
-- add a second, narrowly-scoped policy for active leader/assistant/
-- treasurer of that specific crosspoint, layered on top of the
-- existing is_staff() policy rather than replacing it.
-- ============================================================

CREATE POLICY crosspoints_leader_update ON crosspoints FOR UPDATE
  USING (
    id IN (
      SELECT crosspoint_id FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  )
  WITH CHECK (
    id IN (
      SELECT crosspoint_id FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  );

CREATE POLICY notices_crosspoint_leader_write ON notices FOR ALL
  USING (
    scope = 'crosspoint'
    AND target_id IN (
      SELECT crosspoint_id::text FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  )
  WITH CHECK (
    scope = 'crosspoint'
    AND target_id IN (
      SELECT crosspoint_id::text FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  );

CREATE POLICY events_crosspoint_leader_write ON events FOR ALL
  USING (
    type = 'crosspoint'
    AND crosspoint_id IN (
      SELECT crosspoint_id FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  )
  WITH CHECK (
    type = 'crosspoint'
    AND crosspoint_id IN (
      SELECT crosspoint_id FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  );

CREATE POLICY food_bank_requests_crosspoint_leader_write ON food_bank_requests FOR ALL
  USING (
    crosspoint_id IN (
      SELECT crosspoint_id FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  )
  WITH CHECK (
    crosspoint_id IN (
      SELECT crosspoint_id FROM crosspoint_memberships
      WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
    )
  );

CREATE POLICY food_bank_beneficiaries_crosspoint_leader_write ON food_bank_beneficiaries FOR ALL
  USING (
    request_id IN (
      SELECT id FROM food_bank_requests WHERE crosspoint_id IN (
        SELECT crosspoint_id FROM crosspoint_memberships
        WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
      )
    )
  )
  WITH CHECK (
    request_id IN (
      SELECT id FROM food_bank_requests WHERE crosspoint_id IN (
        SELECT crosspoint_id FROM crosspoint_memberships
        WHERE user_id = auth.uid() AND role IN ('leader','assistant','treasurer') AND status = 'active'
      )
    )
  );
