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
  scripture_ref: '', description: '', tags: '', slug: '',
  spotify_url: '', category: '', article: '', transcript: '',
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
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [showNewSeries, setShowNewSeries] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState('');
  const [creatingSeries, setCreatingSeries] = useState(false);
  const [preachers, setPreachers] = useState<string[]>([]);
  const [showNewPreacher, setShowNewPreacher] = useState(false);
  const [newPreacherName, setNewPreacherName] = useState('');
  const [creatingPreacher, setCreatingPreacher] = useState(false);

  // Auth is enforced centrally by CPLayout — this page just loads data.
  useEffect(() => {
    loadData();
    if (router.query.action === 'new') setShowForm(true);
  }, [router.query]);

  async function loadData() {
    const [{ data: s }, { data: sr }, { data: pr }] = await Promise.all([
      supabase.from('sermons').select('*, series(title)').order('service_date', { ascending: false }),
      supabase.from('series').select('id, title').order('title'),
      supabase.from('preachers').select('name').order('sort_order'),
    ]);
    setSermons((s || []) as any);
    setSeries((sr || []) as any);
    // Managed preachers first (table), then any names still only on sermons.
    const fromTable = ((pr || []) as { name: string }[]).map(p => p.name).filter(Boolean);
    const fromSermons = ((s || []) as any[]).map(sm => sm.preacher).filter(Boolean);
    setPreachers([...new Set([...fromTable, ...fromSermons])].sort());
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
      title:        sermon.title,
      preacher:     sermon.preacher,
      youtube_url:  sermon.youtube_url,
      series_id:    String(sermon.series_id || ''),
      service_date: sermon.service_date,
      scripture_ref: sermon.scripture_ref || '',
      description:  sermon.description || '',
      tags:         (sermon.tags || []).join(', '),
      slug:         sermon.slug,
      spotify_url:  sermon.spotify_url || '',
      category:     sermon.category || '',
      article:      (sermon as { article?: string | null }).article || sermon.notes || '',
      transcript:   sermon.transcript || '',
    });
    setError('');
    setShowForm(true);
  }

  async function generateArticle() {
    if (!form.title || !form.preacher) return;
    setGeneratingArticle(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/sermons/generate-article', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body:    JSON.stringify({
          title: form.title, preacher: form.preacher, scripture: form.scripture_ref,
          summary: form.description, transcript: form.transcript, notes: form.article,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to generate article'); return; }
      if (data.article) {
        const updates: Partial<typeof EMPTY_FORM> = { article: data.article };
        if (data.description && !form.description) updates.description = data.description;
        setForm(f => ({ ...f, ...updates }));
      }
    } catch {
      setError('Failed to generate article');
    } finally {
      setGeneratingArticle(false);
    }
  }

  async function handleCreateSeries() {
    if (!newSeriesTitle.trim()) return;
    setCreatingSeries(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/control-panel/create-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ title: newSeriesTitle.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create series'); setCreatingSeries(false); return; }
      setSeries(prev => [...prev, data].sort((a: any, b: any) => a.title.localeCompare(b.title)));
      set('series_id', String(data.id));
      setShowNewSeries(false);
      setNewSeriesTitle('');
    } catch {
      setError('Failed to create series');
    }
    setCreatingSeries(false);
  }

  async function handleAddPreacher() {
    const name = newPreacherName.trim();
    if (!name || creatingPreacher) return;
    setCreatingPreacher(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/control-panel/create-preacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to add preacher'); return; }
      const finalName = data.name || name;
      if (!preachers.includes(finalName)) setPreachers(prev => [...prev, finalName].sort());
      set('preacher', finalName);
      setShowNewPreacher(false);
      setNewPreacherName('');
    } catch {
      setError('Failed to add preacher');
    } finally {
      setCreatingPreacher(false);
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
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const thumb = getYouTubeThumbnail(form.youtube_url);
      const payload: Record<string, unknown> = {
        title:          form.title,
        preacher:       form.preacher,
        youtube_url:    form.youtube_url,
        series_id:      form.series_id || null,
        service_date:   form.service_date,
        scripture_ref:  form.scripture_ref || null,
        description:    form.description || null,
        thumbnail_url:  thumb || null,
        tags:           form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        slug:           form.slug || generateSlug(form.title),
        spotify_url:    form.spotify_url || null,
        category:       form.category || null,
        article:        form.article || null,
        transcript:     form.transcript || null,
      };

      if (editing) payload.id = editing.id;

      const res = await fetch('/api/control-panel/sermons', {
        method:  editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save sermon'); setSaving(false); return; }

      // Best-effort: (re)index this sermon for "Ask Ruach". Non-blocking — a
      // slow/failed embed must never hold up the save.
      if (data?.id) {
        fetch('/api/control-panel/embed-sermon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ id: data.id }),
        }).catch(() => {});
      }

      setSaving(false);
      setSaved(true);
      setTimeout(() => { setSaved(false); setShowForm(false); loadData(); }, 1500);
    } catch (e: any) {
      setError(e?.message || 'Failed to save sermon');
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this sermon? This cannot be undone.')) return;
    setDeleting(id);
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`/api/control-panel/sermons?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
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
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Theme</th>
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
                  {!showNewPreacher ? (
                    <div className="flex gap-2">
                      <select value={form.preacher} onChange={e => set('preacher', e.target.value)} className={`${inp} flex-1`}>
                        <option value="">— Select preacher —</option>
                        {preachers.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowNewPreacher(true)}
                        className="px-3 py-2 bg-gray-100 dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors whitespace-nowrap flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> New
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={newPreacherName} onChange={e => setNewPreacherName(e.target.value)}
                        placeholder="e.g. Rev. Julian Kyula"
                        className={`${inp} flex-1`}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddPreacher(); } }}
                        autoFocus />
                      <button type="button" onClick={handleAddPreacher} disabled={creatingPreacher || !newPreacherName.trim()}
                        className="px-3 py-2 bg-[#BF0A30] hover:bg-[#A00828] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1">
                        {creatingPreacher ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Add'}
                      </button>
                      <button type="button" onClick={() => { setShowNewPreacher(false); setNewPreacherName(''); }}
                        className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-xl text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
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
                  <label className={lbl}>Theme</label>
                  {!showNewSeries ? (
                    <div className="flex gap-2">
                      <select value={form.series_id} onChange={e => set('series_id', e.target.value)} className={`${inp} flex-1`}>
                        <option value="">No theme</option>
                        {series.map(sr => <option key={sr.id} value={sr.id}>{sr.title}</option>)}
                      </select>
                      <button type="button" onClick={() => setShowNewSeries(true)}
                        className="px-3 py-2 bg-gray-100 dark:bg-[#222] border border-gray-200 dark:border-[#333] rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2a2a] transition-colors whitespace-nowrap flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> New
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={newSeriesTitle} onChange={e => setNewSeriesTitle(e.target.value)}
                        placeholder="Theme name e.g. Walking in Glory"
                        className={`${inp} flex-1`}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateSeries(); } }}
                        autoFocus />
                      <button type="button" onClick={handleCreateSeries} disabled={creatingSeries || !newSeriesTitle.trim()}
                        className="px-3 py-2 bg-[#BF0A30] hover:bg-[#A00828] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1">
                        {creatingSeries ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create'}
                      </button>
                      <button type="button" onClick={() => { setShowNewSeries(false); setNewSeriesTitle(''); }}
                        className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-xl text-xs text-gray-500 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className={lbl}>Scripture Reference (optional)</label>
                  <input value={form.scripture_ref} onChange={e => set('scripture_ref', e.target.value)} placeholder="e.g. John 3:16" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Tags (comma-separated)</label>
                  <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="faith, prayer, purpose" className={inp} />
                </div>
                <div>
                  <label className={lbl}>URL Slug</label>
                  <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated" className={inp} />
                </div>
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
                  <label className={lbl}>Sermon Transcript (paste to write a grounded article)</label>
                  <textarea value={form.transcript} onChange={e => set('transcript', e.target.value)}
                    rows={5} placeholder="Paste the sermon transcript here. The AI writes the article from the actual message rather than generic points…"
                    className={`${inp} resize-y font-mono text-xs`} />
                  <p className="text-xs text-gray-400 mt-1">Optional — greatly improves article quality and verse accuracy, and is indexed for “Ask Ruach”.</p>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={lbl + ' mb-0'}>Sermon Article (Markdown)</label>
                    <button type="button" onClick={generateArticle}
                      disabled={!form.title || !form.preacher || generatingArticle}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors">
                      {generatingArticle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {generatingArticle ? 'Writing…' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea value={form.article} onChange={e => set('article', e.target.value)}
                    rows={8} placeholder="The editorial article shown on the sermon page. Paste a transcript above and hit Generate, or write it in Markdown here…"
                    className={`${inp} resize-y font-mono text-xs`} />
                  <p className="text-xs text-gray-400 mt-1">Markdown — the main read on the sermon page, and the source for AI answers.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className={lbl}>Summary / Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Brief description of the sermon — auto-filled by AI when generating notes, or type your own…" className={`${inp} resize-none`} />
                  <p className="text-xs text-gray-400 mt-1">Shown on the sermon card and search results. Generated automatically with notes if left empty.</p>
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
