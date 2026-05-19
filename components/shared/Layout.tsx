import Head from 'next/head';
import { useRouter } from 'next/router';
import AnnouncementBar from './AnnouncementBar';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileNav from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  image?: string;
  noFooter?: boolean;
  noAnnouncement?: boolean;
  /** Passed from individual pages for richer structured data */
  structuredData?: object;
}

const SITE_URL     = 'https://ruachtabernacle.org';
const SITE_NAME    = 'Ruach Tabernacle Assembly';
const DEFAULT_DESC = 'A God-focused, Service-oriented, Community-driven church in Nairobi, Kenya. Join us every Sunday along the Northern Bypass, next to Shell Windsor.';
const DEFAULT_IMG  = `${SITE_URL}/church-photos/rhema-feast.jpg`;
const ORG_JSON_LD  = {
  '@context': 'https://schema.org',
  '@type': 'Church',
  name: SITE_NAME,
  alternateName: 'Ruach Tabernacle',
  description: DEFAULT_DESC,
  url: SITE_URL,
  logo: `${SITE_URL}/brand/logo.png`,
  image: DEFAULT_IMG,
  telephone: '+254700000000',
  email: 'hello@ruachtabernacle.org',
  sameAs: [
    'https://www.facebook.com/RuachTabernacle',
    'https://www.instagram.com/ruachtabernacle',
    'https://www.youtube.com/@ruachtabernacle',
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rhema Avenue, Northern Bypass',
    addressLocality: 'Nairobi',
    addressRegion: 'Nairobi County',
    addressCountry: 'KE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -1.2195,
    longitude: 36.7928,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Sunday', opens: '08:00', closes: '14:00' },
  ],
  event: {
    '@type': 'Event',
    name: 'Sunday Service',
    description: 'Three Sunday services at 8AM, 10AM and 12:30PM at Rhema Grounds, Windsor, Nairobi.',
    startDate: 'T08:00',
    location: {
      '@type': 'Place',
      name: 'Rhema Grounds',
      address: { '@type': 'PostalAddress', streetAddress: 'Rhema Avenue, Northern Bypass', addressLocality: 'Nairobi', addressCountry: 'KE' },
    },
  },
};

const ADMIN_ROUTES = ['/admin', '/connect/dashboard', '/discipleship', '/crosspoint', '/department', '/notifications', '/onboarding'];
const AUTH_ROUTES  = ['/auth'];
const FULLSCREEN   = ['/live', '/ask', '/bible'];

export default function Layout({ children, title, description, image, noFooter, noAnnouncement, structuredData }: LayoutProps) {
  const router = useRouter();

  const isAdmin      = ADMIN_ROUTES.some(p => router.pathname.startsWith(p));
  const isAuth       = AUTH_ROUTES.some(p => router.pathname.startsWith(p));
  const isFullscreen = FULLSCREEN.includes(router.pathname);

  const pageTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | God · Work · Community`;
  const pageDesc  = description || DEFAULT_DESC;
  const ogImage   = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : DEFAULT_IMG;
  const canonical = `${SITE_URL}${router.asPath.split('?')[0]}`;

  const jsonLd = structuredData ?? ORG_JSON_LD;

  const seoHead = (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type"        content="website" />
      <meta property="og:url"         content={canonical} />
      <meta property="og:title"       content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="en_KE" />

      {/* Twitter / X */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content="@ruachtabernacle" />
      <meta name="twitter:creator"     content="@ruachtabernacle" />
      <meta name="twitter:title"       content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image"       content={ogImage} />

      {/* Indexing */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content={SITE_NAME} />
      <meta name="keywords" content="Ruach Tabernacle, church Nairobi, Sunday service, Kingdom Champions, Rhema, Northern Bypass, Kenya church" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
        {/* Fixed header: announcement bar + navbar stacked in one container */}
        <div className="fixed top-0 left-0 right-0 z-50">
          {!noAnnouncement && <AnnouncementBar />}
          <Navbar />
        </div>
        <main>{children}</main>
        {!noFooter && !isFullscreen && <Footer />}
        <MobileNav />
      </div>
    </>
  );
}
