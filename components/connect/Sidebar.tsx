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
  X,
  Search,
  Radio,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// moduleKey matches admin_permissions.module_key (see execution plan Appendix A /
// supabase/migrations/*_admin_rbac.sql) — items are hidden unless the signed-in
// user's roles grant 'view' on that module (pastor always passes, see
// AuthContext.hasPermission).
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, moduleKey: 'dashboard' },
  { name: 'Search', href: '/admin/search', icon: Search, moduleKey: 'search' },
  {
    name: 'People',
    icon: Users,
    moduleKey: 'members',
    children: [
      { name: 'All Members', href: '/admin/members' },
      { name: 'Guests', href: '/admin/members/guests' },
    ],
  },
  {
    name: 'Crosspoints',
    icon: Home,
    moduleKey: 'crosspoints',
    children: [
      { name: 'All Crosspoints', href: '/admin/crosspoints' },
      { name: 'Transfers', href: '/admin/crosspoints/transfers' },
      { name: 'Modules', href: '/admin/crosspoints/modules' },
    ],
  },
  { name: 'Connect Class', href: '/admin/connect', icon: BookOpen, moduleKey: 'connect' },
  { name: 'Discipleship', href: '/admin/discipleship', icon: GraduationCap, moduleKey: 'discipleship' },
  { name: 'Departments', href: '/admin/departments', icon: Building2, moduleKey: 'departments' },
  { name: 'Events', href: '/admin/events', icon: Calendar, moduleKey: 'events' },
  { name: 'Food Bank', href: '/admin/food-bank', icon: MessageSquare, moduleKey: 'food-bank' },
  { name: 'Prayer Requests', href: '/admin/prayer', icon: MessageSquare, moduleKey: 'prayer' },
  { name: 'Suggestions', href: '/admin/suggestions', icon: MessageSquare, moduleKey: 'suggestions' },
  { name: 'Notices', href: '/admin/notices', icon: Bell, moduleKey: 'notices' },
  { name: 'Reports', href: '/admin/reports', icon: LayoutDashboard, moduleKey: 'reports' },
  {
    name: 'Settings',
    icon: Settings,
    moduleKey: 'settings',
    children: [
      { name: 'General', href: '/admin/settings' },
      { name: 'Roles & Permissions', href: '/admin/settings/roles' },
    ],
  },
  { name: 'Streaming', href: '/control-panel', icon: Radio, moduleKey: 'stream' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const { profile, hasPermission, signOut } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['People', 'Crosspoints']);

  const visibleNav = navigation.filter(item => hasPermission(item.moduleKey, 'view'));

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
        glass-panel fixed top-4 bottom-4 left-4 flex flex-col w-64 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-black/30 z-50
        transform transition-transform duration-300 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-[120%]'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center">
            <img
                src="/brand/ruach-logo.png"
                alt="RUACH CHURCH Logo"
                className="w-9 h-9 rounded-full" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">RuachConnect</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-3 space-y-1 overflow-y-auto">
          {visibleNav.length === 0 && (
            <div className="flex flex-col items-center text-center gap-2 px-4 py-10 text-gray-400">
              <ShieldAlert className="w-8 h-8" />
              <p className="text-sm">No modules assigned to your account yet.</p>
              <p className="text-xs">Ask a super admin to grant you a role.</p>
            </div>
          )}
          {visibleNav.map((item) => (
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
        <div className="flex-shrink-0 p-3 mx-2 mb-2 rounded-2xl bg-gray-100/80 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="avatar avatar-md">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {profile?.first_name} {profile?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{profile?.member_id ?? profile?.email}</p>
            </div>
            <button onClick={signOut} className="p-2 text-gray-400 hover:text-gray-600" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
