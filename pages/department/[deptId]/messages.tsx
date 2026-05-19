import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Send, Search, Users, Pin, ChevronRight, CheckCheck, Loader2, Bell } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { mockDepartments, mockMembers } from '@/data';

const MOCK_DATA = true;

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'leader' | 'member';
  content: string;
  time: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  type: 'direct' | 'broadcast';
  name: string;
  initials: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  pinned: boolean;
  memberId?: string;
  messages: Message[];
}

const buildConversations = (deptId: string | undefined): Conversation[] => [
  {
    id: `broadcast-${deptId}`,
    type: 'broadcast',
    name: 'All Department Members',
    initials: 'ALL',
    lastMessage: 'Reminder: Department meeting this Sunday after service.',
    lastTime: '10:00',
    unread: 0,
    pinned: true,
    messages: [
      { id: 'm1', senderId: 'leader-001', senderName: 'Dept Leader', senderRole: 'leader', content: 'Welcome everyone to the department channel. This is where you will receive announcements and updates.', time: '09:00', isRead: true },
      { id: 'm2', senderId: 'leader-001', senderName: 'Dept Leader', senderRole: 'leader', content: 'Reminder: Department meeting this Sunday after service. Please be present.', time: '10:00', isRead: true },
    ],
  },
  {
    id: 'dm-user-003',
    type: 'direct',
    name: 'Peter Ochieng',
    initials: 'PO',
    lastMessage: 'I will be a few minutes late to the next rehearsal.',
    lastTime: 'Yesterday',
    unread: 1,
    pinned: false,
    memberId: 'user-003',
    messages: [
      { id: 'm3', senderId: 'user-003', senderName: 'Peter Ochieng', senderRole: 'member', content: 'Hi, I wanted to let you know I will be a few minutes late to the next rehearsal.', time: 'Yesterday 14:30', isRead: false },
    ],
  },
  {
    id: 'dm-user-004',
    type: 'direct',
    name: 'Mary Njeri',
    initials: 'MN',
    lastMessage: 'Thank you for the update!',
    lastTime: 'Mon',
    unread: 0,
    pinned: false,
    memberId: 'user-004',
    messages: [
      { id: 'm4', senderId: 'leader-001', senderName: 'Dept Leader', senderRole: 'leader', content: 'Hi Mary, just checking in. Are you available for the event this weekend?', time: 'Mon 09:00', isRead: true },
      { id: 'm5', senderId: 'user-004', senderName: 'Mary Njeri', senderRole: 'member', content: 'Yes, I will be there! Thank you for the update!', time: 'Mon 09:30', isRead: true },
    ],
  },
  {
    id: 'dm-user-005',
    type: 'direct',
    name: 'John Mutua',
    initials: 'JM',
    lastMessage: 'Understood, will do.',
    lastTime: 'Sun',
    unread: 0,
    pinned: false,
    memberId: 'user-005',
    messages: [
      { id: 'm6', senderId: 'leader-001', senderName: 'Dept Leader', senderRole: 'leader', content: 'John, please make sure the equipment is set up by 7:30 AM on Sunday.', time: 'Sun 18:00', isRead: true },
      { id: 'm7', senderId: 'user-005', senderName: 'John Mutua', senderRole: 'member', content: 'Understood, will do.', time: 'Sun 18:15', isRead: true },
    ],
  },
];

export default function DepartmentMessagesPage() {
  const router = useRouter();
  const { deptId } = router.query;

  const department = mockDepartments.find(d => d.id === deptId);

  const [conversations, setConversations] = useState<Conversation[]>(buildConversations(deptId as string));
  const [activeConvoId, setActiveConvoId] = useState(`broadcast-${deptId}`);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [isMobileChat, setIsMobileChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeConvo = conversations.find(c => c.id === activeConvoId);

  useEffect(() => {
    setConversations(buildConversations(deptId as string));
    setActiveConvoId(`broadcast-${deptId}`);
  }, [deptId]);

  const filteredConvos = conversations
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.unread - a.unread;
    });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvoId, conversations]);

  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  function openConvo(id: string) {
    setActiveConvoId(id);
    setIsMobileChat(true);
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, unread: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) } : c
    ));
  }

  async function sendMessage() {
    if (!messageInput.trim() || !activeConvo) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 400));
    const msg: Message = {
      id: Date.now().toString(),
      senderId: 'leader-001',
      senderName: 'Dept Leader',
      senderRole: 'leader',
      content: messageInput.trim(),
      time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };
    setConversations(prev => prev.map(c =>
      c.id === activeConvoId
        ? { ...c, messages: [...c.messages, msg], lastMessage: msg.content, lastTime: msg.time }
        : c
    ));
    setMessageInput('');
    setSending(false);
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unread, 0);
  const deptMemberCount = mockMembers.filter(m => m.departments.some(d => d.departmentId === deptId)).length;

  return (
    <DepartmentLayout department={department} title="Messages">
      <div className="h-[calc(100vh-8rem)] flex overflow-hidden bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-[#2D2D2D]">

        {/* Sidebar */}
        <div className={`flex-shrink-0 w-full sm:w-72 flex flex-col border-r border-gray-100 dark:border-[#2D2D2D] ${isMobileChat ? 'hidden sm:flex' : 'flex'}`}>

          {/* Sidebar Header */}
          <div className="px-4 py-4 border-b border-gray-100 dark:border-[#2D2D2D]">
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
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] rounded-xl focus:outline-none focus:border-[#BF0A30] text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvos.map(convo => (
              <button
                key={convo.id}
                onClick={() => openConvo(convo.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-[#1F1F1F] transition-colors text-left border-b border-gray-50 dark:border-[#1F1F1F] ${
                  activeConvoId === convo.id ? 'bg-[#BF0A30]/5 dark:bg-[#BF0A30]/10' : ''
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 text-sm ${
                  convo.type === 'broadcast' ? 'bg-gradient-to-br from-[#BF0A30] to-[#7D0018]' : 'bg-gradient-to-br from-gray-500 to-gray-700'
                }`}>
                  {convo.type === 'broadcast' ? <Users className="w-5 h-5" /> : convo.initials}
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

          {/* Broadcast Button */}
          <div className="p-3 border-t border-gray-100 dark:border-[#2D2D2D]">
            <button
              onClick={() => openConvo(`broadcast-${deptId}`)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]"
            >
              <Bell className="w-3.5 h-3.5" />Broadcast to Department
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!isMobileChat && 'hidden sm:flex'}`}>
          {activeConvo ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-[#2D2D2D]">
                <button onClick={() => setIsMobileChat(false)} className="sm:hidden p-1 text-gray-500">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                  activeConvo.type === 'broadcast' ? 'bg-gradient-to-br from-[#BF0A30] to-[#7D0018]' : 'bg-gradient-to-br from-gray-500 to-gray-700'
                }`}>
                  {activeConvo.type === 'broadcast' ? <Users className="w-4 h-4" /> : activeConvo.initials}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{activeConvo.name}</p>
                  <p className="text-xs text-gray-500">
                    {activeConvo.type === 'broadcast' ? `${deptMemberCount} members` : 'Direct message'}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeConvo.messages.map(msg => {
                  const isOwn = msg.senderRole === 'leader';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {activeConvo.type === 'broadcast' && !isOwn && (
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

              {/* Message Input */}
              <div className="px-4 py-3.5 border-t border-gray-100 dark:border-[#2D2D2D]">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder={activeConvo.type === 'broadcast' ? 'Broadcast to all department members...' : `Message ${activeConvo.name}...`}
                    rows={1}
                    className="flex-1 resize-none bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#BF0A30] transition-colors max-h-32"
                    style={{ minHeight: '44px' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || sending}
                    className="w-11 h-11 bg-[#BF0A30] hover:bg-[#B00325] disabled:opacity-50 text-white rounded-xl flex items-center justify-center flex-shrink-0"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                {activeConvo.type === 'broadcast' && (
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    This message will be sent to all {deptMemberCount} members in {department.name}
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
    </DepartmentLayout>
  );
}
