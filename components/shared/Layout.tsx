import Head from 'next/head';
import { useRouter } from 'next/router';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';
import AskRuachWidget from './AskRuachWidget';
import { ScrollProgress } from './Reveal';
import { SITE_NAME, DEFAULT_DESC, OG, OG_SIZED, CHURCH_JSON_LD, absUrl, canonicalFor } from '@/lib/seo';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  /** Share image. Prefer a 1200x630 card from OG in lib/seo. */
  image?: string;
  imageAlt?: string;
  noFooter?: boolean;
  noAnnouncement?: boolean;
  /** Keep this page out of search results (e.g. a not-found state). */
  noIndex?: boolean;
  ogType?: 'website' | 'article' | 'video.other';
  /** Extra JSON-LD nodes for this page. The Church node is always included. */
  structuredData?: object | object[];
}

const ADMIN_ROUTES = ['/admin', '/connect/dashboard', '/discipleship', '/crosspoint', '/department', '/notifications', '/onboarding'];
const AUTH_ROUTES  = ['/auth'];
const FULLSCREEN   = ['/live', '/ask', '/bible'];
// Logged-in areas and their login screens: never indexed.
const PRIVATE_PREFIXES = ['/admin', '/auth', '/member', '/connect', '/discipleship', '/crosspoint', '/department', '/notifications', '/control-panel', '/onboarding'];

export default function Layout({
  children, title, description, image, imageAlt, noFooter, noAnnouncement, noIndex, ogType = 'website', structuredData,
}: LayoutProps) {
  const router = useRouter();

  const isAdmin      = ADMIN_ROUTES.some(p => router.pathname.startsWith(p));
  const isAuth       = AUTH_ROUTES.some(p => router.pathname.startsWith(p));
  const isFullscreen = FULLSCREEN.includes(router.pathname);
  const isPrivate    = PRIVATE_PREFIXES.some(p => router.pathname === p || router.pathname.startsWith(p + '/'));

  // Don't double the brand when a page title already carries it.
  const pageTitle = !title
    ? `${SITE_NAME} | God · Work · Community`
    : /ruach tabernacle/i.test(title) ? title : `${title} | ${SITE_NAME}`;
  const pageDesc  = description || DEFAULT_DESC;
  const imgPath   = image || OG.default;
  const ogImage   = absUrl(imgPath);
  const sized     = OG_SIZED.has(imgPath);
  const canonical = canonicalFor(router.asPath);
  const robots    = noIndex || isPrivate
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const extra  = structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [];
  const jsonLd = { '@context': 'https://schema.org', '@graph': [CHURCH_JSON_LD, ...extra] };

  const seoHead = (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      {!isPrivate && !noIndex && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:type"        content={ogType} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:title"       content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image"       content={ogImage} />
      {sized && <meta property="og:image:width"  content="1200" />}
      {sized && <meta property="og:image:height" content="630" />}
      <meta property="og:image:alt"   content={imageAlt || 'Ruach Tabernacle Assembly, Nairobi'} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_KE" />

      {/* X / Twitter cards. No twitter:site: @ruachtabernacle does not exist on X. */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image"       content={ogImage} />

      {/* Indexing */}
      <meta name="robots" content={robots} />
      <meta name="author" content={SITE_NAME} />

      {/* Structured data */}
      {!isPrivate && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );

  if (isAuth) return (
    <>
      {seoHead}
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center p-4">
        {children}
      </div>
    </>
  );

  if (isAdmin) return (
    <>
      {seoHead}
      <div className="min-h-screen bg-[#F9FAFB]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
      </div>
    </>
  );

  return (
    <>
      {seoHead}
      <div className="min-h-screen bg-white text-[#111827] pb-mobile-nav lg:pb-0">
        {/* Reading progress hairline */}
        <ScrollProgress />
        {/* Fixed header: announcement bar + navbar stacked in one container */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="hidden sm:block">
            {!noAnnouncement && <AnnouncementBar />}
          </div>
          <Navbar />
        </div>
        <main>{children}</main>
        {!noFooter && !isFullscreen && <Footer />}
        <MobileNav />
        <AskRuachWidget />
      </div>
    </>
  );
}
