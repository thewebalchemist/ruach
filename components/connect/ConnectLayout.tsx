import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, Users, Calendar, GraduationCap, ClipboardList,
  BookOpen, FileText, Settings, Menu, X, Sun, Moon, LogOut, Bell,
  Award, ChevronRight, MessageSquare, FolderOpen, Video, Presentation
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface ConnectLayoutProps {
  children:          ReactNode;
  title?:            string;
  notificationCount?: number;
}

const navigation = [
  { name: 'Dashboard',       href: '/connect/dashboard',         icon: LayoutDashboard },
  { name: 'Cohorts',         href: '/connect/cohorts',           icon: Calendar },
  { name: 'Students',        href: '/connect/students',          icon: Users },
  { name: 'Attendance',      href: '/connect/attendance/import', icon: ClipboardList },
  { name: 'Exams',           href: '/connect/exams',             icon: BookOpen },
  { name: 'Resources',       href: '/connect/resources',         icon: FolderOpen },
  { name: 'Messages',        href: '/connect/messages',          icon: MessageSquare },
  { name: 'Graduates',       href: '/connect/graduates',         icon: GraduationCap },
  { name: 'Legacy Requests', href: '/connect/legacy-requests',   icon: FileText },
  { name: 'Settings',        href: '/connect/settings',          icon: Settings },
];

export function ConnectLayout({ children, title, notificationCount = 0 }: ConnectLayoutProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    router.pathname === href || router.pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-[#0A0C10]">

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Floating Sidebar ─────────────────────────────────────────────────── */}
      <aside className={`
        fixed top-3 left-3 bottom-3 z-50 w-56
        flex flex-col
        bg-white/95 dark:bg-[#111111]/98
        backdrop-blur-2xl
        border border-white/80
        rounded-2xl
        shadow-2xl shadow-black/10 dark:shadow-black/60
        transition-transform duration-300 ease-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+12px)]'}
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          <Link href="/connect/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center shadow-lg shadow-[#BF0A30]/25 flex-shrink-0">
              <img src="/images/ruaach.png" alt="Ruach" className="w-6 h-6 rounded-full opacity-90" />
            </div>
            <div>
              <p className="text-[13px] font-black text-white leading-tight tracking-tight">Connect</p>
              <p className="text-[10px] text-gray-400 leading-tight">Teacher Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white/50 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-4 h-px bg-white/5 dark:bg-white/[0.05]" />

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {navigation.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium
                  transition-all duration-150 group relative
                  ${active
                    ? 'bg-gradient-to-r from-[#BF0A30] to-[#A0021F] text-white shadow-md shadow-[#BF0A30]/25'
                    : 'text-white/50 hover:bg-white/5 dark:hover:bg-white/[0.05] hover:text-white dark:hover:text-white'
                  }
                `}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-white/50 dark:group-hover:text-gray-300'}`} />
                <span className="flex-1 truncate">{item.name}</span>
                {item.name === 'Messages' && notificationCount > 0 && (
                  <span className="w-4 h-4 bg-[#BF0A30] text-white text-[9px] rounded-full flex items-center justify-center font-black flex-shrink-0">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
                {active && <ChevronRight className="w-3 h-3 opacity-50 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 h-px bg-white/5 dark:bg-white/[0.05]" />

        {/* Footer */}
        <div className="px-2.5 py-3">
          <Link
            href="/connect"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 dark:text-gray-500 hover:bg-white/5 dark:hover:bg-white/[0.05] hover:text-white/70 dark:hover:text-gray-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </Link>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────────────── */}
      <div className="lg:pl-[calc(14rem+24px)] min-h-screen flex flex-col">

        {/* ── Floating Header ───────────────────────────────────────────────── */}
        <header className="sticky top-3 z-30 mx-3 mb-3 flex-shrink-0">
          <div className="
            flex items-center justify-between px-4 h-14
            bg-white/95 dark:bg-[#111111]/98
            backdrop-blur-2xl
            border border-white/80
            rounded-2xl
            shadow-lg shadow-black/5 dark:shadow-black/40
          ">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-white/5 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="lg:hidden h-5 w-px bg-gray-200 dark:bg-white/10" />
              <h1 className="text-[15px] font-bold text-white tracking-tight">{title || 'Dashboard'}</h1>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl text-gray-500 hover:bg-white/5 hover:text-white/70 dark:hover:text-white transition-colors"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link href="/connect/messages" className="relative p-2.5 rounded-xl text-gray-500 hover:bg-white/5 hover:text-white/70 dark:hover:text-white transition-colors">
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BF0A30] rounded-full ring-2 ring-white dark:ring-[#111]" />
                )}
              </Link>

              <div className="ml-1 w-9 h-9 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white text-xs font-black shadow-md shadow-[#BF0A30]/20 flex-shrink-0 cursor-pointer select-none">
                JM
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ──────────────────────────────────────────────────── */}
        <main className="flex-1 px-3 pb-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
