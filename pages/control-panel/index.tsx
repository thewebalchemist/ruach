import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Video, Calendar, HelpCircle, Radio, Sparkles, ArrowRight, Users, Eye, MessageSquare, Clock } from 'lucide-react';
import CPLayout, { CPStatCard } from '@/components/control-panel/CPLayout';
import { supabase } from '@/lib/supabase';

interface Stats {
  sermons: number;
  series: number;
  events: number;
  faqs: number;
  isLive: boolean;
}

interface RecentSermon {
  id: number;
  title: string;
  preacher: string;
  service_date: string;
  slug: string;
}

interface UpcomingEvent {
  id: number;
  title: string;
  event_date: string;
  location: string | null;
}

export default function ControlPanelDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({ sermons: 0, series: 0, events: 0, faqs: 0, isLive: false });
  const [recentSermons, setRecentSermons] = useState<RecentSermon[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  // Auth + role gating handled centrally by CPLayout.
  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const [
      { count: sermonsCount },
      { count: seriesCount },
      { count: eventsCount },
      { count: faqsCount },
      { data: streamData },
      { data: recentData },
      { data: eventData },
    ] = await Promise.all([
      supabase.from('sermons').select('*', { count: 'exact', head: true }),
      supabase.from('series').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).gte('event_date', today),
      supabase.from('faqs').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('stream_settings').select('is_live').single(),
      supabase.from('sermons').select('id, title, preacher, service_date, slug').order('service_date', { ascending: false }).limit(5),
      supabase.from('events').select('id, title, event_date, location').gte('event_date', today).order('event_date').limit(5),
    ]);
    setStats({
      sermons: sermonsCount || 0,
      series: seriesCount || 0,
      events: eventsCount || 0,
      faqs: faqsCount || 0,
      isLive: (streamData as any)?.is_live || false,
    });
    setRecentSermons((recentData as any) || []);
    setUpcomingEvents((eventData as any) || []);
    setLoading(false);
  }

  const QUICK_LINKS = [
    { label: 'Go Live / End Stream', href: '/control-panel/live', icon: Radio, color: '#BF0A30', desc: stats.isLive ? '🔴 Currently LIVE' : 'Stream is offline' },
    { label: 'Add Sermon', href: '/control-panel/sermons?action=new', icon: Video, color: '#7C3AED', desc: `${stats.sermons} total sermons` },
    { label: 'Add Event', href: '/control-panel/events?action=new', icon: Calendar, color: '#0891B2', desc: `${stats.events} upcoming` },
    { label: 'Ask Ruach Config', href: '/control-panel/ask-ruach', icon: Sparkles, color: '#D4AF37', desc: `${stats.faqs} active FAQs` },
  ];

  return (
    <CPLayout title="Dashboard" subtitle="Website & content management">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Live banner */}
          {stats.isLive && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl px-5 py-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-700 dark:text-red-400">Live Stream is Active</p>
                <p className="text-xs text-red-600 dark:text-red-500">Your church is currently streaming.</p>
              </div>
              <Link href="/control-panel/live" className="text-xs font-semibold text-red-600 hover:text-red-800 dark:text-red-400">
                Manage →
              </Link>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <CPStatCard title="Total Sermons" value={stats.sermons} subtitle="all time" icon={<Video className="w-5 h-5" />} color="#7C3AED" />
            <CPStatCard title="Sermon Series" value={stats.series} subtitle="collections" icon={<Eye className="w-5 h-5" />} color="#0891B2" />
            <CPStatCard title="Upcoming Events" value={stats.events} subtitle="next 30 days" icon={<Calendar className="w-5 h-5" />} color="#D4AF37" />
            <CPStatCard title="Active FAQs" value={stats.faqs} subtitle="in Ask Ruach" icon={<HelpCircle className="w-5 h-5" />} color="#10B981" />
          </div>

          {/* Quick links */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {QUICK_LINKS.map(({ label, href, icon: Icon, color, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-4 hover:shadow-md hover:border-gray-200 dark:hover:border-[#333] transition-all group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, color }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{label}</p>
                  <p className="text-xs text-gray-400 truncate">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>

          {/* Recent sermons + upcoming events */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent sermons */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2A2A2A]">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Sermons</h3>
                <Link href="/control-panel/sermons" className="text-xs text-[#BF0A30] font-medium hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-[#222]">
                {recentSermons.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-gray-400 text-center">No sermons yet. <Link href="/control-panel/sermons" className="text-[#BF0A30]">Add one →</Link></p>
                ) : recentSermons.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-9 h-9 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Video className="w-4 h-4 text-[#7C3AED]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.title}</p>
                      <p className="text-xs text-gray-400">{s.preacher} · {new Date(s.service_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <Link href={`/${s.slug}`} target="_blank" className="text-[10px] text-gray-400 hover:text-[#BF0A30] font-medium shrink-0">View</Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming events */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2A2A2A]">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Upcoming Events</h3>
                <Link href="/control-panel/events" className="text-xs text-[#BF0A30] font-medium hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-[#222]">
                {upcomingEvents.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-gray-400 text-center">No upcoming events. <Link href="/control-panel/events" className="text-[#BF0A30]">Add one →</Link></p>
                ) : upcomingEvents.map(e => (
                  <div key={e.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-9 h-9 bg-[#0891B2]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-[#0891B2]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.title}</p>
                      <p className="text-xs text-gray-400">{new Date(e.event_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}{e.location ? ` · ${e.location}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </CPLayout>
  );
}
