import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  Users,
  Home,
  GraduationCap,
  Building2,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Search,
  Radio,
} from 'lucide-react';
import { getCurrentUser } from '@/data';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Search', href: '/admin/search', icon: Search },
  { 
    name: 'People', 
    icon: Users,
    children: [
      { name: 'All Members', href: '/admin/members' },
      { name: 'Guests', href: '/admin/members/guests' },
      { name: 'Attendees', href: '/admin/members/attendees' },
    ],
  },
  { 
    name: 'Crosspoints', 
    icon: Home,
    children: [
      { name: 'All Crosspoints', href: '/admin/crosspoints' },
      { name: 'Transfers', href: '/admin/crosspoints/transfers' },
      { name: 'Modules', href: '/admin/crosspoints/modules' },
    ],
  },
  { 
    name: 'Discipleship', 
    icon: GraduationCap,
    children: [
      { name: 'Overview', href: '/admin/discipleship' },
      { name: 'Connect Classes', href: '/admin/discipleship/connect' },
    ],
  },
  { name: 'Departments', href: '/admin/departments', icon: Building2 },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Food Bank', href: '/admin/food-bank', icon: MessageSquare },
  { name: 'Prayer Requests', href: '/admin/prayer', icon: MessageSquare },
  { name: 'Suggestions', href: '/admin/suggestions', icon: MessageSquare },
  { name: 'Notices', href: '/admin/notices', icon: Bell },
  { name: 'Reports', href: '/admin/reports', icon: LayoutDashboard },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Streaming', href: '/admin/stream/dashboard', icon: Radio },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [expandedItems, setExpandedItems] = useState<string[]>(['People', 'Crosspoints', 'Discipleship']);

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => router.pathname === href;
  const isParentActive = (children?: { href: string }[]) => 
    children?.some(child => router.pathname === child.href);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#1A1A1A] border-r border-gray-200 dark:border-[#2D2D2D] z-50
        transform transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-[#2D2D2D]">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex items-center justify-center">
            <img 
                src="/images/ruaach.png" 
                alt="RUACH CHURCH Logo" 
                className="w-10 h-10 rounded-full" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">RuachConnect</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-8rem)]">
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`nav-item w-full justify-between ${isParentActive(item.children) ? 'active' : ''}`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${expandedItems.includes(item.name) ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedItems.includes(item.name) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`nav-item text-sm ${isActive(child.href) ? 'active' : ''}`}
                          onClick={onClose}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-[#2D2D2D] bg-white dark:bg-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="avatar">
              {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.memberId}</p>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
