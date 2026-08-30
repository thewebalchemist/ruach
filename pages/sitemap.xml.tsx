import { GetServerSideProps } from 'next';
import { supabase } from '@/lib/supabase';

const BASE = 'https://ruachtabernacle.org';

function generateSiteMap(
  sermons: { slug: string; updated_at: string }[],
  series: { slug: string; updated_at: string }[],
) {
  const staticRoutes = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/about', priority: '0.8', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
    { loc: '/sermons', priority: '0.9', changefreq: 'daily' },
    { loc: '/series', priority: '0.8', changefreq: 'weekly' },
    { loc: '/live', priority: '0.9', changefreq: 'daily' },
    { loc: '/ask', priority: '0.7', changefreq: 'monthly' },
    { loc: '/pray', priority: '0.7', changefreq: 'weekly' },
    { loc: '/give', priority: '0.7', changefreq: 'monthly' },
    { loc: '/connect', priority: '0.8', changefreq: 'weekly' },
    { loc: '/crosspoint', priority: '0.7', changefreq: 'weekly' },
    { loc: '/department', priority: '0.6', changefreq: 'monthly' },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes
    .map(
      (r) => `<url>
    <loc>${BASE}${r.loc}</loc>
    <priority>${r.priority}</priority>
    <changefreq>${r.changefreq}</changefreq>
  </url>`,
    )
    .join('\n  ')}
  ${sermons
    .map(
      (s) => `<url>
    <loc>${BASE}/${s.slug}</loc>
    <lastmod>${s.updated_at}</lastmod>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>`,
    )
    .join('\n  ')}
  ${series
    .map(
      (s) => `<url>
    <loc>${BASE}/series/${s.slug}</loc>
    <lastmod>${s.updated_at}</lastmod>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>`,
    )
    .join('\n  ')}
</urlset>`;
}

function SiteMap() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const [{ data: sermons }, { data: series }] = await Promise.all([
    supabase.from('sermons').select('slug, updated_at').order('service_date', { ascending: false }),
    supabase.from('series').select('slug, updated_at').order('created_at', { ascending: false }),
  ]);

  const sitemap = generateSiteMap(sermons ?? [], series ?? []);

  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default SiteMap;
