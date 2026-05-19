import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, Users, Calendar, MessageSquare, Bell, Settings, 
  Menu, X, Sun, Moon, LogOut, ChevronDown, FileText, ClipboardList
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Department } from '@/types';

interface DepartmentLayoutProps {
  children: ReactNode;
  department: Department;
  title?: string;
}

export function DepartmentLayout({ children, department, title }: DepartmentLayoutProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: `/department/${department.id}`, icon: LayoutDashboard },
    { name: 'Members', href: `/department/${department.id}/members`, icon: Users },
    { name: 'Schedule', href: `/department/${department.id}/schedule`, icon: Calendar },
    { name: 'Resources', href: `/department/${department.id}/resources`, icon: FileText },
    { name: 'Assignments', href: `/department/${department.id}/assignments`, icon: ClipboardList },
    { name: 'Notice Board', href: `/department/${department.id}/notices`, icon: Bell },
    { name: 'Messages', href: `/department/${department.id}/messages`, icon: MessageSquare },
    { name: 'Settings', href: `/department/${department.id}/settings`, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F0F]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-[#1A1A1A] border-r border-gray-200 dark:border-[#2D2D2D] transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-[#2D2D2D]">
            <Link href="/department" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#BF0A30] flex items-center justify-center text-2xl">
                {department.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 dark:text-white truncate">{department.name}</p>
                <p className="text-xs text-gray-500">Department Portal</p>
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
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525]'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-[#2D2D2D]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-sm">
                DL
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Dept. Leader</p>
                <p className="text-xs text-gray-500">HOD</p>
              </div>
            </div>
            <Link href="/department" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg">
              <LogOut className="w-4 h-4" />
              Switch Department
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-[#2D2D2D]">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2">
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title || 'Dashboard'}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#252525]"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#252525]">
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
