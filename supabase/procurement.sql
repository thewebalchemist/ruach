-- Procurement & Finance tracking
CREATE TABLE IF NOT EXISTS procurement_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general' CHECK (category IN ('office', 'equipment', 'maintenance', 'ministry', 'food-bank', 'events', 'general')),
  requested_by uuid REFERENCES profiles(id),
  amount_estimated numeric(12,2),
  amount_approved numeric(12,2),
  vendor text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'purchased', 'delivered')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  department_id text REFERENCES departments(id),
  crosspoint_id uuid REFERENCES crosspoints(id),
  receipt_url text,
  notes text,
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE procurement_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff_select_procurement" ON procurement_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff_insert_procurement" ON procurement_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_update_procurement" ON procurement_requests FOR UPDATE TO authenticated USING (true);
