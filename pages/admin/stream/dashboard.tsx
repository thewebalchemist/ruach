import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import {
  LayoutDashboard, Video, Layers, Calendar, HelpCircle, Church, Radio, Users, LogOut, Plus, Edit, Trash2, Save, X, ChevronLeft, ChevronRight, Bell, Loader2, MapPin, Phone, Mail, Globe, Eye, MessageSquare, Sparkles, ExternalLink, Music,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Sermon, Series, Event, FAQ, ChurchInfo, AdminTabId, EventCategory, FAQCategory, ServiceTime } from '@/types';
import { generateSlug, getYouTubeThumbnail } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTabId>('dashboard');
  const [stats, setStats] = useState({ total_sermons: 0, total_series: 0, total_events: 0, total_faqs: 0, total_users: 0, total_chat_sessions: 0 });
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null);
  const [liveStreamUrl, setLiveStreamUrl] = useState('');
  const [defaultYoutubeUrl, setDefaultYoutubeUrl] = useState('');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) { router.push('/admin/login'); return; }
    const authTime = localStorage.getItem('adminAuthTime');
    if (authTime && (Date.now() - parseInt(authTime)) / (1000 * 60 * 60) > 24) { handleLogout(); return; }
    loadAllData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminAuthTime');
    router.push('/admin/login');
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [{ data: sermonsData, count: sermonsCount }, { data: seriesData, count: seriesCount }, { data: eventsData, count: eventsCount }, { data: faqsData, count: faqsCount }, { data: churchData }, { data: streamData }, { count: usersCount }, { count: chatsCount }] = await Promise.all([
        supabase.from('sermons').select('*', { count: 'exact' }).order('service_date', { ascending: false }),
        supabase.from('series').select('*', { count: 'exact' }).order('created_at', { ascending: false }),
        supabase.from('events').select('*', { count: 'exact' }).order('event_date', { ascending: true }),
        supabase.from('faqs').select('*', { count: 'exact' }).order('order_index', { ascending: true }),
        supabase.from('church_info').select('*').single(),
        supabase.from('stream_settings').select('*').single(),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('chat_sessions').select('*', { count: 'exact', head: true }),
      ]);
      setSermons(sermonsData || []);
      setAllSeries(seriesData || []);
      setEvents(eventsData || []);
      setFaqs(faqsData || []);
      setChurchInfo(churchData || null);
      if (streamData) { setLiveStreamUrl(streamData.live_url || ''); setDefaultYoutubeUrl(streamData.default_youtube_url || ''); setIsLive(streamData.is_live || false); }
      setStats({ total_sermons: sermonsCount || 0, total_series: seriesCount || 0, total_events: eventsCount || 0, total_faqs: faqsCount || 0, total_users: usersCount || 0, total_chat_sessions: chatsCount || 0 });
    } catch (error) { console.error('Error:', error); }
    finally { setLoading(false); }
  };

  const sidebarItems = [
    { id: 'dashboard' as AdminTabId, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sermons' as AdminTabId, label: 'Sermons', icon: Video },
    { id: 'series' as AdminTabId, label: 'Series', icon: Layers },
    { id: 'events' as AdminTabId, label: 'Events', icon: Calendar },
    { id: 'faqs' as AdminTabId, label: 'FAQs', icon: HelpCircle },
    { id: 'church-info' as AdminTabId, label: 'Church Info', icon: Church },
    { id: 'stream' as AdminTabId, label: 'Live Stream', icon: Radio },
    { id: 'members' as AdminTabId, label: 'Members', icon: Users },
  ];

  return (
    <>
      <Head><title>Admin Dashboard | RuachOnline</title><meta name="robots" content="noindex, nofollow" /></Head>
      <div className="flex h-screen bg-[#f6f6f8] dark:bg-[#101622] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 hidden md:flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#151b2b] flex-shrink-0">
          <div className="flex flex-col h-full p-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
                <img 
                src="/images/ruaach.png" 
                alt="RUACH CHURCH Logo" 
                className="w-10 h-10 rounded-full" />
              </div>
            </Link>
            <nav className="flex flex-col gap-1 flex-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-[#BF0A30] text-white shadow-lg shadow-[#BF0A30]/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                    <Icon className="w-5 h-5" /><span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
              <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><ExternalLink className="w-5 h-5" /><span className="font-medium">View Site</span></Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><LogOut className="w-5 h-5" /><span className="font-medium">Logout</span></button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#151b2b] border-b border-gray-200 dark:border-gray-800">
            <div><h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{activeTab === 'church-info' ? 'Church Information' : activeTab}</h2><p className="text-sm text-gray-500">Manage your church platform</p></div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 relative"><Bell className="w-5 h-5" /><span className="absolute top-1 right-1 w-2 h-2 bg-[#BF0A30] rounded-full"></span></button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BF0A30] to-purple-600 flex items-center justify-center text-white font-bold">A</div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#BF0A30]" /></div> : (
              <>
                {activeTab === 'dashboard' && <DashboardTab stats={stats} sermons={sermons} events={events} />}
                {activeTab === 'sermons' && <SermonsTab sermons={sermons} allSeries={allSeries} onRefresh={loadAllData} />}
                {activeTab === 'series' && <SeriesTab series={allSeries} onRefresh={loadAllData} />}
                {activeTab === 'events' && <EventsTab events={events} onRefresh={loadAllData} />}
                {activeTab === 'faqs' && <FAQsTab faqs={faqs} onRefresh={loadAllData} />}
                {activeTab === 'church-info' && <ChurchInfoTab churchInfo={churchInfo} onRefresh={loadAllData} />}
                {activeTab === 'stream' && <StreamTab liveUrl={liveStreamUrl} defaultUrl={defaultYoutubeUrl} isLive={isLive} setLiveUrl={setLiveStreamUrl} setDefaultUrl={setDefaultYoutubeUrl} setIsLive={setIsLive} />}
                {activeTab === 'members' && <MembersTab />}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function DashboardTab({ stats, sermons, events }: { stats: any; sermons: Sermon[]; events: Event[] }) {
  const statCards = [
    { label: 'Total Sermons', value: stats.total_sermons, icon: Video, color: 'bg-blue-500' },
    { label: 'Series', value: stats.total_series, icon: Layers, color: 'bg-purple-500' },
    { label: 'Events', value: stats.total_events, icon: Calendar, color: 'bg-green-500' },
    { label: 'FAQs', value: stats.total_faqs, icon: HelpCircle, color: 'bg-orange-500' },
    { label: 'Members', value: stats.total_users, icon: Users, color: 'bg-pink-500' },
    { label: 'Chat Sessions', value: stats.total_chat_sessions, icon: MessageSquare, color: 'bg-indigo-500' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon; return (
            <div key={stat.label} className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-4 shadow-sm">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}><Icon className="w-5 h-5 text-white" /></div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Sermons</h3>
          <div className="space-y-3">
            {sermons.slice(0, 5).map((sermon) => (
              <div key={sermon.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                  <img src={getYouTubeThumbnail(sermon.youtube_url, 'mq') ?? ''} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 dark:text-white text-sm truncate">{sermon.title}</p><p className="text-xs text-gray-500">{sermon.preacher}</p></div>
                <div className="flex items-center gap-1 text-gray-400 text-xs"><Eye className="w-3 h-3" />{sermon.views || 0}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {events.filter(e => new Date(e.event_date) >= new Date()).slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="w-12 h-12 rounded-xl bg-[#BF0A30]/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[#BF0A30] text-xs font-bold">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</span>
                  <span className="text-[#BF0A30] text-lg font-bold leading-none">{new Date(event.event_date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 dark:text-white text-sm truncate">{event.title}</p><p className="text-xs text-gray-500">{event.event_time} • {event.location}</p></div>
              </div>
            ))}
            {events.filter(e => new Date(e.event_date) >= new Date()).length === 0 && <p className="text-gray-500 text-sm text-center py-8">No upcoming events</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SermonsTab({ sermons, allSeries, onRefresh }: { sermons: Sermon[]; allSeries: Series[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', preacher: '', youtube_url: '', service_date: new Date().toISOString().split('T')[0], summary: '', series_id: '', series_part: '', scripture: '', duration: '', audio_url: '' });

  const resetForm = () => { setForm({ title: '', preacher: '', youtube_url: '', service_date: new Date().toISOString().split('T')[0], summary: '', series_id: '', series_part: '', scripture: '', duration: '', audio_url: '' }); setEditingId(null); setShowForm(false); };
  const handleEdit = (sermon: Sermon) => { setForm({ title: sermon.title, preacher: sermon.preacher, youtube_url: sermon.youtube_url || '', service_date: sermon.service_date, summary: sermon.summary || '', series_id: sermon.series_id?.toString() || '', series_part: sermon.series_part?.toString() || '', scripture: sermon.scripture || '', duration: sermon.duration || '', audio_url: sermon.audio_url || '' }); setEditingId(sermon.id); setShowForm(true); };
  const handleSave = async () => {
    if (!form.title || !form.preacher) { alert('Please fill in title and preacher'); return; }
    setSaving(true);
    try {
      const data = { ...form, slug: generateSlug(form.title), thumbnail_url: form.youtube_url ? getYouTubeThumbnail(form.youtube_url) : null, series_id: form.series_id ? parseInt(form.series_id) : null, series_part: form.series_part ? parseInt(form.series_part) : null };
      if (editingId) await supabase.from('sermons').update(data).eq('id', editingId);
      else await supabase.from('sermons').insert([data]);
      resetForm(); onRefresh();
    } catch (error) { console.error(error); alert('Error saving'); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await supabase.from('sermons').delete().eq('id', id); onRefresh(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500">{sermons.length} sermons</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-xl font-medium"><Plus className="w-4 h-4" />Add Sermon</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Sermon' : 'Add Sermon'}</h3>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preacher *</label><input type="text" value={form.preacher} onChange={(e) => setForm({ ...form, preacher: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">YouTube URL</label><input type="url" value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label><input type="date" value={form.service_date} onChange={(e) => setForm({ ...form, service_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Series</label><select value={form.series_id} onChange={(e) => setForm({ ...form, series_id: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"><option value="">No Series</option>{allSeries.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Part #</label><input type="number" value={form.series_part} onChange={(e) => setForm({ ...form, series_part: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scripture</label><input type="text" value={form.scripture} onChange={(e) => setForm({ ...form, scripture: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" placeholder="John 3:16" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label><input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" placeholder="45:00" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audio URL</label><input type="url" value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary</label><textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={5} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-sm" /></div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-[#BF0A30] text-white rounded-xl flex items-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save</button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50"><tr><th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Sermon</th><th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Preacher</th><th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th><th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th></tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {sermons.map((sermon) => (
              <tr key={sermon.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-16 h-10 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0"><img src={getYouTubeThumbnail(sermon.youtube_url, 'mq') ?? ''} alt="" className="w-full h-full object-cover" /></div><div className="min-w-0"><p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{sermon.title}</p>{sermon.audio_url && <span className="inline-flex items-center gap-1 text-xs text-green-600"><Music className="w-3 h-3" />Audio</span>}</div></div></td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{sermon.preacher}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{new Date(sermon.service_date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleEdit(sermon)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(sermon.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SeriesTab({ series, onRefresh }: { series: Series[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', description: '', image_url: '', year: new Date().getFullYear().toString() });
  const resetForm = () => { setForm({ title: '', description: '', image_url: '', year: new Date().getFullYear().toString() }); setEditingId(null); setShowForm(false); };
  const handleEdit = (s: Series) => { setForm({ title: s.title, description: s.description || '', image_url: s.image_url || '', year: s.year || '' }); setEditingId(s.id); setShowForm(true); };
  const handleSave = async () => {
    if (!form.title) { alert('Enter title'); return; }
    try {
      if (editingId) await supabase.from('series').update({ ...form, slug: generateSlug(form.title) }).eq('id', editingId);
      else await supabase.from('series').insert([{ ...form, slug: generateSlug(form.title) }]);
      resetForm(); onRefresh();
    } catch (error) { console.error(error); }
  };
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await supabase.from('series').delete().eq('id', id); onRefresh(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><p className="text-gray-500">{series.length} series</p><button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-xl font-medium"><Plus className="w-4 h-4" />Add Series</button></div>
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit' : 'Add'} Series</h3><button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label><input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label><input type="url" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3"><button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button><button onClick={handleSave} className="px-6 py-2 bg-[#BF0A30] text-white rounded-xl flex items-center gap-2"><Save className="w-4 h-4" />Save</button></div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {series.map((s) => (
          <div key={s.id} className="bg-white dark:bg-[#1a1f2e] rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative">{s.image_url ? <img src={s.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#BF0A30] to-purple-600"><Layers className="w-12 h-12 text-white/50" /></div>}{s.year && <span className="absolute top-3 right-3 px-2 py-1 bg-black/60 text-white text-xs font-bold rounded-lg">{s.year}</span>}</div>
            <div className="p-4"><h4 className="font-bold text-gray-900 dark:text-white">{s.title}</h4><p className="text-sm text-gray-500 mt-1 line-clamp-2">{s.description || 'No description'}</p><div className="flex items-center justify-between mt-4"><span className="text-xs text-gray-400">{s.sermon_count || 0} sermons</span><div className="flex gap-1"><button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg"><Edit className="w-4 h-4" /></button><button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button></div></div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EventsTab({ events, onRefresh }: { events: Event[]; onRefresh: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', event_date: '', event_time: '', location: '', category: 'general' as EventCategory, repeat_weekly: false, chatbot_announcement: false });
  const handleSave = async () => {
    if (!form.title || !form.event_date) { alert('Fill title and date'); return; }
    try { await supabase.from('events').insert([{ ...form, chatbot_enabled: true }]); setForm({ title: '', description: '', event_date: '', event_time: '', location: '', category: 'general', repeat_weekly: false, chatbot_announcement: false }); onRefresh(); } catch (error) { console.error(error); }
  };
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await supabase.from('events').delete().eq('id', id); onRefresh(); };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">All Events</h3>
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="w-12 h-12 rounded-xl bg-[#BF0A30]/10 flex flex-col items-center justify-center flex-shrink-0"><span className="text-[#BF0A30] text-xs font-bold">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</span><span className="text-[#BF0A30] text-lg font-bold leading-none">{new Date(event.event_date).getDate()}</span></div>
              <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 dark:text-white">{event.title}</p><p className="text-sm text-gray-500">{event.event_time} • {event.location}</p></div>
              <span className={`px-2 py-1 text-xs font-medium rounded-lg ${event.category === 'service' ? 'bg-blue-100 text-blue-700' : event.category === 'youth' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{event.category}</span>
              <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Event</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label><input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div><div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label><input type="time" value={form.event_time} onChange={(e) => setForm({ ...form, event_time: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as EventCategory })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"><option value="service">Service</option><option value="youth">Youth</option><option value="community">Community</option><option value="prayer">Prayer</option><option value="general">General</option></select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label><input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <button onClick={handleSave} className="w-full py-2.5 bg-[#BF0A30] text-white rounded-xl font-medium flex items-center justify-center gap-2"><Save className="w-4 h-4" />Save Event</button>
        </div>
      </div>
    </div>
  );
}

function FAQsTab({ faqs, onRefresh }: { faqs: FAQ[]; onRefresh: () => void }) {
  const [form, setForm] = useState({ question: '', answer: '', category: 'general' as FAQCategory });
  const handleSave = async () => {
    if (!form.question || !form.answer) { alert('Fill question and answer'); return; }
    try { await supabase.from('faqs').insert([{ ...form, is_active: true, order_index: faqs.length }]); setForm({ question: '', answer: '', category: 'general' }); onRefresh(); } catch (error) { console.error(error); }
  };
  const handleDelete = async (id: number) => { if (!confirm('Delete?')) return; await supabase.from('faqs').delete().eq('id', id); onRefresh(); };
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add FAQ</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Question</label><input type="text" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Answer</label><textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as FAQCategory })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"><option value="general">General</option><option value="services">Services</option><option value="giving">Giving</option><option value="youth">Youth</option><option value="membership">Membership</option></select></div>
          <button onClick={handleSave} className="px-6 py-2 bg-[#BF0A30] text-white rounded-xl font-medium flex items-center gap-2"><Plus className="w-4 h-4" />Add FAQ</button>
        </div>
      </div>
      <div className="space-y-3">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1"><span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${faq.category === 'services' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{faq.category}</span><h4 className="font-semibold text-gray-900 dark:text-white mt-2">{faq.question}</h4><p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{faq.answer}</p></div>
              <button onClick={() => handleDelete(faq.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChurchInfoTab({ churchInfo, onRefresh }: { churchInfo: ChurchInfo | null; onRefresh: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: churchInfo?.name || 'Ruach Assemblies', tagline: churchInfo?.tagline || '', about_text: churchInfo?.about_text || '', address: churchInfo?.address || '', city: churchInfo?.city || '', country: churchInfo?.country || 'Kenya', phone: churchInfo?.phone || '', email: churchInfo?.email || '', website: churchInfo?.website || '' });
  const handleSave = async () => { setSaving(true); try { await supabase.from('church_info').upsert({ id: 1, ...form }); alert('Saved!'); onRefresh(); } catch (error) { console.error(error); } finally { setSaving(false); } };
  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Church className="w-5 h-5 text-[#BF0A30]" />Basic Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tagline</label><input type="text" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">About</label><textarea value={form.about_text} onChange={(e) => setForm({ ...form, about_text: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-[#BF0A30]" />Location</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-3"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label><input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label><input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
        </div>
      </div>
      <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Phone className="w-5 h-5 text-[#BF0A30]" />Contact</h3>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label><input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
        </div>
      </div>
      <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-[#BF0A30] text-white rounded-xl font-medium flex items-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Church Info</button>
    </div>
  );
}

function StreamTab({ liveUrl, defaultUrl, isLive, setLiveUrl, setDefaultUrl, setIsLive }: { liveUrl: string; defaultUrl: string; isLive: boolean; setLiveUrl: (v: string) => void; setDefaultUrl: (v: string) => void; setIsLive: (v: boolean) => void }) {
  const [saving, setSaving] = useState(false);
  const handleSave = async () => { setSaving(true); try { await supabase.from('stream_settings').update({ live_url: liveUrl, default_youtube_url: defaultUrl, is_live: isLive }).eq('id', 1); alert('Saved!'); } catch (error) { console.error(error); } finally { setSaving(false); } };
  return (
    <div className="max-w-2xl bg-white dark:bg-[#1a1f2e] rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Radio className="w-5 h-5 text-[#BF0A30]" />Live Stream Settings</h3>
      <div className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Live Stream URL</label><input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
        <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Video (Fallback)</label><input type="url" value={defaultUrl} onChange={(e) => setDefaultUrl(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white" /></div>
        <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <input type="checkbox" checked={isLive} onChange={(e) => setIsLive(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-[#BF0A30] focus:ring-[#BF0A30]" />
          <div><span className="text-gray-900 dark:text-white font-medium">Currently LIVE</span><p className="text-xs text-gray-500">Toggle when streaming</p></div>
        </label>
        <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-[#BF0A30] text-white rounded-xl font-medium flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Settings</button>
      </div>
    </div>
  );
}

function MembersTab() {
  return (
    <div className="bg-white dark:bg-[#1a1f2e] rounded-2xl p-8 shadow-sm text-center">
      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Members Management</h3>
      <p className="text-gray-500">Coming soon! View and manage registered members.</p>
    </div>
  );
}