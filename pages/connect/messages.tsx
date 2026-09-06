// pages/connect/messages.tsx
// Messaging — Teachers communicate with individual students or entire cohorts

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, Search, Users, Bell, Pin, ChevronRight, CheckCheck, Loader2 } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface MessageRow {
  id: string; cohort_id: string; student_id: string | null;
  sender_id: string; sender_role: 'teacher' | 'student'; content: string; created_at: string;
}
interface StudentRow {
  id: string; user_id: string; cohort_id: string;
  profiles: { first_name: string; last_name: string } | null;
}
interface CohortRow { id: string; name: string }
interface StateRow { cohort_id: string; student_id: string | null; pinned: boolean; last_read_at: string }

interface Conversation {
  id: string; // `${cohortId}` for the group thread, `${cohortId}:${studentId}` for a DM
  type: 'cohort' | 'direct';
  name: string;
  initials: string;
  cohortId: string;
  studentId: string | null;
  messages: MessageRow[];
  pinned: boolean;
  lastReadAt: string;
}

function initialsOf(first?: string, last?: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
}

export default function MessagesPage() {
  const { profile } = useAuth();

  const [loading,       setLoading]       = useState(true);
  const [cohorts,       setCohorts]       = useState<CohortRow[]>([]);
  const [students,      setStudents]      = useState<StudentRow[]>([]);
  const [messages,      setMessages]      = useState<MessageRow[]>([]);
  const [convoState,    setConvoState]    = useState<StateRow[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messageInput,  setMessageInput]  = useState('');
  const [searchQuery,   setSearchQuery]   = useState('');
  const [sending,       setSending]       = useState(false);
  const [isMobileChat,  setIsMobileChat]  = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);

    const { data: cohortData } = await supabase
      .from('connect_cohorts').select('id, name').eq('teacher_id', profile.id);
    const cohortIds = (cohortData ?? []).map(c => c.id);
    setCohorts((cohortData ?? []) as CohortRow[]);

    if (cohortIds.length === 0) { setLoading(false); return; }

    const [{ data: studentData }, { data: messageData }, { data: stateData }] = await Promise.all([
      (supabase as any).from('connect_students')
        .select('id, user_id, cohort_id, profiles(first_name, last_name)')
        .in('cohort_id', cohortIds),
      (supabase as any).from('connect_messages')
        .select('id, cohort_id, student_id, sender_id, sender_role, content, created_at')
        .in('cohort_id', cohortIds)
        .order('created_at', { ascending: true }),
      supabase.from('connect_conversation_state')
        .select('cohort_id, student_id, pinned, last_read_at')
        .eq('user_id', profile.id),
    ]);

    setStudents((studentData ?? []) as StudentRow[]);
    setMessages((messageData ?? []) as MessageRow[]);
    setConvoState((stateData ?? []) as StateRow[]);
    setLoading(false);
  }, [profile?.id]);

  useEffect(() => { load(); }, [load]);

  // Build one conversation per cohort (group thread) plus one per enrolled
  // student (DM thread), even for students with zero messages yet — so a
  // teacher can always start a new thread.
  const conversations = useMemo<Conversation[]>(() => {
    const list: Conversation[] = [];
    for (const cohort of cohorts) {
      const groupState = convoState.find(s => s.cohort_id === cohort.id && s.student_id === null);
      list.push({
        id: cohort.id,
        type: 'cohort',
        name: `${cohort.name} (Group)`,
        initials: '',
        cohortId: cohort.id,
        studentId: null,
        messages: messages.filter(m => m.cohort_id === cohort.id && m.student_id === null),
        pinned: groupState?.pinned ?? false,
        lastReadAt: groupState?.last_read_at ?? '1970-01-01',
      });
      for (const student of students.filter(s => s.cohort_id === cohort.id)) {
        const dmState = convoState.find(s => s.cohort_id === cohort.id && s.student_id === student.id);
        list.push({
          id: `${cohort.id}:${student.id}`,
          type: 'direct',
          name: `${student.profiles?.first_name ?? ''} ${student.profiles?.last_name ?? ''}`.trim() || 'Student',
          initials: initialsOf(student.profiles?.first_name, student.profiles?.last_name),
          cohortId: cohort.id,
          studentId: student.id,
          messages: messages.filter(m => m.cohort_id === cohort.id && m.student_id === student.id),
          pinned: dmState?.pinned ?? false,
          lastReadAt: dmState?.last_read_at ?? '1970-01-01',
        });
      }
    }
    return list;
  }, [cohorts, students, messages, convoState]);

  const unreadCountOf = useCallback((c: Conversation) =>
    c.messages.filter(m => m.sender_role !== 'teacher' && m.created_at > c.lastReadAt).length,
  []);

  const activeConvo = conversations.find(c => c.id === activeConvoId) ?? null;

  const filteredConvos = conversations
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const aUnread = unreadCountOf(a), bUnread = unreadCountOf(b);
      if (aUnread !== bUnread) return bUnread - aUnread;
      const aLast = a.messages.at(-1)?.created_at ?? '';
      const bLast = b.messages.at(-1)?.created_at ?? '';
      return bLast.localeCompare(aLast);
    });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvoId, messages]);

  async function markRead(c: Conversation) {
    if (!profile?.id) return;
    const now = new Date().toISOString();
    setConvoState(prev => {
      const exists = prev.some(s => s.cohort_id === c.cohortId && s.student_id === c.studentId);
      return exists
        ? prev.map(s => s.cohort_id === c.cohortId && s.student_id === c.studentId ? { ...s, last_read_at: now } : s)
        : [...prev, { cohort_id: c.cohortId, student_id: c.studentId, pinned: false, last_read_at: now }];
    });
    await supabase.from('connect_conversation_state').upsert(
      { user_id: profile.id, cohort_id: c.cohortId, student_id: c.studentId, last_read_at: now },
      { onConflict: c.studentId ? 'user_id,cohort_id,student_id' : 'user_id,cohort_id' },
    );
  }

  function openConvo(c: Conversation) {
    setActiveConvoId(c.id);
    setIsMobileChat(true);
    markRead(c);
  }

  async function sendMessage() {
    if (!messageInput.trim() || !activeConvo || !profile?.id) return;
    setSending(true);
    const content = messageInput.trim();
    const { data } = await (supabase as any).from('connect_messages').insert({
      cohort_id: activeConvo.cohortId,
      student_id: activeConvo.studentId,
      sender_id: profile.id,
      sender_role: 'teacher',
      content,
    }).select('id, cohort_id, student_id, sender_id, sender_role, content, created_at').single();
    if (data) setMessages(prev => [...prev, data as MessageRow]);
    setMessageInput('');
    setSending(false);
    markRead(activeConvo);
  }

  async function togglePin(c: Conversation) {
    if (!profile?.id) return;
    const nextPinned = !c.pinned;
    setConvoState(prev => {
      const exists = prev.some(s => s.cohort_id === c.cohortId && s.student_id === c.studentId);
      return exists
        ? prev.map(s => s.cohort_id === c.cohortId && s.student_id === c.studentId ? { ...s, pinned: nextPinned } : s)
        : [...prev, { cohort_id: c.cohortId, student_id: c.studentId, pinned: nextPinned, last_read_at: new Date().toISOString() }];
    });
    await supabase.from('connect_conversation_state').upsert(
      { user_id: profile.id, cohort_id: c.cohortId, student_id: c.studentId, pinned: nextPinned },
      { onConflict: c.studentId ? 'user_id,cohort_id,student_id' : 'user_id,cohort_id' },
    );
  }

  const totalUnread = conversations.reduce((sum, c) => sum + unreadCountOf(c), 0);
  const activeStudentCount = activeConvo?.type === 'cohort'
    ? students.filter(s => s.cohort_id === activeConvo.cohortId).length
    : 0;

  if (loading) {
    return (
      <ConnectLayout title="Messages">
        <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      </ConnectLayout>
    );
  }

  return (
    <ConnectLayout title="Messages" notificationCount={totalUnread}>
      <div className="max-w-6xl mx-auto h-[calc(100vh-7rem)] flex overflow-hidden bg-[#12151C] rounded-2xl border border-white/[0.06]/70 shadow-sm">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className={`flex-shrink-0 w-full sm:w-80 flex flex-col border-r border-white/[0.04] ${isMobileChat ? 'hidden sm:flex' : 'flex'}`}>

          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-white">Messages</h2>
              {totalUnread > 0 && (
                <span className="w-6 h-6 bg-[#BF0A30] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalUnread}
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations…"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#0A0C10] border border-white/[0.06] rounded-xl focus:outline-none focus:border-[#BF0A30] text-white placeholder-white/30" />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvos.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-10 px-4">
                {cohorts.length === 0 ? 'You have no cohorts assigned yet.' : 'No conversations match your search.'}
              </p>
            )}
            {filteredConvos.map(convo => {
              const unread = unreadCountOf(convo);
              const last = convo.messages.at(-1);
              return (
                <button key={convo.id} onClick={() => openConvo(convo)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#0A0C10] dark:hover:bg-white/[0.03] transition-colors text-left border-b border-gray-50 dark:border-white/[0.03] ${
                    activeConvoId === convo.id ? 'bg-[#BF0A30]/5 dark:bg-[#BF0A30]/10' : ''
                  }`}>
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 text-sm relative ${
                    convo.type === 'cohort' ? 'bg-gradient-to-br from-[#BF0A30] to-[#7D0018]' : 'bg-gradient-to-br from-gray-600 to-gray-800'
                  }`}>
                    {convo.type === 'cohort' ? <Users className="w-5 h-5" /> : convo.initials}
                    {convo.pinned && (
                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                        <Pin className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-sm font-semibold truncate ${unread ? 'text-white' : 'text-white/70'}`}>
                        {convo.name}
                      </span>
                      {last && (
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {new Date(last.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${unread ? 'text-white font-medium' : 'text-gray-500'}`}>
                        {last?.content ?? 'No messages yet'}
                      </p>
                      {unread > 0 && (
                        <span className="ml-2 w-5 h-5 bg-[#BF0A30] text-white text-[10px] rounded-full flex items-center justify-center font-bold flex-shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Chat area ─────────────────────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col ${!isMobileChat && 'hidden sm:flex'}`}>
          {activeConvo ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
                <button onClick={() => setIsMobileChat(false)} className="sm:hidden p-1 text-gray-500">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                  activeConvo.type === 'cohort' ? 'bg-gradient-to-br from-[#BF0A30] to-[#7D0018]' : 'bg-gradient-to-br from-gray-600 to-gray-800'
                }`}>
                  {activeConvo.type === 'cohort' ? <Users className="w-4 h-4" /> : activeConvo.initials}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white text-sm">{activeConvo.name}</p>
                  <p className="text-xs text-gray-500">
                    {activeConvo.type === 'cohort' ? `${activeStudentCount} students` : 'Direct message'}
                  </p>
                </div>
                <button onClick={() => togglePin(activeConvo)}
                  className={`p-2 rounded-xl transition-colors ${activeConvo.pinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={activeConvo.pinned ? 'Unpin' : 'Pin'}>
                  <Pin className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeConvo.messages.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-10">No messages yet — say hello!</p>
                )}
                {activeConvo.messages.map(msg => {
                  const isOwn = msg.sender_role === 'teacher';
                  const sender = !isOwn && activeConvo.type === 'cohort'
                    ? students.find(s => s.user_id === msg.sender_id)?.profiles
                    : null;
                  return (
                    <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {sender && (
                        <span className="text-[11px] text-gray-500 mb-1 px-1 font-semibold">
                          {sender.first_name} {sender.last_name}
                        </span>
                      )}
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isOwn
                          ? 'bg-gradient-to-br from-[#BF0A30] to-[#A0021F] text-white rounded-br-sm'
                          : 'bg-white/5 text-white rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-gray-400">
                          {new Date(msg.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isOwn && <CheckCheck className="w-3 h-3 text-blue-400" />}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Message input */}
              <div className="px-4 py-3.5 border-t border-gray-100">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                    placeholder={activeConvo.type === 'cohort' ? 'Message the whole cohort…' : `Message ${activeConvo.name}…`}
                    rows={1}
                    className="flex-1 resize-none bg-[#0A0C10] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#BF0A30] transition-colors max-h-32"
                    style={{ minHeight: '44px' }}
                  />
                  <button onClick={sendMessage} disabled={!messageInput.trim() || sending}
                    className="btn btn-primary w-11 h-11 p-0 flex-shrink-0">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                {activeConvo.type === 'cohort' && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    This message will be sent to all {activeStudentCount} students in the cohort
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Select a conversation</p>
                <p className="text-gray-400 text-sm mt-1">Choose from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConnectLayout>
  );
}
