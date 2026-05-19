// pages/admin/search.tsx
// Global search — teachers, leaders, and admins can search people, students, cohorts
import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Search, X, User, Users, GraduationCap, BookOpen,
  Phone, Mail, Badge, MapPin, Loader2, ChevronRight,
  Filter, SlidersHorizontal
} from 'lucide-react';
import { AdminLayout } from '@/components/connect/AdminLayout';
import { useMode } from '@/context/ModeContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────
type SearchCategory = 'all' | 'members' | 'students' | 'leaders';

interface PersonResult {
  id:         string;
  full_name:  string;
  email:      string;
  phone:      string | null;
  role:       string;
  status:     string;
  member_id:  string | null;
  avatar_url: string | null;
  rank?:      number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_PEOPLE: PersonResult[] = [
  { id: 'u1', full_name: 'John Mwangi Kamau',    email: 'john.kamau@gmail.com',    phone: '+254712345001', role: 'student', status: 'active', member_id: null,       avatar_url: null },
  { id: 'u2', full_name: 'Mary Njeri Wanjiku',   email: 'mary.wanjiku@gmail.com',  phone: '+254712345002', role: 'student', status: 'active', member_id: null,       avatar_url: null },
  { id: 'u3', full_name: 'Peter Ochieng',        email: 'peter.ochieng@gmail.com', phone: '+254712345003', role: 'member',  status: 'active', member_id: 'RM-01042', avatar_url: null },
  { id: 'u4', full_name: 'Grace Njoroge',        email: 'grace.njoroge@gmail.com', phone: '+254722111222', role: 'member',  status: 'active', member_id: 'RM-00876', avatar_url: null },
  { id: 'u5', full_name: 'David Muthoni',        email: 'david.muthoni@gmail.com', phone: '+254722333444', role: 'leader',  status: 'active', member_id: 'RM-00025', avatar_url: null },
  { id: 'u6', full_name: 'Sarah Akinyi',         email: 'sarah.akinyi@gmail.com',  phone: '+254733456789', role: 'student', status: 'active', member_id: null,       avatar_url: null },
  { id: 'u7', full_name: 'James Mwangi',         email: 'james.mwangi@ruach.ke',   phone: '+254721000001', role: 'teacher', status: 'active', member_id: 'RM-00003', avatar_url: null },
  { id: 'u8', full_name: 'Esther Wambua',        email: 'esther.wambua@gmail.com', phone: '+254744567890', role: 'member',  status: 'active', member_id: 'RM-01287', avatar_url: null },
  { id: 'u9', full_name: 'Daniel Kipkorir',      email: 'daniel.k@gmail.com',      phone: '+254755678901', role: 'student', status: 'active', member_id: null,       avatar_url: null },
  { id: 'u10', full_name: 'Faith Chebet',        email: 'faith.chebet@gmail.com',  phone: '+254766789012', role: 'student', status: 'active', member_id: null,       avatar_url: null },
  { id: 'u11', full_name: 'Michael Otieno',      email: 'michael.otieno@gmail.com',phone: '+254777890123', role: 'member',  status: 'active', member_id: 'RM-01345', avatar_url: null },
  { id: 'u12', full_name: 'Lydia Muthee',        email: 'lydia.muthee@gmail.com',  phone: '+254788901234', role: 'student', status: 'active', member_id: null,       avatar_url: null },
];

function mockSearch(query: string, category: SearchCategory): PersonResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return MOCK_PEOPLE.filter(p => {
    const matchesText =
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.phone?.includes(q) ?? false) ||
      (p.member_id?.toLowerCase().includes(q) ?? false);
    const matchesCat =
      category === 'all' ? true :
      category === 'members'  ? ['member','leader','teacher','pastor'].includes(p.role) :
      category === 'students' ? p.role === 'student' :
      category === 'leaders'  ? ['leader','teacher','pastor'].includes(p.role) :
      true;
    return matchesText && matchesCat;
  });
}

// ── Role badge ────────────────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  student:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  member:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  leader:   'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  teacher:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  admin:    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  pastor:   'bg-[#BF0A30]/10 text-[#BF0A30]',
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  student:  GraduationCap,
  member:   User,
  leader:   Users,
  teacher:  BookOpen,
  admin:    Badge,
  pastor:   Badge,
};

// ── Result profile link ───────────────────────────────────────────────────────
function getProfileLink(p: PersonResult) {
  if (['admin','pastor'].includes(p.role)) return `/admin/members/${p.id}`;
  return `/admin/members/${p.id}`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GlobalSearchPage() {
  const { isDemoMode }   = useMode();
  const { isTeacher }    = useAuth();

  const [query,      setQuery]      = useState('');
  const [category,   setCategory]   = useState<SearchCategory>('all');
  const [results,    setResults]    = useState<PersonResult[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [searched,   setSearched]   = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const inputRef  = useRef<HTMLInputElement>(null);
  const debounce  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ── Perform search ────────────────────────────────────────────────────────
  const doSearch = useCallback(async (q: string, cat: SearchCategory) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);

    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 300)); // simulate latency
      setResults(mockSearch(trimmed, cat));
      setLoading(false);
      return;
    }

    // Live: use Supabase RPC
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc('search_members', {
        p_query: trimmed,
        p_limit: 30,
      });

      if (error) throw error;

      let filtered = (data as PersonResult[]) ?? [];
      if (cat !== 'all') {
        const catRoles: Record<SearchCategory, string[]> = {
          all:      [],
          members:  ['member','leader','teacher','pastor'],
          students: ['student'],
          leaders:  ['leader','teacher','pastor'],
        };
        filtered = filtered.filter(p => catRoles[cat].includes(p.role));
      }
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [isDemoMode]);

  // ── Debounced search on query change ──────────────────────────────────────
  useEffect(() => {
    clearTimeout(debounce.current);
    if (query.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    debounce.current = setTimeout(() => doSearch(query, category), 350);
    return () => clearTimeout(debounce.current);
  }, [query, category, doSearch]);

  // ── Focus on mount ─────────────────────────────────────────────────────────
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const cats: { id: SearchCategory; label: string; icon: React.ElementType }[] = [
    { id: 'all',      label: 'Everyone',  icon: Users },
    { id: 'members',  label: 'Members',   icon: User },
    { id: 'students', label: 'Students',  icon: GraduationCap },
    { id: 'leaders',  label: 'Leaders',   icon: BookOpen },
  ];

  return (
    <>
      <AdminLayout title="Search">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Search</h1>
            <p className="text-sm text-gray-500">Find members, students, leaders by name, phone, or member ID</p>
          </div>

          {/* Search input */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by name, phone, email, or member ID…"
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/[0.07] rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]/30 focus:border-[#BF0A30] transition-all shadow-sm text-base"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
              {query && !loading && (
                <button onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                </button>
              )}
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={`p-1 rounded-lg transition-colors ${showFilter ? 'text-[#BF0A30]' : 'text-gray-400 hover:text-gray-600'}`}
                title="Filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className={`flex gap-2 mb-6 transition-all ${showFilter ? 'opacity-100' : 'opacity-100'}`}>
            {cats.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCategory(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                  category === id
                    ? 'bg-[#BF0A30] text-white border-[#BF0A30] shadow-md shadow-[#BF0A30]/20'
                    : 'bg-white dark:bg-[#141414] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.06] hover:border-[#BF0A30]/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Results */}
          {searched && !loading && results.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No results for &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-gray-400 mt-1">Try a different name, phone number, or member ID</p>
            </div>
          )}

          {!searched && !loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 font-medium">Start typing to search</p>
              <p className="text-sm text-gray-400 mt-1">Minimum 2 characters</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400 px-1 mb-3">
                {results.length} result{results.length !== 1 ? 's' : ''}{query && ` for "${query}"`}
              </p>
              {results.map(person => {
                const RoleIcon = ROLE_ICONS[person.role] ?? User;
                return (
                  <Link
                    key={person.id}
                    href={getProfileLink(person)}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-[#141414] border border-gray-200/70 dark:border-white/[0.05] rounded-2xl hover:border-[#BF0A30]/30 hover:shadow-sm transition-all group"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#1A1A1A] dark:to-[#222] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {person.avatar_url ? (
                        <img src={person.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base font-bold text-gray-500 dark:text-gray-400">
                          {person.full_name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {person.full_name}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${ROLE_COLORS[person.role] ?? 'bg-gray-100 text-gray-500'}`}>
                          <RoleIcon className="w-2.5 h-2.5" />
                          {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
                        </span>
                        {person.member_id && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-mono bg-gray-100 dark:bg-[#1A1A1A] text-gray-500">
                            <Badge className="w-2.5 h-2.5" /> {person.member_id}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[180px]">{person.email}</span>
                        </span>
                        {person.phone && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Phone className="w-3 h-3" /> {person.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status + arrow */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`hidden sm:inline-flex px-2 py-1 rounded-lg text-[10px] font-medium ${
                        person.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                      }`}>
                        {person.status.charAt(0).toUpperCase() + person.status.slice(1)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#BF0A30] transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Quick links */}
          {!searched && (
            <div className="mt-8">
              <p className="text-xs text-gray-400 uppercase font-semibold tracking-wider mb-3">Quick Access</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'All Members',    href: '/admin/members',             icon: Users },
                  { label: 'Connect Students', href: '/admin/connect',           icon: GraduationCap },
                  { label: 'Discipleship',   href: '/admin/discipleship',        icon: BookOpen },
                  { label: 'Guests',         href: '/admin/members/guests',      icon: User },
                ].map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-[#141414] border border-gray-200/70 dark:border-white/[0.05] rounded-2xl hover:border-[#BF0A30]/30 hover:shadow-sm transition-all text-center"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#BF0A30]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#BF0A30]" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Demo note */}
          {isDemoMode && searched && (
            <p className="text-center text-xs text-amber-500 mt-6">
              Demo mode — showing mock results. In live mode this searches your Supabase database.
            </p>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
