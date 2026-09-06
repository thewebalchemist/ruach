import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Share2,
  Play,
  Plus,
  Check,
  ChevronRight,
  Copy,
  CheckCircle,
  Music,
  User,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Layout from '@/components/shared/Layout';
import { supabase } from '@/lib/supabase';
import { Sermon } from '@/types';
import { getYouTubeThumbnail, getCurrentUser } from '@/lib/utils';

const H = { fontFamily: '"Bricolage Grotesque", sans-serif', fontWeight: 800 } as const;

interface SermonPageProps {
  sermon: Sermon | null;
  relatedSermons: Sermon[];
  seriesSermons: Sermon[];
}

function getYtId(url: string) {
  return url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1] ?? '';
}

function getThumb(s: Sermon) {
  if (s.thumbnail_url) return s.thumbnail_url;
  const id = getYtId(s.youtube_url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '/church-photos/IMG_1716.jpg';
}

export default function SermonPage({ sermon, relatedSermons, seriesSermons }: SermonPageProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!sermon) return;
    const user = getCurrentUser();
    if (!user) return;
    supabase.from('watchlist').select('id').eq('user_id', user.id).eq('sermon_id', sermon.id).single()
      .then(({ data }) => setIsInWatchlist(!!data));
  }, [sermon]);

  const toggleWatchlist = async () => {
    if (!sermon) return;
    const user = getCurrentUser();
    if (!user) return;
    if (isInWatchlist) {
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('sermon_id', sermon.id);
      setIsInWatchlist(false);
    } else {
      await supabase.from('watchlist').insert([{ user_id: user.id, sermon_id: sermon.id }]);
      setIsInWatchlist(true);
    }
  };

  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shareOpen) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [shareOpen]);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `Watch "${sermon!.title}" by ${sermon!.preacher} — Ruach Tabernacle`;
    if (navigator.share) {
      try { await navigator.share({ title: sermon!.title, text, url }); } catch {}
    } else {
      setShareOpen(true);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => { setCopied(false); setShareOpen(false); }, 1500);
  };

  if (!sermon) {
    return (
      <Layout title="Sermon Not Found | Ruach Tabernacle">
        <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center text-center px-6 pt-16">
          <p className="text-[#BF0A30] text-6xl font-extrabold mb-4">404</p>
          <h1 className="text-white text-2xl font-bold mb-3">Sermon Not Found</h1>
          <p className="text-[#8B95A8] mb-8">This sermon may have been removed or the link is incorrect.</p>
          <Link href="/sermons" className="bg-[#BF0A30] hover:bg-[#9A0826] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors" style={H}>
            Browse Sermons
          </Link>
        </div>
      </Layout>
    );
  }

  const ytId = getYtId(sermon.youtube_url);
  const thumbnailUrl = sermon.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : '/church-photos/IMG_1716.jpg');
  // Prefer the regenerated JK-style article; fall back to the original notes.
  const sermonNotes = (sermon as { article?: string | null }).article || sermon.notes;
  const spotifyUrl = sermon.spotify_url;
  const pageUrl = `https://ruachtabernacle.org/${sermon.slug}`;
  const cleanDesc = sermon.description?.replace(/[#*_`]/g, '').substring(0, 160) || `Watch "${sermon.title}" by ${sermon.preacher} at Ruach Tabernacle Assembly.`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: sermon.title,
    description: cleanDesc,
    thumbnailUrl: [thumbnailUrl],
    uploadDate: sermon.created_at,
    contentUrl: sermon.youtube_url,
    embedUrl: ytId ? `https://www.youtube.com/embed/${ytId}` : undefined,
    duration: sermon.duration_seconds ? `PT${Math.floor(sermon.duration_seconds / 60)}M${sermon.duration_seconds % 60}S` : undefined,
    author: { '@type': 'Person', name: sermon.preacher },
    publisher: { '@type': 'Organization', name: 'Ruach Tabernacle Assembly', logo: { '@type': 'ImageObject', url: 'https://ruachtabernacle.org/brand/ruach-logo.png' } },
  };

  return (
    <Layout>
      <Head>
        <title>{sermon.title} — {sermon.preacher} | Ruach Tabernacle</title>
        <meta name="description" content={cleanDesc} />
        <link rel="canonical" href={pageUrl} />
        <meta name="keywords" content={`${sermon.title}, ${sermon.preacher}, Ruach Tabernacle, sermon, ${sermon.scripture_ref || ''}, ${(sermon.tags || []).join(', ')}, church, faith, Bible study, spiritual growth`} />
        <meta property="og:type" content="video.other" />
        <meta property="og:title" content={`${sermon.title} — ${sermon.preacher}`} />
        <meta property="og:description" content={cleanDesc} />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:image:width" content="1280" />
        <meta property="og:image:height" content="720" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:site_name" content="Ruach Tabernacle Assembly" />
        {sermon.youtube_url && <meta property="og:video" content={sermon.youtube_url} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ruachtabernacle" />
        <meta name="twitter:title" content={`${sermon.title} — ${sermon.preacher}`} />
        <meta name="twitter:description" content={cleanDesc} />
        <meta name="twitter:image" content={thumbnailUrl} />
        <meta name="twitter:label1" content="Preacher" />
        <meta name="twitter:data1" content={sermon.preacher} />
        {sermon.scripture_ref && <><meta name="twitter:label2" content="Scripture" /><meta name="twitter:data2" content={sermon.scripture_ref} /></>}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <div className="min-h-screen bg-[#0A0C10] text-white overflow-x-hidden pt-16 sm:pt-24">

        {/* ── Hero: cinematic backdrop + video ────────────────────────── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img src={thumbnailUrl} alt="" className="w-full h-full object-cover opacity-25 blur-xl scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0C10] via-[#0A0C10]/60 to-[#0A0C10]" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-10">
            {/* Breadcrumbs */}
            <nav className="flex flex-wrap items-center gap-1.5 text-xs text-[#8B95A8] mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/sermons" className="hover:text-white transition-colors">Sermons</Link>
              {sermon.series && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-white/60">{sermon.series.title}</span>
                </>
              )}
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/60 truncate max-w-[160px]">{sermon.title}</span>
            </nav>

            {/* Video player */}
            {ytId && (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-black/40 mb-8">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                  title={sermon.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            )}

            {/* Title block */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 min-w-0">
                {sermon.series && (
                  <span className="inline-block px-3 py-1 mb-3 rounded-full bg-[#BF0A30]/15 text-[#BF0A30] text-[10px] font-black uppercase tracking-widest border border-[#BF0A30]/25" style={H}>
                    {sermon.series.title}
                  </span>
                )}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-3" style={H}>
                  {sermon.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#8B95A8]">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#BF0A30]" />
                    <span className="text-white/80 font-medium">{sermon.preacher}</span>
                  </span>
                  {sermon.scripture_ref && (
                    <span className="text-[#BF0A30] font-medium">{sermon.scripture_ref}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0 mt-2 md:mt-0">
                <button onClick={toggleWatchlist}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                    isInWatchlist ? 'bg-[#BF0A30] text-white' : 'bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10'
                  }`} style={H}>
                  {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isInWatchlist ? 'Saved' : 'Save'}
                </button>
                <div className="relative" ref={shareRef}>
                  <button onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition-colors" style={H}>
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  {shareOpen && (
                    <>
                      <div className="fixed inset-0 bg-black/40 z-40 sm:hidden" onClick={() => setShareOpen(false)} />
                      <div className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 w-full sm:w-80 bg-[#1A1E28] border-t sm:border border-white/10 sm:rounded-2xl rounded-t-2xl p-5 sm:p-4 shadow-2xl z-50">
                        <p className="text-xs text-[#8B95A8] mb-3 font-semibold uppercase tracking-wider">Share this sermon</p>
                        <div className="flex items-center gap-2 bg-[#0A0C10] rounded-xl p-2.5">
                          <input readOnly value={pageUrl} className="flex-1 bg-transparent text-xs text-white/70 outline-none truncate" />
                          <button onClick={copyLink} className="flex items-center gap-1 px-3 py-1.5 bg-[#BF0A30] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#9A0826] transition-colors" style={H}>
                            {copied ? <><CheckCircle className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                          </button>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <a href={`https://wa.me/?text=${encodeURIComponent(`Watch "${sermon.title}" by ${sermon.preacher}\n${pageUrl}`)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 text-center py-2.5 bg-[#25D366]/10 text-[#25D366] text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#25D366]/20 transition-colors" style={H}>
                            WhatsApp
                          </a>
                          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${sermon.title}" by ${sermon.preacher}`)}&url=${encodeURIComponent(pageUrl)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 text-center py-2.5 bg-white/5 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-white/10 transition-colors" style={H}>
                            X / Twitter
                          </a>
                          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex-1 text-center py-2.5 bg-[#1877F2]/10 text-[#1877F2] text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#1877F2]/20 transition-colors" style={H}>
                            Facebook
                          </a>
                        </div>
                        <button onClick={() => setShareOpen(false)} className="mt-4 w-full text-center text-sm text-[#8B95A8] hover:text-white transition-colors py-2">Close</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 pb-20">

          {/* Spotify embed */}
          {spotifyUrl && (
            <div className="mb-8 bg-[#12151C] rounded-2xl p-5 border border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-[#1DB954]" />
                <p className="text-sm font-bold">Also on Spotify</p>
              </div>
              <iframe
                src={`https://open.spotify.com/embed/${spotifyUrl.replace('https://open.spotify.com/', '')}`}
                width="100%" height="152" frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy" style={{ borderRadius: 12 }}
              />
            </div>
          )}

          {/* Sermon notes */}
          {sermonNotes && (
            <div className="mb-10">
              <h2 className="text-lg font-black uppercase tracking-widest text-[#BF0A30] mb-6" style={H}>Sermon Notes</h2>
              <div className="bg-[#12151C] rounded-2xl p-6 md:p-8 border border-white/[0.06] prose prose-invert prose-sm max-w-none
                prose-headings:font-black prose-headings:text-white prose-headings:tracking-tight
                prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h2:text-[#BF0A30]
                prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
                prose-p:text-[#C5CDD9] prose-p:leading-relaxed
                prose-li:text-[#C5CDD9] prose-li:leading-relaxed
                prose-strong:text-white
                prose-a:text-[#BF0A30] prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-[#BF0A30] prose-blockquote:bg-[#BF0A30]/5 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:text-white/80">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {sermonNotes}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Description (if no notes, or as a short summary) */}
          {!sermonNotes && sermon.description && (
            <div className="mb-10">
              <h2 className="text-lg font-black uppercase tracking-widest text-[#BF0A30] mb-6" style={H}>About This Sermon</h2>
              <div className="bg-[#12151C] rounded-2xl p-6 md:p-8 border border-white/[0.06] prose prose-invert prose-sm max-w-none prose-p:text-[#C5CDD9] prose-p:leading-relaxed prose-strong:text-white">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {sermon.description}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* ── More in Series ─────────────────────────────────────── */}
          {seriesSermons.length > 1 && sermon.series && (
            <div className="mb-10">
              <h2 className="text-lg font-black uppercase tracking-widest text-white mb-5" style={H}>
                More in {sermon.series.title}
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {seriesSermons.filter(s => s.id !== sermon.id).slice(0, 8).map(s => (
                  <Link key={s.id} href={`/${s.slug}`} className="group flex-shrink-0 w-[200px]">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#12151C] group-hover:scale-[1.03] transition-transform duration-300">
                      <img src={getThumb(s)} alt={s.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[#BF0A30]/90 flex items-center justify-center shadow-xl">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-bold text-white line-clamp-2 group-hover:text-[#BF0A30] transition-colors" style={H}>{s.title}</p>
                    <p className="text-xs text-[#8B95A8] mt-0.5">{s.preacher}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Related Sermons ────────────────────────────────────── */}
          {relatedSermons.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-black uppercase tracking-widest text-white mb-5" style={H}>
                More from {sermon.preacher}
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {relatedSermons.slice(0, 8).map(s => (
                  <Link key={s.id} href={`/${s.slug}`} className="group flex-shrink-0 w-[200px]">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#12151C] group-hover:scale-[1.03] transition-transform duration-300">
                      <img src={getThumb(s)} alt={s.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[#BF0A30]/90 flex items-center justify-center shadow-xl">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm font-bold text-white line-clamp-2 group-hover:text-[#BF0A30] transition-colors" style={H}>{s.title}</p>
                    <p className="text-xs text-[#8B95A8] mt-0.5">{s.preacher}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Bottom CTA ─────────────────────────────────────────── */}
          <div className="border-t border-white/[0.06] pt-12 text-center">
            <p className="text-[#BF0A30] text-[10px] font-black uppercase tracking-widest mb-3" style={H}>Every Sunday · 3 Services</p>
            <h2 className="text-white text-2xl md:text-3xl font-black mb-4" style={H}>
              Experience it in person.
            </h2>
            <p className="text-[#8B95A8] text-sm mb-8 max-w-sm mx-auto">
              Watching online is great — but there&apos;s something special about being in the room.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/new-here"
                className="flex items-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-black text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all shadow-xl shadow-[rgba(191,10,48,0.35)]" style={H}>
                Plan a Visit <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/sermons"
                className="flex items-center gap-2 border border-white/20 text-white hover:border-white/40 font-bold text-xs uppercase tracking-widest px-7 py-4 rounded-2xl transition-all" style={H}>
                All Sermons
              </Link>
            </div>
          </div>
        </div>
      </div>
      </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;

  const { data: sermon } = await supabase
    .from('sermons')
    .select(`*, series:series_id (id, title, slug, thumbnail_url)`)
    .eq('slug', slug)
    .single();

  if (!sermon) {
    return { props: { sermon: null, relatedSermons: [], seriesSermons: [] } };
  }

  await supabase
    .from('sermons')
    .update({ view_count: (sermon.view_count || 0) + 1 })
    .eq('id', sermon.id);

  let seriesSermons: Sermon[] = [];
  if (sermon.series_id) {
    const { data } = await supabase
      .from('sermons')
      .select('*')
      .eq('series_id', sermon.series_id)
      .order('service_date', { ascending: true });
    seriesSermons = data || [];
  }

  const { data: relatedSermons } = await supabase
    .from('sermons')
    .select('*')
    .eq('preacher', sermon.preacher)
    .neq('id', sermon.id)
    .order('service_date', { ascending: false })
    .limit(8);

  return {
    props: {
      sermon,
      relatedSermons: relatedSermons || [],
      seriesSermons,
    },
  };
};
