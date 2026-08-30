// pages/connect/resources.tsx
// Resource Library — Teachers share slides, PDFs, videos and links with cohorts

import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Link2, Video, Download, Eye,
  Trash2, Plus, Search, BookOpen, X, Loader2,
  FolderOpen, Calendar,
} from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { supabase } from '@/lib/supabase';

type ResourceType = 'pdf' | 'video' | 'link' | 'document';

interface Resource {
  id: string; title: string; type: ResourceType; url: string; uploaded_at: string; session_id: string;
}
interface Cohort { id: string; name: string; enrolled_count: number; }
interface Session { id: string; title: string; cohort_id: string; session_number: number; }

const TYPE_CONFIG: Record<ResourceType, { icon: any; label: string; color: string; bg: string }> = {
  pdf:      { icon: FileText,     label: 'PDF',      color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  video:    { icon: Video,        label: 'Video',    color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  link:     { icon: Link2,        label: 'Link',     color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  document: { icon: BookOpen,     label: 'Document', color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
};

export default function ResourcesPage() {
  const [cohorts, setCohorts]   = useState<Cohort[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [filterType, setFilterType] = useState<ResourceType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType]   = useState<ResourceType>('pdf');
  const [newUrl, setNewUrl]     = useState('');
  const [newSessionId, setNewSessionId] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [cohortsRes, sessionsRes] = await Promise.all([
      supabase.from('connect_cohorts').select('id, name, enrolled_count').order('start_date', { ascending: false }),
      supabase.from('connect_sessions').select('id, title, cohort_id, session_number'),
    ]);
    setCohorts(cohortsRes.data ?? []);
    setSessions(sessionsRes.data ?? []);
    setSelectedCohort(prev => prev || cohortsRes.data?.[0]?.id || '');
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const cohortSessions = sessions.filter(s => s.cohort_id === selectedCohort);

  useEffect(() => {
    if (cohortSessions.length === 0) { setResources([]); return; }
    supabase
      .from('connect_resources')
      .select('id, title, type, url, uploaded_at, session_id')
      .in('session_id', cohortSessions.map(s => s.id))
      .order('uploaded_at', { ascending: false })
      .then(({ data }) => setResources(data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCohort, sessions]);

  const filtered = resources.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  async function handleUpload() {
    if (!newTitle || !newUrl || !newSessionId) { setError('Title, URL, and session are all required.'); return; }
    setUploading(true); setError('');
    const { error: insertErr } = await supabase.from('connect_resources').insert({
      title: newTitle, type: newType, url: newUrl, session_id: newSessionId,
    });
    setUploading(false);
    if (insertErr) { setError(insertErr.message); return; }
    closeUploadModal();
    setSelectedCohort(c => c); // trigger reload via effect dependency unchanged — reload manually:
    const { data } = await supabase.from('connect_resources').select('id, title, type, url, uploaded_at, session_id').in('session_id', cohortSessions.map(s => s.id)).order('uploaded_at', { ascending: false });
    setResources(data ?? []);
  }

  function closeUploadModal() {
    setShowUploadModal(false);
    setNewTitle(''); setNewType('pdf'); setNewUrl(''); setNewSessionId('');
  }

  async function deleteResource(id: string) {
    await supabase.from('connect_resources').delete().eq('id', id);
    setResources(prev => prev.filter(r => r.id !== id));
  }

  const cohort = cohorts.find(c => c.id === selectedCohort);

  return (
    <ConnectLayout title="Resources">

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.05]">
              <h3 className="font-bold text-gray-900 dark:text-white">Add Resource</h3>
              <button onClick={closeUploadModal} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="form-group">
                <label className="form-label">Resource Title<span className="required">*</span></label>
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Session 3 Slides" className="input" />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(TYPE_CONFIG) as [ResourceType, typeof TYPE_CONFIG[ResourceType]][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button key={key} onClick={() => setNewType(key)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                          newType === key ? `border-[#BF0A30] ${cfg.bg}` : 'border-gray-200 dark:border-[#2D2D2D] hover:border-gray-300 dark:hover:border-[#3D3D3D]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${newType === key ? cfg.color : 'text-gray-500'}`} />
                        <span className={newType === key ? cfg.color : 'text-gray-500'}>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">URL<span className="required">*</span></label>
                <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://..." type="url" className="input" />
                <p className="form-help">Link to a file already hosted elsewhere (Drive, R2, YouTube, etc.)</p>
              </div>

              <div className="form-group">
                <label className="form-label">Session<span className="required">*</span></label>
                <select value={newSessionId} onChange={e => setNewSessionId(e.target.value)} className="select">
                  <option value="">Select a session…</option>
                  {cohortSessions.map(s => (
                    <option key={s.id} value={s.id}>Session {s.session_number}: {s.title}</option>
                  ))}
                </select>
              </div>

              {error && <div className="alert alert-error text-sm">{error}</div>}

              <button onClick={handleUpload} disabled={!newTitle || !newUrl || !newSessionId || uploading} className="btn btn-primary w-full">
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : <><Plus className="w-4 h-4" /> Add Resource</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="page-title">Resources</h1>
            <p className="page-subtitle">Learning materials shared with your cohort</p>
          </div>
          <button onClick={() => { setError(''); setShowUploadModal(true); }} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select value={selectedCohort} onChange={e => setSelectedCohort(e.target.value)}
            className="select w-auto min-w-[200px]">
            {cohorts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search resources…" className="input pl-9" />
          </div>

          <div className="flex gap-1.5">
            {(['all', 'pdf', 'video', 'link', 'document'] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all capitalize ${
                  filterType === t
                    ? 'bg-[#BF0A30] text-white border-[#BF0A30]'
                    : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]'
                }`}
              >{t}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200/70 dark:border-white/[0.05] p-4 shadow-sm">
            <p className="text-xl font-black text-[#BF0A30]">{resources.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Resources</p>
          </div>
          <div className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200/70 dark:border-white/[0.05] p-4 shadow-sm">
            <p className="text-xl font-black text-purple-500">{cohort?.enrolled_count ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Cohort Members</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05]">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-1">No resources yet</p>
            <p className="text-gray-400 text-sm mb-5">Add slides, PDFs or videos for your students</p>
            <button onClick={() => setShowUploadModal(true)} className="btn btn-primary gap-2">
              <Plus className="w-4 h-4" /> Add First Resource
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(r => {
              const cfg = TYPE_CONFIG[r.type];
              const Icon = cfg.icon;
              const session = sessions.find(s => s.id === r.session_id);
              return (
                <div key={r.id} className="resource-card group flex items-center gap-4 bg-white dark:bg-[#141414] rounded-xl border border-gray-200/70 dark:border-white/[0.05] p-4">
                  <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{r.title}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                      {session && <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Session {session.session_number}</span>}
                      <span className="text-xs text-gray-400">Added {new Date(r.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm gap-1.5">
                      {r.type === 'link' ? <><Link2 className="w-3.5 h-3.5" /> Open</> : <><Download className="w-3.5 h-3.5" /> Download</>}
                    </a>
                    <button onClick={() => deleteResource(r.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ConnectLayout>
  );
}
