import { useState, ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, Video, Calendar, Radio,
  Settings, ChevronRight, LogOut, Menu, X, Church,
  Sparkles, Layers, ExternalLink, Users, UserPlus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CPLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const NAV = [
  { label: 'Dashboard',   href: '/control-panel',           icon: LayoutDashboard },
  { label: 'Live Stream', href: '/control-panel/live',       icon: Radio },
  { label: 'Sermons',     href: '/control-panel/sermons',    icon: Video },
  { label: 'Series',      href: '/control-panel/series',     icon: Layers },
  { label: 'Events',      href: '/control-panel/events',     icon: Calendar },
  { label: 'Ask Ruach',   href: '/control-panel/ask-ruach',  icon: Sparkles },
  { label: 'Church Info', href: '/control-panel/church-info',icon: Church },
  { label: 'Settings',    href: '/control-panel/settings',   icon: Settings },
];

const ADMIN_LINK = { label: 'Church Admin', href: '/admin', icon: Users };
const TEAM_LINK  = { label: 'Team Members', href: '/control-panel/team', icon: UserPlus };

export default function CPLayout({ children, title, subtitle, actions }: CPLayoutProps) {
  const router = useRouter();
  const { profile, signOut, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const userEmail = profile?.email ?? '';
  const isMedia   = profile?.role === 'media';

  const isActive = (href: string) =>
    href === '/control-panel'
      ? router.pathname === href
      : router.pathname.startsWith(href);

  const sidebar = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-[#1E1E1E]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#BF0A30] rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Control Panel</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Ruach Tabernacle</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(href)
                ? 'bg-[#BF0A30] text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}

        <div className="pt-3 mt-3 border-t border-gray-100 dark:border-[#1E1E1E] space-y-0.5">
          {isAdmin && (
            <Link
              href={TEAM_LINK.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(TEAM_LINK.href)
                  ? 'bg-[#BF0A30] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <TEAM_LINK.icon className="w-4 h-4 flex-shrink-0" />
              {TEAM_LINK.label}
            </Link>
          )}
          {!isMedia && (
            <Link
              href={ADMIN_LINK.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ADMIN_LINK.icon className="w-4 h-4 flex-shrink-0" />
              {ADMIN_LINK.label}
              <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
            </Link>
          )}
        </div>
      </div>

      {/* User */}
      <div className="px-3 pb-4 border-t border-gray-100 dark:border-[#1E1E1E] pt-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-[#BF0A30]/10 rounded-lg flex items-center justify-center text-[#BF0A30] text-xs font-bold">
            {userEmail.slice(0, 1).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{userEmail || 'Admin'}</p>
            <p className="text-[10px] text-gray-400">Control Panel</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </nav>
  );

  return (
    <>
      <Head>
        <title>{title} | Control Panel | Ruach</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F] flex">

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 bg-white dark:bg-[#111111] border-r border-gray-100 dark:border-[#1E1E1E] fixed inset-y-0 left-0 z-30">
          {sidebar}
        </aside>

        {/* Mobile overlay */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#1E1E1E] flex flex-col z-50">
              {sidebar}
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 lg:ml-56 flex flex-col">

          {/* Top bar */}
          <header className="sticky top-0 z-20 bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-[#1E1E1E] px-4 lg:px-6 h-14 flex items-center gap-4">
            <button onClick={() => setOpen(true)} className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A]">
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex-1 flex items-center gap-2 text-sm text-gray-400">
              <Link href="/control-panel" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Control Panel</Link>
              {router.pathname !== '/control-panel' && (
                <>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-gray-700 dark:text-gray-200 font-medium capitalize">
                    {router.pathname.split('/').pop()?.replace(/-/g, ' ')}
                  </span>
                </>
              )}
            </div>
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#BF0A30] font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Site
            </Link>
          </header>

          {/* Page */}
          <main className="flex-1 p-4 lg:p-6">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>

            {children}
          </main>
        </div>
      </div>
    </>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
}

export function CPStatCard({ title, value, subtitle, icon, color = '#BF0A30' }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
