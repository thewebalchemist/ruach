import Link from 'next/link';

const CONNECT_LINKS = [
  { label: 'New Here?',     href: '/new-here' },
  { label: 'Connect',       href: '/r-connect' },
  { label: 'Crosspoints',   href: '/r-crosspoints' },
  { label: 'Events',        href: '/r-events' },
  { label: 'Sermons',       href: '/sermons' },
  { label: 'Church Online', href: '/live' },
];

const COMMUNITY_LINKS = [
  { label: 'R-Kids',                   href: '/r-kids-church' },
  { label: 'R-Teens (Trendsetters)',   href: '/trendsetters' },
  { label: 'The Bridge (Youth)',       href: '/the-bridge' },
  { label: 'R-Warriors',               href: '/r-warriors' },
  { label: 'Kingdom Woman',            href: '/kingdom-woman' },
  { label: 'Marriage Ministry',        href: '/marriage-ministry' },
  { label: 'Dads on Duty',             href: '/dads-on-duty' },
  { label: 'R-Worship',                href: '/r-worship' },
  { label: 'Intercessors',             href: '/intercessors' },
  { label: 'R-Media',                  href: '/r-media' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0A0C10] text-[#8B95A8]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div>
            <div className="mb-4">
              <img
                src="/brand/ruach-logo.png"
                alt="Ruach Tabernacle"
                className="h-9 object-contain brightness-0 invert opacity-90"
                style={{ maxWidth: '150px' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/brand/logo.png'; }}
              />
            </div>
            <p className="text-[#BF0A30] font-bold text-sm mb-1">Raising Kingdom Champions</p>
            <p className="text-[#4A5568] text-sm leading-relaxed mb-4">
              We are waiting for you.<br />
              Along the Northern Bypass, Next to Shell Windsor, Nairobi
            </p>
            <Link
              href="/new-here"
              className="inline-flex items-center gap-1.5 border border-[#BF0A30] text-[#BF0A30] hover:bg-[#BF0A30] hover:text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all"
            >
              Plan a Visit →
            </Link>
          </div>

          {/* R-Connect */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">R-Connect</h4>
            <ul className="space-y-2.5">
              {CONNECT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[#4A5568] hover:text-[#BF0A30] text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* R-Communities */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">R-Communities</h4>
            <ul className="space-y-2.5">
              {COMMUNITY_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[#4A5568] hover:text-[#BF0A30] text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Reach Out */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Reach Out</h4>
            <div className="space-y-3 mb-6">
              <a
                href="mailto:hello@ruachtabernacle.org"
                className="flex items-center gap-2 text-[#4A5568] hover:text-[#BF0A30] text-sm transition-colors"
              >
                hello@ruachtabernacle.org
              </a>
              <a
                href="tel:+254700000000"
                className="flex items-center gap-2 text-[#4A5568] hover:text-[#BF0A30] text-sm transition-colors"
              >
                Phone: 0700 000 000
              </a>
            </div>

            <h5 className="text-white font-semibold text-xs uppercase tracking-widest mb-3">Social Links</h5>
            <div className="space-y-2">
              {[
                { label: 'Facebook',  href: '#' },
                { label: 'Instagram', href: '#' },
                { label: 'YouTube',   href: '#' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#4A5568] hover:text-[#BF0A30] text-sm transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#4A5568] text-xs">
            © {year} Ruach Tabernacle Assembly. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="text-[#4A5568] hover:text-[#8B95A8] text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link href="/all-about-ruach" className="text-[#4A5568] hover:text-[#8B95A8] text-xs transition-colors">
              All About Ruach
            </Link>
          </div>
        </div>
      </div>

      {/* Big RUACH wordmark — white, full width, YouVersion style */}
      <div className="overflow-hidden border-t border-white/6 select-none" aria-hidden>
        <p
          className="leading-[0.82] font-black tracking-tighter text-center text-white"
          style={{
            fontFamily: '"Bricolage Grotesque", sans-serif',
            fontWeight: 900,
            fontSize: 'clamp(96px, 20vw, 320px)',
          }}
        >
          RUACH
        </p>
      </div>
    </footer>
  );
}
