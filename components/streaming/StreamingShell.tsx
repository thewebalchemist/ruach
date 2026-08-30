import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Search,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  BookMarked,
  Radio,
  Church,
  Home,
  Layers,
  Sparkles,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/utils';
import { User as UserType } from '@/types';
import AuthModal from './AuthModal';
import AskRuachWidget from './AskRuachWidget';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  // Default to dark mode
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check authentication and theme on mount
  useEffect(() => {
    setMounted(true);
    setUser(getCurrentUser());
    
    // Check localStorage for theme preference, default to dark
    const savedTheme = localStorage.getItem('ruachstream_theme');
    if (savedTheme === 'light') {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  }, []);

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme toggle - save preference
  useEffect(() => {
    if (!mounted) return;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ruachstream_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ruachstream_theme', 'light');
    }
  }, [isDark, mounted]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [router.pathname]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/sermons?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('ruachstream_session');
    setUser(null);
    setUserMenuOpen(false);
    router.push('/');
  };

  // Simplified nav links
  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/series', label: 'Series', icon: Layers },
    { href: '/chat', label: 'Ask Ruach', icon: Sparkles, highlight: false },
    { href: '/live', label: 'Live', icon: Radio, highlight: true },
  ];

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0a0c10]">
        {children}
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#0a0c10] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDark 
              ? 'bg-[#0a0c10]/95 backdrop-blur-xl shadow-lg border-b border-gray-800/50'
              : 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-10 py-3 lg:py-5">
          <div className="flex items-center justify-between">
            {/* Logo & Nav */}
            <div className="flex items-center gap-4 lg:gap-10">
              {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
                <img 
                src="/brand/ruach-logo.png" 
                alt="RUACH CHURCH Logo" 
                className="w-10 h-10 rounded-full" />
              </div>
            </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-6 lg:gap-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base lg:text-lg font-medium transition-colors flex items-center gap-2 ${
                      isActive(link.href)
                        ? 'text-[#BF0A30]'
                        : isDark 
                          ? 'text-gray-300 hover:text-[#BF0A30]' 
                          : 'text-gray-600 hover:text-[#BF0A30]'
                    } ${link.highlight ? 'text-[#BF0A30]' : ''}`}
                  >
                    {link.highlight && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BF0A30] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#BF0A30]"></span>
                      </span>
                    )}
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              {/* Search Bar - Desktop Only */}
              <div className="hidden lg:block">
                <form onSubmit={handleSearch} className="relative group">
                  <div className={`flex items-center border rounded-2xl transition-all ${
                    isDark 
                      ? 'bg-white/10 border-white/10 group-focus-within:border-[#BF0A30]/50' 
                      : 'bg-gray-100 border-gray-200 group-focus-within:border-[#BF0A30]/50'
                  }`}>
                    <div className="pl-4 text-gray-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search sermons..."
                      className={`w-40 lg:w-56 bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-2.5 text-sm ${
                        isDark 
                          ? 'text-white placeholder:text-gray-500' 
                          : 'text-gray-900 placeholder:text-gray-400'
                      }`}
                    />
                  </div>
                </form>
              </div>

              {/* Search Button - Mobile/Tablet */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`lg:hidden p-2 sm:p-2.5 rounded-xl transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-[#BF0A30] hover:bg-white/10' 
                    : 'text-gray-600 hover:text-[#BF0A30] hover:bg-gray-100'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme Toggle - Hidden on very small screens */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={`hidden sm:flex p-2 sm:p-2.5 rounded-xl transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-[#BF0A30] hover:bg-white/10' 
                    : 'text-gray-600 hover:text-[#BF0A30] hover:bg-gray-100'
                }`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications - Hidden on mobile */}
              <button className={`hidden sm:flex p-2 sm:p-2.5 rounded-xl transition-colors relative ${
                isDark 
                  ? 'text-gray-300 hover:text-[#BF0A30] hover:bg-white/10' 
                  : 'text-gray-600 hover:text-[#BF0A30] hover:bg-gray-100'
              }`}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-[#BF0A30] rounded-full"></span>
              </button>

              {/* User Menu / Login */}
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#BF0A30] to-purple-500 overflow-hidden border-2 border-white/20 flex items-center justify-center shadow-lg">
                      {user.image_url ? (
                        <img src={user.image_url} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs sm:text-sm font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </button>
                  
                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className={`absolute right-0 top-full mt-3 w-56 rounded-3xl shadow-2xl border overflow-hidden ${
                      isDark 
                        ? 'bg-[#1a1e28] border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                      </div>
                      <div className="p-2">
                        {/* Theme toggle in dropdown for mobile */}
                        <button
                          onClick={() => setIsDark(!isDark)}
                          className={`sm:hidden w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                            isDark 
                              ? 'text-gray-300 hover:bg-gray-800' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                          {isDark ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <Link
                          href="/my-list"
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                            isDark 
                              ? 'text-gray-300 hover:bg-gray-800' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <BookMarked className="w-5 h-5" />
                          My Watchlist
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3 sm:px-5 py-2 sm:py-2.5 bg-[#BF0A30] hover:bg-[#9a0826] text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-[#BF0A30]/20 hover:shadow-[#BF0A30]/30"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 sm:p-2.5 rounded-xl transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-[#BF0A30] hover:bg-white/10' 
                    : 'text-gray-600 hover:text-[#BF0A30] hover:bg-gray-100'
                }`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search - Expandable */}
          {searchOpen && (
            <div className="lg:hidden mt-3 pb-1">
              <form onSubmit={handleSearch}>
                <div className={`flex items-center border rounded-2xl ${
                  isDark 
                    ? 'bg-white/10 border-white/10' 
                    : 'bg-gray-100 border-gray-200'
                }`}>
                  <div className="pl-4 text-gray-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sermons..."
                    className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-0 px-3 py-3 text-sm ${
                      isDark ? 'text-white placeholder:text-gray-400' : 'text-gray-900 placeholder:text-gray-400'
                    }`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="pr-4 text-gray-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden absolute top-full left-0 right-0 border-b shadow-2xl ${
            isDark 
              ? 'bg-[#12151c] border-gray-800' 
              : 'bg-white border-gray-200'
          }`}>
            <nav className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                      isActive(link.href)
                        ? 'bg-[#BF0A30] text-white shadow-lg shadow-[#BF0A30]/20'
                        : isDark 
                          ? 'text-gray-200 hover:bg-white/10' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{link.label}</span>
                    {link.highlight && !isActive(link.href) && (
                      <span className="ml-auto px-2.5 py-1 text-xs bg-[#BF0A30] text-white rounded-full font-bold">
                        LIVE
                      </span>
                    )}
                  </Link>
                );
              })}
              
              {/* Divider */}
              <div className={`border-t my-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}></div>
              
              {/* All Sermons */}
              <Link
                href="/sermons"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                  isDark 
                    ? 'text-gray-200 hover:bg-white/10' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Church className="w-5 h-5" />
                <span className="font-semibold">All Sermons</span>
              </Link>

              {/* Theme toggle for mobile (if not logged in) */}
              {!user && (
                <button
                  onClick={() => {
                    setIsDark(!isDark);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                    isDark 
                      ? 'text-gray-200 hover:bg-white/10' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="font-semibold">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Click outside to close dropdowns */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setUserMenuOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 lg:pt-24">{children}</main>

      {/* Ask Ruach Chat Widget */}
      <AskRuachWidget onOpenAuthModal={() => setShowAuthModal(true)} />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setShowAuthModal(false);
          }}
        />
      )}
    </div>
  );
}