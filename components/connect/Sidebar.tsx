import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard, Users, Home, GraduationCap, Building2, Calendar,
  MessageSquare, Bell, Settings, ChevronDown, LogOut, X, Search, Radio,
  BookOpen, Heart, Utensils,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const H = { fontFamily: 'Montserrat, sans-serif', fontWeight: 900 } as const;

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Search', href: '/admin/search', icon: Search },
  {
    name: 'People', icon: Users,
    children: [
      { name: 'All Members', href: '/admin/members' },
      { name: 'Guests', href: '/admin/members/guests' },
      { name: 'Create Staff', href: '/admin/users/new' },
    ],
  },
  {
    name: 'Crosspoints', icon: Home,
    children: [
      { name: 'All Crosspoints', href: '/admin/crosspoints' },
      { name: 'Transfers', href: '/admin/crosspoints/transfers' },
      { name: 'Modules', href: '/admin/crosspoints/modules' },
    ],
  },
  {
    name: 'Programs', icon: GraduationCap,
    children: [
      { name: 'Connect Class', href: '/admin/connect' },
      { name: 'Discipleship', href: '/admin/discipleship' },
    ],
  },
  { name: 'Departments', href: '/admin/departments', icon: Building2 },
  { name: 'Events', href: '/admin/events', icon: Calendar },
  { name: 'Food Bank', href: '/admin/food-bank', icon: Utensils },
  { name: 'Prayer', href: '/admin/prayer', icon: Heart },
  { name: 'Suggestions', href: '/admin/suggestions', icon: MessageSquare },
  { name: 'Notices', href: '/admin/notices', icon: Bell },
  { name: 'Reports', href: '/admin/reports', icon: LayoutDashboard },
  { name: 'Broadcast', href: '/admin/broadcast', icon: Radio },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const [expanded, setExpanded] = useState<string[]>(['People', 'Crosspoints', 'Programs']);

  const toggle = (name: string) =>
    setExpanded(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]);

  const isActive = (href: string) => router.pathname === href;
  const isParentActive = (children?: { href: string }[]) =>
    children?.some(c => router.pathname.startsWith(c.href));

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#111316] border-r border-white/[0.06] z-50 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-white/[0.06] flex-shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
            <img src="/brand/ruach-logo.png" alt="Ruach" className="h-7 w-auto" />
            <span className="text-white font-black text-xs uppercase tracking-widest" style={H}>Admin</span>
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navigation.map(item => (
            <div key={item.name}>
              {item.children ? (
                <>
                  <button onClick={() => toggle(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isParentActive(item.children) ? 'text-white bg-white/[0.06]' : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'}`}>
                    <span className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded.includes(item.name) ? 'rotate-180' : ''}`} />
                  </button>
                  {expanded.includes(item.name) && (
                    <div className="ml-7 mt-0.5 space-y-0.5 border-l border-white/[0.06] pl-3">
                      {item.children.map(child => (
                        <Link key={child.href} href={child.href} onClick={onClose}
                          className={`block px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors ${isActive(child.href) ? 'text-[#BF0A30] bg-[#BF0A30]/10' : 'text-white/40 hover:text-white/70'}`}>
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link href={item.href} onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isActive(item.href) ? 'text-[#BF0A30] bg-[#BF0A30]/10' : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'}`}>
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="flex-shrink-0 p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-[#BF0A30]/20 flex items-center justify-center text-[#BF0A30] text-xs font-bold flex-shrink-0">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-white/30 text-[10px] truncate">{profile?.role} · {profile?.member_id || profile?.email}</p>
            </div>
            <button onClick={signOut} className="p-1.5 text-white/30 hover:text-white/60 transition-colors" title="Sign out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
