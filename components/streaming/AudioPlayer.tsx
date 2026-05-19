import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Download,
  Headphones,
  Video,
} from 'lucide-react';

interface AudioPlayerProps {
  youtubeUrl: string;
  audioUrl?: string | null;
  thumbnailUrl?: string | null;
  title: string;
  preacher: string;
  duration?: string;
  onModeChange?: (mode: 'video' | 'audio') => void;
}

export default function AudioPlayer({
  youtubeUrl,
  audioUrl,
  thumbnailUrl,
  title,
  preacher,
  duration,
  onModeChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [mode, setMode] = useState<'video' | 'audio'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Extract YouTube video ID
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  };

  const videoId = extractYouTubeId(youtubeUrl);
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`
    : '';

  // Handle mode change
  const handleModeChange = (newMode: 'video' | 'audio') => {
    setMode(newMode);
    onModeChange?.(newMode);
    
    if (newMode === 'audio' && audioRef.current) {
      // Reset audio when switching to audio mode
      setIsPlaying(false);
    }
  };

  // Audio controls
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 0.7;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        Math.min(audioRef.current.currentTime + seconds, totalDuration)
      );
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate waveform bars
  const waveformBars = Array.from({ length: 40 }, (_, i) => {
    const progress = (currentTime / totalDuration) * 100;
    const barPosition = (i / 40) * 100;
    const isActive = barPosition < progress;
    const height = Math.random() * 20 + 8;
    return { height, isActive };
  });

  // Check if we have a direct audio source
  const hasDirectAudio = !!audioUrl;

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-[#232f48]/50 rounded-lg p-1">
          <button
            onClick={() => handleModeChange('video')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'video'
                ? 'bg-[#BF0A30] text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            Video
          </button>
          <button
            onClick={() => handleModeChange('audio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'audio'
                ? 'bg-[#BF0A30] text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4" />
            Audio Only
          </button>
        </div>

        {/* Download button (only if direct audio exists) */}
        {hasDirectAudio && (
          <a
            href={audioUrl!}
            download
            className="flex items-center gap-2 px-4 py-2 bg-[#232f48] hover:bg-[#2d3b55] text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download MP3</span>
          </a>
        )}
      </div>

      {/* Video Player (when in video mode) */}
      {mode === 'video' && embedUrl && (
        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        </div>
      )}

      {/* Audio Player (when in audio mode) */}
      {mode === 'audio' && (
        <div className="glass-panel rounded-xl p-6">
          {/* Hidden audio element */}
          {hasDirectAudio && (
            <audio
              ref={audioRef}
              src={audioUrl!}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onWaiting={() => setIsLoading(true)}
              onCanPlay={() => setIsLoading(false)}
              preload="metadata"
            />
          )}

          {/* Album art / thumbnail */}
          <div className="flex items-center gap-6 mb-6">
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-cover bg-center shrink-0 shadow-xl"
              style={{ backgroundImage: `url(${thumbnailUrl || '/placeholder.jpg'})` }}
            />
            <div className="min-w-0">
              <h3 className="text-white font-bold text-lg md:text-xl truncate">{title}</h3>
              <p className="text-gray-400">{preacher}</p>
            </div>
          </div>

          {/* Waveform visualization */}
          <div className="flex items-center justify-center gap-[2px] h-12 mb-4 opacity-60">
            {waveformBars.map((bar, i) => (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-all duration-100 ${
                  bar.isActive ? 'bg-[#BF0A30]' : 'bg-gray-600'
                }`}
                style={{ height: `${bar.height}px` }}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={totalDuration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-[#3b4d6b]/30 rounded-full appearance-none cursor-pointer accent-[#BF0A30]"
              style={{
                background: `linear-gradient(to right, #BF0A30 ${
                  (currentTime / (totalDuration || 1)) * 100
                }%, #3b4d6b30 ${(currentTime / (totalDuration || 1)) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{duration || formatTime(totalDuration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Playback rate */}
            <button
              onClick={changePlaybackRate}
              className="text-gray-400 hover:text-white transition-colors px-2 py-1 border border-gray-600 rounded text-xs font-bold"
            >
              {playbackRate}x
            </button>

            {/* Main controls */}
            <div className="flex items-center gap-4 md:gap-6">
              <button
                onClick={() => skip(-15)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Back 15 seconds"
              >
                <SkipBack className="w-6 h-6" />
              </button>

              <button
                onClick={togglePlayPause}
                disabled={!hasDirectAudio}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
                  hasDirectAudio
                    ? 'bg-[#BF0A30] text-white hover:bg-[#9a0826] shadow-[#BF0A30]/25'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-7 h-7" />
                ) : (
                  <Play className="w-7 h-7 ml-1" />
                )}
              </button>

              <button
                onClick={() => skip(15)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Forward 15 seconds"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-[#BF0A30] hidden sm:block"
              />
            </div>
          </div>

          {/* No audio available message */}
          {!hasDirectAudio && (
            <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-xl">
              <p className="text-yellow-500 text-sm text-center">
                ⚠️ No audio file uploaded for this sermon. 
                <br className="hidden sm:block" />
                <span className="text-yellow-600">Use Video mode to watch, or ask admin to upload an audio file.</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}