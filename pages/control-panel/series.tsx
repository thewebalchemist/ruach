import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Plus, Layers, Edit, Trash2, Save, X, Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';
import CPLayout from '@/components/control-panel/CPLayout';
import { supabase } from '@/lib/supabase';
import { Series } from '@/types';
import { generateSlug } from '@/lib/utils';

const EMPTY_FORM = { title: '', description: '', year: new Date().getFullYear().toString(), slug: '', thumbnail_url: '' };

const inp = "w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]";
const lbl = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

export default function SeriesCP() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<Series[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Series | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { router.push('/auth/login?redirectTo=/control-panel/series'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single() as any;
    if (!profile || !['admin', 'pastor'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }

  async function loadData() {
    const { data } = await supabase.from('series').select('*').order('start_date', { ascending: false });
    setSeries((data || []) as Series[]);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowForm(true);
  }

  function openEdit(s: Series) {
    setEditing(s);
    setForm({ title: s.title, description: s.description || '', year: s.start_date ? new Date(s.start_date).getFullYear().toString() : '', slug: s.slug, thumbnail_url: s.thumbnail_url || '' });
    setError('');
    setShowForm(true);
  }

  function set(k: keyof typeof EMPTY_FORM, v: string) {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'title' && !editing) next.slug = generateSlug(v);
      return next;
    });
  }

  async function handleSave() {
    if (!form.title) { setError('Title is required.'); return; }
    setSaving(true); setError('');
    const payload = {
      title: form.title,
      description: form.description || null,
      start_date: form.year ? `${form.year}-01-01` : null,
      slug: form.slug || generateSlug(form.title),
      thumbnail_url: form.thumbnail_url || null,
    };

    let err;
    if (editing) {
      ({ error: err } = await (supabase.from('series') as any).update(payload).eq('id', editing.id));
    } else {
      ({ error: err } = await (supabase.from('series') as any).insert(payload));
    }
    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); loadData(); }, 1500);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this series? Sermons in it will be unlinked.')) return;
    await (supabase.from('series') as any).delete().eq('id', id);
    loadData();
  }

  const filtered = series.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <CPLayout
      title="Sermon Series"
      subtitle={`${series.length} series`}
      actions={
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white text-sm font-semibold rounded-xl hover:bg-[#A00828] transition-colors">
          <Plus className="w-4 h-4" /> Add Series
        </button>
      }
    >
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search series…"
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] py-16 text-center">
              <Layers className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No series yet.</p>
              <button onClick={openNew} className="mt-3 text-sm text-[#BF0A30] font-medium hover:underline">Create your first series →</button>
            </div>
          ) : filtered.map(s => (
            <div key={s.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden group">
              <div className="aspect-video bg-gray-100 dark:bg-[#222] relative">
                {s.thumbnail_url
                  ? <img src={s.thumbnail_url} alt={s.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><Layers className="w-8 h-8 text-gray-300 dark:text-gray-600" /></div>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{s.title}</p>
                    {s.start_date && <p className="text-xs text-gray-400 mt-0.5">{new Date(s.start_date).getFullYear()}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-[#222]">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-[#222]">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] rounded-t-2xl">
              <h2 className="font-bold text-gray-900 dark:text-white">{editing ? 'Edit Series' : 'Add New Series'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className={lbl}>Series Title *</label><input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Kingdom Champions" className={inp} /></div>
              <div><label className={lbl}>Year</label><input value={form.year} onChange={e => set('year', e.target.value)} placeholder="2026" className={inp} /></div>
              <div><label className={lbl}>Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={`${inp} resize-none`} /></div>
              <div><label className={lbl}>Cover Image URL</label><input type="url" value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)} placeholder="https://…" className={inp} /></div>
              <div><label className={lbl}>URL Slug</label><input value={form.slug} onChange={e => set('slug', e.target.value)} className={inp} /></div>
              {error && <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3"><AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" /><p className="text-sm text-red-600">{error}</p></div>}
              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || saved} className="flex items-center gap-2 px-5 py-2.5 bg-[#BF0A30] hover:bg-[#A00828] disabled:opacity-60 text-white text-sm font-semibold rounded-xl">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : saved ? 'Saved!' : editing ? 'Save' : 'Add Series'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 dark:border-[#333] text-sm text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#222]">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CPLayout>
  );
}
