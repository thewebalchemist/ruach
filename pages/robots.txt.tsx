import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.setHeader('Content-Type', 'text/plain');
  res.write(
    `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: https://ruachtabernacle.org/sitemap.xml`,
  );
  res.end();
  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
