import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Home, Play, Tv2, Heart, Grid2X2, X, ChevronRight } from 'lucide-react';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

/* ─── Bottom tab config ──────────────────────────────────────────── */
const TABS = [
  { label: 'Home',    href: '/',         icon: Home },
  { label: 'Sermons', href: '/sermons',   icon: Play },
  { label: 'Live',    href: '/live',      icon: Tv2,  isLive: true },
  { label: 'Give',    href: '/give',      icon: Heart },
  { label: 'More',    href: null,         icon: Grid2X2 },
] as const;

/* ─── Slide-up sheet sections ────────────────────────────────────── */
const MORE_SECTIONS = [
  {
    title: 'Visit',
    items: [
      { label: 'New Here?',       href: '/new-here',      desc: 'Plan your first visit' },
      { label: 'Contact Us',      href: '/contact',       desc: 'Directions & hours' },
      { label: 'Events',          href: '/r-events',      desc: 'Upcoming gatherings' },
    ],
  },
  {
    title: 'About',
    items: [
      { label: 'Who We Are',      href: '/who-we-are',      desc: 'Mission, vision & beliefs' },
      { label: 'All About Ruach', href: '/all-about-ruach', desc: 'Everything you want to know' },
      { label: 'Our Team',        href: '/our-team',        desc: 'Meet our leadership' },
    ],
  },
  {
    title: 'Connect & Grow',
    items: [
      { label: 'R-Connect',       href: '/r-connect',     desc: 'Connect, grow & serve' },
      { label: 'Crosspoints',     href: '/r-crosspoints', desc: 'Home church groups' },
      { label: 'Discipleship',    href: '/discipleship',  desc: 'Grow in faith' },
    ],
  },
  {
    title: 'Communities',
    items: [
      { label: 'All Communities', href: '/r-communities', desc: 'Find your circle' },
      { label: 'R-Kids Church',   href: '/r-kids-church', desc: 'Ages 0–12' },
      { label: 'The Bridge',      href: '/the-bridge',    desc: 'Youth church' },
      { label: 'Kingdom Woman',   href: '/kingdom-woman', desc: "Women's ministry" },
      { label: 'R-Warriors',      href: '/r-warriors',    desc: "Men's ministry" },
    ],
  },
  {
    title: 'Media',
    items: [
      { label: 'Sermons',         href: '/sermons',       desc: 'Watch messages' },
      { label: 'Watch Live',      href: '/live',          desc: 'Sunday service stream' },
      { label: 'R-Media',         href: '/r-media',       desc: 'Production team' },
    ],
  },
];

export default function MobileNav() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  /* Close sheet on route change */
  useEffect(() => { setSheetOpen(false); }, [router.pathname]);

  /* Prevent body scroll when sheet is open */
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sheetOpen]);

  const isActive = (href: string | null) => {
    if (!href) return false;
    return href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);
  };

  return (
    <>
      {/* ── Bottom tab bar ──────────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'rgba(8,10,14,0.96)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 -4px 30px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-stretch h-[60px] max-w-lg mx-auto px-1">
          {TABS.map(({ label, href, icon: Icon, ...rest }) => {
            const isLive = 'isLive' in rest && rest.isLive;
            const isMore = href === null;
            const active = isMore ? sheetOpen : isActive(href);

            const handleClick = () => {
              if (isMore) setSheetOpen((v) => !v);
            };

            const inner = (
              <>
                {/* Top active line */}
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] rounded-full bg-[#BF0A30]"
                    style={{ boxShadow: '0 0 8px rgba(191,10,48,0.9)' }}
                  />
                )}

                {isLive ? (
                  <span
                    className="relative flex items-center justify-center w-10 h-10 rounded-2xl"
                    style={{
                      background: active ? '#BF0A30' : 'rgba(191,10,48,0.15)',
                      border: '1px solid rgba(191,10,48,0.35)',
                    }}
                  >
                    <Icon style={{ width: 18, height: 18 }} className={active ? 'text-white' : 'text-[#BF0A30]'} />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 border border-[#0A0C10] animate-pulse" />
                  </span>
                ) : (
                  <Icon
                    style={{ width: 20, height: 20 }}
                    className={`transition-colors ${active ? 'text-[#BF0A30]' : 'text-white/50'}`}
                  />
                )}

                <span
                  className={`text-[9px] font-bold uppercase tracking-wide leading-none transition-colors ${
                    active ? 'text-[#BF0A30]' : 'text-white/45'
                  }`}
                  style={H}
                >
                  {label}
                </span>
              </>
            );

            const cls = 'flex-1 flex flex-col items-center justify-center gap-0.5 relative active:opacity-70 transition-opacity';

            return isMore ? (
              <button key="more" onClick={handleClick} className={cls}>
                {inner}
              </button>
            ) : (
              <Link key={href} href={href as string} className={cls}>
                {inner}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── More slide-up sheet ──────────────────────────────────── */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          onClick={() => setSheetOpen(false)}
        >
          {/* Scrim */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
            style={{
              background: 'rgba(12,14,20,0.99)',
              border: '1px solid rgba(255,255,255,0.10)',
              maxHeight: '88vh',
              paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle + header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/20" />
              <p className="text-white text-sm font-black uppercase tracking-widest pt-2" style={H}>Menu</p>
              <button
                onClick={() => setSheetOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/8 text-white/60 hover:text-white transition-colors mt-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-4 pb-4" style={{ maxHeight: 'calc(88vh - 80px)' }}>

              {/* Quick actions row */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: 'New Here?', href: '/new-here',  emoji: '👋' },
                  { label: 'Events',    href: '/r-events',  emoji: '📅' },
                  { label: 'Contact',   href: '/contact',   emoji: '📍' },
                ].map((q) => (
                  <Link
                    key={q.href}
                    href={q.href}
                    className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-2xl leading-none">{q.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-wide text-white/75" style={H}>{q.label}</span>
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-white/8 mb-4" />

              {/* Sections */}
              {MORE_SECTIONS.map((section) => (
                <div key={section.title} className="mb-5">
                  <p className="text-[#BF0A30] text-[10px] font-black uppercase tracking-widest px-2 mb-2" style={H}>
                    {section.title}
                  </p>
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const active = router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                            active ? 'bg-[rgba(191,10,48,0.12)]' : 'hover:bg-white/5'
                          }`}
                        >
                          <div>
                            <p
                              className={`text-[11px] font-black uppercase tracking-widest ${active ? 'text-[#BF0A30]' : 'text-white/85'}`}
                              style={H}
                            >
                              {item.label}
                            </p>
                            <p className="text-[10px] text-white/35 mt-0.5">{item.desc}</p>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-[#BF0A30]' : 'text-white/25'}`} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
