-- suggestions had SELECT/INSERT policies but no UPDATE policy at all, so the
-- admin "Start Review" / "Mark Resolved" / respond actions could never persist.
CREATE POLICY suggestions_update ON suggestions FOR UPDATE
  USING (is_staff())
  WITH CHECK (is_staff());
