import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import { Home, Sparkles, Tv2, Heart, LogIn, BookOpen, Users } from 'lucide-react';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 };

const LOGIN_PORTALS = [
  { label: 'Connect Class',  desc: 'Students & teachers',    href: '/connect',      icon: BookOpen, color: '#BF0A30' },
  { label: 'Discipleship',   desc: 'Members & facilitators', href: '/discipleship', icon: Users,    color: '#7C3AED' },
  { label: 'Crosspoint',     desc: 'Join your home church',  href: '/crosspoint',   icon: Home,     color: '#0891B2' },
];

export default function MobileNav() {
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLoginOpen(false); }, [router.pathname]);

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

          {/* Give — center accent button */}
          <Link
            href="/give"
            className="flex flex-col items-center justify-center w-[60px] h-[56px] rounded-2xl mx-1 transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #BF0A30 0%, #9A0826 100%)',
              boxShadow: '0 4px 20px rgba(191,10,48,0.55)',
            }}
          >
            <Heart style={{ width: 20, height: 20 }} className="text-white" />
            <span className="text-[9px] font-bold uppercase tracking-wide leading-none text-white mt-0.5" style={H}>Give</span>
          </Link>

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
              onClick={() => setLoginOpen(v => !v)}
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
