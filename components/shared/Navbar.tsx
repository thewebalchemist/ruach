import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

const NAV_LINKS = [
  { label: 'New Here?',     href: '/new-here' },
  { label: 'Who We Are',    href: '/who-we-are' },
  { label: 'Connect',       href: '/r-connect' },
  { label: 'Communities',   href: '/r-communities' },
  { label: 'R-Kids',        href: '/r-kids-church' },
  { label: 'Our Team',      href: '/our-team' },
  { label: 'Sermons',       href: '/sermons' },
];

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

  const isActive = (href: string) =>
    router.pathname === href || (href !== '/' && router.pathname.startsWith(href));

  return (
    <>
      {/* Navbar bar — parent Layout wrapper handles fixed positioning */}
      <header
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/[0.92] backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.08)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <div className="flex items-center justify-between h-[60px]">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
              <img
                src="/brand/cropped-icon.png"
                alt="Ruach Tabernacle"
                className="h-9 w-9 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/brand/icon.png'; }}
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    isActive(link.href)
                      ? scrolled ? 'text-[#BF0A30]' : 'text-white'
                      : scrolled ? 'text-[#374151] hover:text-[#111827]' : 'text-white/80 hover:text-white'
                  }`}
                  style={H}
                >
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-px bg-[#BF0A30] rounded-full" />
                  )}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA + hamburger */}
            <div className="flex items-center gap-3">
              <Link
                href="/live"
                className={`hidden sm:flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all ${
                  scrolled
                    ? 'bg-[#BF0A30] hover:bg-[#9A0826] text-white'
                    : 'border border-white/60 text-white bg-transparent hover:bg-white/10'
                }`}
                style={H}
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Watch Online
              </Link>
              <button
                className={`flex lg:hidden w-9 h-9 items-center justify-center rounded-lg transition-colors ${
                  scrolled ? 'text-[#374151]' : 'text-white/80'
                }`}
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-down menu */}
      {open && (
        <div className="fixed inset-0 z-[45] lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="absolute top-0 pt-[100px] left-0 right-0 bg-black border-t border-white/8"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col p-4 gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${
                    isActive(link.href)
                      ? 'text-white bg-white/8'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  style={H}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/live"
                className="mt-2 flex items-center justify-center gap-2 bg-[#BF0A30] text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-xl"
                style={H}
              >
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Watch Online
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
