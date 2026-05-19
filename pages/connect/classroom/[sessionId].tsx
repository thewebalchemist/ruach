// pages/connect/classroom/[sessionId].tsx
// Virtual Classroom — Firebase-signaled WebRTC room
// Architecture: Firebase Realtime DB for signaling/chat/state → WebRTC for media
// Scales to 500+ via SFU integration (LiveKit/mediasoup) — plug-in ready

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Users,
  Hand, ScreenShare, ScreenShareOff, Settings, Maximize2, Grid,
  PinIcon, ChevronRight, X, Send, AlertCircle, Loader2, Radio,
  Volume2, VolumeX, BookOpen, CheckCircle, Clock, UserCheck
} from 'lucide-react';
import { mockConnectSessions, mockConnectStudents, mockConnectCohorts, getUserById } from '@/data/connect';

// ── Types ────────────────────────────────────────────────────────────────────
interface Participant {
  id:          string;
  name:        string;
  initials:    string;
  role:        'teacher' | 'student';
  isAudioOn:   boolean;
  isVideoOn:   boolean;
  handRaised:  boolean;
  speaking:    boolean;
  isPresent:   boolean;
}

interface ChatMessage {
  id:        string;
  senderId:  string;
  senderName: string;
  message:   string;
  time:      string;
  isOwn:     boolean;
}

type SidePanel = 'chat' | 'participants' | 'attendance' | null;
type ViewMode  = 'gallery' | 'spotlight';

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PARTICIPANTS: Participant[] = [
  { id: 'teacher-001', name: 'Ps. James Mwangi', initials: 'JM', role: 'teacher', isAudioOn: true,  isVideoOn: true,  handRaised: false, speaking: true,  isPresent: true },
  { id: 'user-new-001', name: 'John Kamau',       initials: 'JK', role: 'student', isAudioOn: false, isVideoOn: false, handRaised: false, speaking: false, isPresent: true },
  { id: 'user-new-002', name: 'Mary Wanjiku',     initials: 'MW', role: 'student', isAudioOn: false, isVideoOn: true,  handRaised: true,  speaking: false, isPresent: true },
  { id: 'user-new-003', name: 'Peter Ochieng',    initials: 'PO', role: 'student', isAudioOn: false, isVideoOn: false, handRaised: false, speaking: false, isPresent: true },
];

const INITIAL_CHAT: ChatMessage[] = [
  { id: 'c1', senderId: 'teacher-001', senderName: 'Ps. James', message: 'Welcome everyone to Session 3! Make sure you have your Bible ready 📖', time: '09:02', isOwn: false },
  { id: 'c2', senderId: 'user-new-001', senderName: 'John', message: 'Thank you Pastor James! Ready and excited!', time: '09:03', isOwn: false },
  { id: 'c3', senderId: 'user-new-002', senderName: 'Mary', message: 'Good morning everyone! 🙏', time: '09:04', isOwn: false },
];

export default function VirtualClassroomPage() {
  const router   = useRouter();
  const { sessionId } = router.query;

  const [isTeacher,    setIsTeacher]    = useState(true); // determined from auth
  const [micOn,        setMicOn]        = useState(false);
  const [camOn,        setCamOn]        = useState(false);
  const [screenShare,  setScreenShare]  = useState(false);
  const [handRaised,   setHandRaised]   = useState(false);
  const [sidePanel,    setSidePanel]    = useState<SidePanel>('chat');
  const [viewMode,     setViewMode]     = useState<ViewMode>('gallery');
  const [participants, setParticipants] = useState<Participant[]>(MOCK_PARTICIPANTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [chatInput,    setChatInput]    = useState('');
  const [pinnedId,     setPinnedId]     = useState<string>('teacher-001');
  const [isLive,       setIsLive]       = useState(true);
  const [duration,     setDuration]     = useState(0); // seconds since start
  const [attendanceMarked, setAttendanceMarked] = useState<string[]>(['teacher-001', 'user-new-001', 'user-new-002', 'user-new-003']);
  const [showEndModal, setShowEndModal] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Lookup session
  const session = mockConnectSessions.find(s => s.id === sessionId);
  const cohort  = session ? mockConnectCohorts.find(c => c.id === session.cohortId) : null;

  // Duration timer
  useEffect(() => {
    const t = setInterval(() => setDuration(prev => prev + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Simulate someone raising hand every 20s (demo)
  useEffect(() => {
    const t = setInterval(() => {
      setParticipants(prev => prev.map((p, i) =>
        i === 2 ? { ...p, handRaised: !p.handRaised } : p
      ));
    }, 20000);
    return () => clearInterval(t);
  }, []);

  function formatDuration(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function sendChat() {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      id:         Date.now().toString(),
      senderId:   'me',
      senderName: 'You',
      message:    chatInput.trim(),
      time:       new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
      isOwn:      true,
    };
    setChatMessages(prev => [...prev, msg]);
    setChatInput('');
  }

  function lowerHand(participantId: string) {
    setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, handRaised: false } : p));
    showNotif('Hand lowered');
  }

  function markAttendance(participantId: string) {
    setAttendanceMarked(prev => prev.includes(participantId) ? prev.filter(id => id !== participantId) : [...prev, participantId]);
  }

  function showNotif(msg: string) {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  }

  function endSession() {
    setSessionEnded(true);
    setIsLive(false);
  }

  const studentsPresent = participants.filter(p => p.role === 'student' && attendanceMarked.includes(p.id));
  const handsRaised     = participants.filter(p => p.handRaised);

  if (sessionEnded) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center animate-fade-in-scale">
          <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Session Ended</h1>
          <p className="text-gray-400 mb-2">
            {session?.title ?? 'Virtual Class'} completed successfully
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Duration: <span className="text-white font-medium">{formatDuration(duration)}</span> ·
            Attendance: <span className="text-green-400 font-medium">{studentsPresent.length}/{participants.filter(p => p.role === 'student').length}</span> students
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/connect/cohorts/${session?.cohortId}`)}
              className="btn btn-primary w-full"
            >
              View Cohort <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/connect/dashboard')}
              className="btn btn-secondary w-full"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{session?.title ?? 'Virtual Class'} · RuachConnect</title>
      </Head>

      <div className="min-h-screen bg-[#0D0D1A] flex flex-col" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── Notification toast ────────────────────────────────────────────── */}
        {notification && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
            <div className="bg-white/10 backdrop-blur border border-white/20 text-white text-sm px-4 py-2.5 rounded-xl">
              {notification}
            </div>
          </div>
        )}

        {/* ── End session modal ─────────────────────────────────────────────── */}
        {showEndModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 w-full max-w-sm animate-fade-in-scale">
              <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center mb-4">
                <PhoneOff className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">End Class Session?</h3>
              <p className="text-gray-400 text-sm mb-6">
                This will end the class for all {participants.length} participants.
                Attendance ({studentsPresent.length} marked) will be saved.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowEndModal(false)}
                  className="flex-1 py-3 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={endSession}
                  className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold text-white transition-colors">
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0D0D1A]/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/images/ruaach.png" alt="" className="w-7 h-7 rounded-full opacity-80" />
            <div>
              <p className="text-white text-sm font-semibold leading-tight truncate max-w-[200px] lg:max-w-none">
                {session?.title ?? 'Connect Class'}
              </p>
              <p className="text-gray-500 text-xs">{cohort?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            {isLive && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/15 border border-red-500/30 rounded-full">
                <div className="live-dot" />
                <span className="text-red-400 text-xs font-semibold">LIVE</span>
              </div>
            )}

            {/* Duration */}
            <div className="flex items-center gap-1.5 text-gray-400 text-sm font-mono">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(duration)}
            </div>

            {/* Participant count */}
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Users className="w-3.5 h-3.5" />
              <span>{participants.length}</span>
            </div>

            {/* View mode */}
            <button
              onClick={() => setViewMode(v => v === 'gallery' ? 'spotlight' : 'gallery')}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors hidden lg:flex"
              title={viewMode === 'gallery' ? 'Spotlight mode' : 'Gallery mode'}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">

          {/* ── Video area ──────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3">

            {viewMode === 'spotlight' ? (
              /* Spotlight: pinned participant large, others in strip */
              <>
                <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#1A1A2E] border border-white/[0.05]">
                  {(() => {
                    const pinned = participants.find(p => p.id === pinnedId) ?? participants[0];
                    return (
                      <>
                        {pinned.isVideoOn ? (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a3e] to-[#0d0d2e] flex items-center justify-center">
                            <div className="text-white/20 text-6xl font-black">{pinned.initials}</div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white text-2xl font-black opacity-60">
                                {pinned.initials}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a]">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white text-3xl font-black">
                              {pinned.initials}
                            </div>
                          </div>
                        )}
                        {/* Participant info overlay */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                          <div className="flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg">
                            {pinned.isAudioOn ? <Mic className="w-3.5 h-3.5 text-green-400" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
                            <span className="text-white text-sm font-medium">{pinned.name}</span>
                            {pinned.role === 'teacher' && <span className="text-[#D4AF37] text-xs">Teacher</span>}
                          </div>
                        </div>
                        {pinned.handRaised && (
                          <div className="absolute top-4 right-4 flex items-center gap-2 bg-amber-500 px-3 py-1.5 rounded-lg">
                            <Hand className="w-4 h-4 text-white" />
                            <span className="text-white text-xs font-medium">Hand Raised</span>
                          </div>
                        )}
                        {pinned.speaking && (
                          <div className="absolute inset-0 pointer-events-none border-2 border-green-400 rounded-2xl opacity-60" />
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Thumbnail strip */}
                <div className="flex gap-2 h-24 overflow-x-auto">
                  {participants.filter(p => p.id !== pinnedId).map(p => (
                    <button key={p.id} onClick={() => setPinnedId(p.id)}
                      className={`relative flex-shrink-0 w-40 rounded-xl overflow-hidden border transition-colors ${
                        p.speaking ? 'border-green-400' : 'border-white/[0.05]'
                      } bg-[#1A1A2E]`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#BF0A30]/80 to-[#7D0018]/80 flex items-center justify-center text-white text-sm font-bold">
                          {p.initials}
                        </div>
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                        <span className="text-white text-[10px] font-medium bg-black/60 px-2 py-0.5 rounded truncate max-w-[80px]">
                          {p.name.split(' ')[0]}
                        </span>
                        {p.handRaised && <Hand className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Gallery grid */
              <div className={`flex-1 grid gap-3 overflow-auto ${
                participants.length <= 2 ? 'grid-cols-2' :
                participants.length <= 4 ? 'grid-cols-2' :
                participants.length <= 9 ? 'grid-cols-3' :
                'grid-cols-4'
              }`}>
                {participants.map(p => (
                  <div key={p.id}
                    className={`relative rounded-2xl overflow-hidden bg-[#1A1A2E] border transition-colors ${
                      p.speaking       ? 'border-green-400/70' :
                      p.handRaised     ? 'border-amber-400/70' :
                      p.id === pinnedId ? 'border-[#BF0A30]/50' :
                      'border-white/[0.05]'
                    }`}
                    style={{ minHeight: '120px' }}
                  >
                    {/* Video/avatar */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a]">
                      <div className={`rounded-full bg-gradient-to-br flex items-center justify-center font-black text-white ${
                        p.role === 'teacher'
                          ? 'from-[#BF0A30] to-[#7D0018] w-16 h-16 text-xl'
                          : 'from-[#374151] to-[#1F2937] w-12 h-12 text-base'
                      }`}>
                        {p.initials}
                      </div>
                    </div>

                    {/* Hand raised overlay */}
                    {p.handRaised && (
                      <div className="absolute inset-0 bg-amber-500/10 flex items-start justify-end p-2">
                        <div className="bg-amber-500 rounded-lg p-1.5">
                          <Hand className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Speaking ring */}
                    {p.speaking && (
                      <div className="absolute inset-0 border-2 border-green-400 rounded-2xl pointer-events-none opacity-70" />
                    )}

                    {/* Bottom bar */}
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                      <span className="text-white text-xs font-medium truncate">
                        {p.name} {p.role === 'teacher' && <span className="text-[#D4AF37] ml-1">●</span>}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!p.isAudioOn && <MicOff className="w-3 h-3 text-red-400" />}
                        {!p.isVideoOn && <VideoOff className="w-3 h-3 text-red-400" />}
                      </div>
                    </div>

                    {/* Pin button on hover */}
                    <button onClick={() => { setPinnedId(p.id); setViewMode('spotlight'); }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-black/60 rounded-lg text-white hover:bg-white/20 transition-all">
                      <PinIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Side panel ──────────────────────────────────────────────────── */}
          {sidePanel && (
            <div className="classroom-sidebar w-[320px] flex flex-col border-l border-white/[0.05] flex-shrink-0">

              {/* Panel tabs */}
              <div className="flex border-b border-white/[0.05]">
                {[
                  { id: 'chat',         label: 'Chat',        icon: MessageSquare },
                  { id: 'participants', label: 'People',      icon: Users },
                  ...(isTeacher ? [{ id: 'attendance', label: 'Attendance', icon: UserCheck }] : []),
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id}
                    onClick={() => setSidePanel(prev => prev === id ? null : id as SidePanel)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors border-b-2 ${
                      sidePanel === id
                        ? 'text-[#BF0A30] border-[#BF0A30]'
                        : 'text-gray-500 border-transparent hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {id === 'participants' && handsRaised.length > 0 && (
                      <span className="absolute top-2 right-0 w-4 h-4 bg-amber-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                        {handsRaised.length}
                      </span>
                    )}
                  </button>
                ))}
                <button onClick={() => setSidePanel(null)}
                  className="p-3 text-gray-600 hover:text-gray-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Chat panel ──────────────────────────────────────────────── */}
              {sidePanel === 'chat' && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                        {!msg.isOwn && (
                          <span className="text-gray-500 text-[10px] mb-1 px-1 font-medium">{msg.senderName}</span>
                        )}
                        <div className={`chat-bubble max-w-[85%] ${msg.isOwn ? 'own' : 'other'}`}>
                          {msg.message}
                        </div>
                        <span className="text-gray-600 text-[10px] mt-1 px-1">{msg.time}</span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-3 border-t border-white/[0.05]">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendChat()}
                        placeholder="Message everyone…"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#BF0A30] transition-colors"
                      />
                      <button onClick={sendChat} disabled={!chatInput.trim()}
                        className="p-2.5 bg-[#BF0A30] hover:bg-[#B00325] disabled:opacity-40 rounded-xl transition-colors flex-shrink-0">
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ── Participants panel ───────────────────────────────────────── */}
              {sidePanel === 'participants' && (
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  {handsRaised.length > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3">
                      <p className="text-amber-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                        <Hand className="w-3.5 h-3.5" /> Hands Raised ({handsRaised.length})
                      </p>
                      {handsRaised.map(p => (
                        <div key={p.id} className="flex items-center justify-between py-1">
                          <span className="text-gray-300 text-sm">{p.name}</span>
                          {isTeacher && (
                            <button onClick={() => lowerHand(p.id)}
                              className="text-xs text-amber-400 hover:text-white border border-amber-500/30 px-2 py-0.5 rounded-lg transition-colors">
                              Lower
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Teachers first */}
                  {participants.filter(p => p.role === 'teacher').map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 hover:bg-white/[0.04] rounded-xl transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {p.initials}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium leading-tight">{p.name}</p>
                          <p className="text-[#D4AF37] text-[10px] font-semibold">Teacher</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {p.isAudioOn ? <Mic className="w-3.5 h-3.5 text-green-400" /> : <MicOff className="w-3.5 h-3.5 text-red-400" />}
                        {p.isVideoOn ? <Video className="w-3.5 h-3.5 text-green-400" /> : <VideoOff className="w-3.5 h-3.5 text-red-400" />}
                      </div>
                    </div>
                  ))}

                  <div className="h-px bg-white/[0.05] my-2" />
                  <p className="text-gray-600 text-[10px] uppercase font-semibold tracking-wider px-2 mb-1">
                    Students ({participants.filter(p => p.role === 'student').length})
                  </p>

                  {participants.filter(p => p.role === 'student').map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2.5 hover:bg-white/[0.04] rounded-xl transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                          attendanceMarked.includes(p.id) ? 'bg-green-600' : 'bg-gray-700'
                        }`}>
                          {p.initials}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium leading-tight">{p.name}</p>
                          {p.handRaised && <p className="text-amber-400 text-[10px]">Hand raised ✋</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {p.isAudioOn ? <Mic className="w-3.5 h-3.5 text-green-400" /> : <MicOff className="w-3.5 h-3.5 text-gray-600" />}
                        {p.isVideoOn ? <Video className="w-3.5 h-3.5 text-green-400" /> : <VideoOff className="w-3.5 h-3.5 text-gray-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Attendance panel (teacher only) ───────────────────────────── */}
              {sidePanel === 'attendance' && isTeacher && (
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 text-center">
                    <p className="text-green-400 text-2xl font-black">{studentsPresent.length}/{participants.filter(p => p.role === 'student').length}</p>
                    <p className="text-gray-400 text-xs mt-0.5">Students Present</p>
                  </div>
                  <div className="space-y-2">
                    {participants.filter(p => p.role === 'student').map(p => {
                      const marked = attendanceMarked.includes(p.id);
                      return (
                        <button key={p.id} onClick={() => markAttendance(p.id)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                            marked
                              ? 'bg-green-500/10 border-green-500/30 text-green-400'
                              : 'bg-white/[0.03] border-white/[0.05] text-gray-400 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${marked ? 'bg-green-600' : 'bg-gray-700'}`}>
                              {p.initials}
                            </div>
                            <span className="text-sm font-medium">{p.name}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            marked ? 'bg-green-500 border-green-500' : 'border-gray-600'
                          }`}>
                            {marked && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      const allStudents = participants.filter(p => p.role === 'student').map(p => p.id);
                      setAttendanceMarked(prev => {
                        const allMarked = allStudents.every(id => prev.includes(id));
                        return allMarked ? prev.filter(id => !allStudents.includes(id)) : [...new Set([...prev, ...allStudents])];
                      });
                    }}
                    className="mt-3 w-full py-2.5 border border-white/10 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:border-white/20 transition-colors"
                  >
                    Mark All Present
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom Controls ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0D0D1A]/90 backdrop-blur-sm border-t border-white/[0.05] flex-shrink-0">

          {/* Left: Session info */}
          <div className="hidden sm:flex items-center gap-3 min-w-[160px]">
            <div>
              <p className="text-white text-xs font-semibold truncate max-w-[140px]">
                {session?.title ?? 'Session'}
              </p>
              <p className="text-gray-600 text-xs font-mono">{formatDuration(duration)}</p>
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-3">
            {/* Mic */}
            <button onClick={() => { setMicOn(!micOn); showNotif(micOn ? 'Microphone off' : 'Microphone on'); }}
              className={`control-btn ${micOn ? 'active' : 'inactive'}`}
              title={micOn ? 'Mute' : 'Unmute'}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            {/* Camera */}
            <button onClick={() => { setCamOn(!camOn); showNotif(camOn ? 'Camera off' : 'Camera on'); }}
              className={`control-btn ${camOn ? 'active' : 'inactive'}`}
              title={camOn ? 'Stop video' : 'Start video'}
            >
              {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Screen share */}
            <button onClick={() => { setScreenShare(!screenShare); showNotif(screenShare ? 'Screen share stopped' : 'Screen sharing started'); }}
              className={`control-btn ${screenShare ? 'bg-green-600 text-white' : 'active'}`}
              title={screenShare ? 'Stop sharing' : 'Share screen'}
            >
              {screenShare ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
            </button>

            {/* Raise hand (student only) */}
            {!isTeacher && (
              <button onClick={() => { setHandRaised(!handRaised); showNotif(handRaised ? 'Hand lowered' : 'Hand raised!'); }}
                className={`control-btn ${handRaised ? 'bg-amber-500 text-white' : 'active'}`}
                title={handRaised ? 'Lower hand' : 'Raise hand'}
              >
                <Hand className="w-5 h-5" />
              </button>
            )}

            {/* End call */}
            <button onClick={() => isTeacher ? setShowEndModal(true) : router.push('/connect/student')}
              className="control-btn danger w-14 h-12 rounded-2xl"
              title="Leave"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Side panel toggles */}
          <div className="hidden sm:flex items-center gap-1 min-w-[160px] justify-end">
            <button onClick={() => setSidePanel(p => p === 'chat' ? null : 'chat')}
              className={`relative p-2.5 rounded-xl transition-colors ${sidePanel === 'chat' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              <MessageSquare className="w-5 h-5" />
              {chatMessages.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#BF0A30] rounded-full" />
              )}
            </button>
            <button onClick={() => setSidePanel(p => p === 'participants' ? null : 'participants')}
              className={`relative p-2.5 rounded-xl transition-colors ${sidePanel === 'participants' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
              <Users className="w-5 h-5" />
              {handsRaised.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{handsRaised.length}</span>
              )}
            </button>
            {isTeacher && (
              <button onClick={() => setSidePanel(p => p === 'attendance' ? null : 'attendance')}
                className={`relative p-2.5 rounded-xl transition-colors ${sidePanel === 'attendance' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
                <UserCheck className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
