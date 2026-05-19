// R2 Storage Configuration


export const R2_CONFIG = {
    // Public URL for accessing files (used in frontend)
    publicUrl: process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-xxxxx.r2.dev',
    
    // Folder structure
    folders: {
      audio: 'audio',
      video: 'video',
      seriesCovers: 'series-covers',
      thumbnails: 'thumbnails',
    },
  };
  
  // Helper to build full URL for a media file
  export function getMediaUrl(folder: keyof typeof R2_CONFIG.folders, filename: string): string {
    return `${R2_CONFIG.publicUrl}/${R2_CONFIG.folders[folder]}/${filename}`;
  }
  
  // Helper to extract filename from full URL
  export function getFilenameFromUrl(url: string): string {
    return url.split('/').pop() || '';
  }
  
  // Generate a safe filename from sermon title and date
  export function generateMediaFilename(title: string, date: string, extension: string): string {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
    
    return `${date}-${slug}.${extension}`;
  }
  
  // Supported media types
  export const SUPPORTED_AUDIO_TYPES = [
    'audio/mpeg',      // .mp3
    'audio/mp4',       // .m4a
    'audio/aac',       // .aac
    'audio/ogg',       // .ogg
    'audio/wav',       // .wav
  ];
  
  export const SUPPORTED_VIDEO_TYPES = [
    'video/mp4',       // .mp4
    'video/webm',      // .webm
    'video/quicktime', // .mov
  ];
  
  export const SUPPORTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  
  // Max file sizes
  export const MAX_FILE_SIZES = {
    audio: 200 * 1024 * 1024,  // 200MB
    video: 2 * 1024 * 1024 * 1024, // 2GB
    image: 10 * 1024 * 1024,   // 10MB
  };
  
  // Format bytes to human readable
  export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }