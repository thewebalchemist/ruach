import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'video.other';
  noIndex?: boolean;
  keywords?: string;
  publishedTime?: string;
  author?: string;
}

const SITE_NAME = 'Ruach Tabernacle Assembly';
const DEFAULT_DESCRIPTION =
  'A God-focused, Service-oriented, Community-driven church in Nairobi, Kenya. Join us for Sunday services, Connect Class, Crosspoints, and more.';
const DEFAULT_IMAGE = '/brand/og-image.jpg';
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ruachtabernacle.org';
const TWITTER_HANDLE = '@RuachAssemblies';

export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  noIndex = false,
  keywords,
  publishedTime,
  author,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const desc = description || DEFAULT_DESCRIPTION;
  const imgPath = image || DEFAULT_IMAGE;
  const imgUrl = imgPath.startsWith('http') ? imgPath : `${SITE_URL}${imgPath}`;
  const canonicalUrl = url ? `${SITE_URL}${url}` : undefined;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph — Facebook, WhatsApp, LinkedIn, iMessage previews */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={imgUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {author && <meta property="article:author" content={author} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={imgUrl} />
      <meta name="twitter:image:alt" content={title || SITE_NAME} />
    </Head>
  );
}
