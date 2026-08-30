-- departments had SELECT only — no write policy at all, so admin edits
-- (name/description/icon/leader_id) could never persist.
CREATE POLICY departments_write ON departments FOR ALL
  USING (is_staff())
  WITH CHECK (is_staff());
