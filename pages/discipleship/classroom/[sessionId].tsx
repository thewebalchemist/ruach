import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  LiveKitRoom, VideoConference, useParticipants, RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { supabase } from '@/lib/supabase';
import { Users, Loader2, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import Link from 'next/link';

const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 };
const MIN_ATTENDANCE_MINUTES = 30;

function AttendanceTracker({
  userId, sessionId, onAttended,
}: { userId: string; sessionId: string; onAttended: () => void }) {
  const attendedRef = useRef(false);
  const joinTime    = useRef(Date.now());

  useEffect(() => {
    if (attendedRef.current) return;
    const iv = setInterval(async () => {
      if ((Date.now() - joinTime.current) / 60_000 >= MIN_ATTENDANCE_MINUTES) {
        attendedRef.current = true;
        clearInterval(iv);
        try {
          const { data: { session: auth } } = await supabase.auth.getSession();
          await fetch('/api/classroom/attendance', {
            method:  'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(auth ? { 'Authorization': `Bearer ${auth.access_token}` } : {}),
            },
            body:    JSON.stringify({ userId, sessionId, cohortType: 'discipleship' }),
          });
          onAttended();
        } catch (e) { console.error('[attendance]', e); }
      }
    }, 60_000);
    return () => clearInterval(iv);
  }, [userId, sessionId, onAttended]);

  return null;
}

function TeacherPanel({ sessionId }: { sessionId: string }) {
  const [students, setStudents] = useState<any[]>([]);
  const [attended, setAttended] = useState<Set<string>>(new Set());
  const participants            = useParticipants();

  useEffect(() => {
    async function load() {
      const { data: sess } = await supabase
        .from('discipleship_sessions').select('cohort_id').eq('id', sessionId).single();
      if (!sess) return;
      const { data: stu } = await (supabase as any)
        .from('discipleship_students')
        .select('id, user_id, profiles(first_name, last_name)')
        .eq('cohort_id', (sess as any).cohort_id)
        .eq('status', 'enrolled');
      if (stu) setStudents(stu);
      const { data: att } = await (supabase as any)
        .from('discipleship_attendance').select('student_id')
        .eq('session_id', sessionId).eq('present', true);
      if (att) setAttended(new Set(att.map((a: any) => a.student_id)));
    }
    load();
  }, [sessionId]);

  async function toggle(studentId: string) {
    if (attended.has(studentId)) {
      await (supabase as any).from('discipleship_attendance')
        .delete().eq('student_id', studentId).eq('session_id', sessionId);
      setAttended(p => { const s = new Set(p); s.delete(studentId); return s; });
    } else {
      await (supabase as any).from('discipleship_attendance').upsert(
        { student_id: studentId, session_id: sessionId, present: true, marked_at: new Date().toISOString() },
        { onConflict: 'student_id,session_id' },
      );
      setAttended(p => new Set([...p, studentId]));
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-white/10 flex-shrink-0">
        <p className="text-white font-black text-sm" style={H}>Attendance</p>
        <p className="text-white/35 text-xs">{attended.size}/{students.length} marked</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {students.map(s => {
          const p    = (s as any).profiles ?? {};
          const name = `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Student';
          const online = participants.some((part: { identity?: string }) => part.identity === s.user_id);
          return (
            <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${online ? 'bg-green-500' : 'bg-white/20'}`} />
              <span className="text-white/75 text-xs flex-1 truncate">{name}</span>
              <button onClick={() => toggle(s.id)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${attended.has(s.id) ? 'bg-green-500/20 text-green-400' : 'bg-white/8 text-white/30 hover:text-white/60'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
        {!students.length && <p className="text-white/25 text-xs text-center py-4">No enrolled students</p>}
      </div>
    </div>
  );
}

export default function DiscipleshipClassroomPage() {
  const router    = useRouter();
  const sessionId = router.query.sessionId as string | undefined;

  type State = 'loading' | 'ready' | 'error' | 'left';
  const [state,     setState]     = useState<State>('loading');
  const [tokenData, setTokenData] = useState<any>(null);
  const [userId,    setUserId]    = useState('');
  const [session,   setSession]   = useState<any>(null);
  const [error,     setError]     = useState('');
  const [attended,  setAttended]  = useState(false);
  const [showPanel, setPanel]     = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      const { data: { session: auth } } = await supabase.auth.getSession();
      if (!auth) { router.push(`/discipleship?redirect=/discipleship/classroom/${sessionId}`); return; }
      setUserId(auth.user.id);

      const { data: sess } = await (supabase as any)
        .from('discipleship_sessions').select('id, title, session_number').eq('id', sessionId).single();
      setSession(sess);

      const res = await fetch('/api/classroom/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.access_token}` },
        body: JSON.stringify({ sessionId, cohortType: 'discipleship' }),
      });
      if (!res.ok) { const j = await res.json(); setError(j.message ?? 'Failed to join'); setState('error'); return; }
      setTokenData(await res.json());
      setState('ready');
    })();
  }, [sessionId, router]);

  if (state === 'loading') return (
    <div className="fixed inset-0 bg-[#0A0C10] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-[#BF0A30] animate-spin" />
        <p className="text-white/50 text-sm" style={H}>Joining classroom…</p>
      </div>
    </div>
  );

  if (state === 'error') return (
    <div className="fixed inset-0 bg-[#0A0C10] flex items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <AlertCircle className="w-12 h-12 text-[#BF0A30] mx-auto mb-4" />
        <h2 className="text-white font-black text-xl mb-2" style={H}>Cannot Join</h2>
        <p className="text-white/50 text-sm mb-6">{error}</p>
        <Link href="/discipleship/student" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );

  if (state === 'left') return (
    <div className="fixed inset-0 bg-[#0A0C10] flex items-center justify-center p-6">
      <div className="max-w-sm text-center">
        {attended
          ? <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
          : <LogOut className="w-14 h-14 text-white/30 mx-auto mb-4" />}
        <h2 className="text-white font-black text-xl mb-2" style={H}>
          {attended ? 'Attendance Recorded!' : 'You left early'}
        </h2>
        <p className="text-white/50 text-sm mb-6">
          {attended
            ? 'Great work today! Your attendance has been saved.'
            : 'You need to stay for at least 30 minutes for attendance to be recorded.'}
        </p>
        <Link href="/discipleship/student" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#0A0C10] flex flex-col">
      <div className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
        style={{ background: 'rgba(12,14,20,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-sm truncate" style={H}>{session?.title ?? 'KDC Session'}</p>
          <p className="text-white/35 text-xs">Session {session?.session_number} · {tokenData?.participantName}
            {tokenData?.isTeacher && <span className="ml-2 text-[#BF0A30]">· Teacher</span>}
          </p>
        </div>
        {attended && (
          <span className="flex items-center gap-1 text-green-400 text-xs font-bold" style={H}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Attended
          </span>
        )}
        {tokenData?.isTeacher && (
          <button onClick={() => setPanel(p => !p)}
            className={`p-2 rounded-xl transition-colors ${showPanel ? 'bg-[#BF0A30]/20 text-[#BF0A30]' : 'text-white/40 hover:text-white hover:bg-white/8'}`}>
            <Users className="w-4 h-4" />
          </button>
        )}
        <button onClick={() => setState('left')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black text-white bg-[#BF0A30] hover:bg-red-700 transition-colors"
          style={H}>
          <LogOut className="w-3.5 h-3.5" /> Leave
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <LiveKitRoom
            serverUrl={tokenData.serverUrl}
            token={tokenData.token}
            connect video audio
            onDisconnected={() => setState('left')}
            style={{ height: '100%', background: '#0A0C10' }}
          >
            <RoomAudioRenderer />
            <VideoConference />
            {!tokenData.isTeacher && (
              <AttendanceTracker
                userId={userId}
                sessionId={sessionId!}
                onAttended={() => setAttended(true)}
              />
            )}
          </LiveKitRoom>
        </div>

        {showPanel && tokenData?.isTeacher && (
          <div className="w-64 flex-shrink-0 flex flex-col"
            style={{ background: 'rgba(10,12,16,0.98)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
            <LiveKitRoom serverUrl={tokenData.serverUrl} token={tokenData.token} connect={false}>
              <TeacherPanel sessionId={sessionId!} />
            </LiveKitRoom>
          </div>
        )}
      </div>
    </div>
  );
}
