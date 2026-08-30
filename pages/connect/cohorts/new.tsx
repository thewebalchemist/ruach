import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, CheckCircle, Calendar, Video, MapPin } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { ConnectClassType } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface SessionForm {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: ConnectClassType;
  meetingLink: string;
  venue: string;
}

export default function CreateCohortPage() {
  const { profile } = useAuth();
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(100);
  const [minAttendance, setMinAttendance] = useState(80);
  const [minExamScore, setMinExamScore] = useState(70);
  const [whatsappLink, setWhatsappLink] = useState('');
  const [sessions, setSessions] = useState<SessionForm[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const addSession = () => {
    const newSession: SessionForm = {
      id: `session-${Date.now()}`,
      title: `Session ${sessions.length + 1}: ${['Salvation & New Life', 'Water Baptism', 'The Holy Spirit', 'Church Membership'][sessions.length] || 'New Session'}`,
      date: '',
      startTime: '09:00',
      endTime: '12:00',
      type: 'physical',
      meetingLink: '',
      venue: 'Ruach Main Auditorium',
    };
    setSessions([...sessions, newSession]);
  };

  const updateSession = (index: number, field: string, value: string) => {
    const updated = [...sessions];
    updated[index] = { ...updated[index], [field]: value };
    setSessions(updated);
  };

  const removeSession = (index: number) => {
    setSessions(sessions.filter((_, i) => i !== index));
  };

  const addDefaultSessions = () => {
    const defaultSessions: SessionForm[] = [
      { id: 's1', title: 'Session 1: Salvation & New Life', date: '', startTime: '09:00', endTime: '12:00', type: 'physical', meetingLink: '', venue: 'Ruach Main Auditorium' },
      { id: 's2', title: 'Session 2: Water Baptism', date: '', startTime: '09:00', endTime: '12:00', type: 'physical', meetingLink: '', venue: 'Ruach Main Auditorium' },
      { id: 's3', title: 'Session 3: The Holy Spirit', date: '', startTime: '09:00', endTime: '12:00', type: 'physical', meetingLink: '', venue: 'Ruach Main Auditorium' },
      { id: 's4', title: 'Session 4: Church Membership & Serving', date: '', startTime: '09:00', endTime: '12:00', type: 'physical', meetingLink: '', venue: 'Ruach Main Auditorium' },
    ];
    setSessions(defaultSessions);
  };

  const handleSave = async () => {
    if (!startDate || !endDate) { setError('Start and end dates are required'); return; }
    setIsSaving(true);
    setError('');

    const year = new Date(startDate).getFullYear();
    const { count } = await supabase
      .from('connect_cohorts')
      .select('id', { count: 'exact', head: true })
      .eq('year', year);
    const cohortNumber = (count ?? 0) + 1;

    const { data: cohort, error: cohortErr } = await supabase
      .from('connect_cohorts')
      .insert({
        name,
        year,
        cohort_number: cohortNumber,
        description: description || null,
        start_date: startDate,
        end_date: endDate,
        registration_deadline: registrationDeadline || startDate,
        status: 'registration-open',
        teacher_id: profile?.id ?? null,
        whatsapp_link: whatsappLink || null,
        max_capacity: maxCapacity,
        min_attendance_percent: minAttendance,
        min_exam_score: minExamScore,
      })
      .select('id')
      .single();

    if (cohortErr || !cohort) {
      setIsSaving(false);
      setError(cohortErr?.message ?? 'Failed to create cohort');
      return;
    }

    if (sessions.length > 0) {
      const { error: sessionsErr } = await supabase.from('connect_sessions').insert(
        sessions.map((s, i) => ({
          cohort_id: cohort.id,
          session_number: i + 1,
          title: s.title,
          date: s.date || startDate,
          start_time: s.startTime,
          end_time: s.endTime,
          type: s.type,
          meeting_link: s.type === 'virtual' ? (s.meetingLink || null) : null,
          venue: s.type === 'physical' ? (s.venue || null) : null,
        })),
      );
      if (sessionsErr) console.error('Session insert (non-fatal):', sessionsErr.message);
    }

    setIsSaving(false);
    setSavedSuccess(true);
  };

  if (savedSuccess) {
    return (
      <ConnectLayout title="Create Cohort">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Cohort Created!</h1>
          <p className="text-gray-500 mb-6">{name} with {sessions.length} sessions</p>
          <div className="flex gap-4">
            <Link href="/connect/dashboard" className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Dashboard</Link>
            <button onClick={() => { setSavedSuccess(false); setName(''); setSessions([]); }} className="flex-1 py-3 bg-[#BF0A30] text-white rounded-lg font-medium">Create Another</button>
          </div>
        </div>
      </ConnectLayout>
    );
  }

  return (
    <ConnectLayout title="Create Cohort">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/connect/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create New Cohort</h1>
          </div>
          <button onClick={handleSave} disabled={isSaving || !name || sessions.length === 0} className="px-6 py-2.5 bg-[#BF0A30] text-white rounded-lg font-medium hover:bg-[#B00325] disabled:opacity-50">
            {isSaving ? 'Creating...' : 'Create Cohort'}
          </button>
        </div>

        {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cohort Details */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Cohort Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cohort Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Connect Cohort 2 2026" className="w-full px-3 py-2.5 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Know who you are in Christ" className="w-full px-3 py-2.5 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Deadline</label>
                  <input type="date" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Capacity</label>
                  <input type="number" value={maxCapacity} onChange={(e) => setMaxCapacity(Number(e.target.value))} min={1} className="w-full px-3 py-2.5 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp Group Link</label>
                  <input type="url" value={whatsappLink} onChange={(e) => setWhatsappLink(e.target.value)} placeholder="https://chat.whatsapp.com/..." className="w-full px-3 py-2.5 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Pass Requirements</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min. Attendance (%)</label>
                  <input type="number" value={minAttendance} onChange={(e) => setMinAttendance(Number(e.target.value))} min={0} max={100} className="w-full px-3 py-2.5 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min. Exam Score (%)</label>
                  <input type="number" value={minExamScore} onChange={(e) => setMinExamScore(Number(e.target.value))} min={0} max={100} className="w-full px-3 py-2.5 border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-white dark:bg-[#252525]" />
                </div>
              </div>
            </div>
          </div>

          {/* Sessions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Class Sessions ({sessions.length})</h2>
              <div className="flex gap-2">
                {sessions.length === 0 && (
                  <button onClick={addDefaultSessions} className="px-3 py-1.5 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50">
                    Add Default 4 Sessions
                  </button>
                )}
                <button onClick={addSession} className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#BF0A30] border border-[#BF0A30] rounded-lg hover:bg-[#BF0A30]/5">
                  <Plus className="w-4 h-4" /> Add Session
                </button>
              </div>
            </div>

            {sessions.length === 0 ? (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border-2 border-dashed border-gray-300 dark:border-[#2D2D2D] p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No sessions added yet</p>
                <p className="text-sm text-gray-400 mb-4">Connect Class typically has 4 sessions</p>
                <button onClick={addDefaultSessions} className="px-6 py-2.5 bg-[#BF0A30] text-white rounded-lg font-medium">Add Default Sessions</button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, index) => (
                  <div key={session.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#BF0A30] text-white flex items-center justify-center font-bold">{index + 1}</div>
                        <input type="text" value={session.title} onChange={(e) => updateSession(index, 'title', e.target.value)} className="font-medium text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[#BF0A30] focus:outline-none px-1 py-0.5" />
                      </div>
                      <button onClick={() => removeSession(index)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                        <input type="date" value={session.date} onChange={(e) => updateSession(index, 'date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-sm bg-white dark:bg-[#252525]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Start Time</label>
                        <input type="time" value={session.startTime} onChange={(e) => updateSession(index, 'startTime', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-sm bg-white dark:bg-[#252525]" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">End Time</label>
                        <input type="time" value={session.endTime} onChange={(e) => updateSession(index, 'endTime', e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-sm bg-white dark:bg-[#252525]" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Session Type</label>
                      <div className="flex gap-2">
                        <button onClick={() => updateSession(index, 'type', 'physical')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${session.type === 'physical' ? 'border-[#BF0A30] bg-[#BF0A30]/5 text-[#BF0A30]' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                          <MapPin className="w-4 h-4" /> Physical
                        </button>
                        <button onClick={() => updateSession(index, 'type', 'virtual')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-colors ${session.type === 'virtual' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                          <Video className="w-4 h-4" /> Virtual
                        </button>
                      </div>
                    </div>

                    {session.type === 'physical' ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Venue</label>
                        <input type="text" value={session.venue} onChange={(e) => updateSession(index, 'venue', e.target.value)} placeholder="Enter venue..." className="w-full px-3 py-2 border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-sm bg-white dark:bg-[#252525]" />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Meeting Link</label>
                        <input type="url" value={session.meetingLink} onChange={(e) => updateSession(index, 'meetingLink', e.target.value)} placeholder="https://meet.google.com/..." className="w-full px-3 py-2 border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-sm bg-white dark:bg-[#252525]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ConnectLayout>
  );
}