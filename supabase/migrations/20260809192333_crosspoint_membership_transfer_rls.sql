-- ============================================================
-- Batch 6 — Crosspoint. crosspoint_memberships had a SELECT policy only
-- (no INSERT at all, so "join a crosspoint" could never succeed regardless
-- of the app-layer bug being fixed alongside this). transfer_requests had
-- RLS enabled with zero policies at all (deny-everyone, including staff).
-- ============================================================

CREATE POLICY crosspoint_memberships_insert ON crosspoint_memberships FOR INSERT
  WITH CHECK (user_id = auth.uid() OR is_staff());

CREATE POLICY crosspoint_memberships_update ON crosspoint_memberships FOR UPDATE
  USING (is_staff());

CREATE POLICY transfer_requests_select ON transfer_requests FOR SELECT
  USING (user_id = auth.uid() OR is_staff());

CREATE POLICY transfer_requests_insert ON transfer_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY transfer_requests_update ON transfer_requests FOR UPDATE
  USING (is_staff());
