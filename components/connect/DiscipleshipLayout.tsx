import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, Users, BookOpen, Calendar, GraduationCap, 
  Menu, X, Sun, Moon, LogOut, Bell, Settings, Award
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface DiscipleshipLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DiscipleshipLayout({ children, title }: DiscipleshipLayoutProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/discipleship/dashboard', icon: LayoutDashboard },
    { name: 'Courses', href: '/discipleship/courses', icon: BookOpen },
    { name: 'Cohorts', href: '/discipleship/cohorts', icon: Users },
    { name: 'Students', href: '/discipleship/students', icon: GraduationCap },
    { name: 'Graduates', href: '/discipleship/graduates', icon: Award },
    { name: 'Schedule', href: '/discipleship/schedule', icon: Calendar },
    { name: 'Settings', href: '/discipleship/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#1A1A1A] border-r border-gray-200 dark:border-[#2D2D2D] transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
            <Link href="/discipleship/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#BF0A30] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">Discipleship</p>
                <p className="text-xs text-gray-500">Management Portal</p>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href || router.asPath.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#BF0A30] text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-[#2D2D2D]">
            <Link href="/discipleship" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg">
              <LogOut className="w-4 h-4" />
              Logout
            </Link>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2D2D2D]">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2">
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title || 'Dashboard'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#252525]">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#252525]">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
