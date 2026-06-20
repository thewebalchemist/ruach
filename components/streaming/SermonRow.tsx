import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Plus, Check } from 'lucide-react';
import { Sermon } from '@/types';
import { getYouTubeThumbnail, formatDateShort, truncateText, stripMarkdown } from '@/lib/utils';

interface SermonRowProps {
  title: string;
  sermons: Sermon[];
  viewAllHref?: string;
  watchlistIds?: string[];
  onToggleWatchlist?: (sermonId: string) => void;
}

export default function SermonRow({
  title,
  sermons,
  viewAllHref,
  watchlistIds = [],
  onToggleWatchlist,
}: SermonRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!sermons || sermons.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <section className="py-6 group/row">
      {/* Row Header */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {title}
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="text-sm font-medium text-[#BF0A30] opacity-0 group-hover/row:opacity-100 transition-opacity ml-2 hover:underline"
              >
                View All →
              </Link>
            )}
          </h2>
        </div>
      </div>

      {/* Scrollable Row */}
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 lg:w-16 flex items-center justify-center bg-gradient-to-r from-white dark:from-[#0a0c10] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8 text-gray-900 dark:text-white" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 lg:w-16 flex items-center justify-center bg-gradient-to-l from-white dark:from-[#0a0c10] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 text-gray-900 dark:text-white" />
          </button>
        )}

        {/* Cards Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide px-4 lg:px-10 pb-4"
        >
          {sermons.map((sermon, index) => (
            <SermonCard
              key={sermon.id}
              sermon={sermon}
              index={index}
              isInWatchlist={watchlistIds.includes(sermon.id)}
              onToggleWatchlist={onToggleWatchlist}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// Individual Sermon Card
interface SermonCardProps {
  sermon: Sermon;
  index: number;
  isInWatchlist: boolean;
  onToggleWatchlist?: (sermonId: string) => void;
}

function SermonCard({ sermon, index, isInWatchlist, onToggleWatchlist }: SermonCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const thumbnailUrl = sermon.thumbnail_url || getYouTubeThumbnail(sermon.youtube_url, 'hq');
  const fallbackUrl = getYouTubeThumbnail(sermon.youtube_url, 'mq');

  return (
    <div
      className="relative flex-shrink-0 w-[280px] md:w-[320px] group/card sermon-card"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/sermons/${sermon.slug}`}>
        {/* Thumbnail - Increased rounded corners */}
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800">
          <img
            src={(imageError ? fallbackUrl : thumbnailUrl) ?? ''}
            alt={sermon.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-110"
            onError={() => setImageError(true)}
          />
          
          {/* Play Icon Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover/card:opacity-100 scale-75 group-hover/card:scale-100 transition-all shadow-xl">
              <Play className="w-6 h-6 text-[#0a0c10] fill-current ml-1" />
            </div>
          </div>

          {/* Duration Badge */}
          {sermon.duration_seconds && (
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 text-white text-xs font-medium rounded-lg">
              {Math.floor(sermon.duration_seconds / 60)}:{String(sermon.duration_seconds % 60).padStart(2, '0')}
            </div>
          )}

          {/* Series Badge */}
          {sermon.series && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-[#BF0A30]/90 text-white text-xs font-bold rounded-lg">
              {sermon.series.title}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-3 space-y-1">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base line-clamp-1 group-hover/card:text-[#BF0A30] transition-colors">
            {sermon.title}
          </h3>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
            <span>{sermon.preacher}</span>
            <span className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full" />
            <span>{formatDateShort(sermon.service_date)}</span>
          </div>
        </div>
      </Link>

      {/* Hover Card with Extra Info */}
      {isHovered && (
        <div className="absolute left-0 right-0 -bottom-2 card-info z-30 pointer-events-none">
          <div className="bg-white dark:bg-[#1a1e28] rounded-b-2xl p-4 shadow-2xl border border-gray-200 dark:border-gray-700 border-t-0 pointer-events-auto">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-3">
              <Link
                href={`/sermons/${sermon.slug}`}
                className="w-10 h-10 rounded-full bg-[#BF0A30] flex items-center justify-center hover:bg-[#9a0826] transition-colors"
              >
                <Play className="w-5 h-5 text-white fill-current ml-0.5" />
              </Link>
              
              {onToggleWatchlist && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onToggleWatchlist(sermon.id);
                  }}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isInWatchlist
                      ? 'bg-white dark:bg-white text-black border-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-white hover:border-[#BF0A30] hover:text-[#BF0A30]'
                  }`}
                >
                  {isInWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              )}
            </div>

            {/* Description Preview */}
            {sermon.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {truncateText(stripMarkdown(sermon.description), 100)}
              </p>
            )}

            {/* Tags */}
            {sermon.tags && sermon.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sermon.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-[#BF0A30]/10 dark:bg-[#BF0A30]/20 text-[#BF0A30] text-[10px] font-medium rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}