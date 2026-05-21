import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import {
  Home, Sparkles, Tv2, LogIn, BookOpen, Users, Heart, CalendarDays,
  Video, Info, X, MoreHorizontal, UserPlus, Phone, PlayCircle,
  ChevronRight, Mic, Map, Baby, Sword, Crown, Music2, Megaphone,
  Handshake, Globe, Film,
} from 'lucide-react';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

const LOGIN_PORTALS = [
  { label: 'Connect Class',  desc: 'Students & teachers',    href: '/connect',      icon: BookOpen, color: '#BF0A30' },
  { label: 'Discipleship',   desc: 'Members & facilitators', href: '/discipleship', icon: Users,    color: '#7C3AED' },
];

const QUICK_CARDS = [
  { label: "New Here?", href: '/new-here',  icon: UserPlus,    bg: 'rgba(255,255,255,0.06)' },
  { label: 'Give',      href: '/give',      icon: Heart,       bg: '#BF0A30',               accent: true },
  { label: 'Events',    href: '/r-events',  icon: CalendarDays,bg: 'rgba(255,255,255,0.06)' },
];

const SECTIONS = [
  {
    title: 'Communities',
    items: [
      { label: 'All Communities',   desc: 'Find your circle',       href: '/r-communities', icon: Globe },
      { label: 'R-Kids Church',     desc: 'Ages 0–12',              href: '/r-kids-church', icon: Baby },
      { label: 'The Bridge',        desc: 'Youth church',           href: '/the-bridge',    icon: Megaphone },
      { label: 'Kingdom Woman',     desc: "Women's ministry",       href: '/kingdom-woman', icon: Crown },
      { label: 'R-Warriors',        desc: "Men's ministry",         href: '/r-warriors',    icon: Sword },
    ],
  },
  {
    title: 'Media',
    items: [
      { label: 'Sermons',           desc: 'Watch messages',         href: '/sermons',       icon: Mic },
      { label: 'Watch Live',        desc: 'Sunday service stream',  href: '/live',          icon: PlayCircle },
      { label: 'R-Media',           desc: 'Production team',        href: '/r-media',       icon: Film },
    ],
  },
  {
    title: 'Visit',
    items: [
      { label: 'New Here?',         desc: 'Plan your first visit',  href: '/new-here',      icon: UserPlus },
      { label: 'Contact Us',        desc: 'Directions & hours',     href: '/contact',       icon: Phone },
    ],
  },
  {
    title: 'About',
    items: [
      { label: 'Who We Are',        desc: 'Mission, vision & beliefs',     href: '/who-we-are',     icon: Info },
      { label: 'All About Ruach',   desc: 'Everything you want to know',   href: '/all-about-ruach',icon: BookOpen },
      { label: 'Our Team',          desc: 'Meet our leadership',           href: '/our-team',       icon: Users },
    ],
  },
  {
    title: 'Connect & Grow',
    items: [
      { label: 'R-Connect',         desc: 'Connect, grow & serve',  href: '/r-connect',     icon: Handshake },
      { label: 'Crosspoints',       desc: 'Join a home church',     href: '/r-crosspoints', icon: Map },
      { label: 'R-Worship',         desc: 'Worship team',           href: '/r-worship',     icon: Music2 },
    ],
  },
];

export default function MobileNav() {
  const router = useRouter();
  const [moreOpen,  setMoreOpen]  = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMoreOpen(false); setLoginOpen(false); }, [router.pathname]);

  useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [moreOpen]);

  useEffect(() => {
    if (!loginOpen) return;
    const handler = (e: MouseEvent) => {
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setLoginOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [loginOpen]);

  const active = (href: string) =>
    href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  const btnCls = 'flex flex-col items-center justify-center gap-0.5 w-[60px] h-12 rounded-2xl transition-all active:scale-95';

  return (
    <>
      {/* ── Full-screen More bottom sheet ──────────────────── */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[60] lg:hidden bg-black/60 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />

          {/* Sheet */}
          <div
            className="fixed left-0 right-0 bottom-0 z-[61] lg:hidden rounded-t-[28px] overflow-hidden"
            style={{
              background: '#111316',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Handle + header */}
            <div className="flex-shrink-0 pt-3 pb-4 px-5">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <span className="text-white font-black text-xl tracking-tight" style={H}>MENU</span>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/12 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-4 pb-8">

              {/* Quick cards row */}
              <div className="grid grid-cols-3 gap-2.5 mb-6">
                {QUICK_CARDS.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl transition-all active:scale-95"
                      style={{
                        background: card.bg,
                        border: card.accent ? 'none' : '1px solid rgba(255,255,255,0.08)',
                        boxShadow: card.accent ? '0 4px 20px rgba(191,10,48,0.4)' : undefined,
                      }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                      <span className="text-white font-black text-[10px] uppercase tracking-widest leading-tight text-center" style={H}>
                        {card.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              {/* Categorized sections */}
              {SECTIONS.map((section) => (
                <div key={section.title} className="mb-5">
                  <p className="text-[#BF0A30] text-[10px] font-black uppercase tracking-[0.15em] mb-2 px-1" style={H}>
                    {section.title}
                  </p>
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    {section.items.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors"
                          style={i > 0 ? { borderTop: '1px solid rgba(255,255,255,0.05)' } : {}}
                        >
                          <Icon className="w-4 h-4 text-white/40 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-black text-[13px] leading-tight tracking-tight" style={H}>
                              {item.label.toUpperCase()}
                            </p>
                            <p className="text-white/40 text-[11px] mt-0.5">{item.desc}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Scrim behind login dropdown */}
      {loginOpen && (
        <div className="fixed inset-0 z-[58] lg:hidden" onClick={() => setLoginOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        </div>
      )}

      {/* Floating island */}
      <div
        className="fixed left-0 right-0 z-[59] lg:hidden flex justify-center pointer-events-none"
        style={{ bottom: 'max(16px, env(safe-area-inset-bottom, 16px))' }}
      >
        <nav
          className="flex items-center pointer-events-auto"
          style={{
            background: 'rgba(8,10,14,0.97)',
            backdropFilter: 'blur(28px) saturate(180%)',
            WebkitBackdropFilter: 'blur(28px) saturate(180%)',
            borderRadius: '28px',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
            padding: '6px 8px',
            gap: '2px',
          }}
        >
          {/* Home */}
          <Link href="/" className={btnCls}>
            <Home style={{ width: 20, height: 20 }} className={active('/') ? 'text-[#BF0A30]' : 'text-white/50'} />
            <span className={`text-[9px] font-bold uppercase tracking-wide leading-none ${active('/') ? 'text-[#BF0A30]' : 'text-white/40'}`} style={H}>Home</span>
          </Link>

          {/* Ask */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggleAskRuach'))}
            className={btnCls}
          >
            <Sparkles style={{ width: 20, height: 20 }} className="text-white/50" />
            <span className="text-[9px] font-bold uppercase tracking-wide leading-none text-white/40" style={H}>Ask</span>
          </button>

          {/* More — center accent button */}
          <button
            onClick={() => { setMoreOpen(v => !v); setLoginOpen(false); }}
            className="flex flex-col items-center justify-center w-[60px] h-[56px] rounded-2xl mx-1 transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #BF0A30 0%, #9A0826 100%)',
              boxShadow: '0 4px 20px rgba(191,10,48,0.55)',
            }}
          >
            {moreOpen
              ? <X style={{ width: 20, height: 20 }} className="text-white" />
              : <MoreHorizontal style={{ width: 20, height: 20 }} className="text-white" />
            }
            <span className="text-[9px] font-bold uppercase tracking-wide leading-none text-white mt-0.5" style={H}>More</span>
          </button>

          {/* Live */}
          <Link href="/live" className={btnCls}>
            <span
              className="relative flex items-center justify-center w-9 h-7 rounded-xl"
              style={active('/live')
                ? { background: '#BF0A30' }
                : { background: 'rgba(191,10,48,0.12)', border: '1px solid rgba(191,10,48,0.25)' }}
            >
              <Tv2 style={{ width: 15, height: 15 }} className={active('/live') ? 'text-white' : 'text-[#BF0A30]'} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 border border-[#080A0E] animate-pulse" />
            </span>
            <span className={`text-[9px] font-bold uppercase tracking-wide leading-none ${active('/live') ? 'text-[#BF0A30]' : 'text-white/40'}`} style={H}>Live</span>
          </Link>

          {/* Login with portal dropdown */}
          <div className="relative" ref={loginRef}>
            <button
              onClick={() => { setLoginOpen(v => !v); setMoreOpen(false); }}
              className={`${btnCls} ${loginOpen ? 'bg-white/8' : ''}`}
            >
              <LogIn style={{ width: 20, height: 20 }} className={loginOpen ? 'text-white' : 'text-white/50'} />
              <span className={`text-[9px] font-bold uppercase tracking-wide leading-none ${loginOpen ? 'text-white' : 'text-white/40'}`} style={H}>Login</span>
            </button>

            {loginOpen && (
              <div
                className="absolute bottom-[calc(100%+14px)] right-0 w-[200px] rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(10,12,18,0.99)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.85)',
                }}
              >
                <p className="px-4 pt-4 pb-2 text-white/35 text-[9px] font-bold uppercase tracking-widest" style={H}>Sign in to</p>
                {LOGIN_PORTALS.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Link
                      key={p.href}
                      href={p.href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${p.color}22` }}
                      >
                        <Icon style={{ width: 14, height: 14, color: p.color }} />
                      </div>
                      <div>
                        <p className="text-white text-[11px] font-bold leading-tight" style={H}>{p.label}</p>
                        <p className="text-white/35 text-[10px] mt-0.5">{p.desc}</p>
                      </div>
                    </Link>
                  );
                })}
                <div className="h-2" />
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
