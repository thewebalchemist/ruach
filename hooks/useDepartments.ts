// hooks/useDepartments.ts
// Live replacement for the mock department list in data/organizations.ts,
// which doesn't match the real seeded `departments` table at all (different
// ids, different ministries — see AUDIT_REPORT.md). The database is the
// source of truth: it's what foreign keys (department_memberships,
// user_admin_roles, etc.) actually reference.
//
// Not yet wired into the ~48 pages still importing from '@/data' — that
// repointing happens module-by-module in Batches 4-6 alongside the rest of
// each module's real-data wiring, not as a standalone mechanical swap here.
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  leaderId: string | null;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('departments')
      .select('id, name, description, icon, leader_id')
      .order('name')
      .then(({ data }) => {
        if (cancelled) return;
        setDepartments((data ?? []).map(d => ({
          id: d.id, name: d.name, description: d.description, icon: d.icon, leaderId: d.leader_id,
        })));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { departments, loading };
}
