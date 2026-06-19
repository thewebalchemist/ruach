import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Plus, Info, Check, Volume2, VolumeX } from 'lucide-react';
import { Sermon, Series } from '@/types';
import { getYouTubeThumbnail, formatDateShort, stripMarkdown, truncateText } from '@/lib/utils';

interface HeroBannerProps {
  featuredSermon?: Sermon;
  featuredSeries?: Series;
  isInWatchlist?: boolean;
  onAddToWatchlist?: () => void;
}

export default function HeroBanner({
  featuredSermon,
  featuredSeries,
  isInWatchlist = false,
  onAddToWatchlist,
}: HeroBannerProps) {
  const [muted, setMuted] = useState(true);

  if (!featuredSermon && !featuredSeries) {
    return null;
  }

  const item = featuredSermon || {
    title: featuredSeries?.title || '',
    preacher: '',
    service_date: featuredSeries?.created_at || '',
    description: featuredSeries?.description || '',
    youtube_url: '',
    slug: featuredSeries?.slug || '',
    thumbnail_url: featuredSeries?.image_url || null,
  };

  const backgroundImage = item.thumbnail_url || getYouTubeThumbnail(item.youtube_url || '', 'maxres');
  const description = truncateText(stripMarkdown(item.description || ''), 180);

  return (
    <section className="relative w-full min-h-[75vh] md:min-h-[85vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        {/* Gradient Overlays - Adjusted for better title visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c10] via-[#0a0c10]/70 to-[#0a0c10]/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0c10]/90 via-[#0a0c10]/50 to-transparent" />
        {/* Top gradient to ensure header is readable */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0a0c10]/80 to-transparent" />
      </div>

      {/* Content - Positioned to avoid being cut off */}
      <div className="relative h-full min-h-[75vh] md:min-h-[85vh] max-w-[1440px] mx-auto px-4 lg:px-10 flex items-end pb-24 md:pb-36 pt-32">
        <div className="max-w-2xl space-y-5 animate-fade-in">
          {/* Series Badge */}
          {featuredSermon?.series && (
            <div className="inline-flex items-center gap-3">
              <Link
                href={`/series/${featuredSermon.series.slug}`}
                className="px-4 py-1.5 rounded-full bg-[#BF0A30]/20 text-[#BF0A30] text-xs font-bold uppercase tracking-wider border border-[#BF0A30]/30 hover:bg-[#BF0A30]/30 transition-colors"
              >
                {featuredSermon.series.title}
              </Link>
              {featuredSermon.series_part && (
                <span className="text-gray-400 text-sm">
                  Part {featuredSermon.series_part}
                </span>
              )}
            </div>
          )}

          {/* Title - Made more prominent with better spacing */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
            {item.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-300">
            {featuredSermon?.preacher && (
              <span className="font-medium text-base md:text-lg">{featuredSermon.preacher}</span>
            )}
            {item.service_date && (
              <>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                <span className="text-sm md:text-base">{formatDateShort(item.service_date)}</span>
              </>
            )}
            {featuredSermon?.duration_seconds && (
              <>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                <span className="text-sm md:text-base">{Math.floor(featuredSermon.duration_seconds / 60)}:{String(featuredSermon.duration_seconds % 60).padStart(2, '0')}</span>
              </>
            )}
            {featuredSermon?.scripture_ref && (
              <>
                <span className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                <span className="text-[#BF0A30] font-medium text-sm md:text-base">{featuredSermon.scripture_ref}</span>
              </>
            )}
          </div>

          {/* Description */}
          {description && (
            <p className="text-gray-300 text-base md:text-lg leading-relaxed line-clamp-3 max-w-xl">
              {description}
            </p>
          )}

          {/* Action Buttons - Increased rounded corners */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 pt-3">
            {/* Play Button */}
            <Link
              href={featuredSermon ? `/sermons/${featuredSermon.slug}` : `/series/${item.slug}`}
              className="flex items-center gap-3 px-7 md:px-9 py-3.5 md:py-4 bg-white hover:bg-gray-100 text-black rounded-2xl font-bold text-base md:text-lg transition-all hover:scale-105 shadow-xl"
            >
              <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
              <span>Play</span>
            </Link>

            {/* More Info */}
            <Link
              href={featuredSermon ? `/sermons/${featuredSermon.slug}` : `/series/${item.slug}`}
              className="flex items-center gap-3 px-7 md:px-9 py-3.5 md:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-2xl font-bold text-base md:text-lg transition-all border border-white/20"
            >
              <Info className="w-5 h-5 md:w-6 md:h-6" />
              <span>More Info</span>
            </Link>

            {/* Add to Watchlist */}
            {featuredSermon && onAddToWatchlist && (
              <button
                onClick={onAddToWatchlist}
                className={`p-3.5 md:p-4 rounded-2xl border-2 transition-all ${
                  isInWatchlist
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white border-white/50 hover:border-white hover:bg-white/10'
                }`}
              >
                {isInWatchlist ? (
                  <Check className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mute Button (for future video preview) */}
        <button
          onClick={() => setMuted(!muted)}
          className="absolute bottom-24 md:bottom-36 right-4 lg:right-10 p-3 rounded-full border border-white/30 text-white/70 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all hidden"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Content Rating Badge */}
      <div className="absolute bottom-8 md:bottom-12 right-4 lg:right-10">
        <div className="px-4 py-2 border-l-4 border-white/50 bg-white/10 backdrop-blur-md text-white text-sm font-medium rounded-r-xl">
          Faith Building
        </div>
      </div>
    </section>
  );
}