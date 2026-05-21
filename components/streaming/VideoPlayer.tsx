import { useEffect, useState } from 'react';

interface VideoPlayerProps {
  streamUrl: string | null;
  isLive: boolean;
}

export default function VideoPlayer({ streamUrl, isLive }: VideoPlayerProps) {
  const [videoError, setVideoError] = useState(false);
  const [defaultVideo, setDefaultVideo] = useState('');

  useEffect(() => {
    // Fetch default video URL from API
    const fetchDefaultVideo = async () => {
      try {
        const response = await fetch('/api/stream/settings');
        const data = await response.json();
        setDefaultVideo(data.defaultYoutubeUrl || '');
      } catch (error) {
        console.error('Error fetching default video:', error);
      }
    };

    fetchDefaultVideo();
  }, []);

  const getEmbedUrl = (url: string, isLiveStream: boolean) => {
    if (!url) return '';

    try {
      let videoId = '';
      
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0] || '';
      }

      if (!videoId) return url;

      if (isLiveStream) {
        // Live stream: autoplay but not muted, no loop
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
      } else {
        // Default video: autoplay, muted, loop
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1&controls=1`;
      }
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return '';
    }
  };

  const displayUrl = isLive && streamUrl 
    ? getEmbedUrl(streamUrl, true) 
    : getEmbedUrl(defaultVideo, false);

  if (!displayUrl && !isLive) {
    return (
      <div className="relative w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="aspect-video w-full flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h3 className="text-2xl font-bold mb-4">No Stream Available</h3>
            <p className="text-gray-300">
              The live stream will start when the service begins.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Admin: Please configure the default video in the admin panel.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl">
      <div className="aspect-video w-full">
        {displayUrl ? (
          <iframe
            key={displayUrl}
            src={displayUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onError={() => setVideoError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <p>Loading video...</p>
          </div>
        )}
      </div>

      {isLive && (
        <div className="absolute top-6 left-6 z-10">
          <div className="bg-[#BF0A30] text-white px-4 py-2 rounded-[2rem] font-bold text-sm flex items-center space-x-2 shadow-lg">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span>LIVE</span>
          </div>
        </div>
      )}

      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white p-8">
            <p className="mb-4">Unable to load video stream.</p>
            <p className="text-sm text-gray-400">Please check the video URL in admin settings.</p>
          </div>
        </div>
      )}
    </div>
  );
}