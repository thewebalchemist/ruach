import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  GraduationCap, Calendar, CheckCircle, AlertTriangle,
  Video, BookOpen, Award, ChevronRight, Loader2, Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

interface StudentRecord {
  id:       string;
  level:    number;
  status:   string;
  cohort_id: string;
}

interface Cohort {
  id:   string;
  name: string;
  status: string;
}

interface Session {
  id:             string;
  title:          string;
  session_number: number;
  date:           string | null;
  start_time:     string | null;
  type:           string | null;
  is_completed:   boolean;
}

interface AttendanceRow {
  session_id: string;
  present:    boolean;
}

interface ExamResult {
  id:         string;
  score:      number;
  total_marks: number;
  percentage: number;
  passed:     boolean;
  submitted_at: string;
  discipleship_exams: { title: string };
}

export default function DiscipleshipStudentDashboard() {
  const router     = useRouter();
  const { profile } = useAuth();

  const [loading,   setLoading]   = useState(true);
  const [student,   setStudent]   = useState<StudentRecord | null>(null);
  const [cohort,    setCohort]    = useState<Cohort | null>(null);
  const [sessions,  setSessions]  = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [results,   setResults]   = useState<ExamResult[]>([]);
  const [points,    setPoints]    = useState(0);
  const [badges,    setBadges]    = useState<string[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    (async () => {
      // Fetch student record (most advanced level)
      const { data: stu } = await (supabase as any)
        .from('discipleship_students')
        .select('id, level, status, cohort_id')
        .eq('user_id', profile.id)
        .order('level', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!stu) { setLoading(false); return; }
      setStudent(stu as StudentRecord);

      // Parallel fetches
      const [{ data: cohortData }, { data: sessionData }, { data: attData }, { data: examData }, { data: profileData }] = await Promise.all([
        supabase.from('discipleship_cohorts').select('id, name, status').eq('id', stu.cohort_id).single(),
        (supabase as any).from('discipleship_sessions').select('id, title, session_number, date, start_time, type, is_completed')
          .eq('cohort_id', stu.cohort_id).order('session_number'),
        (supabase as any).from('discipleship_attendance').select('session_id, present').eq('student_id', stu.id),
        (supabase as any).from('discipleship_exam_results')
          .select('id, score, total_marks, percentage, passed, submitted_at, discipleship_exams(title)')
          .eq('student_id', stu.id).order('submitted_at', { ascending: false }),
        supabase.from('profiles').select('points, badge_slugs').eq('id', profile.id).single(),
      ]);

      setCohort(cohortData as Cohort);
      setSessions((sessionData ?? []) as Session[]);
      setAttendance((attData ?? []) as AttendanceRow[]);
      setResults((examData ?? []) as ExamResult[]);
      setPoints((profileData as any)?.points ?? 0);
      setBadges((profileData as any)?.badge_slugs ?? []);
      setLoading(false);
    })();
  }, [profile?.id]);

  if (loading) return (
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#BF0A30] animate-spin" />
    </div>
  );

  if (!student || !cohort) return (
    <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4">
      <div className="text-center">
        <GraduationCap className="w-16 h-16 text-white/20 mx-auto mb-4" />
        <h1 className="text-xl text-white mb-2" style={H}>Not Enrolled</h1>
        <p className="text-white/40 text-sm mb-6">You're not currently enrolled in any discipleship class.</p>
        <Link href="/discipleship/enroll" className="inline-flex items-center gap-2 px-6 py-3 bg-[#BF0A30] text-white rounded-2xl font-black text-sm" style={H}>
          Enroll Now <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );

  const totalSessions     = sessions.length;
  const completedSessions = sessions.filter(s => s.is_completed).length;
  const attended          = attendance.filter(a => a.present).length;
  const attendancePct     = attendance.length > 0 ? Math.round((attended / attendance.length) * 100) : 0;
  const isAtRisk          = attendance.length > 0 && attendancePct < 80;
  const nextSession       = sessions.find(s => !s.is_completed);
  const progressPct       = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const levelLabel = ['', 'KDC 1 — Foundations', 'KDC 2 — Kingdom Life', 'KDC 3 — Leadership'][student.level] ?? `KDC ${student.level}`;

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest" style={H}>Discipleship</p>
          <Link href="/member" className="text-white/30 text-xs hover:text-white/60 transition-colors">← Dashboard</Link>
        </div>
        <h1 className="text-white text-2xl" style={H}>{levelLabel}</h1>
        <p className="text-white/40 text-sm">{cohort.name}</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-16 space-y-4">

        {/* At-risk warning */}
        {isAtRisk && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-300 text-sm">Your attendance is below 80%. Please speak to your teacher to avoid being at risk of failing.</p>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Level',      value: `KDC ${student.level}`,   icon: BookOpen },
            { label: 'Attendance', value: `${attendancePct}%`,       icon: CheckCircle, warn: isAtRisk },
            { label: 'Progress',   value: `${progressPct}%`,         icon: GraduationCap },
            { label: 'Points',     value: points.toLocaleString(),   icon: Star },
          ].map(({ label, value, icon: Icon, warn }) => (
            <div key={label} className={`rounded-2xl p-4 ${warn ? 'border border-amber-500/30 bg-amber-500/10' : 'bg-white/[0.04] border border-white/[0.06]'}`}>
              <Icon className={`w-4 h-4 mb-2 ${warn ? 'text-amber-400' : 'text-[#BF0A30]'}`} />
              <p className={`text-xl font-black ${warn ? 'text-amber-300' : 'text-white'}`} style={H}>{value}</p>
              <p className="text-white/35 text-xs">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider" style={H}>Course Progress</p>
            <p className="text-white/50 text-xs">{completedSessions}/{totalSessions} sessions</p>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-[#BF0A30] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Next session */}
        {nextSession && (
          <div className="bg-[#BF0A30]/10 border border-[#BF0A30]/20 rounded-2xl p-5">
            <p className="text-[#BF0A30] text-[10px] font-bold uppercase tracking-widest mb-2" style={H}>Next Session</p>
            <p className="text-white font-black text-lg mb-1" style={H}>{nextSession.title}</p>
            {nextSession.date && (
              <p className="text-white/40 text-xs flex items-center gap-1.5 mb-3">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(nextSession.date).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}
                {nextSession.start_time ? ` · ${nextSession.start_time}` : ''}
              </p>
            )}
            {nextSession.type === 'virtual' && (
              <Link href={`/discipleship/classroom/${nextSession.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#BF0A30] hover:bg-[#A0021F] text-white rounded-xl text-xs font-black transition-colors"
                style={H}>
                <Video className="w-3.5 h-3.5" /> Join Classroom
              </Link>
            )}
          </div>
        )}

        {/* Sessions list */}
        <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-white font-black text-sm" style={H}>All Sessions</p>
          </div>
          <div className="divide-y divide-white/[0.05]">
            {sessions.map(s => {
              const isAttended = attendance.some(a => a.session_id === s.id && a.present);
              return (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isAttended ? 'bg-green-500/20 text-green-400' : s.is_completed ? 'bg-white/[0.05] text-white/20' : 'bg-[#BF0A30]/20 text-[#BF0A30]'
                  }`} style={H}>
                    {s.session_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm truncate">{s.title}</p>
                    {s.date && (
                      <p className="text-white/25 text-xs">{new Date(s.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</p>
                    )}
                  </div>
                  {isAttended ? (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  ) : s.type === 'virtual' ? (
                    <Link href={`/discipleship/classroom/${s.id}`}
                      className="flex items-center gap-1 px-2 py-1 bg-[#BF0A30]/20 text-[#BF0A30] rounded-lg text-[10px] font-bold"
                      style={H}>
                      <Video className="w-3 h-3" /> Join
                    </Link>
                  ) : null}
                </div>
              );
            })}
            {sessions.length === 0 && (
              <p className="text-white/25 text-sm text-center py-8">No sessions scheduled yet</p>
            )}
          </div>
        </div>

        {/* Exam results */}
        {results.length > 0 && (
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <p className="text-white font-black text-sm" style={H}>Exam Results</p>
            </div>
            <div className="divide-y divide-white/[0.05]">
              {results.map(r => (
                <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${r.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {r.passed ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm truncate">{(r.discipleship_exams as any)?.title ?? 'Exam'}</p>
                    <p className="text-white/25 text-xs">{new Date(r.submitted_at).toLocaleDateString('en-KE')}</p>
                  </div>
                  <span className={`text-sm font-black ${r.passed ? 'text-green-400' : 'text-red-400'}`} style={H}>
                    {Math.round(r.percentage)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {badges.length > 0 && (
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3" style={H}>Achievements</p>
            <div className="flex flex-wrap gap-2">
              {badges.map(b => (
                <span key={b} className="px-3 py-1 bg-[#BF0A30]/20 border border-[#BF0A30]/30 rounded-full text-[#BF0A30] text-xs font-bold" style={H}>
                  {b.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Graduation status */}
        {student.status === 'completed' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
            <Award className="w-10 h-10 text-green-400 mx-auto mb-3" />
            <h3 className="text-green-300 text-lg mb-1" style={H}>Level {student.level} Graduate</h3>
            <p className="text-green-400/60 text-sm">Congratulations on completing KDC {student.level}!</p>
            {student.level < 3 && (
              <Link href="/discipleship/enroll" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-black transition-colors" style={H}>
                Enroll in KDC {student.level + 1} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
