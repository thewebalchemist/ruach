import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Heart, LogIn } from 'lucide-react';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

/* ─── Nav structure ──────────────────────────────────────────────── */
/* Standalone link rendered before the dropdown group */
const NEW_HERE = { label: 'New Here?', href: '/new-here' };

const NAV = [
  {
    label: 'About',
    href: '/who-we-are',
    children: [
      { label: 'Who We Are',      href: '/who-we-are',      desc: 'Mission, vision & beliefs' },
      { label: 'All About Ruach', href: '/all-about-ruach', desc: 'Everything you want to know' },
      { label: 'Our Team',        href: '/our-team',        desc: 'Meet our leadership' },
      { label: 'Contact Us',      href: '/contact',         desc: 'Get in touch' },
    ],
  },
  {
    label: 'Connect',
    href: '/r-connect',
    children: [
      { label: 'R-Connect',       href: '/r-connect',       desc: 'Connect, grow & serve' },
      { label: 'Crosspoints',     href: '/r-crosspoints',   desc: 'Home church groups' },
      { label: 'Discipleship',    href: '/discipleship',    desc: 'Grow in faith' },
      { label: 'Events',          href: '/r-events',        desc: 'Upcoming gatherings' },
    ],
  },
  {
    label: 'Communities',
    href: '/r-communities',
    children: [
      { label: 'All Communities', href: '/r-communities',   desc: 'Find your circle' },
      { label: 'R-Kids Church',   href: '/r-kids-church',   desc: 'Ages 0–12' },
      { label: 'The Bridge',      href: '/the-bridge',      desc: 'Youth church' },
      { label: 'Kingdom Woman',   href: '/kingdom-woman',   desc: "Women's ministry" },
      { label: 'R-Warriors',      href: '/r-warriors',      desc: "Men's ministry" },
      { label: 'R-Worship',       href: '/r-worship',       desc: 'Worship team' },
    ],
  },
  {
    label: 'Media',
    href: '/sermons',
    children: [
      { label: 'Sermons',         href: '/sermons',         desc: 'Watch messages' },
      { label: 'Watch Live',      href: '/live',            desc: 'Sunday service stream' },
      { label: 'R-Media',         href: '/r-media',         desc: 'Production & media team' },
    ],
  },
];

/* ─── Desktop dropdown item ──────────────────────────────────────── */
function DropdownItem({ label, href, desc }: { label: string; href: string; desc: string }) {
  const router = useRouter();
  const active = router.pathname === href || (href !== '/' && router.pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex flex-col px-4 py-3 rounded-xl transition-all group ${
        active ? 'bg-[rgba(191,10,48,0.12)]' : 'hover:bg-white/5'
      }`}
    >
      <span
        className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
          active ? 'text-[#BF0A30]' : 'text-white/90 group-hover:text-white'
        }`}
        style={H}
      >
        {label}
      </span>
      <span className="text-[10px] text-white/40 mt-0.5 leading-tight">{desc}</span>
    </Link>
  );
}

/* ─── Desktop nav item with hover dropdown ───────────────────────── */
function NavItem({ item, scrolled }: { item: typeof NAV[0]; scrolled: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = item.children
    ? item.children.some((c) => router.pathname === c.href || (c.href !== '/' && router.pathname.startsWith(c.href)))
    : router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href));

  const enter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  if (!item.children) {
    return (
      <Link
        href={item.href}
        className={`relative px-3.5 py-2 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
          isActive ? 'text-[#BF0A30]' : 'text-white/80 hover:text-white'
        }`}
        style={H}
      >
        {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-px bg-[#BF0A30] rounded-full" />}
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        className={`relative flex items-center gap-1 px-3.5 py-2 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
          isActive ? 'text-[#BF0A30]' : 'text-white/80 hover:text-white'
        }`}
        style={H}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {isActive && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-px bg-[#BF0A30] rounded-full" />}
        {item.label}
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-2xl p-2 z-50"
          style={{
            background: 'rgba(10,12,16,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}
          onMouseEnter={enter}
          onMouseLeave={leave}
        >
          {item.children.map((child) => (
            <DropdownItem key={child.href} {...child} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Mobile accordion section ───────────────────────────────────── */
function MobileSection({
  item,
  onClose,
}: {
  item: typeof NAV[0];
  onClose: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = item.children
    ? item.children.some((c) => router.pathname === c.href || (c.href !== '/' && router.pathname.startsWith(c.href)))
    : router.pathname === item.href;

  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-colors ${
          isActive ? 'bg-[rgba(191,10,48,0.15)] text-[#F87171]' : 'text-white/70 hover:text-white hover:bg-white/5'
        }`}
        style={H}
      >
        <span className="text-sm font-black uppercase tracking-wider">{item.label}</span>
      </Link>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${
          isActive ? 'text-[#F87171]' : 'text-white/70 hover:text-white'
        } ${open ? 'bg-white/8' : 'hover:bg-white/5'}`}
        style={H}
      >
        <span className="text-sm font-black uppercase tracking-wider">{item.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="bg-white/[0.04] px-3 pb-3 space-y-0.5">
          {item.children.map((child) => {
            const childActive = router.pathname === child.href || (child.href !== '/' && router.pathname.startsWith(child.href));
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className={`flex flex-col px-4 py-3 rounded-xl transition-colors ${
                  childActive ? 'bg-[rgba(191,10,48,0.12)]' : 'hover:bg-white/5'
                }`}
              >
                <span
                  className={`text-[11px] font-black uppercase tracking-widest ${childActive ? 'text-[#BF0A30]' : 'text-white/85'}`}
                  style={H}
                >
                  {child.label}
                </span>
                <span className="text-[10px] text-white/35 mt-0.5">{child.desc}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const LOGIN_OPTIONS = [
  { label: 'Connect Class', href: '/connect',      desc: 'Connect students & teachers' },
  { label: 'Member Portal', href: '/member/login', desc: 'Members, Crosspoint & Discipleship' },
];

/* ─── Desktop Login dropdown ──────────────────────────────────────── */
function LoginDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all text-white bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 whitespace-nowrap"
        style={H}
      >
        <LogIn className="w-3.5 h-3.5" />
        Login
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-60 rounded-2xl p-2 z-50"
          style={{
            background: 'rgba(10,12,16,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          }}
        >
          <p className="px-4 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest text-white/30" style={H}>Sign in as</p>
          {LOGIN_OPTIONS.map(opt => (
            <Link
              key={opt.href}
              href={opt.href}
              onClick={() => setOpen(false)}
              className="flex flex-col px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <span className="text-[11px] font-black uppercase tracking-widest text-white/90 group-hover:text-white" style={H}>{opt.label}</span>
              <span className="text-[10px] text-white/35 mt-0.5 leading-tight">{opt.desc}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Navbar ────────────────────────────────────────────────── */
export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [router.pathname]);

  return (
    <>
      <header
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-xl bg-black/80 shadow-[0_1px_20px_rgba(0,0,0,0.6)]'
            : 'bg-transparent'
        }`}
        style={scrolled ? { borderBottom: '1px solid rgba(255,255,255,0.08)' } : undefined}
      >
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ────────────────────────────────────────────── */}
            <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
              <img
                src="/brand/ruach-logo.png"
                alt="Ruach Tabernacle"
                className="h-8 w-auto object-contain"
                style={{ maxWidth: '140px' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/brand/logo.png'; }}
              />
            </Link>

            {/* ── Desktop nav with dropdowns ──────────────────────── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {/* Standalone "New Here?" with a subtle pill highlight */}
              <Link
                href={NEW_HERE.href}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  router.pathname === NEW_HERE.href
                    ? 'bg-[#BF0A30] text-white'
                    : 'border border-white/25 text-white/85 hover:text-white hover:border-white/50'
                }`}
                style={H}
              >
                {NEW_HERE.label}
              </Link>

              {NAV.map((item) => (
                <NavItem key={item.href} item={item} scrolled={scrolled} />
              ))}

              {/* Give — center nav, distinct heart accent */}
              <Link
                href="/give"
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  router.pathname === '/give'
                    ? 'text-[#BF0A30]'
                    : 'text-white/80 hover:text-white'
                }`}
                style={H}
              >
                {router.pathname === '/give' && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-px bg-[#BF0A30] rounded-full" />
                )}
                <Heart className={`w-3 h-3 ${router.pathname === '/give' ? 'text-[#BF0A30]' : 'text-white/50'}`} />
                Give
              </Link>
            </nav>

            {/* ── Right CTAs ──────────────────────────────────────── */}
            <div className="flex items-center gap-2.5">
              {/* Login dropdown — desktop only */}
              <div className="hidden lg:block">
                <LoginDropdown />
              </div>

              <Link
                href="/live"
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all bg-[#BF0A30] hover:bg-[#9A0826] text-white shadow-lg shadow-[rgba(191,10,48,0.3)]"
                style={H}
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Watch Online
              </Link>

              {/* Hamburger (mobile) */}
              <button
                className="flex lg:hidden w-9 h-9 items-center justify-center rounded-xl transition-colors text-white/80 hover:text-white hover:bg-white/10"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile full-screen menu ──────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-[45] lg:hidden"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="absolute top-0 left-0 right-0 max-h-screen overflow-y-auto"
            style={{
              background: 'rgba(10,12,16,0.98)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/8">
              <Link href="/" onClick={() => setOpen(false)}>
                <img
                  src="/brand/ruach-logo.png"
                  alt="Ruach Tabernacle"
                  className="h-7 w-auto object-contain"
                  style={{ maxWidth: '120px' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/brand/logo.png'; }}
                />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav sections */}
            <nav className="p-4 space-y-1.5">
              {/* Home quick link */}
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={`flex items-center px-5 py-4 rounded-2xl transition-colors text-sm font-black uppercase tracking-wider ${
                  router.pathname === '/' ? 'bg-[rgba(191,10,48,0.15)] text-[#F87171]' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                style={H}
              >
                Home
              </Link>

              {/* Standalone New Here? — highlighted */}
              <Link
                href="/new-here"
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-colors text-sm font-black uppercase tracking-wider border ${
                  router.pathname === '/new-here'
                    ? 'bg-[#BF0A30] border-[#BF0A30] text-white'
                    : 'border-white/20 text-white/80 hover:text-white hover:border-white/40'
                }`}
                style={H}
              >
                New Here? <span className="text-xs opacity-60">→</span>
              </Link>

              {NAV.map((item) => (
                <MobileSection key={item.href} item={item} onClose={() => setOpen(false)} />
              ))}
            </nav>

            {/* Mobile CTAs */}
            <div className="px-4 pb-6 pt-2 space-y-2.5">
              {/* Login section */}
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <p className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white/30 bg-white/[0.03]" style={H}>Sign in as</p>
                {LOGIN_OPTIONS.map(opt => (
                  <Link
                    key={opt.href}
                    href={opt.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-white/5 border-t border-white/[0.06] transition-colors"
                  >
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest text-white/85" style={H}>{opt.label}</p>
                      <p className="text-[10px] text-white/35 mt-0.5">{opt.desc}</p>
                    </div>
                    <LogIn className="w-3.5 h-3.5 text-white/30" />
                  </Link>
                ))}
              </div>

              <Link
                href="/give"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 border border-white/20 text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-2xl hover:bg-white/8 transition-colors"
                style={H}
              >
                <Heart className="w-4 h-4 text-[#BF0A30]" /> Give
              </Link>
              <Link
                href="/live"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 bg-[#BF0A30] hover:bg-[#9A0826] text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-2xl transition-colors"
                style={H}
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Watch Online
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
