import { Html, Head, Main, NextScript } from 'next/document';

const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'chk8boBGW8ULmGORL1lTISWXoh6x1Kf5OUELQ8bxxeY';

const WEBSITE_SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Ruach Tabernacle Church (A Ruach Assemblies Church)',
  alternateName: ['Ruach Tabernacle', 'Ruach Tabernacle Assembly'],
  url: 'https://ruachtabernacle.org',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://ruachtabernacle.org/sermons?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
});

const NAV_SCHEMA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: [
    {
      '@type': 'SiteNavigationElement',
      position: 1,
      name: 'Watch Live',
      description: 'Join Sunday services live — three services every week',
      url: 'https://ruachtabernacle.org/live',
    },
    {
      '@type': 'SiteNavigationElement',
      position: 2,
      name: 'Sermons',
      description: 'Watch powerful Kingdom-focused messages and teachings',
      url: 'https://ruachtabernacle.org/sermons',
    },
    {
      '@type': 'SiteNavigationElement',
      position: 3,
      name: 'New Here?',
      description: 'Plan your first visit to Ruach Tabernacle',
      url: 'https://ruachtabernacle.org/new-here',
    },
    {
      '@type': 'SiteNavigationElement',
      position: 4,
      name: 'Give',
      description: 'Support the ministry of Ruach Tabernacle',
      url: 'https://ruachtabernacle.org/give',
    },
    {
      '@type': 'SiteNavigationElement',
      position: 5,
      name: 'Connect',
      description: 'Get connected with R-Connect community',
      url: 'https://ruachtabernacle.org/r-connect',
    },
    {
      '@type': 'SiteNavigationElement',
      position: 6,
      name: 'Who We Are',
      description: 'Our mission, vision and beliefs',
      url: 'https://ruachtabernacle.org/who-we-are',
    },
  ],
});

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&family=Inter:wght@300;400;500;600;700&family=Bricolage+Grotesque:wght@600;700;800&family=Space+Grotesk:wght@500;600;700&family=Archivo:wght@700;800;900&family=Outfit:wght@600;700;800&family=Sora:wght@600;700;800&family=Fraunces:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#0A0C10" />
        <meta name="google-site-verification" content={GOOGLE_SITE_VERIFICATION} />
        {/* Favicons */}
        <link rel="icon" type="image/png" href="/brand/icon.png" />
        <link rel="apple-touch-icon" href="/brand/icon.png" />
        {/* Structured data — site-wide */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: WEBSITE_SCHEMA }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: NAV_SCHEMA }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
