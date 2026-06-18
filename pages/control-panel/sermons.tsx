import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, Video, Edit, Trash2, Save, X, Loader2, Search, AlertCircle, CheckCircle, ExternalLink, Sparkles, Music } from 'lucide-react';
import CPLayout from '@/components/control-panel/CPLayout';
import { supabase } from '@/lib/supabase';
import { Sermon, Series } from '@/types';
import { generateSlug, getYouTubeThumbnail } from '@/lib/utils';

const CATEGORIES = ['faith', 'prayer', 'family', 'leadership', 'kingdom', 'worship', 'evangelism', 'other'] as const;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EMPTY_FORM = {
  title: '', preacher: '', youtube_url: '', series_id: '', service_date: '',
  scripture: '', summary: '', tags: '', slug: '',
  spotify_url: '', category: '', notes: '',
};

export default function SermonsCP() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Sermon | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [generatingNotes, setGeneratingNotes] = useState(false);

  useEffect(() => {
    checkAuth();
    if (router.query.action === 'new') setShowForm(true);
  }, [router.query]);

  async function checkAuth() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) { router.push('/auth/login?redirectTo=/control-panel/sermons'); return; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single() as any;
    if (!profile || !['admin', 'pastor', 'media'].includes(profile.role) || profile.status === 'suspended') { router.push('/'); return; }
    loadData();
  }

  async function loadData() {
    const [{ data: s }, { data: sr }] = await Promise.all([
      supabase.from('sermons').select('*, series(title)').order('service_date', { ascending: false }),
      supabase.from('series').select('id, title').order('title'),
    ]);
    setSermons((s || []) as any);
    setSeries((sr || []) as any);
    setLoading(false);
  }

  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, service_date: new Date().toISOString().split('T')[0] });
    setError('');
    setShowForm(true);
  }

  function openEdit(sermon: Sermon) {
    setEditing(sermon);
    setForm({
      title:       sermon.title,
      preacher:    sermon.preacher,
      youtube_url: sermon.youtube_url,
      series_id:   String(sermon.series_id || ''),
      service_date: sermon.service_date,
      scripture:   sermon.scripture || '',
      summary:     sermon.summary || '',
      tags:        (sermon.tags || []).join(', '),
      slug:        sermon.slug,
      spotify_url: (sermon as any).spotify_url || '',
      category:    (sermon as any).category || '',
      notes:       (sermon as any).notes || '',
    });
    setError('');
    setShowForm(true);
  }

  async function generateNotes() {
    if (!form.title || !form.preacher) return;
    setGeneratingNotes(true);
    try {
      const res = await fetch('/api/sermons/generate-notes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ title: form.title, preacher: form.preacher, scripture: form.scripture, summary: form.summary }),
      });
      const data = await res.json();
      if (data.notes) setForm(f => ({ ...f, notes: data.notes }));
    } catch {
      // silent
    } finally {
      setGeneratingNotes(false);
    }
  }

  function set(k: keyof typeof EMPTY_FORM, v: string) {
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'title' && !editing) next.slug = generateSlug(v);
      // thumbnail is rendered inline from form.youtube_url directly, no need to store separately
      return next;
    });
  }

  async function handleSave() {
    if (!form.title || !form.preacher || !form.youtube_url || !form.service_date) {
      setError('Title, preacher, YouTube URL, and date are required.'); return;
    }
    setSaving(true); setError('');
    const thumb = getYouTubeThumbnail(form.youtube_url);
    const payload = {
      title:         form.title,
      preacher:      form.preacher,
      youtube_url:   form.youtube_url,
      series_id:     form.series_id ? parseInt(form.series_id) : null,
      service_date:  form.service_date,
      scripture:     form.scripture || null,
      summary:       form.summary || null,
      thumbnail_url: thumb || null,
      tags:          form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      slug:          form.slug || generateSlug(form.title),
      spotify_url:   form.spotify_url || null,
      category:      form.category || null,
      notes:         form.notes || null,
    };

    let err;
    if (editing) {
      ({ error: err } = await (supabase.from('sermons') as any).update(payload).eq('id', editing.id));
    } else {
      ({ error: err } = await (supabase.from('sermons') as any).insert(payload));
    }

    setSaving(false);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); loadData(); }, 1500);
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this sermon? This cannot be undone.')) return;
    setDeleting(id);
    await (supabase.from('sermons') as any).delete().eq('id', id);
    setDeleting(null);
    loadData();
  }

  const filtered = sermons.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.preacher.toLowerCase().includes(search.toLowerCase())
  );

  const inp = "w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]";
  const lbl = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

  return (
    <CPLayout
      title="Sermons"
      subtitle={`${sermons.length} total`}
      actions={
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white text-sm font-semibold rounded-xl hover:bg-[#A00828] transition-colors">
          <Plus className="w-4 h-4" /> Add Sermon
        </button>
      }
    >
      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sermons…"
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Video className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">{search ? 'No sermons match your search.' : 'No sermons yet.'}</p>
              {!search && <button onClick={openNew} className="mt-3 text-sm text-[#BF0A30] font-medium hover:underline">Add your first sermon →</button>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#111] border-b border-gray-100 dark:border-[#2A2A2A] text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sermon</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Preacher</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Series</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-[#222]">
                  {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.thumbnail_url ? (
                            <img src={s.thumbnail_url} alt="" className="w-14 h-9 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                          ) : (
                            <div className="w-14 h-9 bg-[#7C3AED]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Video className="w-4 h-4 text-[#7C3AED]" />
                            </div>
                          )}
                          <span className="font-medium text-gray-900 dark:text-white line-clamp-1">{s.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell">{s.preacher}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">{formatDate(s.service_date)}</td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{(s as any).series?.title || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Link href={`/${s.slug}`} target="_blank" className="p-1.5 rounded-lg text-gray-400 hover:text-[#BF0A30] hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-[#222] transition-colors">
                            {deleting === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] rounded-t-2xl">
              <h2 className="font-bold text-gray-900 dark:text-white">{editing ? 'Edit Sermon' : 'Add New Sermon'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={lbl}>Sermon Title *</label>
                  <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Walking in Purpose" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Preacher *</label>
                  <input value={form.preacher} onChange={e => set('preacher', e.target.value)} placeholder="e.g. Rev. Julian Kyula" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Service Date *</label>
                  <input type="date" value={form.service_date} onChange={e => set('service_date', e.target.value)} className={inp} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>YouTube URL *</label>
                  <input type="url" value={form.youtube_url} onChange={e => set('youtube_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." className={inp} />
                  {form.youtube_url && getYouTubeThumbnail(form.youtube_url) && (
                    <img src={getYouTubeThumbnail(form.youtube_url)!} alt="preview" className="mt-2 h-20 rounded-lg object-cover" />
                  )}
                </div>
                <div>
                  <label className={lbl}>Series</label>
                  <select value={form.series_id} onChange={e => set('series_id', e.target.value)} className={inp}>
                    <option value="">No series</option>
                    {series.map(sr => <option key={sr.id} value={sr.id}>{sr.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Scripture Reference</label>
                  <input value={form.scripture} onChange={e => set('scripture', e.target.value)} placeholder="e.g. John 3:16" className={inp} />
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Summary</label>
                  <textarea value={form.summary} onChange={e => set('summary', e.target.value)} rows={4} placeholder="Brief description of the sermon…" className={`${inp} resize-none`} />
                </div>
                <div>
                  <label className={lbl}>Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="faith, prayer, purpose" className={inp} />
                </div>
                <div>
                  <label className={lbl}>URL Slug</label>
                  <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" className={inp} />
                </div>
                {/* ── New fields ── */}
                <div>
                  <label className={lbl}><Music className="inline w-3.5 h-3.5 mr-1" />Spotify URL (optional)</label>
                  <input type="url" value={form.spotify_url} onChange={e => set('spotify_url', e.target.value)} placeholder="https://open.spotify.com/episode/..." className={inp} />
                </div>
                <div>
                  <label className={lbl}>Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} className={inp}>
                    <option value="">— Select category —</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={lbl + ' mb-0'}>Sermon Notes (Markdown)</label>
                    <button type="button" onClick={generateNotes}
                      disabled={!form.title || !form.preacher || generatingNotes}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors">
                      {generatingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {generatingNotes ? 'Generating…' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                    rows={8} placeholder="# Sermon Notes&#10;&#10;Notes in Markdown format…"
                    className={`${inp} resize-y font-mono text-xs`} />
                  <p className="text-xs text-gray-400 mt-1">Markdown — rendered on the sermon page under the Notes tab.</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleSave} disabled={saving || saved} className="flex items-center gap-2 px-5 py-2.5 bg-[#BF0A30] hover:bg-[#A00828] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving…' : saved ? 'Saved!' : editing ? 'Save Changes' : 'Add Sermon'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-5 py-2.5 border border-gray-200 dark:border-[#333] text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </CPLayout>
  );
}
