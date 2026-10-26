import { GetServerSideProps } from 'next';

// Preview deployments (*.vercel.app) must never be indexed.
const PROD_HOST = 'ruachtabernacle.org';

const PRIVATE = [
  '/admin', '/api', '/auth', '/control-panel', '/member', '/notifications',
  '/connect/', '/discipleship', '/crosspoint', '/department',
];

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const host = (req.headers.host || '').toLowerCase();
  const body = host === PROD_HOST
    ? ['User-agent: *', 'Allow: /', ...PRIVATE.map(p => `Disallow: ${p}`), '', `Sitemap: https://${PROD_HOST}/sitemap.xml`].join('\n')
    : 'User-agent: *\nDisallow: /';
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600');
  res.write(body + '\n');
  res.end();
  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
