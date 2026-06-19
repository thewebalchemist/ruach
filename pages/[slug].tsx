import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Calendar,
  Share2,
  User,
  Play,
  Plus,
  Check,
  Download,
  BookOpen,
  MessageSquare,
  FileText,
  ChevronRight,
  Music,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Layout from '@/components/shared/Layout';
import AudioPlayer from '@/components/streaming/AudioPlayer';
import { supabase } from '@/lib/supabase';
import { Sermon } from '@/types';
import { formatDate, getYouTubeThumbnail, getCurrentUser } from '@/lib/utils';

interface SermonPageProps {
  sermon: Sermon | null;
  relatedSermons: Sermon[];
  seriesSermons: Sermon[];
}

type TabType = 'description' | 'notes' | 'scripture' | 'discussion' | 'transcript';

export default function SermonPage({ sermon, relatedSermons, seriesSermons }: SermonPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [playerMode, setPlayerMode] = useState<'video' | 'audio'>('video');

  useEffect(() => {
    checkWatchlist();
  }, [sermon]);

  const checkWatchlist = async () => {
    if (!sermon) return;
    const user = getCurrentUser();
    if (!user) return;

    const { data } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('sermon_id', sermon.id)
      .single();

    setIsInWatchlist(!!data);
  };

  const toggleWatchlist = async () => {
    if (!sermon) return;
    const user = getCurrentUser();
    if (!user) {
      alert('Please sign in to add to your watchlist');
      return;
    }

    try {
      if (isInWatchlist) {
        await supabase
          .from('watchlist')
          .delete()
          .eq('user_id', user.id)
          .eq('sermon_id', sermon.id);
        setIsInWatchlist(false);
      } else {
        await supabase
          .from('watchlist')
          .insert([{ user_id: user.id, sermon_id: sermon.id }]);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
  };

  if (!sermon) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Sermon Not Found
            </h1>
            <Link href="/sermons" className="text-[#BF0A30] hover:text-[#9a0826] font-semibold">
              ← Back to All Sermons
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const thumbnailUrl = sermon.thumbnail_url || getYouTubeThumbnail(sermon.youtube_url, 'maxres');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: sermon.title,
          text: `Watch "${sermon.title}" by ${sermon.preacher}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const sermonNotes = sermon.notes;
  const spotifyUrl  = sermon.spotify_url;

  const tabs = [
    { id: 'description' as TabType, label: 'Description' },
    ...(sermonNotes ? [{ id: 'notes' as TabType, label: 'Sermon Notes' }] : []),
    { id: 'scripture' as TabType, label: 'Scripture & Notes' },
    { id: 'discussion' as TabType, label: 'Discussion' },
    { id: 'transcript' as TabType, label: 'Transcript' },
  ];

  return (
    <>
      <Head>
        <title>{sermon.title} | {sermon.preacher} | Ruach Tabernacle</title>
        <meta name="description" content={sermon.description?.substring(0, 155).replace(/[#*_]/g, '') || `Watch "${sermon.title}" by ${sermon.preacher} on Ruach Tabernacle.`} />
        <link rel="canonical" href={`https://ruachtabernacle.org/${sermon.slug}`} />
        {/* Open Graph — enables rich preview when sharing the sermon link */}
        <meta property="og:type" content="video.other" />
        <meta property="og:title" content={`${sermon.title} — ${sermon.preacher}`} />
        <meta property="og:description" content={sermon.description?.substring(0, 200).replace(/[#*_]/g, '') || `Watch this sermon by ${sermon.preacher} at Ruach Tabernacle Assembly.`} />
        <meta property="og:image" content={sermon.thumbnail_url || 'https://ruachtabernacle.org/church-photos/rhema-feast.jpg'} />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="720" />
        <meta property="og:url" content={`https://ruachtabernacle.org/${sermon.slug}`} />
        <meta property="og:site_name" content="Ruach Tabernacle Assembly" />
        {sermon.youtube_url && <meta property="og:video" content={sermon.youtube_url} />}
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ruachtabernacle" />
        <meta name="twitter:title" content={`${sermon.title} — ${sermon.preacher}`} />
        <meta name="twitter:description" content={sermon.description?.substring(0, 200).replace(/[#*_]/g, '') || `Watch this sermon at Ruach Tabernacle Assembly.`} />
        <meta name="twitter:image" content={sermon.thumbnail_url || 'https://ruachtabernacle.org/church-photos/rhema-feast.jpg'} />
        <meta name="twitter:label1" content="Preacher" />
        <meta name="twitter:data1" content={sermon.preacher} />
        {sermon.scripture_ref && <><meta name="twitter:label2" content="Scripture" /><meta name="twitter:data2" content={sermon.scripture_ref} /></>}
      </Head>

      <Layout>
        <div className="bg-gray-50 dark:bg-[#0a0c10] min-h-screen">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-10 py-6">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 text-sm mb-6">
              <Link href="/" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link href="/sermons" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                Sermons
              </Link>
              {sermon.series && (
                <>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <Link href={`/series/${sermon.series.slug}`} className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    {sermon.series.title}
                  </Link>
                </>
              )}
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">{sermon.title}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Main Content */}
              <div className="lg:col-span-8 space-y-6">
                {/* Header Section with Background */}
                <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#1a1e28] shadow-lg">
                  {/* Background blur - only in dark mode */}
                  <div className="absolute inset-0 z-0 hidden dark:block">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1e28] via-[#1a1e28]/80 to-transparent z-10" />
                    <div
                      className="w-full h-full bg-cover bg-center blur-2xl opacity-30 scale-110"
                      style={{ backgroundImage: `url(${thumbnailUrl})` }}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative z-20 p-6 md:p-8">
                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      {sermon.series && (
                        <Link
                          href={`/series/${sermon.series.slug}`}
                          className="px-3 py-1 rounded-full bg-[#BF0A30]/10 dark:bg-[#BF0A30]/20 text-[#BF0A30] text-xs font-bold uppercase tracking-wider border border-[#BF0A30]/20 dark:border-[#BF0A30]/30 hover:bg-[#BF0A30]/20 dark:hover:bg-[#BF0A30]/30 transition-colors"
                        >
                          {sermon.series_part ? `Part ${sermon.series_part}` : sermon.series.title}
                        </Link>
                      )}
                      <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(sermon.service_date)}
                      </span>
                      {sermon.duration_seconds && (
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{Math.floor(sermon.duration_seconds / 60)}:{String(sermon.duration_seconds % 60).padStart(2, '0')}</span>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-gray-900 dark:text-white text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3">
                      {sermon.title}
                    </h1>

                    {/* Preacher & Scripture */}
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 mb-6">
                      <User className="w-5 h-5 text-[#BF0A30]" />
                      <span className="font-medium">{sermon.preacher}</span>
                      {sermon.scripture_ref && (
                        <>
                          <span className="w-1 h-1 bg-gray-400 rounded-full" />
                          <span className="text-[#BF0A30]">{sermon.scripture_ref}</span>
                        </>
                      )}
                    </div>

                    {/* Audio/Video Player */}
                    <AudioPlayer
                      youtubeUrl={sermon.youtube_url}
                      audioUrl={sermon.audio_url}
                      thumbnailUrl={thumbnailUrl}
                      title={sermon.title}
                      preacher={sermon.preacher}
                      duration={sermon.duration_seconds ? `${Math.floor(sermon.duration_seconds / 60)}:${String(sermon.duration_seconds % 60).padStart(2, '0')}` : undefined}
                      onModeChange={setPlayerMode}
                    />
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-6">
                  <button
                    onClick={toggleWatchlist}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isInWatchlist
                        ? 'bg-[#BF0A30] text-white'
                        : 'bg-gray-100 dark:bg-[#232f48] hover:bg-gray-200 dark:hover:bg-[#2d3b55] text-gray-900 dark:text-white'
                    }`}
                  >
                    {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {isInWatchlist ? 'In Library' : 'Add to Library'}
                  </button>

                  {sermon.audio_url && (
                    <a
                      href={sermon.audio_url}
                      download
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-[#232f48] hover:bg-gray-200 dark:hover:bg-[#2d3b55] text-gray-900 dark:text-white text-sm font-semibold transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download Audio
                    </a>
                  )}

                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-[#232f48] hover:bg-gray-200 dark:hover:bg-[#2d3b55] text-gray-900 dark:text-white text-sm font-semibold transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>

                {/* Spotify embed (if URL is set) */}
                {spotifyUrl && (
                  <div className="bg-white dark:bg-[#1a1e28] rounded-3xl p-5 shadow-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Music className="w-4 h-4 text-[#1DB954]" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Also on Spotify</p>
                    </div>
                    <iframe
                      src={`https://open.spotify.com/embed/${spotifyUrl.replace('https://open.spotify.com/', '')}`}
                      width="100%"
                      height="152"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      style={{ borderRadius: 12 }}
                    />
                  </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-800">
                  <div className="flex gap-1 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                          activeTab === tab.id
                            ? 'text-[#BF0A30] border-[#BF0A30]'
                            : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-[#1a1e28] rounded-3xl p-6 md:p-8 shadow-lg">
                  {activeTab === 'description' && (
                    <div className="markdown-content">
                      {sermon.description ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {sermon.description}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">No description available for this sermon.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
                      {sermonNotes ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {sermonNotes}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-gray-500 italic">No notes available.</p>
                      )}
                    </div>
                  )}

                  {activeTab === 'scripture' && (
                    <div className="space-y-6">
                      {sermon.scripture_ref && (
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-[#BF0A30]" />
                            Scripture Reference
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">{sermon.scripture_ref}</p>
                          <a
                            href={`https://www.biblegateway.com/passage/?search=${encodeURIComponent(sermon.scripture_ref)}&version=NIV`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-xl font-medium hover:bg-[#9a0826] transition-colors"
                          >
                            Read on Bible Gateway
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#BF0A30]" />
                          Your Notes
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 italic">Note-taking feature coming soon. Sign in to save notes.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'discussion' && (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Discussion Questions</h3>
                      <p className="text-gray-500 dark:text-gray-400">Coming soon! Discussion questions and community insights.</p>
                    </div>
                  )}

                  {activeTab === 'transcript' && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Transcript</h3>
                      <p className="text-gray-500 dark:text-gray-400">Transcript not available for this sermon.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                {/* More in Series */}
                {seriesSermons.length > 1 && sermon.series && (
                  <div className="bg-white dark:bg-[#1a1e28] rounded-3xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      More in {sermon.series.title}
                    </h3>
                    <div className="space-y-3">
                      {seriesSermons
                        .filter((s) => s.id !== sermon.id)
                        .slice(0, 5)
                        .map((s) => (
                          <Link
                            key={s.id}
                            href={`/sermons/${s.slug}`}
                            className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                          >
                            <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                              <img
                                src={getYouTubeThumbnail(s.youtube_url, 'mq') ?? ''}
                                alt={s.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                                <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-[#BF0A30] transition-colors">
                                {s.series_part && `Part ${s.series_part}: `}{s.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.preacher}</p>
                            </div>
                          </Link>
                        ))}
                    </div>
                    <Link
                      href={`/series/${sermon.series.slug}`}
                      className="mt-4 block text-center text-sm font-medium text-[#BF0A30] hover:text-[#9a0826] transition-colors"
                    >
                      View All Episodes →
                    </Link>
                  </div>
                )}

                {/* Related Sermons */}
                {relatedSermons.length > 0 && (
                  <div className="bg-white dark:bg-[#1a1e28] rounded-3xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Sermons</h3>
                    <div className="space-y-3">
                      {relatedSermons.slice(0, 4).map((s) => (
                        <Link
                          key={s.id}
                          href={`/sermons/${s.slug}`}
                          className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                          <div className="relative w-20 h-12 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                            <img
                              src={getYouTubeThumbnail(s.youtube_url, 'mq') ?? ''}
                              alt={s.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-[#BF0A30] transition-colors">
                              {s.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.preacher}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Study Guide Card */}
                <div className="bg-gradient-to-br from-[#BF0A30] to-[#9a0826] rounded-3xl p-6 text-white">
                  <h3 className="text-lg font-bold mb-2">Study Guide</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Go deeper with our sermon study guide. Perfect for small groups or personal study.
                  </p>
                  <button className="w-full py-2.5 bg-white text-[#BF0A30] rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  // Fetch sermon with series
  const { data: sermon } = await supabase
    .from('sermons')
    .select(`*, series:series_id (id, title, slug, image_url)`)
    .eq('slug', slug)
    .single();

  if (!sermon) {
    return { props: { sermon: null, relatedSermons: [], seriesSermons: [] } };
  }

  // Increment view count
  await supabase
    .from('sermons')
    .update({ view_count: (sermon.view_count || 0) + 1 })
    .eq('id', sermon.id);

  // Fetch series sermons if in a series
  let seriesSermons: Sermon[] = [];
  if (sermon.series_id) {
    const { data } = await supabase
      .from('sermons')
      .select('*')
      .eq('series_id', sermon.series_id)
      .order('series_part', { ascending: true });
    seriesSermons = data || [];
  }

  // Fetch related sermons (same preacher, different sermon)
  const { data: relatedSermons } = await supabase
    .from('sermons')
    .select('*')
    .eq('preacher', sermon.preacher)
    .neq('id', sermon.id)
    .order('service_date', { ascending: false })
    .limit(4);

  return {
    props: {
      sermon,
      relatedSermons: relatedSermons || [],
      seriesSermons,
    },
  };
};