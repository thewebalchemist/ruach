-- connect_resources had only a SELECT policy — teachers could never add or
-- remove a resource through the normal client.
CREATE POLICY connect_resources_write ON connect_resources FOR ALL
  USING (is_staff()) WITH CHECK (is_staff());
