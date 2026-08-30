import { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Series } from '@/types';

interface SeriesRowProps {
  title: string;
  series: Series[];
  viewAllHref?: string;
}

export default function SeriesRow({ title, series, viewAllHref }: SeriesRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!series || series.length === 0) return null;

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
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide px-4 lg:px-10 pb-4"
        >
          {series.map((item, index) => (
            <SeriesCard key={item.id} series={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Individual Series Card (Taller aspect ratio like Netflix show posters)
interface SeriesCardProps {
  series: Series;
  index: number;
}

function SeriesCard({ series, index }: SeriesCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/series/${series.slug}`}
      className="relative flex-shrink-0 w-[180px] md:w-[220px] group/card"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Poster Image - Increased rounded corners */}
      <div className="relative aspect-[2/3] rounded-3xl overflow-hidden bg-gray-200 dark:bg-gray-800 card-hover-scale shadow-lg">
        {series.thumbnail_url && !imageError ? (
          <img
            src={series.thumbnail_url}
            alt={series.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#BF0A30] to-[#9a0826] flex items-center justify-center">
            <span className="text-white text-5xl font-bold">
              {series.title.charAt(0)}
            </span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-2xl transform scale-90 group-hover/card:scale-100 transition-transform">
            <Play className="w-8 h-8 text-[#0a0c10] fill-current ml-1" />
          </div>
        </div>

        {/* Series Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-base md:text-lg line-clamp-2 mb-1">
            {series.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-gray-300">
            {series.start_date && <span>{new Date(series.start_date).getFullYear()}</span>}
            {series.sermon_count !== undefined && (
              <>
                <span className="w-1 h-1 bg-gray-400 rounded-full" />
                <span>{series.sermon_count} sermons</span>
              </>
            )}
          </div>
        </div>

        {/* Year Badge */}
        {series.start_date && (
          <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-lg">
            {new Date(series.start_date).getFullYear()}
          </div>
        )}
      </div>
    </Link>
  );
}