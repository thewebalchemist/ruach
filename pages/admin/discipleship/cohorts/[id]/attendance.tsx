import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowLeft, X, Users } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface ParsedAttendee {
  name: string; email: string; matched: boolean; studentId?: string; admissionNumber?: string;
}
interface Cohort { id: string; name: string; }
interface SessionRow { id: string; title: string; date: string; is_completed: boolean; cohort_id: string; }
interface StudentRow { id: string; admission_number: string; profiles: { first_name: string; last_name: string; email: string } | null; }

export default function DiscipleshipAttendanceImportPage() {
  const router = useRouter();
  const { id } = router.query as { id?: string };

  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedAttendee[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [cohortRes, sessionsRes, studentsRes] = await Promise.all([
      supabase.from('discipleship_cohorts').select('id, name').eq('id', id).single(),
      supabase.from('discipleship_sessions').select('id, title, date, is_completed, cohort_id').eq('cohort_id', id),
      supabase.from('discipleship_students').select('id, admission_number, profiles(first_name, last_name, email)').eq('cohort_id', id),
    ]);
    setCohort(cohortRes.data);
    setSessions(sessionsRes.data ?? []);
    setStudents((studentsRes.data as any) ?? []);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) { setFile(selectedFile); parseCSV(selectedFile); }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) { setFile(dropped); parseCSV(dropped); }
  };

  const parseCSV = async (csvFile: File) => {
    setIsProcessing(true);
    const text = await csvFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    const data = lines.slice(1);

    const parsed: ParsedAttendee[] = data.map(line => {
      const cols = line.split(',').map(c => c.trim().replace(/"/g, ''));
      const [name, email] = cols;

      const match = students.find(student => {
        const fullName = `${student.profiles?.first_name ?? ''} ${student.profiles?.last_name ?? ''}`.trim();
        return (
          fullName.toLowerCase() === name?.toLowerCase() ||
          (student.profiles?.email && student.profiles.email.toLowerCase() === email?.toLowerCase())
        );
      });

      return {
        name: name || 'Unknown', email: email || '', matched: !!match,
        studentId: match?.id, admissionNumber: match?.admission_number,
      };
    });

    setParsedData(parsed);
    setIsProcessing(false);
  };

  const handleSubmit = async () => {
    if (!selectedSession) return;
    setIsProcessing(true);
    const matched = parsedData.filter(p => p.matched && p.studentId);
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('discipleship_attendance').upsert(
      matched.map(p => ({ student_id: p.studentId, session_id: selectedSession, present: true, marked_by: session?.user.id ?? null, marked_at: new Date().toISOString() })),
      { onConflict: 'student_id,session_id' },
    );
    setIsProcessing(false);
    setIsSubmitted(true);
  };

  const matchedCount = parsedData.filter(p => p.matched).length;
  const unmatchedCount = parsedData.filter(p => !p.matched).length;

  if (isSubmitted) {
    return (
      <AdminLayout title="Import Attendance">
        <div className="max-w-md mx-auto text-center py-20">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Attendance Imported!</h1>
          <p className="text-gray-500 mb-6">{matchedCount} students marked as present</p>
          {unmatchedCount > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 mb-6 text-left">
              <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">{unmatchedCount} names could not be matched to enrolled students</p>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                {parsedData.filter(p => !p.matched).slice(0, 5).map((p, i) => <li key={i}>· {p.name} {p.email && `(${p.email})`}</li>)}
              </ul>
            </div>
          )}
          <div className="flex gap-3">
            <Link href={`/admin/discipleship/cohorts/${id}`} className="flex-1 py-3 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Back to Cohort</Link>
            <button onClick={() => { setIsSubmitted(false); setFile(null); setParsedData([]); }} className="flex-1 py-3 bg-[#BF0A30] text-white rounded-xl text-sm font-medium hover:bg-[#A0021F]">Import Another</button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Import Attendance">
      <Link href={`/admin/discipleship/cohorts/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cohort
      </Link>
      <div className="max-w-3xl">
        <PageHeader title="Import Attendance" subtitle={cohort ? `Upload a session attendance CSV for ${cohort.name}` : ''} />

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-xl bg-[#BF0A30] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Select Session</h2>
            </div>
            <select
              value={selectedSession}
              onChange={e => { setSelectedSession(e.target.value); setParsedData([]); setFile(null); }}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
            >
              <option value="">Select a session...</option>
              {sessions.map(s => (
                <option key={s.id} value={s.id}>{s.title} – {new Date(s.date).toLocaleDateString()}{s.is_completed ? ' ✓' : ''}</option>
              ))}
            </select>
            {sessions.length === 0 && <p className="text-xs text-amber-600 mt-1">No sessions found for this cohort.</p>}
            {students.length > 0 && (
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {students.length} students enrolled in this cohort</p>
            )}
          </div>

          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-xl bg-[#BF0A30] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Upload Attendance CSV</h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">CSV with columns: <code>name, email</code>. One row per attendee.</p>

            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />

            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => selectedSession && fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
                  selectedSession ? 'border-gray-300 dark:border-[#2D2D2D] hover:border-[#BF0A30] cursor-pointer' : 'border-gray-200 dark:border-[#1E1E1E] cursor-not-allowed opacity-50'
                }`}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedSession ? 'Click to upload or drag & drop CSV' : 'Select a session first'}</p>
                <p className="text-xs text-gray-400 mt-1">CSV files only</p>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5 text-green-600" /></div>
                  <div><p className="font-medium text-gray-900 dark:text-white text-sm">{file.name}</p><p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p></div>
                </div>
                <button onClick={() => { setFile(null); setParsedData([]); }} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {parsedData.length > 0 && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-xl bg-[#BF0A30] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Review Matches</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Total', val: parsedData.length, color: 'text-gray-900 dark:text-white', bg: 'bg-gray-50 dark:bg-[#1A1A1A]' },
                  { label: 'Matched', val: matchedCount, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                  { label: 'Unmatched', val: unmatchedCount, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                ].map(({ label, val, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center`}><p className={`text-2xl font-bold ${color}`}>{val}</p><p className="text-xs text-gray-500">{label}</p></div>
                ))}
              </div>
              {matchedCount > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Matched ({matchedCount})</p>
                  <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-100 dark:border-white/[0.04] divide-y divide-gray-50 dark:divide-white/[0.02]">
                    {parsedData.filter(p => p.matched).map((a, i) => (
                      <div key={i} className="px-4 py-2.5 flex justify-between text-sm"><span className="font-medium text-gray-900 dark:text-white">{a.name}</span><span className="text-xs text-gray-400 font-mono">{a.admissionNumber}</span></div>
                    ))}
                  </div>
                </div>
              )}
              {unmatchedCount > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Unmatched ({unmatchedCount}) — will be skipped</p>
                  <div className="max-h-28 overflow-y-auto rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 divide-y divide-amber-100 dark:divide-amber-800/20">
                    {parsedData.filter(p => !p.matched).map((a, i) => (
                      <div key={i} className="px-4 py-2.5 text-sm"><p className="font-medium text-amber-800 dark:text-amber-200">{a.name}</p>{a.email && <p className="text-xs text-amber-600 dark:text-amber-400">{a.email}</p>}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {parsedData.length > 0 && matchedCount > 0 && (
            <button onClick={handleSubmit} disabled={isProcessing} className="w-full py-3 bg-[#BF0A30] text-white font-medium rounded-2xl hover:bg-[#A0021F] disabled:opacity-50 transition-colors shadow-md shadow-[#BF0A30]/20">
              {isProcessing ? 'Processing...' : `Mark ${matchedCount} Students as Present`}
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
