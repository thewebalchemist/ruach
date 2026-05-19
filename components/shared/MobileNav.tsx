import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Play, Tv2, Users, Grid3X3 } from 'lucide-react';

const TABS = [
  { label: 'Home',      href: '/',             icon: Home    },
  { label: 'Sermons',   href: '/sermons',       icon: Play    },
  { label: 'Live',      href: '/live',          icon: Tv2     },
  { label: 'Connect',   href: '/r-connect',     icon: Users   },
  { label: 'More',      href: '/new-here',      icon: Grid3X3 },
];

export default function MobileNav() {
  const router = useRouter();

  const isActive = (href: string) =>
    href === '/'
      ? router.pathname === '/'
      : router.pathname.startsWith(href);

  return (
    <nav
      className="fixed bottom-4 left-0 right-0 z-50 mx-4 lg:hidden rounded-[28px] shadow-2xl shadow-black/40"
      style={{
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.20)',
      }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          const isLive = href === '/live';

          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-opacity active:opacity-60"
            >
              {/* Active indicator pill */}
              {active && (
                <span
                  className="absolute top-2 w-5 h-0.5 rounded-full bg-[#BF0A30]"
                  style={{ boxShadow: '0 0 8px rgba(191,10,48,0.8)' }}
                />
              )}

              {/* Live button gets special treatment */}
              {isLive ? (
                <span
                  className="flex items-center justify-center w-11 h-11 rounded-2xl"
                  style={{
                    background: active ? '#BF0A30' : 'rgba(191,10,48,0.18)',
                    border: '1px solid rgba(191,10,48,0.4)',
                  }}
                >
                  <Tv2 className={`w-5 h-5 ${active ? 'text-white' : 'text-[#BF0A30]'}`} />
                  <span
                    className="absolute top-2.5 right-[calc(50%-18px)] w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"
                  />
                </span>
              ) : (
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? 'text-[#BF0A30]' : 'text-white/45'
                  }`}
                />
              )}

              <span
                className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  active ? 'text-[#BF0A30]' : 'text-white/40'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
