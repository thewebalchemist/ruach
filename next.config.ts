import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'pub-*.r2.dev' },
    ],
  },

  async redirects() {
    return [
      // ── WordPress legacy URL redirects ──────────────────────────────
      // Preserve any Google-indexed WordPress pages
      { source: '/wp-content/:path*', destination: '/', permanent: true },
      { source: '/wp-admin/:path*', destination: '/admin', permanent: true },
      { source: '/wp-login.php', destination: '/auth/login', permanent: true },
      { source: '/feed', destination: '/sermons', permanent: true },
      { source: '/category/:path*', destination: '/sermons', permanent: true },
      { source: '/tag/:path*', destination: '/sermons', permanent: true },

      // ── Old live subdomain paths (now handled via DNS/Vercel redirect) ──
      // If someone lands with ?from=live we don't need anything special,
      // but guard common paths that might be bookmarked
      { source: '/online', destination: '/live', permanent: true },
      { source: '/watch', destination: '/live', permanent: true },
      { source: '/stream', destination: '/live', permanent: true },

      // ── Old chat path from ruach-live ──
      { source: '/chat', destination: '/ask', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
