import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Save, User, Loader2 } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { useDepartment } from '@/hooks/useDepartment';
import { supabase } from '@/lib/supabase';

interface Leader { first_name: string; last_name: string; phone: string | null; email: string }
interface SubTeam { id: string; name: string }

export default function DepartmentSettingsPage() {
  const router = useRouter();
  const { deptId } = router.query as { deptId?: string };
  const { department, loading: deptLoading, reload } = useDepartment(deptId);

  const [leader, setLeader] = useState<Leader | null>(null);
  const [subTeams, setSubTeams] = useState<SubTeam[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const load = useCallback(async () => {
    if (!deptId) return;
    const { data } = await supabase.from('department_sub_teams').select('id, name').eq('department_id', deptId);
    setSubTeams(data ?? []);
  }, [deptId]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!department) return;
    setForm({ name: department.name, description: department.description });
    if (department.leaderId) {
      supabase.from('profiles').select('first_name, last_name, phone, email').eq('id', department.leaderId).single().then(({ data }) => setLeader(data));
    } else {
      setLeader(null);
    }
  }, [department]);

  async function handleSave() {
    if (!deptId) return;
    setSaving(true);
    const { error } = await supabase.from('departments').update({ name: form.name, description: form.description || null }).eq('id', deptId);
    setSaving(false);
    if (!error) {
      setSaved(true);
      reload();
      setTimeout(() => setSaved(false), 2500);
    }
  }

  if (deptLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  return (
    <DepartmentLayout department={department} title="Settings">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Department Settings</h1>
          <p className="text-gray-500">Manage settings for {department.name}</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325] disabled:opacity-50">
          <Save className="w-4 h-4" />{saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">Settings saved successfully.</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Department Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Name</label>
              <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea rows={3} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30] resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Department Leader</h2>
          {leader ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#252525] rounded-xl">
              <div className="w-14 h-14 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-lg">{leader.first_name[0]}{leader.last_name[0]}</div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{leader.first_name} {leader.last_name}</p>
                {leader.phone && <p className="text-sm text-gray-500">{leader.phone}</p>}
                {leader.email && <p className="text-sm text-gray-500">{leader.email}</p>}
                <span className="mt-1 inline-block px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">Leader</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#252525] rounded-xl text-gray-500">
              <User className="w-8 h-8" />
              <p className="text-sm">No leader assigned</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">To transfer department leadership, contact the church administrator.</p>
        </div>

        {subTeams.length > 0 && (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Sub-teams ({subTeams.length})</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {subTeams.map(team => (
                <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{team.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DepartmentLayout>
  );
}
