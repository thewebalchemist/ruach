// pages/department/index.tsx
// Department picker — routes into the department portal for departments the
// caller actually leads. The old version had a client-side "department
// password" field that was checked against nothing at all (any password —
// or none — worked) before routing straight into an ungated department
// console. Real gating now happens in DepartmentLayout via department_memberships;
// this page only needs to show the caller which departments they can enter.

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Loader2, ShieldOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { DepartmentIcon } from '@/components/shared/DepartmentIcon';
import { supabase } from '@/lib/supabase';

interface Department { id: string; name: string; icon: string | null; description: string | null }

export default function DepartmentSelectPage() {
  const router = useRouter();
  const { session, profile, isAdmin, loading: authLoading } = useAuth();
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [myDepartmentIds, setMyDepartmentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const [deptRes, membershipRes] = await Promise.all([
      supabase.from('departments').select('id, name, icon, description').order('name'),
      isAdmin
        ? Promise.resolve({ data: null })
        : supabase.from('department_memberships').select('department_id').eq('user_id', session.user.id).in('role', ['leader', 'assistant']).eq('status', 'active'),
    ]);
    setAllDepartments(deptRes.data ?? []);
    setMyDepartmentIds(new Set((membershipRes.data ?? []).map((m: any) => m.department_id)));
    setLoading(false);
  }, [session?.user?.id, isAdmin]);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { router.push('/auth/login'); return; }
    load();
  }, [authLoading, session, router, load]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F0F0F]"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  const myDepartments = isAdmin ? allDepartments : allDepartments.filter(d => myDepartmentIds.has(d.id));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Department Portal</h1>
          <p className="text-gray-500 mt-2">Welcome, {profile?.first_name}. Select a department to manage.</p>
        </div>

        {myDepartments.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-8 text-center">
            <ShieldOff className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">You don't lead any departments</p>
            <p className="text-sm text-gray-400 mt-1">Contact an admin if you believe this is incorrect.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {myDepartments.map(dept => (
              <Link
                key={dept.id}
                href={`/department/${dept.id}`}
                className="flex items-center gap-3 p-4 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] rounded-xl hover:border-[#BF0A30] transition-colors"
              >
                <DepartmentIcon name={dept.icon} className="w-7 h-7 text-[#BF0A30] flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{dept.name}</p>
                  {dept.description && <p className="text-xs text-gray-500 truncate">{dept.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/member" className="text-sm text-gray-500 hover:text-[#BF0A30]">← Back to Member Portal</Link>
        </div>
      </div>
    </div>
  );
}
