import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Save, Loader2, AlertCircle, CheckCircle, Plus, Trash2 } from 'lucide-react';
import CPLayout from '@/components/control-panel/CPLayout';
import { supabase } from '@/lib/supabase';
import { invalidateKnowledgeCache } from '@/lib/knowledge';

interface ServiceTime { name: string; day: string; time: string; }
interface ChurchInfo {
  id?: number;
  name: string;
  tagline: string;
  about_text: string;
  address: string;
  city: string;
  country: string;
  directions: string;
  phone: string;
  email: string;
  website: string;
  service_times: ServiceTime[];
}

const EMPTY: ChurchInfo = {
  name: 'Ruach Tabernacle Assembly',
  tagline: 'God | Work | Community',
  about_text: '',
  address: '',
  city: 'Nairobi',
  country: 'Kenya',
  directions: '',
  phone: '',
  email: '',
  website: 'https://ruachtabernacle.org',
  service_times: [
    { name: 'First Service', day: 'Sunday', time: '8:00 AM - 9:30 AM' },
    { name: 'Second Service', day: 'Sunday', time: '10:00 AM - 12:00 PM' },
    { name: 'Third Service', day: 'Sunday', time: '12:30 PM - 2:00 PM' },
  ],
};

const inp = "w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]";
const lbl = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

export default function ChurchInfoCP() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState<ChurchInfo>(EMPTY);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { router.push('/auth/login?redirectTo=/control-panel/church-info'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single() as any;
    if (!profile || !['admin', 'pastor'].includes(profile.role) || profile.status === 'suspended') { router.push('/'); return; }
    loadData();
  }

  async function loadData() {
    const { data } = await (supabase.from('church_info') as any).select('*').single();
    if (data) {
      setInfo({
        id: data.id,
        name: data.name || EMPTY.name,
        tagline: data.tagline || EMPTY.tagline,
        about_text: data.about_text || '',
        address: data.address || '',
        city: data.city || 'Nairobi',
        country: data.country || 'Kenya',
        directions: data.directions || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        service_times: Array.isArray(data.service_times) ? data.service_times : EMPTY.service_times,
      });
    }
    setLoading(false);
  }

  function set<K extends keyof ChurchInfo>(k: K, v: ChurchInfo[K]) {
    setInfo(i => ({ ...i, [k]: v }));
  }

  function setServiceTime(idx: number, field: keyof ServiceTime, val: string) {
    setInfo(i => {
      const times = [...i.service_times];
      times[idx] = { ...times[idx], [field]: val };
      return { ...i, service_times: times };
    });
  }

  function addServiceTime() {
    setInfo(i => ({ ...i, service_times: [...i.service_times, { name: '', day: 'Sunday', time: '' }] }));
  }

  function removeServiceTime(idx: number) {
    setInfo(i => ({ ...i, service_times: i.service_times.filter((_, j) => j !== idx) }));
  }

  async function handleSave() {
    setSaving(true); setError('');
    const payload = {
      name: info.name,
      tagline: info.tagline,
      about_text: info.about_text,
      address: info.address,
      city: info.city,
      country: info.country,
      directions: info.directions,
      phone: info.phone,
      email: info.email,
      website: info.website,
      service_times: info.service_times,
    };
    let err;
    if (info.id) {
      ({ error: err } = await (supabase.from('church_info') as any).update(payload).eq('id', info.id));
    } else {
      ({ error: err } = await (supabase.from('church_info') as any).insert(payload));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    invalidateKnowledgeCache();
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <CPLayout title="Church Information" subtitle="This data feeds the Ask Ruach AI chatbot">
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="max-w-2xl space-y-6">
          {/* Basic info */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Church Identity</h2>
            <div>
              <label className={lbl}>Church Name</label>
              <input value={info.name} onChange={e => set('name', e.target.value)} className={inp} />
            </div>
            <div>
              <label className={lbl}>Tagline</label>
              <input value={info.tagline} onChange={e => set('tagline', e.target.value)} placeholder="God | Work | Community" className={inp} />
            </div>
            <div>
              <label className={lbl}>About the Church</label>
              <textarea value={info.about_text} onChange={e => set('about_text', e.target.value)} rows={4} placeholder="Brief description of the church…" className={`${inp} resize-none`} />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Location</h2>
            <div>
              <label className={lbl}>Street Address</label>
              <input value={info.address} onChange={e => set('address', e.target.value)} placeholder="Rhema Avenue, Northern Bypass" className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>City</label>
                <input value={info.city} onChange={e => set('city', e.target.value)} className={inp} />
              </div>
              <div>
                <label className={lbl}>Country</label>
                <input value={info.country} onChange={e => set('country', e.target.value)} className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>Directions (for AI)</label>
              <textarea value={info.directions} onChange={e => set('directions', e.target.value)} rows={2} placeholder="e.g. Along Northern Bypass, next to Shell Windsor" className={`${inp} resize-none`} />
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Phone</label>
                <input value={info.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 700 000 000" className={inp} />
              </div>
              <div>
                <label className={lbl}>Email</label>
                <input type="email" value={info.email} onChange={e => set('email', e.target.value)} placeholder="hello@ruachtabernacle.org" className={inp} />
              </div>
            </div>
            <div>
              <label className={lbl}>Website</label>
              <input type="url" value={info.website} onChange={e => set('website', e.target.value)} className={inp} />
            </div>
          </div>

          {/* Service times */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Service Times</h2>
              <button onClick={addServiceTime} className="flex items-center gap-1.5 text-xs text-[#BF0A30] font-semibold hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add Service
              </button>
            </div>
            {info.service_times.map((st, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <input value={st.name} onChange={e => setServiceTime(i, 'name', e.target.value)} placeholder="First Service" className={inp} />
                  <select value={st.day} onChange={e => setServiceTime(i, 'day', e.target.value)} className={inp}>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <input value={st.time} onChange={e => setServiceTime(i, 'time', e.target.value)} placeholder="8:00 AM - 9:30 AM" className={inp} />
                </div>
                <button onClick={() => removeServiceTime(i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#BF0A30] hover:bg-[#A00828] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Church Info'}
            </button>
            {saved && <span className="text-sm text-green-600 dark:text-green-400 font-medium">AI cache flushed — changes active immediately.</span>}
          </div>
        </div>
      )}
    </CPLayout>
  );
}
