import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { Menu, Sun, Moon, Bell, Search } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="top-header">
      <button
        onClick={onMenuClick}
        className="lg:hidden btn-icon flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="hidden lg:block text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex-shrink-0">
        {title}
      </h1>

      <Link
        href="/admin/search"
        className="flex-1 flex items-center gap-2.5 min-w-0 px-4 py-2.5 rounded-2xl bg-gray-100/80 dark:bg-white/5 text-gray-400 dark:text-gray-500 hover:bg-gray-200/70 dark:hover:bg-white/10 transition-colors"
      >
        <Search className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm truncate">Search members, crosspoints, cohorts…</span>
      </Link>

      {mounted && (
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn-icon flex-shrink-0"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      )}

      <button className="relative btn-icon flex-shrink-0" aria-label="Notifications">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#BF0A30] rounded-full ring-2 ring-white dark:ring-[#12151C]" />
      </button>
    </header>
  );
}
