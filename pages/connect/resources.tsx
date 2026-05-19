// pages/connect/resources.tsx
// Resource Library — Teachers share slides, PDFs, videos and links with cohorts

import { useState } from 'react';
import Link from 'next/link';
import {
  Upload, FileText, Link2, Video, Presentation, Download, Eye,
  Trash2, Plus, Search, Filter, BookOpen, X, CheckCircle, Loader2,
  FolderOpen, MoreVertical, Calendar, Users
} from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { mockConnectCohorts } from '@/data/connect';

type ResourceType = 'pdf' | 'slide' | 'video' | 'link' | 'document';
type UploadStep   = 'idle' | 'selecting' | 'success';

interface Resource {
  id:         string;
  title:      string;
  type:       ResourceType;
  cohortId:   string;
  sessionId?: string;
  url:        string;
  size?:      string;
  addedBy:    string;
  addedAt:    string;
  downloads:  number;
  views:      number;
  description?: string;
}

// ── Mock resources ────────────────────────────────────────────────────────────
const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', title: 'Session 1 - Salvation Slides', type: 'slide',   cohortId: 'cc-2026-01', sessionId: 'session-001', url: '#', size: '2.4 MB', addedBy: 'Ps. James', addedAt: '2026-02-01',  downloads: 34, views: 45, description: 'Full slide deck for Session 1 on Salvation & New Life' },
  { id: 'r2', title: 'Water Baptism Study Notes',    type: 'pdf',     cohortId: 'cc-2026-01', sessionId: 'session-002', url: '#', size: '1.1 MB', addedBy: 'Ps. James', addedAt: '2026-02-08',  downloads: 28, views: 41, description: 'Study notes covering scriptural basis for water baptism' },
  { id: 'r3', title: 'Holy Spirit – Video Message',  type: 'video',   cohortId: 'cc-2026-01', sessionId: 'session-003', url: '#',              addedBy: 'Ps. James', addedAt: '2026-02-14',  downloads: 0,  views: 31, description: 'Rev. Julian Kyula teaching on the Holy Spirit' },
  { id: 'r4', title: 'Membership Handbook',          type: 'pdf',     cohortId: 'cc-2026-01',                          url: '#', size: '5.2 MB', addedBy: 'Admin',     addedAt: '2026-01-25',  downloads: 42, views: 53, description: 'Official Ruach Assemblies membership handbook 2026' },
  { id: 'r5', title: 'Bible Reading Plan',           type: 'pdf',     cohortId: 'cc-2026-01',                          url: '#', size: '480 KB', addedBy: 'Ps. James', addedAt: '2026-01-30',  downloads: 38, views: 49 },
  { id: 'r6', title: 'Ruach YouTube Channel',        type: 'link',    cohortId: 'cc-2026-01',                          url: 'https://youtube.com', addedBy: 'Admin', addedAt: '2026-01-20', downloads: 0,  views: 22, description: 'Official Ruach Assemblies YouTube channel for sermon replays' },
  { id: 'r7', title: 'Cohort 2 - Intro Slides',     type: 'slide',   cohortId: 'cc-2026-02',                          url: '#', size: '1.8 MB', addedBy: 'Ps. James', addedAt: '2026-04-05',  downloads: 5,  views: 12 },
];

const TYPE_CONFIG: Record<ResourceType, { icon: any; label: string; color: string; bg: string }> = {
  pdf:      { icon: FileText,       label: 'PDF',        color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  slide:    { icon: Presentation,   label: 'Slides',     color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  video:    { icon: Video,          label: 'Video',      color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  link:     { icon: Link2,          label: 'Link',       color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  document: { icon: BookOpen,       label: 'Document',   color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
};

export default function ResourcesPage() {
  const [resources,       setResources]       = useState<Resource[]>(MOCK_RESOURCES);
  const [selectedCohort,  setSelectedCohort]  = useState('cc-2026-01');
  const [filterType,      setFilterType]      = useState<ResourceType | 'all'>('all');
  const [searchQuery,     setSearchQuery]     = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep,      setUploadStep]      = useState<UploadStep>('idle');
  const [viewResource,    setViewResource]    = useState<Resource | null>(null);

  // New resource form
  const [newTitle,        setNewTitle]        = useState('');
  const [newType,         setNewType]         = useState<ResourceType>('pdf');
  const [newDescription,  setNewDescription]  = useState('');
  const [newUrl,          setNewUrl]          = useState('');
  const [newSessionId,    setNewSessionId]    = useState('');
  const [uploading,       setUploading]       = useState(false);

  const cohortResources = resources.filter(r => {
    if (r.cohortId !== selectedCohort) return false;
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const grouped = {
    session: cohortResources.filter(r => r.sessionId),
    general: cohortResources.filter(r => !r.sessionId),
  };

  async function handleUpload() {
    if (!newTitle) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    const newResource: Resource = {
      id:          Date.now().toString(),
      title:       newTitle,
      type:        newType,
      cohortId:    selectedCohort,
      sessionId:   newSessionId || undefined,
      url:         newUrl || '#',
      addedBy:     'Ps. James',
      addedAt:     new Date().toISOString().split('T')[0],
      downloads:   0,
      views:       0,
      description: newDescription,
    };
    setResources(prev => [newResource, ...prev]);
    setUploading(false);
    setUploadStep('success');
  }

  function closeUploadModal() {
    setShowUploadModal(false);
    setUploadStep('idle');
    setNewTitle(''); setNewType('pdf'); setNewDescription(''); setNewUrl(''); setNewSessionId('');
  }

  function deleteResource(id: string) {
    setResources(prev => prev.filter(r => r.id !== id));
  }

  const cohort = mockConnectCohorts.find(c => c.id === selectedCohort);

  return (
    <ConnectLayout title="Resources">

      {/* ── View resource modal ──────────────────────────────────────────────── */}
      {viewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] w-full max-w-lg shadow-2xl animate-fade-in-scale">
            <div className="p-5 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = TYPE_CONFIG[viewResource.type];
                  const Icon = cfg.icon;
                  return (
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{viewResource.title}</h3>
                  <p className="text-xs text-gray-500">{TYPE_CONFIG[viewResource.type].label} · Added {viewResource.addedAt}</p>
                </div>
              </div>
              <button onClick={() => setViewResource(null)} className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              {viewResource.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">{viewResource.description}</p>
              )}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Downloads', val: viewResource.downloads },
                  { label: 'Views', val: viewResource.views },
                  { label: 'Size', val: viewResource.size || '—' },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-3">
                    <p className="font-bold text-gray-900 dark:text-white">{val}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <a href={viewResource.url} target="_blank" rel="noopener noreferrer"
                  className="btn btn-primary flex-1">
                  {viewResource.type === 'link' ? <><Link2 className="w-4 h-4" /> Open Link</> : <><Download className="w-4 h-4" /> Download</>}
                </a>
                <button onClick={() => setViewResource(null)} className="btn btn-secondary flex-1">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload modal ─────────────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-white/[0.06] w-full max-w-md shadow-2xl animate-fade-in-scale">
            {uploadStep === 'success' ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">Resource Added!</h3>
                <p className="text-gray-500 text-sm mb-5">{newTitle} has been shared with the cohort</p>
                <div className="flex gap-3">
                  <button onClick={closeUploadModal} className="btn btn-secondary flex-1">Done</button>
                  <button onClick={() => setUploadStep('idle')} className="btn btn-primary flex-1">Add Another</button>
                </div>
              </div>
            ) : (
              <>
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
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.entries(TYPE_CONFIG) as [ResourceType, typeof TYPE_CONFIG[ResourceType]][]).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        return (
                          <button key={key} onClick={() => setNewType(key)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                              newType === key
                                ? `border-[#BF0A30] ${cfg.bg}`
                                : 'border-gray-200 dark:border-[#2D2D2D] hover:border-gray-300 dark:hover:border-[#3D3D3D]'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${newType === key ? cfg.color : 'text-gray-500'}`} />
                            <span className={newType === key ? cfg.color : 'text-gray-500'}>{cfg.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {newType === 'link' ? (
                    <div className="form-group">
                      <label className="form-label">URL</label>
                      <input value={newUrl} onChange={e => setNewUrl(e.target.value)}
                        placeholder="https://..." type="url" className="input" />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label className="form-label">File</label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-[#2D2D2D] rounded-xl p-6 text-center hover:border-[#BF0A30] transition-colors cursor-pointer">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">Click to upload or drag & drop</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, PPTX, MP4, DOC (max 50MB)</p>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Session (optional)</label>
                    <select value={newSessionId} onChange={e => setNewSessionId(e.target.value)} className="select">
                      <option value="">General resource (all sessions)</option>
                      {['session-001', 'session-002', 'session-003', 'session-004'].map((sid, i) => (
                        <option key={sid} value={sid}>Session {i + 1}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)}
                      rows={2} placeholder="Brief description of this resource…" className="textarea" />
                  </div>

                  <button onClick={handleUpload} disabled={!newTitle || uploading} className="btn btn-primary w-full">
                    {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Upload className="w-4 h-4" /> Add Resource</>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Page ─────────────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="page-title">Resources</h1>
            <p className="page-subtitle">Learning materials shared with your cohort</p>
          </div>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        </div>

        {/* Cohort + filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select value={selectedCohort} onChange={e => setSelectedCohort(e.target.value)}
            className="select w-auto min-w-[200px]">
            {mockConnectCohorts.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search resources…" className="input pl-9" />
          </div>

          <div className="flex gap-1.5">
            {(['all', 'pdf', 'slide', 'video', 'link'] as const).map(t => (
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

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Resources', val: cohortResources.length, color: 'text-[#BF0A30]' },
            { label: 'Total Downloads', val: cohortResources.reduce((s, r) => s + r.downloads, 0), color: 'text-blue-500' },
            { label: 'Total Views', val: cohortResources.reduce((s, r) => s + r.views, 0), color: 'text-green-500' },
            { label: 'Cohort Members', val: cohort?.enrolledCount ?? 0, color: 'text-purple-500' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-white dark:bg-[#141414] rounded-xl border border-gray-200/70 dark:border-white/[0.05] p-4 shadow-sm">
              <p className={`text-xl font-black ${color}`}>{val}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {cohortResources.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05]">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium mb-1">No resources yet</p>
            <p className="text-gray-400 text-sm mb-5">Add slides, PDFs or videos for your students</p>
            <button onClick={() => setShowUploadModal(true)} className="btn btn-primary gap-2">
              <Plus className="w-4 h-4" /> Add First Resource
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Session resources */}
            {grouped.session.length > 0 && (
              <div>
                <h2 className="section-title mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#BF0A30]" /> Session Materials
                </h2>
                <div className="space-y-2">
                  {grouped.session.map(r => <ResourceCard key={r.id} resource={r} onView={setViewResource} onDelete={deleteResource} />)}
                </div>
              </div>
            )}

            {/* General resources */}
            {grouped.general.length > 0 && (
              <div>
                <h2 className="section-title mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#BF0A30]" /> General Resources
                </h2>
                <div className="space-y-2">
                  {grouped.general.map(r => <ResourceCard key={r.id} resource={r} onView={setViewResource} onDelete={deleteResource} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ConnectLayout>
  );
}

function ResourceCard({ resource, onView, onDelete }: {
  resource: Resource;
  onView: (r: Resource) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cfg  = TYPE_CONFIG[resource.type];
  const Icon = cfg.icon;

  return (
    <div className="resource-card group">
      <div className={`w-11 h-11 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${cfg.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{resource.title}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
          {resource.size && <span className="text-xs text-gray-400">{resource.size}</span>}
          <span className="text-xs text-gray-400">Added {resource.addedAt}</span>
        </div>
        {resource.description && (
          <p className="text-xs text-gray-500 mt-1 truncate">{resource.description}</p>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Download className="w-3 h-3" />{resource.downloads}</span>
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{resource.views}</span>
        </div>
        <button onClick={() => onView(resource)}
          className="btn btn-secondary btn-sm gap-1.5">
          <Eye className="w-3.5 h-3.5" /> View
        </button>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="btn-icon btn-sm">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] rounded-xl shadow-xl z-10 py-1 w-36">
              <a href={resource.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
                <Download className="w-3.5 h-3.5" /> Download
              </a>
              <button onClick={() => { onDelete(resource.id); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
