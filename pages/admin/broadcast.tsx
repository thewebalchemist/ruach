// pages/admin/broadcast.tsx
// Admin bulk communications — send in-app, SMS, or WhatsApp to segments

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Send, Bell, MessageSquare, Users, Calendar, CheckCircle,
  X, Clock, ChevronDown, ChevronUp, Smartphone
} from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { useAuth } from '@/context/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
type Channel = 'in-app' | 'sms' | 'whatsapp';
type ScheduleMode = 'now' | 'later';

interface AudienceSegment {
  id: string;
  label: string;
  count: number;
  hasSubSelect?: boolean;
}

interface RecentBroadcast {
  id: string;
  subject: string;
  audience: string;
  channels: Channel[];
  recipientCount: number;
  sentAt: string;
  status: 'sent' | 'scheduled' | 'failed';
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const AUDIENCE_SEGMENTS: AudienceSegment[] = [
  { id: 'all-members',        label: 'All Members',           count: 247 },
  { id: 'all-students',       label: 'All Students (Connect)', count: 82  },
  { id: 'connect-cohort',     label: 'Connect Cohort',        count: 24,  hasSubSelect: true },
  { id: 'crosspoint-leaders', label: 'Crosspoint Leaders',    count: 18  },
  { id: 'teachers',           label: 'Teachers',              count: 12  },
  { id: 'department',         label: 'Department',            count: 0,   hasSubSelect: true },
];

const CONNECT_COHORTS = ['Cohort 7 (Current)', 'Cohort 8 (Upcoming)', 'Cohort 6 (Graduated)'];
const DEPARTMENTS_LIST = [
  'R-Kids Church', 'Trendsetters', 'Bridge', 'Crosspoints', 'R-Warriors',
  'Kingdom Woman', 'R-Worship', 'Media Team', 'Intercessors', 'Evangelists',
  'Hospitality', 'Care & Counselling',
];

const DEPT_COUNTS: Record<string, number> = {
  'R-Kids Church': 25, 'Trendsetters': 35, 'Bridge': 80, 'Crosspoints': 150,
  'R-Warriors': 45, 'Kingdom Woman': 65, 'R-Worship': 50, 'Media Team': 30,
  'Intercessors': 40, 'Evangelists': 25, 'Hospitality': 35, 'Care & Counselling': 15,
};

const RECENT_BROADCASTS: RecentBroadcast[] = [
  {
    id: 'bc-001',
    subject: 'Kingdom Woman Conference Reminder',
    audience: 'Kingdom Woman Dept.',
    channels: ['in-app', 'whatsapp'],
    recipientCount: 65,
    sentAt: '2026-05-07T14:00:00Z',
    status: 'sent',
  },
  {
    id: 'bc-002',
    subject: 'Connect Class Cohort 8 Registration Open',
    audience: 'All Members',
    channels: ['in-app', 'sms'],
    recipientCount: 247,
    sentAt: '2026-05-05T09:00:00Z',
    status: 'sent',
  },
  {
    id: 'bc-003',
    subject: 'Crosspoint Leaders Quarterly Meeting',
    audience: 'Crosspoint Leaders',
    channels: ['in-app', 'whatsapp'],
    recipientCount: 18,
    sentAt: '2026-05-03T10:30:00Z',
    status: 'sent',
  },
  {
    id: 'bc-004',
    subject: 'Prayer Week — Join Us Each Morning',
    audience: 'All Members',
    channels: ['in-app', 'sms', 'whatsapp'],
    recipientCount: 247,
    sentAt: '2026-04-28T07:00:00Z',
    status: 'sent',
  },
  {
    id: 'bc-005',
    subject: 'KDC Cohort A — Exam Reminder',
    audience: 'All Students',
    channels: ['in-app'],
    recipientCount: 82,
    sentAt: '2026-04-25T16:00:00Z',
    status: 'sent',
  },
];

const CHANNEL_CONFIG: Record<Channel, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  'in-app':   { icon: Bell,          label: 'In-App',   color: 'text-blue-600',  bg: 'bg-blue-100 dark:bg-blue-900/30'  },
  'sms':      { icon: Smartphone,    label: 'SMS',       color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  'whatsapp': { icon: MessageSquare, label: 'WhatsApp',  color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
};

const SMS_LIMIT = 160;

function formatSentAt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function BroadcastPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!profile || !['admin', 'pastor'].includes(profile.role)) router.push('/');
  }, [authLoading, profile]);

  // Audience
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set());
  const [selectedCohort, setSelectedCohort] = useState(CONNECT_COHORTS[0]);
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS_LIST[0]);

  // Message
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Channels
  const [channels, setChannels] = useState<Set<Channel>>(new Set(['in-app']));

  // Schedule
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Modal / confirmation
  const [showConfirm, setShowConfirm] = useState(false);
  const [sent, setSent] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Estimate recipient count
  const estimatedCount = [...selectedSegments].reduce((total, segId) => {
    const seg = AUDIENCE_SEGMENTS.find(s => s.id === segId);
    if (!seg) return total;
    if (seg.id === 'department') return total + (DEPT_COUNTS[selectedDept] ?? 0);
    return total + seg.count;
  }, 0);

  function toggleSegment(id: string) {
    setSelectedSegments(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }

  function toggleChannel(ch: Channel) {
    setChannels(prev => {
      const s = new Set(prev);
      if (s.has(ch)) { if (s.size > 1) s.delete(ch); } else s.add(ch);
      return s;
    });
  }

  function handleSend() {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setShowConfirm(false);
      setSent(true);
    }, 1500);
  }

  return (
    <AdminLayout title="Broadcast">
      <PageHeader
        title="Broadcast Message"
        subtitle="Send announcements and notifications to your congregation."
      />

      {sent && (
        <div className="alert alert-success mb-6 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-800 dark:text-green-300">Message sent successfully!</p>
            <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
              Your broadcast was delivered to {estimatedCount} recipients via {[...channels].map(c => CHANNEL_CONFIG[c].label).join(', ')}.
            </p>
          </div>
          <button onClick={() => setSent(false)} className="ml-auto">
            <X className="w-4 h-4 text-green-600" />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: Composer ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Target Audience */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#BF0A30]" /> Target Audience
              </h2>
              {estimatedCount > 0 && (
                <span className="text-sm font-bold text-[#BF0A30] bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                  ~{estimatedCount} recipients
                </span>
              )}
            </div>

            <div className="space-y-2">
              {AUDIENCE_SEGMENTS.map(seg => (
                <div key={seg.id}>
                  <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/[0.06] transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSegments.has(seg.id)}
                      onChange={() => toggleSegment(seg.id)}
                      className="w-4 h-4 accent-[#BF0A30]"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-gray-800">{seg.label}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {seg.id === 'department' && selectedSegments.has('department')
                        ? `${DEPT_COUNTS[selectedDept] ?? 0} members`
                        : `${seg.count} members`
                      }
                    </span>
                  </label>

                  {/* Sub-selectors */}
                  {seg.id === 'connect-cohort' && selectedSegments.has('connect-cohort') && (
                    <div className="ml-7 mt-1 mb-2">
                      <select
                        value={selectedCohort}
                        onChange={e => setSelectedCohort(e.target.value)}
                        className="select text-sm py-2"
                      >
                        {CONNECT_COHORTS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  )}
                  {seg.id === 'department' && selectedSegments.has('department') && (
                    <div className="ml-7 mt-1 mb-2">
                      <select
                        value={selectedDept}
                        onChange={e => setSelectedDept(e.target.value)}
                        className="select text-sm py-2"
                      >
                        {DEPARTMENTS_LIST.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Message Composer */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#BF0A30]" /> Message
            </h2>

            <div className="form-group !mb-0">
              <label className="form-label">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Sunday Service Reminder"
                className="input"
              />
            </div>

            <div className="form-group !mb-0">
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label !mb-0">Message Body</label>
                <span className={`text-xs font-semibold ${body.length > SMS_LIMIT ? 'text-amber-600' : 'text-gray-400'}`}>
                  {body.length} / {SMS_LIMIT} SMS chars
                </span>
              </div>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your message here..."
                rows={5}
                className="textarea"
              />
              {body.length > SMS_LIMIT && (
                <p className="text-xs text-amber-600 font-semibold mt-1">
                  Message exceeds SMS limit. SMS recipients will receive a truncated version or multiple messages.
                </p>
              )}
            </div>
          </div>

          {/* Channel Selector */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#BF0A30]" /> Delivery Channels
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(CHANNEL_CONFIG) as Channel[]).map(ch => {
                const cfg = CHANNEL_CONFIG[ch];
                const Icon = cfg.icon;
                const active = channels.has(ch);
                return (
                  <button
                    type="button"
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      active
                        ? 'border-[#BF0A30] bg-red-50 dark:bg-red-900/20 shadow-sm'
                        : 'border-white/[0.06] bg-white/[0.04] hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-[#BF0A30]' : cfg.bg}`}>
                      <Icon className={`w-5 h-5 ${active ? 'text-white' : cfg.color}`} />
                    </div>
                    <span className={`text-xs font-bold ${active ? 'text-[#BF0A30]' : 'text-white/50'}`}>{cfg.label}</span>
                    {active && <CheckCircle className="w-4 h-4 text-[#BF0A30]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#BF0A30]" /> Schedule
            </h2>
            <div className="flex gap-3">
              {(['now', 'later'] as ScheduleMode[]).map(mode => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setScheduleMode(mode)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all capitalize ${
                    scheduleMode === mode
                      ? 'bg-[#BF0A30] text-white border-[#BF0A30] shadow-md shadow-[#BF0A30]/25'
                      : 'bg-white/[0.04] text-white/50 border-white/[0.06] hover:border-gray-300'
                  }`}
                >
                  {mode === 'now' ? 'Send Now' : 'Schedule for Later'}
                </button>
              ))}
            </div>
            {scheduleMode === 'later' && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="form-group !mb-0">
                  <label className="form-label">Date</label>
                  <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="input" />
                </div>
                <div className="form-group !mb-0">
                  <label className="form-label">Time</label>
                  <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="input" />
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="button"
            disabled={!subject.trim() || !body.trim() || selectedSegments.size === 0}
            onClick={() => setShowConfirm(true)}
            className="btn btn-primary btn-lg w-full"
          >
            <Send className="w-5 h-5" />
            {scheduleMode === 'now' ? 'Send Broadcast' : 'Schedule Broadcast'}
          </button>
        </div>

        {/* ── Right: Preview + Recents ────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Preview Panel */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
            <h3 className="font-semibold text-white mb-4 text-sm">Message Preview</h3>

            {/* In-App preview */}
            {channels.has('in-app') && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">In-App Notification</p>
                <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] dark:border-[#3D3D3D]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-4 h-4 text-[#BF0A30]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {subject || 'Subject line here'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {body || 'Your message body will appear here...'}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">Just now · RuachConnect</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SMS preview */}
            {channels.has('sms') && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SMS</p>
                <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] dark:border-[#3D3D3D]">
                  <p className="text-xs text-white/70">
                    <span className="font-bold">Ruach:</span>{' '}
                    {subject ? `${subject}. ` : ''}{body ? body.slice(0, 140) : 'Message preview...'}
                    {body.length > 140 && '...'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{Math.min(body.length, SMS_LIMIT)}/{SMS_LIMIT} characters</p>
                </div>
              </div>
            )}

            {/* WhatsApp preview */}
            {channels.has('whatsapp') && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">WhatsApp</p>
                <div className="bg-[#DCF8C6] dark:bg-[#1D3A27] rounded-xl p-4 border border-green-200 dark:border-green-900/40">
                  <p className="text-xs font-bold text-white mb-1">
                    {subject || 'Subject'}
                  </p>
                  <p className="text-xs text-white/70">
                    {body || 'Your message body...'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1.5">Ruach Assemblies · Just now</p>
                </div>
              </div>
            )}

            {!subject && !body && (
              <p className="text-sm text-gray-400 text-center py-4">
                Fill in the message to see a preview.
              </p>
            )}
          </div>

          {/* Recent Broadcasts */}
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06]">
            <div className="p-4 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white text-sm">Recent Broadcasts</h3>
            </div>
            <div className="divide-y divide-white/[0.06]">
              {RECENT_BROADCASTS.map(bc => (
                <div key={bc.id} className="p-4">
                  <p className="text-sm font-semibold text-white leading-snug">{bc.subject}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{bc.audience}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1">
                      {bc.channels.map(ch => {
                        const Icon = CHANNEL_CONFIG[ch].icon;
                        return (
                          <div key={ch} className={`w-5 h-5 rounded flex items-center justify-center ${CHANNEL_CONFIG[ch].bg}`}>
                            <Icon className={`w-3 h-3 ${CHANNEL_CONFIG[ch].color}`} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{bc.recipientCount} recipients</p>
                      <p className="text-[10px] text-gray-400">{formatSentAt(bc.sentAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ──────────────────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#12151C] rounded-2xl border border-white/[0.06] p-6 w-full max-w-sm shadow-2xl animate-fade-in-scale">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#BF0A30]/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-[#BF0A30]" />
              </div>
              <div>
                <h3 className="font-bold text-white">Confirm Broadcast</h3>
                <p className="text-xs text-gray-500">Review before sending</p>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subject</span>
                <span className="font-semibold text-white text-right max-w-[60%] line-clamp-1">{subject}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Recipients</span>
                <span className="font-bold text-[#BF0A30]">~{estimatedCount} people</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Channels</span>
                <span className="font-semibold text-white">
                  {[...channels].map(c => CHANNEL_CONFIG[c].label).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Schedule</span>
                <span className="font-semibold text-white">
                  {scheduleMode === 'now' ? 'Send immediately' : `${scheduleDate} ${scheduleTime}`}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="btn btn-secondary flex-1">Cancel</button>
              <button onClick={handleSend} disabled={isSending} className="btn btn-primary flex-1">
                {isSending
                  ? <span className="spinner spinner-sm border-white border-t-transparent" />
                  : 'Confirm & Send'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
