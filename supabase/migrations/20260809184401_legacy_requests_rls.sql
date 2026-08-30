-- ============================================================
-- legacy_member_requests and discipleship_legacy_requests both had RLS
-- enabled with zero policies (deny-all by default) — meaning staff could
-- never read them through the normal client, and the submitter couldn't
-- see their own request status either. This is why
-- pages/connect/legacy-requests.tsx was stuck reading mock data: the real
-- table was unreadable. See AUDIT_REPORT.md / execution plan Batch 4/5.
-- ============================================================

CREATE POLICY legacy_member_requests_select ON legacy_member_requests FOR SELECT
  USING (user_id = auth.uid() OR is_staff());

CREATE POLICY discipleship_legacy_requests_select ON discipleship_legacy_requests FOR SELECT
  USING (user_id = auth.uid() OR is_staff());
