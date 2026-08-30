import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Save, User, Loader2 } from 'lucide-react';
import { CrosspointLayout } from '@/components/connect/CrosspointLayout';
import { useCrosspoint } from '@/hooks/useCrosspoint';
import { supabase } from '@/lib/supabase';

interface Leader { first_name: string; last_name: string; phone: string | null; email: string }

export default function CrosspointSettingsPage() {
  const router = useRouter();
  const { cpId } = router.query as { cpId?: string };
  const { crosspoint, loading: cpLoading, reload } = useCrosspoint(cpId);

  const [leader, setLeader] = useState<Leader | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: '', area: '', zone: '', meetingDay: '', meetingTime: '', venue: '', maxMembers: '15',
  });

  useEffect(() => {
    if (!crosspoint) return;
    setForm({
      name: crosspoint.name || '',
      area: crosspoint.area || '',
      zone: crosspoint.zone || '',
      meetingDay: crosspoint.meetingDay || '',
      meetingTime: crosspoint.meetingTime || '',
      venue: crosspoint.venue || '',
      maxMembers: crosspoint.maxMembers?.toString() || '15',
    });
    if (crosspoint.leaderId) {
      supabase.from('profiles').select('first_name, last_name, phone, email').eq('id', crosspoint.leaderId).single()
        .then(({ data }) => setLeader(data));
    } else {
      setLeader(null);
    }
  }, [crosspoint]);

  if (cpLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }
  if (!crosspoint) {
    return <div className="min-h-screen flex items-center justify-center"><p>Crosspoint not found</p></div>;
  }

  async function handleSave() {
    if (!cpId) return;
    setSaving(true);
    const { error } = await supabase.from('crosspoints').update({
      name: form.name,
      area: form.area,
      zone: form.zone,
      meeting_day: form.meetingDay,
      meeting_time: form.meetingTime,
      venue: form.venue,
      max_members: parseInt(form.maxMembers, 10) || 15,
    }).eq('id', cpId);
    setSaving(false);
    if (!error) {
      setSaved(true);
      reload();
      setTimeout(() => setSaved(false), 2500);
    }
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const zones = ['north', 'south', 'east', 'west'];

  return (
    <CrosspointLayout crosspoint={crosspoint} title="Settings">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Crosspoint Settings</h1>
          <p className="text-gray-500">Manage details for {crosspoint.name}</p>
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
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Crosspoint Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Crosspoint Name</label>
              <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area / Neighbourhood</label>
              <input type="text" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone</label>
              <select className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}>
                {zones.map(z => <option key={z} value={z}>{z.charAt(0).toUpperCase() + z.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Members</label>
              <input type="number" min={1} max={50} className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" value={form.maxMembers} onChange={e => setForm(f => ({ ...f, maxMembers: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Meeting Schedule</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Day</label>
              <select className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" value={form.meetingDay} onChange={e => setForm(f => ({ ...f, meetingDay: e.target.value }))}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Time</label>
              <input type="text" placeholder="e.g. 7:00 PM" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" value={form.meetingTime} onChange={e => setForm(f => ({ ...f, meetingTime: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Venue</label>
              <input type="text" placeholder="Physical address or description" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Leader Information</h2>
          {leader ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#252525] rounded-xl">
              <div className="w-14 h-14 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-lg">
                {leader.first_name[0]}{leader.last_name[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{leader.first_name} {leader.last_name}</p>
                {leader.phone && <p className="text-sm text-gray-500">{leader.phone}</p>}
                {leader.email && <p className="text-sm text-gray-500">{leader.email}</p>}
                <span className="mt-1 inline-block px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">Crosspoint Leader</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#252525] rounded-xl text-gray-500">
              <User className="w-8 h-8" />
              <p className="text-sm">No leader assigned</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">To change the crosspoint leader, contact the church administrator.</p>
        </div>
      </div>
    </CrosspointLayout>
  );
}
