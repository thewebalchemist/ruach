import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Users, GraduationCap, AlertTriangle, Upload,
  Plus, X, FileText, Film, Globe, File, Trash2, ExternalLink,
  CheckCircle, XCircle, Bell, Send, BookOpen, Calendar,
  ChevronDown, Paperclip, Loader2
} from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

type Tab = 'students' | 'sessions' | 'exams' | 'resources';
type ResourceType = 'pdf' | 'video' | 'link' | 'document';

const TYPE_META: Record<ResourceType, { label: string; icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  pdf:      { label: 'PDF',      icon: FileText, color: 'text-red-600',    bg: 'bg-red-100 dark:bg-red-900/30' },
  video:    { label: 'Video',    icon: Film,     color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  link:     { label: 'Link',     icon: Globe,    color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
  document: { label: 'Document', icon: File,     color: 'text-green-600',  bg: 'bg-green-100 dark:bg-green-900/30' },
};

export default function CohortDetailPage() {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { profile, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cohort, setCohort] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>('students');

  // Resource modal state
  const [showResource, setShowResource] = useState(false);
  const [resSessionId, setResSessionId] = useState('');
  const [resType, setResType] = useState<ResourceType>('pdf');
  const [resTitle, setResTitle] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resFile, setResFile] = useState<File | null>(null);
  const [resUploading, setResUploading] = useState(false);

  // Notify modal state
  const [showNotify, setShowNotify] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState('');

  useEffect(() => {
    if (!router.isReady || !id) return;
    fetchData();
  }, [router.isReady, id]);

  async function fetchData() {
    setLoading(true);

    const [cohortRes, studentsRes, sessionsRes, examsRes, resourcesRes] = await Promise.all([
      db.from('connect_cohorts')
        .select('*, profiles!connect_cohorts_teacher_id_fkey(first_name, last_name, full_name)')
        .eq('id', id)
        .single(),
      db.from('connect_students')
        .select('*, profiles(first_name, last_name, full_name, phone)')
        .eq('cohort_id', id),
      db.from('connect_sessions')
        .select('*')
        .eq('cohort_id', id)
        .order('session_number'),
      db.from('connect_exams')
        .select('*')
        .eq('cohort_id', id),
      db.from('connect_resources')
        .select('*')
        .eq('cohort_id', id),
    ]);

    if (cohortRes.data) setCohort(cohortRes.data);
    if (studentsRes.data) setStudents(studentsRes.data);
    if (sessionsRes.data) setSessions(sessionsRes.data);
    if (examsRes.data) setExams(examsRes.data);
    if (resourcesRes.data) setResources(resourcesRes.data);

    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <ConnectLayout title="Loading...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#BF0A30] animate-spin" />
        </div>
      </ConnectLayout>
    );
  }

  if (!cohort) {
    return (
      <ConnectLayout title="Not Found">
        <div className="text-center py-20">
          <p className="text-gray-500 mb-3">Cohort not found.</p>
          <Link href="/connect/cohorts" className="text-[#BF0A30] text-sm">← All Cohorts</Link>
        </div>
      </ConnectLayout>
    );
  }

  const atRisk = students.filter(s => (s.total_attendance_percent ?? 0) < (cohort.min_attendance_percent ?? 80));
  const canGrad = students.filter(s => s.can_graduate);
  const sessionResources = sessions.map(s => ({
    ...s,
    sessionResources: resources.filter(r => r.session_id === s.id),
  }));
  const allResources = resources.map(r => {
    const session = sessions.find(s => s.id === r.session_id);
    return { ...r, sessionTitle: session?.title ?? '', sessionId: r.session_id };
  });

  // ── Add resource ──────────────────────────────────────────────────────────
  const openResourceModal = (sessionId = '') => {
    setResSessionId(sessionId || sessions[0]?.id || '');
    setResType('pdf');
    setResTitle('');
    setResUrl('');
    setResFile(null);
    setShowResource(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResFile(file);
    if (!resTitle) setResTitle(file.name.replace(/\.[^.]+$/, ''));
    if (file.type.includes('pdf')) setResType('pdf');
    else if (file.type.includes('video')) setResType('video');
    else setResType('document');
  };

  const addResource = async () => {
    if (!resTitle.trim() || !resSessionId) return;
    setResUploading(true);

    const url = resFile
      ? `https://storage.ruach.church/${Date.now()}-${resFile.name}`
      : resUrl.trim();

    const { error } = await db.from('connect_resources').insert({
      session_id: resSessionId,
      cohort_id: id,
      type: resType,
      title: resTitle.trim(),
      url,
    });

    setResUploading(false);
    if (!error) {
      await fetchData();
      setShowResource(false);
      setActiveTab('resources');
    }
  };

  const deleteResource = async (resourceId: string) => {
    await db.from('connect_resources').delete().eq('id', resourceId);
    await fetchData();
  };

  const toggleEnrollment = async () => {
    const newStatus = cohort.status === 'registration-open' ? 'active' : 'registration-open';
    await db.from('connect_cohorts').update({ status: newStatus }).eq('id', id);
    await fetchData();
  };

  const STATUS_COLOR: Record<string, string> = {
    active:             'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'registration-open':'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed:          'bg-white/5 text-gray-700',
    draft:              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  return (
    <ConnectLayout title={cohort.name}>

      {/* ── Resource modal ── */}
      {showResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#12151C] rounded-2xl border border-white/[0.06] p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-semibold text-white">Add Resource</h3>
                <p className="text-xs text-gray-400 mt-0.5">Attach a file or link to a session</p>
              </div>
              <button onClick={() => setShowResource(false)} className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">

              {/* Session picker */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Attach to Session *</label>
                <div className="relative">
                  <select
                    value={resSessionId}
                    onChange={e => setResSessionId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white appearance-none focus:outline-none focus:border-[#BF0A30]"
                  >
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Type buttons */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Resource Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(TYPE_META) as [ResourceType, typeof TYPE_META[ResourceType]][]).map(([key, meta]) => {
                    const Icon = meta.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setResType(key)}
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-colors ${
                          resType === key
                            ? 'border-[#BF0A30] bg-[#BF0A30]/5 text-[#BF0A30]'
                            : 'border-white/[0.06] text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Title *</label>
                <input
                  value={resTitle}
                  onChange={e => setResTitle(e.target.value)}
                  placeholder="e.g. Salvation Notes Week 1"
                  className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400"
                />
              </div>

              {/* File upload zone */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  Upload File {resType !== 'link' && '(PDF, video, doc)'}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.avi"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {resFile ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40 rounded-xl">
                    <FileText className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200 truncate">{resFile.name}</p>
                      <p className="text-xs text-green-600">{(resFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => setResFile(null)} className="text-green-600 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 w-full py-6 border-2 border-dashed border-white/10 dark:border-[#2D2D2D] rounded-xl text-gray-500 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm font-medium">Click to upload file</span>
                    <span className="text-xs text-gray-400">PDF, DOCX, PPTX, MP4 up to 100MB</span>
                  </button>
                )}
              </div>

              {/* URL field */}
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">
                  {resFile ? 'Or paste URL instead' : 'URL (if no file)'}
                </label>
                <input
                  value={resUrl}
                  onChange={e => setResUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={!!resFile}
                  className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowResource(false)} className="flex-1 py-2.5 border border-white/[0.06] rounded-xl text-sm font-medium text-white/50">
                Cancel
              </button>
              <button
                onClick={addResource}
                disabled={!resTitle.trim() || (!resFile && !resUrl.trim()) || resUploading}
                className="flex-1 py-2.5 bg-[#BF0A30] text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#A0021F] flex items-center justify-center gap-2"
              >
                {resUploading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Add Resource</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notify modal ── */}
      {showNotify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#12151C] rounded-2xl border border-white/[0.06] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Notify All Students</h3>
              <button onClick={() => setShowNotify(false)} className="p-1.5 rounded-xl hover:bg-white/5 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={notifyMsg}
              onChange={e => setNotifyMsg(e.target.value)}
              rows={4}
              placeholder="Type your message to all students..."
              className="w-full px-4 py-3 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white resize-none focus:outline-none focus:border-[#BF0A30] placeholder:text-gray-400 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowNotify(false)} className="flex-1 py-2.5 border border-white/[0.06] rounded-xl text-sm font-medium text-white/50">Cancel</button>
              <button
                disabled={!notifyMsg.trim()}
                onClick={() => { setShowNotify(false); setNotifyMsg(''); }}
                className="flex-1 py-2.5 bg-[#BF0A30] text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-[#A0021F] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <Link href="/connect/cohorts" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white/70 dark:hover:text-gray-300 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All Cohorts
      </Link>

      <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-5 mb-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white">{cohort.name}</h1>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${STATUS_COLOR[cohort.status] ?? STATUS_COLOR['draft']}`}>
                {cohort.status.replace('-', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500">{cohort.description}</p>
            {cohort.profiles && (
              <p className="text-sm text-gray-500 mt-1">Teacher: <span className="text-white/70 font-medium">{cohort.profiles?.full_name}</span></p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowNotify(true)} className="flex items-center gap-1.5 px-3 py-2 border border-white/[0.06] rounded-xl text-sm text-white/50 hover:border-blue-400 hover:text-blue-600 transition-colors">
              <Bell className="w-4 h-4" /> Notify
            </button>
            <button onClick={() => openResourceModal()} className="flex items-center gap-1.5 px-3 py-2 border border-white/[0.06] rounded-xl text-sm text-white/50 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors">
              <Paperclip className="w-4 h-4" /> Add Resource
            </button>
            <button onClick={toggleEnrollment} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              cohort.status === 'registration-open'
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200'
            }`}>
              {cohort.status === 'registration-open' ? 'Close Enrollment' : 'Open Enrollment'}
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'Enrolled',    value: students.length,    color: 'text-white' },
            { label: 'Sessions',    value: `${sessions.filter(s=>s.is_completed).length}/${sessions.length}`, color: 'text-blue-600' },
            { label: 'At Risk',     value: atRisk.length,      color: atRisk.length > 0 ? 'text-amber-600' : 'text-gray-400' },
            { label: 'Can Graduate',value: canGrad.length,     color: canGrad.length > 0 ? 'text-green-600' : 'text-gray-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#0A0C10] rounded-xl p-3 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Graduation banner ── */}
      {canGrad.length > 0 && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/40 rounded-2xl p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
              {canGrad.length} student{canGrad.length !== 1 ? 's' : ''} ready to graduate!
            </p>
          </div>
          <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-xl hover:bg-green-700">
            Graduate Now
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-[#12151C] border border-white/[0.06]/70 p-1 rounded-2xl mb-5 shadow-sm">
        {([
          { id: 'students',  label: `Students (${students.length})` },
          { id: 'sessions',  label: `Sessions (${sessions.length})` },
          { id: 'exams',     label: `Exams (${exams.length})` },
          { id: 'resources', label: `Resources (${allResources.length})` },
        ] as { id: Tab; label: string }[]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs sm:text-sm font-medium rounded-xl transition-colors ${
              activeTab === tab.id
                ? 'bg-[#BF0A30] text-white shadow-sm'
                : 'text-gray-500 hover:text-white/70 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Students tab ── */}
      {activeTab === 'students' && (
        <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 shadow-sm overflow-hidden">
          {students.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students enrolled yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Student', 'Admission #', 'Attendance', 'Status', ''].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const at = s.total_attendance_percent ?? 0;
                    const atOk = at >= (cohort.min_attendance_percent ?? 80);
                    return (
                      <tr key={s.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${atOk ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                              {s.profiles?.first_name?.[0]}{s.profiles?.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-medium text-white">{s.profiles?.full_name}</p>
                              <p className="text-xs text-gray-400">{s.profiles?.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/50">{s.admission_number}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${atOk ? 'bg-green-500' : 'bg-red-500'} rounded-full`} style={{ width: `${at}%` }} />
                            </div>
                            <span className={`text-xs font-medium ${atOk ? 'text-green-600' : 'text-red-500'}`}>{at}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            s.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            s.status === 'completed'   ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {s.status === 'in-progress' ? 'In Progress' : s.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link href={`/connect/students/${s.id}`} className="text-xs text-[#BF0A30] hover:underline font-medium">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Sessions tab ── */}
      {activeTab === 'sessions' && (
        <div className="space-y-3">
          {sessions.map(session => {
            const sessionResourceCount = resources.filter(r => r.session_id === session.id).length;
            return (
              <div key={session.id} className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${session.is_completed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100'}`}>
                      {session.is_completed
                        ? <CheckCircle className="w-4 h-4 text-green-600" />
                        : <Calendar className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-white">{session.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {new Date(session.date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })} · {session.start_time} – {session.end_time}
                      </p>
                      {session.venue && <p className="text-xs text-gray-400 mt-0.5">📍 {session.venue}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${session.type === 'virtual' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {session.type}
                    </span>
                    {sessionResourceCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white/5 text-white/50">
                        {sessionResourceCount} file{sessionResourceCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <button
                      onClick={() => openResourceModal(session.id)}
                      className="flex items-center gap-1 text-xs text-[#BF0A30] font-medium hover:underline"
                    >
                      <Plus className="w-3 h-3" /> Resource
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Exams tab ── */}
      {activeTab === 'exams' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link
              href={`/connect/exams/new?cohort=${cohort.id}`}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#BF0A30] text-white rounded-xl text-sm font-medium hover:bg-[#A0021F] transition-colors shadow-md shadow-[#BF0A30]/20"
            >
              <Plus className="w-4 h-4" /> New Exam
            </Link>
          </div>
          {exams.length === 0 ? (
            <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-12 text-center shadow-sm">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No exams yet</p>
              <Link href={`/connect/exams/new?cohort=${cohort.id}`} className="text-sm text-[#BF0A30] mt-2 inline-block">Create first exam →</Link>
            </div>
          ) : exams.map(exam => (
            <div key={exam.id} className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-white">{exam.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{exam.duration_minutes} min · Pass: {exam.passing_marks}/{exam.total_marks}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    exam.status === 'published' ? 'bg-green-100 text-green-800' :
                    exam.status === 'closed'    ? 'bg-red-100 text-red-800' :
                    'bg-white/5 text-gray-700'
                  }`}>
                    {exam.status}
                  </span>
                  <Link href={`/connect/exams/${exam.id}`} className="text-xs text-[#BF0A30] font-medium hover:underline">View →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Resources tab ── */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => openResourceModal()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#BF0A30] text-white rounded-xl text-sm font-medium hover:bg-[#A0021F] transition-colors shadow-md shadow-[#BF0A30]/20"
            >
              <Plus className="w-4 h-4" /> Add Resource
            </button>
          </div>

          {allResources.length === 0 ? (
            <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-12 text-center shadow-sm">
              <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No resources yet</p>
              <p className="text-sm text-gray-400 mt-1">Add PDFs, videos or links to each session.</p>
              <button onClick={() => openResourceModal()} className="mt-4 text-sm text-[#BF0A30] font-medium hover:underline">
                Add first resource →
              </button>
            </div>
          ) : sessions.filter(s => resources.some(r => r.session_id === s.id)).map(session => {
            const sessionRes = resources.filter(r => r.session_id === session.id);
            return (
              <div key={session.id} className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] bg-gray-50">
                  <p className="font-medium text-sm text-white/70">{session.title}</p>
                  <button onClick={() => openResourceModal(session.id)} className="flex items-center gap-1 text-xs text-[#BF0A30] font-medium hover:underline">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="divide-y divide-gray-50">
                  {sessionRes.map(resource => {
                    const meta = TYPE_META[resource.type as ResourceType] ?? TYPE_META.document;
                    const Icon = meta.icon;
                    return (
                      <div key={resource.id} className="flex items-center gap-4 px-5 py-3.5">
                        <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-white truncate">{resource.title}</p>
                          <p className="text-xs text-gray-400">{meta.label} · {new Date(resource.uploaded_at ?? resource.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors rounded-lg">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button onClick={() => deleteResource(resource.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ConnectLayout>
  );
}
