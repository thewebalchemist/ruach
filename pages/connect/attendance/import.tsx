import { useState, useRef } from 'react';
import Link from 'next/link';
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowLeft, X, Users } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { mockConnectCohorts, mockConnectSessions, mockConnectStudents, getUserById } from '@/data/connect';
import { useRouter } from 'next/router';

interface ParsedAttendee {
  name: string;
  email: string;
  duration: string;
  matched: boolean;
  studentId?: string;
  admissionNumber?: string;
}

export default function AttendanceImportPage() {
  const router = useRouter();

  const initCohort  = (router.query.cohort as string) || mockConnectCohorts[0]?.id || '';
  const initSession = (router.query.session as string) || '';

  const [selectedCohort,  setSelectedCohort]  = useState(initCohort);
  const [selectedSession, setSelectedSession] = useState(initSession);
  const [file,            setFile]            = useState<File | null>(null);
  const [parsedData,      setParsedData]      = useState<ParsedAttendee[]>([]);
  const [isProcessing,    setIsProcessing]    = useState(false);
  const [isSubmitted,     setIsSubmitted]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fix: show ALL sessions (completed and upcoming) — teacher may re-import
  const sessions = mockConnectSessions.filter(s => s.cohortId === selectedCohort);
  const students = mockConnectStudents.filter(s => s.cohortId === selectedCohort);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.name.endsWith('.csv')) {
      setFile(dropped);
      parseCSV(dropped);
    }
  };

  const parseCSV = async (csvFile: File) => {
    setIsProcessing(true);
    const text  = await csvFile.text();
    const lines = text.split('\n').filter(line => line.trim());
    const data  = lines.slice(1); // skip header row

    const parsed: ParsedAttendee[] = data.map(line => {
      const cols  = line.split(',').map(c => c.trim().replace(/"/g, ''));
      const [name, email, duration] = cols;

      const match = students.find(student => {
        const user = getUserById(student.userId);
        if (!user) return false;
        return (
          user.fullName.toLowerCase() === name?.toLowerCase() ||
          (user.email && user.email.toLowerCase() === email?.toLowerCase())
        );
      });

      return {
        name:            name || 'Unknown',
        email:           email || '',
        duration:        duration || '0',
        matched:         !!match,
        studentId:       match?.id,
        admissionNumber: match?.admissionNumber,
      };
    });

    setParsedData(parsed);
    setIsProcessing(false);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    // production: POST /api/connect/attendance/import
    await new Promise(r => setTimeout(r, 1500));
    setIsProcessing(false);
    setIsSubmitted(true);
  };

  const matchedCount   = parsedData.filter(p => p.matched).length;
  const unmatchedCount = parsedData.filter(p => !p.matched).length;

  if (isSubmitted) {
    return (
      <ConnectLayout title="Import Attendance">
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
                {parsedData.filter(p => !p.matched).slice(0, 5).map((p, i) => (
                  <li key={i}>· {p.name} {p.email && `(${p.email})`}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Link href="/connect/dashboard" className="flex-1 py-3 border border-gray-200 dark:border-white/[0.06] rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">
              Dashboard
            </Link>
            <button
              onClick={() => { setIsSubmitted(false); setFile(null); setParsedData([]); }}
              className="flex-1 py-3 bg-[#BF0A30] text-white rounded-xl text-sm font-medium hover:bg-[#A0021F]"
            >
              Import Another
            </button>
          </div>
        </div>
      </ConnectLayout>
    );
  }

  return (
    <ConnectLayout title="Import Attendance">
      <Link href="/connect/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="max-w-3xl">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Import Attendance</h1>
        <p className="text-sm text-gray-500 mb-6">Upload a Google Meet attendance CSV to mark students as present</p>

        <div className="space-y-4">
          {/* Step 1: Select cohort & session */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-xl bg-[#BF0A30] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Select Cohort & Session</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Cohort</label>
                <select
                  value={selectedCohort}
                  onChange={e => { setSelectedCohort(e.target.value); setSelectedSession(''); setParsedData([]); setFile(null); }}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                >
                  {mockConnectCohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Session</label>
                <select
                  value={selectedSession}
                  onChange={e => setSelectedSession(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                >
                  <option value="">Select a session...</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title} – {new Date(s.date).toLocaleDateString()}{s.isCompleted ? ' ✓' : ''}
                    </option>
                  ))}
                </select>
                {sessions.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No sessions found for this cohort.</p>
                )}
              </div>
            </div>
            {students.length > 0 && (
              <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> {students.length} students enrolled in this cohort
              </p>
            )}
          </div>

          {/* Step 2: Upload CSV */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-7 h-7 rounded-xl bg-[#BF0A30] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Upload Google Meet CSV</h2>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 mb-4 text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1.5">How to export from Google Meet:</p>
              <ol className="text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside text-xs">
                <li>Go to your Google Meet session in Google Calendar</li>
                <li>Click "View attendance report"</li>
                <li>Click "Download" (exports as CSV)</li>
                <li>Upload that file here</li>
              </ol>
            </div>

            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />

            {!file ? (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => selectedSession && fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${
                  selectedSession
                    ? 'border-gray-300 dark:border-[#2D2D2D] hover:border-[#BF0A30] cursor-pointer'
                    : 'border-gray-200 dark:border-[#1E1E1E] cursor-not-allowed opacity-50'
                }`}
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedSession ? 'Click to upload or drag & drop CSV' : 'Select a session first'}
                </p>
                <p className="text-xs text-gray-400 mt-1">CSV files only</p>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => { setFile(null); setParsedData([]); }} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Review */}
          {parsedData.length > 0 && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-xl bg-[#BF0A30] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Review Matches</h2>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Total',     val: parsedData.length, color: 'text-gray-900 dark:text-white',   bg: 'bg-gray-50 dark:bg-[#1A1A1A]' },
                  { label: 'Matched',   val: matchedCount,      color: 'text-green-600',                   bg: 'bg-green-50 dark:bg-green-900/20' },
                  { label: 'Unmatched', val: unmatchedCount,    color: 'text-amber-600',                   bg: 'bg-amber-50 dark:bg-amber-900/20' },
                ].map(({ label, val, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-bold ${color}`}>{val}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              {matchedCount > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Matched ({matchedCount})
                  </p>
                  <div className="max-h-36 overflow-y-auto rounded-xl border border-gray-100 dark:border-white/[0.04] divide-y divide-gray-50 dark:divide-white/[0.02]">
                    {parsedData.filter(p => p.matched).map((a, i) => (
                      <div key={i} className="px-4 py-2.5 flex justify-between text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{a.name}</span>
                        <span className="text-xs text-gray-400 font-mono">{a.admissionNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unmatchedCount > 0 && (
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Unmatched ({unmatchedCount}) — will be skipped
                  </p>
                  <div className="max-h-28 overflow-y-auto rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 divide-y divide-amber-100 dark:divide-amber-800/20">
                    {parsedData.filter(p => !p.matched).map((a, i) => (
                      <div key={i} className="px-4 py-2.5 text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-200">{a.name}</p>
                        {a.email && <p className="text-xs text-amber-600 dark:text-amber-400">{a.email}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          {parsedData.length > 0 && matchedCount > 0 && (
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full py-3 bg-[#BF0A30] text-white font-medium rounded-2xl hover:bg-[#A0021F] disabled:opacity-50 transition-colors shadow-md shadow-[#BF0A30]/20"
            >
              {isProcessing ? 'Processing...' : `Mark ${matchedCount} Students as Present`}
            </button>
          )}
        </div>
      </div>
    </ConnectLayout>
  );
}