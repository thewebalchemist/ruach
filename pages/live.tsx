import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Radio, Calendar, StickyNote, BookMarked, ArrowRight } from 'lucide-react';
import Layout from '@/components/shared/Layout';
import { SEO } from '@/components/shared/SEO';
import VideoPlayer from '@/components/streaming/VideoPlayer';
import NotesEditor from '@/components/streaming/NotesEditor';
import BibleReader from '@/components/streaming/BibleReader';
import PastServices from '@/components/streaming/PastServices';
import ScheduleView from '@/components/streaming/ScheduleView';
import { StreamLink } from '@/types';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

type LiveTab = 'notes' | 'bible' | 'past' | 'schedule';

const TABS: { id: LiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'past',     label: 'Past Services', icon: Radio },
  { id: 'schedule', label: 'Schedule',      icon: Calendar },
  { id: 'notes',    label: 'My Notes',      icon: StickyNote },
  { id: 'bible',    label: 'Bible',         icon: BookMarked },
];

export default function LivePage() {
  const [activeTab, setActiveTab] = useState<LiveTab>('past');
  const [streamData, setStreamData] = useState<StreamLink>({ url: '', isLive: false, updatedAt: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stream')
      .then(r => r.json())
      .then(data => {
        setStreamData({ url: data.url, isLive: data.isLive, updatedAt: data.updatedAt, defaultYoutubeUrl: data.defaultYoutubeUrl });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const renderTab = () => {
    switch (activeTab) {
      case 'notes':    return <NotesEditor />;
      case 'bible':    return <BibleReader />;
      case 'past':     return <PastServices />;
      case 'schedule': return <ScheduleView />;
    }
  };

  return (
    <>
      <SEO
        title="Watch Live"
        description="Join Ruach Tabernacle Assembly live every Sunday. Three services: 8AM, 10AM, and 12:30PM."
        url="/live"
        image="/church-photos/church.jpg"
      />

      <Layout>
        <div className="min-h-screen bg-[#0A0C10]">

          {/* Live banner */}
          {streamData.isLive && (
            <div
              className="flex items-center justify-center gap-2.5 py-2.5 text-sm font-bold text-white"
              style={{ background: '#BF0A30' }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <span style={H}>We are LIVE — Join us now</span>
            </div>
          )}

          {/* ── Desktop layout ─────────────────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="max-w-7xl mx-auto px-8 py-10">
              <div className="grid grid-cols-3 gap-8">

                {/* Left: sticky video + info */}
                <div className="col-span-2">
                  <div className="sticky top-24">
                    <VideoPlayer streamUrl={streamData.url} isLive={streamData.isLive} />

                    {/* Stream info */}
                    <div className="mt-5 rounded-2xl p-5" style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-white font-black text-lg leading-tight" style={H}>
                            {streamData.isLive ? 'Live Now' : 'Sunday Services'}
                          </h2>
                          <p className="text-[#8B95A8] text-sm mt-1">
                            {streamData.isLive
                              ? 'Take notes or follow along in your Bible while you worship.'
                              : 'Services: 8AM · 10AM · 12:30PM every Sunday at Rhema Grounds.'}
                          </p>
                        </div>
                        {!streamData.isLive && (
                          <Link href="/sermons"
                            className="flex-shrink-0 flex items-center gap-1.5 text-[#BF0A30] hover:text-red-400 font-bold text-sm transition-colors whitespace-nowrap"
                            style={H}
                          >
                            Past sermons <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: tab panel */}
                <div className="col-span-1">
                  <div
                    className="sticky top-24 rounded-2xl overflow-hidden flex flex-col"
                    style={{
                      height: 'calc(100vh - 7rem)',
                      background: 'rgba(12,14,20,0.98)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Tabs */}
                    <div className="flex border-b border-white/[0.07] flex-shrink-0">
                      {TABS.map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase tracking-wide transition-colors border-b-2 ${
                              active
                                ? 'text-[#BF0A30] border-[#BF0A30]'
                                : 'text-white/35 border-transparent hover:text-white/60'
                            }`}
                            style={H}
                          >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto">
                      {renderTab()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile layout ──────────────────────────────────────────────── */}
          <div className="lg:hidden">
            {/* Sticky video player */}
            <div className="sticky top-16 z-30" style={{ background: '#0A0C10' }}>
              <VideoPlayer streamUrl={streamData.url} isLive={streamData.isLive} />
            </div>

            {/* Inline tabs */}
            <div
              className="flex border-b border-white/[0.07] sticky top-[calc(4rem+56.25vw)] z-20"
              style={{ background: 'rgba(10,12,16,0.98)', backdropFilter: 'blur(12px)' }}
            >
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-[9px] font-bold uppercase tracking-wide transition-colors border-b-2 ${
                      active
                        ? 'text-[#BF0A30] border-[#BF0A30]'
                        : 'text-white/35 border-transparent'
                    }`}
                    style={H}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="pb-28">
              {renderTab()}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="fixed inset-0 z-50 bg-[#0A0C10] flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
