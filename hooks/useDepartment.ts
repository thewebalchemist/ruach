// hooks/useDepartment.ts
// Shared "load one department by id" logic for pages/department/[deptId]/*
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Department } from '@/types';

export function useDepartment(deptId: string | undefined) {
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!deptId) return;
    setLoading(true);
    const [deptRes, countRes] = await Promise.all([
      supabase.from('departments').select('id, name, description, icon, leader_id').eq('id', deptId).single(),
      supabase.from('department_memberships').select('id', { count: 'exact', head: true }).eq('department_id', deptId).eq('status', 'active'),
    ]);

    setDepartment(deptRes.data ? {
      id: deptRes.data.id,
      name: deptRes.data.name,
      description: deptRes.data.description ?? '',
      icon: deptRes.data.icon ?? '🤝',
      leaderId: deptRes.data.leader_id ?? '',
      memberCount: countRes.count ?? 0,
    } as Department : null);
    setLoading(false);
  }, [deptId]);

  useEffect(() => { load(); }, [load]);

  return { department, loading, reload: load };
}
