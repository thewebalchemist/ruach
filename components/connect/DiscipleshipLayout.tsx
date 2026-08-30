import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, Users, BookOpen, Calendar, GraduationCap,
  Menu, X, Sun, Moon, LogOut, Bell, Settings, Award, Loader2, ShieldOff, ChevronRight,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';

interface DiscipleshipLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DiscipleshipLayout({ children, title }: DiscipleshipLayoutProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { loading, role, profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Deliberately checks role directly (teacher/admin/pastor) rather than the
  // broader AuthContext.isTeacher, which also includes 'leader' — the DB's
  // is_staff() (what RLS actually enforces for discipleship_* writes) does
  // not include 'leader'. Using isTeacher here would show a 'leader' the
  // full facilitator UI with buttons that always fail server-side. See
  // AUDIT_REPORT.md / execution plan Batch 5.
  const isFacilitator = !!role && ['teacher', 'admin', 'pastor'].includes(role);

  const navigation = [
    { name: 'Dashboard', href: '/discipleship/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/discipleship/courses', icon: BookOpen },
    { name: 'Cohorts', href: '/discipleship/cohorts', icon: Users },
    { name: 'Students', href: '/discipleship/students', icon: GraduationCap },
    { name: 'Graduates', href: '/discipleship/graduates', icon: Award },
    { name: 'Schedule', href: '/discipleship/schedule', icon: Calendar },
    { name: 'Settings', href: '/discipleship/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#080808]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isFacilitator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#080808] p-6">
        <div className="text-center max-w-sm">
          <ShieldOff className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Not authorized</h1>
          <p className="text-sm text-gray-500 mb-6">This portal is for Discipleship facilitators and staff.</p>
          <button onClick={() => router.push('/discipleship')} className="btn btn-primary">Sign in</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">

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
        border border-white/80 dark:border-white/[0.06]
        rounded-2xl
        shadow-2xl shadow-black/10 dark:shadow-black/60
        transition-transform duration-300 ease-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+12px)]'}
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-5 pb-4">
          <Link href="/discipleship/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center shadow-lg shadow-[#BF0A30]/25 flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-black text-gray-900 dark:text-white leading-tight tracking-tight">Discipleship</p>
              <p className="text-[10px] text-gray-400 leading-tight">Management Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-4 h-px bg-gray-100 dark:bg-white/[0.05]" />

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const active = router.pathname === item.href || router.asPath.startsWith(item.href);
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
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                <span className="flex-1 truncate">{item.name}</span>
                {active && <ChevronRight className="w-3 h-3 opacity-50 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        <div className="mx-4 h-px bg-gray-100 dark:bg-white/[0.05]" />

        {/* Footer */}
        <div className="px-2.5 py-3">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white text-xs font-black shadow-md shadow-[#BF0A30]/20 flex-shrink-0">
              {(profile?.first_name?.[0] ?? '') + (profile?.last_name?.[0] ?? '')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-gray-900 dark:text-white truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-[11px] text-gray-400 truncate capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
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
            border border-white/80 dark:border-white/[0.06]
            rounded-2xl
            shadow-lg shadow-black/5 dark:shadow-black/40
          ">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-1 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="lg:hidden h-5 w-px bg-gray-200 dark:bg-white/10" />
              <h1 className="text-[15px] font-bold text-gray-800 dark:text-white tracking-tight">{title || 'Dashboard'}</h1>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white transition-colors"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white transition-colors">
                <Bell className="w-4 h-4" />
              </button>
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
