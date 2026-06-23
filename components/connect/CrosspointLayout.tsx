import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, Users, Calendar, BookOpen, MessageSquare, Bell, 
  Menu, X, Sun, Moon, LogOut, Settings, ClipboardList, Package
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Crosspoint } from '@/types';

interface CrosspointLayoutProps {
  children: ReactNode;
  crosspoint: Crosspoint;
  title?: string;
}

export function CrosspointLayout({ children, crosspoint, title }: CrosspointLayoutProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: `/crosspoint/${crosspoint.id}`, icon: LayoutDashboard },
    { name: 'Members', href: `/crosspoint/${crosspoint.id}/members`, icon: Users },
    { name: 'Attendance', href: `/crosspoint/${crosspoint.id}/attendance`, icon: ClipboardList },
    { name: 'Weekly Module', href: `/crosspoint/${crosspoint.id}/module`, icon: BookOpen },
    { name: 'Schedule', href: `/crosspoint/${crosspoint.id}/schedule`, icon: Calendar },
    { name: 'Food Bank', href: `/crosspoint/${crosspoint.id}/food-bank`, icon: Package },
    { name: 'Notices', href: `/crosspoint/${crosspoint.id}/notices`, icon: Bell },
    { name: 'Settings', href: `/crosspoint/${crosspoint.id}/settings`, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#12151C] border-r border-white/[0.06] transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.06]">
            <Link href="/crosspoint" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#BF0A30] flex items-center justify-center">
                <span className="text-white font-bold">CP</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{crosspoint.name}</p>
                <p className="text-xs text-gray-500">{crosspoint.area}</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href || router.asPath === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#BF0A30] text-white'
                      : 'text-white/50 hover:bg-white/5 dark:hover:bg-[#252525]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                CL
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">CP Leader</p>
                <p className="text-xs text-gray-500">Leader</p>
              </div>
            </div>
            <Link href="/crosspoint" className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:bg-white/5 dark:hover:bg-[#252525] rounded-lg">
              <LogOut className="w-4 h-4" />
              Switch Crosspoint
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#12151C] border-b border-white/[0.06]">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2">
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-white">{title || 'Dashboard'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-white/5 dark:hover:bg-[#252525]"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="relative p-2 rounded-lg hover:bg-white/5 dark:hover:bg-[#252525]">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BF0A30] rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
