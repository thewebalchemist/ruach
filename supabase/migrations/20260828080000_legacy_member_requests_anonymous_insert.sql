-- Found via QA schema audit: pages/connect/register.tsx's "Older cohort /
-- Legacy" self-service path (submitLegacy()) is deliberately reachable by an
-- anonymous, pre-account visitor — it never calls supabase.auth.signUp(),
-- it just files a request for staff to review and later match/create an
-- account for (pages/api/admin/verify-legacy-request.ts handles that side).
-- But the only INSERT policy on this table requires user_id = auth.uid(),
-- which an anonymous caller can never satisfy (auth.uid() is NULL), so this
-- form has always 403'd for the exact audience it's built for. The
-- authenticated-member equivalent (pages/member/onboarding.tsx's legacy
-- branch, which does supply a real user_id) is already covered by the
-- existing policy — this adds the anonymous case alongside it. Anonymous
-- rows are visible only to staff (existing SELECT policy: user_id =
-- auth.uid() OR is_staff() — NULL never matches a real auth.uid()), so
-- nothing here loosens read access.
CREATE POLICY legacy_member_requests_anonymous_insert ON legacy_member_requests FOR INSERT
  WITH CHECK (user_id IS NULL);
