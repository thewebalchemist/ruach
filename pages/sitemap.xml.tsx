import { GetServerSideProps } from 'next';
import { supabase } from '@/lib/supabase';
import { SITE_URL } from '@/lib/seo';

// Public, indexable pages only. Login portals (/connect, /crosspoint,
// /department) are noindex, and /series/* now redirects to /sermons, so
// neither belongs here.
const STATIC_ROUTES: { loc: string; priority: string; changefreq: string }[] = [
  { loc: '/',                  priority: '1.0', changefreq: 'daily' },
  { loc: '/new-here',          priority: '0.9', changefreq: 'monthly' },
  { loc: '/sermons',           priority: '0.9', changefreq: 'weekly' },
  { loc: '/live',              priority: '0.9', changefreq: 'weekly' },
  { loc: '/r-events',          priority: '0.8', changefreq: 'weekly' },
  { loc: '/who-we-are',        priority: '0.8', changefreq: 'monthly' },
  { loc: '/all-about-ruach',   priority: '0.8', changefreq: 'monthly' },
  { loc: '/our-team',          priority: '0.7', changefreq: 'monthly' },
  { loc: '/about',             priority: '0.6', changefreq: 'monthly' },
  { loc: '/contact',           priority: '0.7', changefreq: 'monthly' },
  { loc: '/give',              priority: '0.7', changefreq: 'monthly' },
  { loc: '/pray',              priority: '0.6', changefreq: 'monthly' },
  { loc: '/ask',               priority: '0.5', changefreq: 'monthly' },
  { loc: '/bible',             priority: '0.4', changefreq: 'yearly' },
  { loc: '/r-connect',         priority: '0.7', changefreq: 'monthly' },
  { loc: '/r-crosspoints',     priority: '0.7', changefreq: 'monthly' },
  { loc: '/r-communities',     priority: '0.7', changefreq: 'monthly' },
  { loc: '/r-kids-church',     priority: '0.6', changefreq: 'monthly' },
  { loc: '/trendsetters',      priority: '0.6', changefreq: 'monthly' },
  { loc: '/the-bridge',        priority: '0.6', changefreq: 'monthly' },
  { loc: '/r-warriors',        priority: '0.6', changefreq: 'monthly' },
  { loc: '/kingdom-woman',     priority: '0.6', changefreq: 'monthly' },
  { loc: '/marriage-ministry', priority: '0.6', changefreq: 'monthly' },
  { loc: '/dads-on-duty',      priority: '0.6', changefreq: 'monthly' },
  { loc: '/r-worship',         priority: '0.6', changefreq: 'monthly' },
  { loc: '/intercessors',      priority: '0.6', changefreq: 'monthly' },
  { loc: '/r-media',           priority: '0.6', changefreq: 'monthly' },
  { loc: '/privacy-policy',    priority: '0.2', changefreq: 'yearly' },
];

// Must match TEAM_MEMBERS in pages/our-team/[slug].tsx.
const TEAM_SLUGS = [
  'rev-julian-kyula', 'pst-zino', 'pst-mule', 'maureen-wanjiku', 'pst-david-kimani',
  'pst-kev-owino', 'rev-beverly', 'elizabeth-akinyi', 'pst-ivlyn-mutua',
];

const url = (loc: string, extra = '') => `  <url>\n    <loc>${SITE_URL}${loc}</loc>${extra}\n  </url>`;

function generateSiteMap(sermons: { slug: string; updated_at: string | null }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
  ...STATIC_ROUTES.map(r => url(r.loc, `\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>`)),
  ...TEAM_SLUGS.map(s => url(`/our-team/${s}`, '\n    <priority>0.5</priority>')),
  ...sermons.map(s => url(`/${s.slug}`, `${s.updated_at ? `\n    <lastmod>${new Date(s.updated_at).toISOString()}</lastmod>` : ''}\n    <priority>0.7</priority>`)),
].join('\n')}
</urlset>`;
}

function SiteMap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const { data: sermons } = await supabase
    .from('sermons')
    .select('slug, updated_at')
    .order('service_date', { ascending: false });

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
  res.write(generateSiteMap((sermons ?? []).filter(s => s.slug)));
  res.end();

  return { props: {} };
};

export default SiteMap;
