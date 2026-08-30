// hooks/useCrosspoint.ts
// Shared "load one crosspoint by id" logic — every pages/crosspoint/[cpId]/*
// page used to repeat this exact fetch-and-map (and, before Batch 6, did it
// against mock data). One hook now serves all of them.
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Crosspoint } from '@/types';

export function useCrosspoint(cpId: string | undefined) {
  const [crosspoint, setCrosspoint] = useState<Crosspoint | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!cpId) return;
    setLoading(true);
    const { data: cp } = await supabase
      .from('crosspoints')
      .select('id, name, zone, area, location, status, max_members, member_count, leader_id, assistant_id, treasurer_id, meeting_day, meeting_time, venue, created_at')
      .eq('id', cpId)
      .single();

    setCrosspoint(cp ? {
      id: cp.id, name: cp.name, zone: cp.zone, area: cp.area, location: cp.location,
      status: cp.status, maxMembers: cp.max_members, memberCount: cp.member_count,
      leaderId: cp.leader_id, assistantId: cp.assistant_id, treasurerId: cp.treasurer_id,
      meetingDay: cp.meeting_day, meetingTime: cp.meeting_time, venue: cp.venue, createdAt: cp.created_at,
    } as Crosspoint : null);
    setLoading(false);
  }, [cpId]);

  useEffect(() => { load(); }, [load]);

  return { crosspoint, loading, reload: load };
}
