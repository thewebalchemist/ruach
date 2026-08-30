-- Found while wiring up pages/connect/cohorts/[id].tsx's "Notify All Students"
-- feature to real data: notifications' only policy (notifications_own, FOR
-- ALL) requires user_id = auth.uid(), so a teacher can only ever insert a
-- notification addressed to themselves — every staff-initiated notification
-- to a student would be silently rejected by RLS. Every other place in the
-- app that notifies someone other than the caller does so via the
-- service-role client in an API route (e.g. lib/exams/submitAndGrade.ts),
-- bypassing RLS entirely; this is the first client-side case.
--
-- Adding a narrow INSERT-only policy rather than loosening notifications_own
-- itself: staff should be able to create a notification for any user, but
-- should NOT gain the ability to read, mark-read, or delete other users'
-- notifications through this same grant — that stays self-only.
CREATE POLICY notifications_staff_insert ON notifications FOR INSERT
  WITH CHECK (is_staff());
