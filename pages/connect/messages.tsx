// pages/connect/messages.tsx
// Messaging — Teachers communicate with individual students or entire cohorts

import { useState, useRef, useEffect } from 'react';
import { Send, Search, Users, User, Bell, BellOff, Pin, ChevronRight, Clock, CheckCheck, Loader2 } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { mockConnectStudents, mockConnectCohorts, getUserById } from '@/data/connect';

interface Message {
  id:         string;
  senderId:   string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  content:    string;
  time:       string;
  isRead:     boolean;
}

interface Conversation {
  id:           string;
  type:         'direct' | 'cohort';
  name:         string;
  initials:     string;
  lastMessage:  string;
  lastTime:     string;
  unread:       number;
  pinned:       boolean;
  cohortId?:    string;
  studentId?:   string;
  messages:     Message[];
}

// ── Mock conversations ────────────────────────────────────────────────────────
const INITIAL_CONVOS: Conversation[] = [
  {
    id: 'cohort-cc-2026-01', type: 'cohort', name: 'Cohort 1 2026 (Group)', initials: 'C1',
    lastMessage: 'Session 3 is on Saturday. Please be present 🙏',
    lastTime: '09:15', unread: 0, pinned: true, cohortId: 'cc-2026-01',
    messages: [
      { id: 'm1', senderId: 'teacher-001', senderName: 'Ps. James', senderRole: 'teacher', content: 'Good morning everyone! Welcome to Connect Class Cohort 1 2026.', time: '08:00', isRead: true },
      { id: 'm2', senderId: 'user-new-001', senderName: 'John', senderRole: 'student', content: 'Good morning Pastor James! Excited to be here.', time: '08:05', isRead: true },
      { id: 'm3', senderId: 'teacher-001', senderName: 'Ps. James', senderRole: 'teacher', content: 'Please make sure you have your Bibles ready for Session 1. See you Sunday!', time: '08:10', isRead: true },
      { id: 'm4', senderId: 'user-new-002', senderName: 'Mary', senderRole: 'student', content: 'Will the session be recorded for those who can\'t attend physically?', time: '08:30', isRead: true },
      { id: 'm5', senderId: 'teacher-001', senderName: 'Ps. James', senderRole: 'teacher', content: 'Yes! We\'ll have the virtual option running as well. Join via the Classroom link.', time: '08:35', isRead: true },
      { id: 'm6', senderId: 'teacher-001', senderName: 'Ps. James', senderRole: 'teacher', content: 'Session 3 is on Saturday. Please be present 🙏', time: '09:15', isRead: true },
    ],
  },
  {
    id: 'student-cs-002', type: 'direct', name: 'Mary Wanjiku', initials: 'MW',
    lastMessage: 'I missed Session 2 due to illness. Is there a way to catch up?',
    lastTime: 'Yesterday', unread: 1, pinned: false, studentId: 'cs-002',
    messages: [
      { id: 'm7', senderId: 'user-new-002', senderName: 'Mary', senderRole: 'student', content: 'Hello Pastor James, I missed Session 2 due to illness. Is there a way to catch up?', time: '2026-02-09 14:30', isRead: false },
    ],
  },
  {
    id: 'student-cs-001', type: 'direct', name: 'John Kamau', initials: 'JK',
    lastMessage: 'Thank you for the resources Pastor!',
    lastTime: 'Mon', unread: 0, pinned: false, studentId: 'cs-001',
    messages: [
      { id: 'm8', senderId: 'teacher-001', senderName: 'Ps. James', senderRole: 'teacher', content: 'Hi John, how are you finding the class so far?', time: 'Mon 10:00', isRead: true },
      { id: 'm9', senderId: 'user-new-001', senderName: 'John', senderRole: 'student', content: 'It\'s been life-changing! I\'ve learnt so much about salvation.', time: 'Mon 10:30', isRead: true },
      { id: 'm10', senderId: 'teacher-001', senderName: 'Ps. James', senderRole: 'teacher', content: 'That\'s wonderful to hear! Keep engaging with the material.', time: 'Mon 11:00', isRead: true },
      { id: 'm11', senderId: 'user-new-001', senderName: 'John', senderRole: 'student', content: 'Thank you for the resources Pastor!', time: 'Mon 11:05', isRead: true },
    ],
  },
  {
    id: 'student-cs-003', type: 'direct', name: 'Peter Ochieng', initials: 'PO',
    lastMessage: 'Looking forward to Saturday\'s session!',
    lastTime: 'Sun', unread: 0, pinned: false, studentId: 'cs-003',
    messages: [
      { id: 'm12', senderId: 'user-new-003', senderName: 'Peter', senderRole: 'student', content: 'Looking forward to Saturday\'s session!', time: 'Sun 16:00', isRead: true },
    ],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVOS);
  const [activeConvoId, setActiveConvoId]   = useState('cohort-cc-2026-01');
  const [messageInput,  setMessageInput]    = useState('');
  const [searchQuery,   setSearchQuery]     = useState('');
  const [sending,       setSending]         = useState(false);
  const [isMobileChat,  setIsMobileChat]    = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConvo = conversations.find(c => c.id === activeConvoId);

  const filteredConvos = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.unread - a.unread;
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvoId, conversations]);

  function openConvo(id: string) {
    setActiveConvoId(id);
    setIsMobileChat(true);
    // Mark messages read
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) } : c
    ));
  }

  async function sendMessage() {
    if (!messageInput.trim() || !activeConvo) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 400));
    const msg: Message = {
      id:         Date.now().toString(),
      senderId:   'teacher-001',
      senderName: 'Ps. James',
      senderRole: 'teacher',
      content:    messageInput.trim(),
      time:       new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
      isRead:     true,
    };
    setConversations(prev => prev.map(c =>
      c.id === activeConvoId
        ? { ...c, messages: [...c.messages, msg], lastMessage: msg.content, lastTime: msg.time }
        : c
    ));
    setMessageInput('');
    setSending(false);
  }

  function togglePin(id: string) {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);

  return (
    <ConnectLayout title="Messages" notificationCount={totalUnread}>
      <div className="max-w-6xl mx-auto h-[calc(100vh-7rem)] flex overflow-hidden bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] shadow-sm">

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <div className={`flex-shrink-0 w-full sm:w-80 flex flex-col border-r border-gray-100 dark:border-white/[0.05] ${isMobileChat ? 'hidden sm:flex' : 'flex'}`}>

          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-gray-100 dark:border-white/[0.05]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 dark:text-white">Messages</h2>
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
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/[0.06] rounded-xl focus:outline-none focus:border-[#BF0A30] text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvos.map(convo => (
              <button key={convo.id} onClick={() => openConvo(convo.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left border-b border-gray-50 dark:border-white/[0.03] ${
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
                    <span className={`text-sm font-semibold truncate ${convo.unread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {convo.name}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{convo.lastTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate ${convo.unread ? 'text-gray-800 dark:text-gray-200 font-medium' : 'text-gray-500'}`}>
                      {convo.lastMessage}
                    </p>
                    {convo.unread > 0 && (
                      <span className="ml-2 w-5 h-5 bg-[#BF0A30] text-white text-[10px] rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* New broadcast */}
          <div className="p-3 border-t border-gray-100 dark:border-white/[0.05]">
            <button className="btn btn-primary w-full btn-sm gap-2">
              <Bell className="w-3.5 h-3.5" /> Broadcast to Cohort
            </button>
          </div>
        </div>

        {/* ── Chat area ─────────────────────────────────────────────────────── */}
        <div className={`flex-1 flex flex-col ${!isMobileChat && 'hidden sm:flex'}`}>
          {activeConvo ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.05]">
                <button onClick={() => setIsMobileChat(false)} className="sm:hidden p-1 text-gray-500">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                  activeConvo.type === 'cohort' ? 'bg-gradient-to-br from-[#BF0A30] to-[#7D0018]' : 'bg-gradient-to-br from-gray-600 to-gray-800'
                }`}>
                  {activeConvo.type === 'cohort' ? <Users className="w-4 h-4" /> : activeConvo.initials}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{activeConvo.name}</p>
                  <p className="text-xs text-gray-500">
                    {activeConvo.type === 'cohort'
                      ? `${mockConnectStudents.filter(s => s.cohortId === activeConvo.cohortId).length} students`
                      : 'Direct message'}
                  </p>
                </div>
                <button onClick={() => togglePin(activeConvo.id)}
                  className={`p-2 rounded-xl transition-colors ${activeConvo.pinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                  title={activeConvo.pinned ? 'Unpin' : 'Pin'}>
                  <Pin className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeConvo.messages.map(msg => {
                  const isOwn = msg.senderRole === 'teacher';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {/* Sender name (only for group messages) */}
                      {activeConvo.type === 'cohort' && !isOwn && (
                        <span className="text-[11px] text-gray-500 mb-1 px-1 font-semibold">{msg.senderName}</span>
                      )}
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isOwn
                          ? 'bg-gradient-to-br from-[#BF0A30] to-[#A0021F] text-white rounded-br-sm'
                          : 'bg-gray-100 dark:bg-[#252525] text-gray-800 dark:text-gray-200 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-gray-400">{msg.time}</span>
                        {isOwn && msg.isRead && <CheckCheck className="w-3 h-3 text-blue-400" />}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Message input */}
              <div className="px-4 py-3.5 border-t border-gray-100 dark:border-white/[0.05]">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
                    placeholder={activeConvo.type === 'cohort' ? 'Message the whole cohort…' : `Message ${activeConvo.name}…`}
                    rows={1}
                    className="flex-1 resize-none bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#BF0A30] transition-colors max-h-32"
                    style={{ minHeight: '44px' }}
                  />
                  <button onClick={sendMessage} disabled={!messageInput.trim() || sending}
                    className="btn btn-primary w-11 h-11 p-0 flex-shrink-0">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                {activeConvo.type === 'cohort' && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    This message will be sent to all {mockConnectStudents.filter(s => s.cohortId === activeConvo.cohortId).length} students in the cohort
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
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
