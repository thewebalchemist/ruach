import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Radio, Calendar, StickyNote, BookMarked, ArrowRight,
  ChevronDown, ChevronUp, EyeOff, Eye,
} from 'lucide-react';
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
  { id: 'notes',    label: 'My Notes',      icon: StickyNote },
  { id: 'bible',    label: 'Bible',         icon: BookMarked },
  { id: 'past',     label: 'Past',          icon: Radio },
  { id: 'schedule', label: 'Schedule',      icon: Calendar },
];

export default function LivePage() {
  const [activeTab,    setActiveTab]    = useState<LiveTab>('notes');
  const [streamData,   setStreamData]   = useState<StreamLink>({ url: '', isLive: false, updatedAt: '' });
  const [loading,      setLoading]      = useState(true);
  const [videoVisible, setVideoVisible] = useState(true);
  const [navH,         setNavH]         = useState('4rem');

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const update = (e: { matches: boolean }) => setNavH(e.matches ? '6rem' : '4rem');
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    fetch('/api/stream/settings')
      .then(r => r.json())
      .then(data => {
        setStreamData({
          url: data.url,
          isLive: data.isLive,
          updatedAt: data.updatedAt,
          defaultYoutubeUrl: data.defaultYoutubeUrl,
        });
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
        <div className="min-h-screen bg-[#0A0C10] pt-16 sm:pt-24">

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

          {/* ── Desktop layout ───────────────────────────────────────────── */}
          <div className="hidden lg:block">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex gap-6 items-start">

                {/* Left: video + info */}
                <div className="flex-1 min-w-0">
                  <div className="sticky top-24 space-y-4">
                    {/* Video with toggle */}
                    {videoVisible && (
                      <VideoPlayer streamUrl={streamData.url} isLive={streamData.isLive} />
                    )}

                    {/* Info + controls */}
                    <div className="rounded-2xl p-4" style={{ background: 'rgba(18,21,28,0.9)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-white font-black text-base leading-tight" style={H}>
                            {streamData.isLive ? 'Live Now' : 'Sunday Services'}
                          </h2>
                          <p className="text-[#8B95A8] text-sm mt-0.5">
                            {streamData.isLive
                              ? 'Take notes or follow along in your Bible.'
                              : '8AM · 10AM · 12:30PM — Rhema Grounds'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setVideoVisible(v => !v)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-white/50 hover:text-white transition-colors"
                            style={{ background: 'rgba(255,255,255,0.06)', ...H }}
                          >
                            {videoVisible
                              ? <><EyeOff className="w-3.5 h-3.5" /> Hide video</>
                              : <><Eye className="w-3.5 h-3.5" /> Show video</>
                            }
                          </button>
                          {!streamData.isLive && (
                            <Link
                              href="/sermons"
                              className="flex items-center gap-1 text-[#BF0A30] hover:text-red-400 font-black text-xs transition-colors whitespace-nowrap"
                              style={H}
                            >
                              Past sermons <ArrowRight className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: tab panel */}
                <div className="w-[360px] flex-shrink-0">
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
                            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-black uppercase tracking-wide transition-colors border-b-2 ${
                              active
                                ? 'text-[#BF0A30] border-[#BF0A30]'
                                : 'text-white/30 border-transparent hover:text-white/55'
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

          {/* ── Mobile layout ─────────────────────────────────────────────── */}
          <div className="lg:hidden">
            {/* Sticky video area */}
            <div className="sticky top-16 sm:top-24 z-30 bg-[#0A0C10]">
              {videoVisible && (
                <VideoPlayer streamUrl={streamData.url} isLive={streamData.isLive} />
              )}
              {/* Toggle video bar */}
              <button
                onClick={() => setVideoVisible(v => !v)}
                className="w-full flex items-center justify-center gap-2 py-2 text-white/40 hover:text-white/70 transition-colors"
                style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                {videoVisible
                  ? <><EyeOff className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase tracking-wider" style={H}>Hide Video</span><ChevronUp className="w-3.5 h-3.5" /></>
                  : <><Eye className="w-3.5 h-3.5" /><span className="text-[10px] font-black uppercase tracking-wider" style={H}>Show Video</span><ChevronDown className="w-3.5 h-3.5" /></>
                }
              </button>
            </div>

            {/* Tabs bar */}
            <div
              className="flex border-b border-white/[0.07] sticky z-20"
              style={{
                top: videoVisible ? `calc(${navH} + 56.25vw + 32px)` : `calc(${navH} + 32px)`,
                background: 'rgba(10,12,16,0.98)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {TABS.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-3 text-[9px] font-black uppercase tracking-wide transition-colors border-b-2 ${
                      active
                        ? 'text-[#BF0A30] border-[#BF0A30]'
                        : 'text-white/30 border-transparent'
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

          {/* Loading overlay */}
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
