import { Menu, Settings, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import AdminDashboard from './AdminDashboard';
import PrayerModal from './PrayerModal';

export default function Header() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
                <img 
                src="/images/ruaach.png" 
                alt="RUACH CHURCH Logo" 
                className="w-10 h-10 rounded-full" />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/sermons"
                className="text-gray-700 dark:text-gray-300 hover:text-[#BF0A30] dark:hover:text-[#BF0A30] transition-colors font-medium"
              >
                All Sermons
              </Link>
              <button
                onClick={() => setShowPrayerModal(true)}
                className="text-gray-700 dark:text-gray-300 hover:text-[#BF0A30] dark:hover:text-[#BF0A30] transition-colors font-medium"
              >
                Submit Prayer
              </button>
              {/* <button
                onClick={() => setShowAdmin(true)}
                className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[1rem] transition-colors"
                title="Admin Settings"
              >
                <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button> */}
              <ThemeToggle />
            </nav>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-[1rem] transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-800 pt-4">
              <nav className="flex flex-col space-y-4">
                <Link
                  href="/sermons"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#BF0A30] dark:hover:text-[#BF0A30] transition-colors font-medium py-2"
                >
                  All Sermons
                </Link>
                <button
                  onClick={() => {
                    setShowPrayerModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#BF0A30] dark:hover:text-[#BF0A30] transition-colors font-medium text-left py-2"
                >
                  Submit Prayer
                </button>
                {/* <button
                  onClick={() => {
                    setShowAdmin(true);
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-700 dark:text-gray-300 hover:text-[#BF0A30] dark:hover:text-[#BF0A30] transition-colors font-medium text-left py-2 flex items-center space-x-2"
                >
                  <Settings className="w-5 h-5" />
                  <span>Admin Settings</span>
                </button> */}
              </nav>
            </div>
          )}
        </div>
      </header>

      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}
      {showPrayerModal && <PrayerModal onClose={() => setShowPrayerModal(false)} />}
    </>
  );
}