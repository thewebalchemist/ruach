// pages/notifications/index.tsx
// Full notifications page for members and staff

import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  ArrowLeft, Bell, BookOpen, AlertTriangle, FileText,
  Calendar, Heart, Star, GraduationCap, Home, CheckCircle, X
} from 'lucide-react';

const MOCK_DATA = true;

// ── Types ─────────────────────────────────────────────────────────────────────
type NotificationCategory = 'church' | 'crosspoint' | 'connect' | 'discipleship';

interface Notification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
}

// ── Mock Notifications ────────────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-001',
    category: 'discipleship',
    title: 'New Module Published',
    description: 'KDC Level 1 — Module 3: "The Fruit of the Spirit" is now available for study.',
    time: '2 hours ago',
    isRead: false,
  },
  {
    id: 'n-002',
    category: 'connect',
    title: 'Attendance Warning',
    description: 'You have missed 2 consecutive Connect Class sessions. Please attend the next session to remain enrolled.',
    time: '5 hours ago',
    isRead: false,
  },
  {
    id: 'n-003',
    category: 'discipleship',
    title: 'Exam Now Available',
    description: 'The end-of-module assessment for "Faith and Works" is now open. You have 7 days to complete it.',
    time: '1 day ago',
    isRead: false,
  },
  {
    id: 'n-004',
    category: 'church',
    title: 'Event Reminder',
    description: 'Kingdom Woman Conference starts this Friday at 9:00 AM. Registration closes tomorrow.',
    time: '1 day ago',
    isRead: false,
  },
  {
    id: 'n-005',
    category: 'church',
    title: 'Prayer Request Update',
    description: 'A prayer request you prayed for has been marked as answered. Join in giving thanks!',
    time: '2 days ago',
    isRead: true,
  },
  {
    id: 'n-006',
    category: 'church',
    title: 'Welcome to RuachConnect',
    description: 'Your member account has been activated. Explore your dashboard to get started on your journey.',
    time: '3 days ago',
    isRead: true,
  },
  {
    id: 'n-007',
    category: 'discipleship',
    title: 'Graduation Eligible',
    description: 'Congratulations! You have completed all requirements for KDC Level 1. You are eligible for graduation.',
    time: '4 days ago',
    isRead: true,
  },
  {
    id: 'n-008',
    category: 'crosspoint',
    title: 'Crosspoint Meeting Reminder',
    description: 'Your Kilimani Crosspoint meets tomorrow, Wednesday at 7:00 PM. Location: James\' Residence, Kilimani.',
    time: '5 days ago',
    isRead: true,
  },
  {
    id: 'n-009',
    category: 'crosspoint',
    title: 'New Crosspoint Module',
    description: '"Building Strong Relationships" — this week\'s Crosspoint discussion guide is ready.',
    time: '6 days ago',
    isRead: true,
  },
  {
    id: 'n-010',
    category: 'connect',
    title: 'Connect Class Registration Open',
    description: 'Cohort 9 registration is now open. Invite someone who needs to go through Connect Class.',
    time: '1 week ago',
    isRead: true,
  },
];

type TabFilter = 'all' | 'unread' | NotificationCategory;

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'church', label: 'Church' },
  { key: 'crosspoint', label: 'Crosspoint' },
  { key: 'connect', label: 'Connect' },
  { key: 'discipleship', label: 'Discipleship' },
];

const CATEGORY_CONFIG: Record<
  NotificationCategory,
  { icon: React.ElementType; bg: string; iconColor: string; label: string }
> = {
  church: {
    icon: Bell,
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    label: 'Church',
  },
  crosspoint: {
    icon: Home,
    bg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    label: 'Crosspoint',
  },
  connect: {
    icon: BookOpen,
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    label: 'Connect',
  },
  discipleship: {
    icon: GraduationCap,
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    label: 'Discipleship',
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filtered = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !n.isRead;
    return n.category === activeTab;
  });

  function markRead(id: string) {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111]/98 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-black text-gray-900 dark:text-white text-base tracking-tight leading-tight">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-[11px] text-gray-400 leading-tight">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-semibold text-[#BF0A30] hover:opacity-80 transition-opacity"
            >
              Mark all read
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 animate-fade-in">

        {/* ── Filter Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            const tabUnread =
              tab.key === 'unread'
                ? unreadCount
                : tab.key === 'all'
                ? 0
                : notifications.filter(n => n.category === tab.key && !n.isRead).length;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#BF0A30] text-white shadow-md shadow-[#BF0A30]/30'
                    : 'bg-white dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#2D2D2D] hover:border-[#BF0A30]/40'
                }`}
              >
                {tab.label}
                {tabUnread > 0 && (
                  <span
                    className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none ${
                      isActive ? 'bg-white/30 text-white' : 'bg-[#BF0A30] text-white'
                    }`}
                  >
                    {tabUnread}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Notification List ────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center mb-4">
              <Bell className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">No notifications</p>
            <p className="text-sm text-gray-400">
              {activeTab === 'unread'
                ? 'You are all caught up!'
                : 'Nothing in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(notification => {
              const config = CATEGORY_CONFIG[notification.category];
              const Icon = config.icon;

              return (
                <button
                  key={notification.id}
                  onClick={() => markRead(notification.id)}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                    notification.isRead
                      ? 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2D2D2D]'
                      : 'bg-white dark:bg-[#1A1A1A] border-[#BF0A30]/20 dark:border-[#BF0A30]/20 shadow-sm shadow-[#BF0A30]/5'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${config.bg}`}
                  >
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-bold leading-snug ${
                          notification.isRead
                            ? 'text-gray-700 dark:text-gray-300'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {notification.time}
                        </span>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#BF0A30] flex-shrink-0" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {notification.description}
                    </p>
                    <span
                      className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.iconColor}`}
                    >
                      {config.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
