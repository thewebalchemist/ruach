// pages/admin/crosspoints/modules/index.tsx
// Admin: Manage crosspoint weekly study modules — publish, draft, edit

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Plus, BookOpen, Edit, Eye, Download, ChevronDown, ChevronUp,
  CheckCircle, Clock, Globe, Users, MessageSquare, Flame,
  Search, MoreVertical, Copy, Trash2, ArrowUpRight, Loader2
} from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const db = supabase as any;

type ModuleStatus = 'published' | 'draft' | 'scheduled';

interface ModuleRow {
  id: string;
  title: string;
  description: string;
  scripture: string;
  content: string;
  discussion_questions: string[];
  prayer_points: string[];
  week_number: number;
  status: ModuleStatus;
  published_at: string | null;
  scheduled_for: string | null;
  series_name: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<ModuleStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  published: { label: 'Published', color: 'text-green-400', bg: 'bg-green-900/30', icon: CheckCircle },
  draft:     { label: 'Draft',     color: 'text-amber-400', bg: 'bg-amber-900/30', icon: Clock },
  scheduled: { label: 'Scheduled', color: 'text-blue-400',  bg: 'bg-blue-900/30',  icon: Clock },
};

export default function CrosspointModulesPage() {
  const router = useRouter();
  const { profile, loading: authLoading, session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [crosspointCount, setCrosspointCount] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | ModuleStatus>('all');
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=' + router.asPath); return; }
    if (!['admin', 'pastor', 'teacher', 'leader'].includes(profile.role)) { router.push('/'); return; }
    loadData();
  }, [authLoading, profile]);

  async function loadData() {
    setLoading(true);

    const [{ data: modData }, { count: cpCount }] = await Promise.all([
      db.from('crosspoint_modules').select('*').order('created_at', { ascending: false }),
      db.from('crosspoints').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

    let rows = (modData ?? []) as ModuleRow[];

    // If empty, seed a sample module
    if (rows.length === 0 && session?.access_token) {
      const seedModule = {
        title: 'Test Module — Getting Started',
        description: 'A sample module to help you get started with crosspoint study materials.',
        scripture: 'Psalm 119:105',
        content: 'This is a sample module. Replace it with your own content or delete it and create a new one.',
        discussion_questions: ['What does this verse mean to you?', 'How can we apply this in our crosspoint?'],
        prayer_points: ['Pray for wisdom as we study together', 'Pray for unity in our crosspoints'],
        week_number: 1,
        status: 'draft',
        series_name: 'Sample Series',
      };

      const { data: inserted } = await db
        .from('crosspoint_modules')
        .insert(seedModule)
        .select()
        .single();

      if (inserted) rows = [inserted as ModuleRow];
    }

    setModules(rows);
    setCrosspointCount(cpCount ?? 0);
    setLoading(false);
  }

  const currentWeek = modules.find(m => m.status === 'published')?.week_number ?? 0;
  const currentModule = modules.find(m => m.week_number === currentWeek && m.status === 'published');

  const filtered = modules.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.scripture.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const published = modules.filter(m => m.status === 'published').length;
  const drafts = modules.filter(m => m.status === 'draft').length;

  if (loading) {
    return (
      <AdminLayout title="Crosspoint Modules">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Crosspoint Modules">
      <PageHeader
        title="Crosspoint Modules"
        subtitle={`Weekly study materials shared to all ${crosspointCount} crosspoints`}
        actions={
          <Link href="/admin/crosspoints/modules/new" className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" /> Create Module
          </Link>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Modules',   value: modules.length,   icon: BookOpen,    color: 'text-[#BF0A30]', bg: 'bg-red-900/20' },
          { label: 'Published',       value: published,        icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-900/20' },
          { label: 'Drafts',          value: drafts,           icon: Clock,       color: 'text-amber-600', bg: 'bg-amber-900/20' },
          { label: 'Crosspoints',     value: crosspointCount,  icon: Users,       color: 'text-blue-600',  bg: 'bg-blue-900/20' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#12151C] rounded-2xl border border-white/[0.06] p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl font-black text-white leading-none">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* This Week's Module Hero */}
      {currentModule && (
        <div className="relative bg-gradient-to-r from-[#BF0A30] to-[#8B0017] rounded-2xl p-6 mb-6 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '12px 12px',
          }} />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase">
                    Week {currentModule.week_number} · Current
                  </span>
                  {currentModule.series_name && (
                    <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider">
                      {currentModule.series_name}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black mb-1 tracking-tight">{currentModule.title}</h2>
                <p className="text-white/80 font-medium mb-1 italic">{currentModule.scripture}</p>
                <p className="text-white/70 text-sm max-w-xl">{currentModule.description}</p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-sm font-semibold transition-colors">
                  <Download className="w-4 h-4" /> PDF
                </button>
                <Link href={`/admin/crosspoints/modules/${currentModule.week_number}`} className="flex items-center gap-2 px-4 py-2 bg-[#12151C] text-[#BF0A30] rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors">
                  <Eye className="w-4 h-4" /> Preview
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20 text-sm text-white/70">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {crosspointCount} crosspoints receiving</span>
              <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {currentModule.discussion_questions?.length ?? 0} discussion questions</span>
              <span className="flex items-center gap-1.5"><Flame className="w-4 h-4" /> {currentModule.prayer_points?.length ?? 0} prayer points</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search modules..."
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize ${
                filter === f
                  ? 'bg-[#BF0A30] text-white'
                  : 'bg-[#12151C] border border-white/[0.06] text-white/50 hover:border-gray-300'
              }`}
            >
              {f === 'all' ? `All (${modules.length})` : f === 'published' ? `Published (${published})` : `Drafts (${drafts})`}
            </button>
          ))}
        </div>
      </div>

      {/* Modules List */}
      <div className="bg-[#12151C] rounded-2xl border border-white/[0.06] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No modules found</p>
            <p className="text-sm text-gray-400">Try adjusting the filter or search</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.map(module => {
              const expanded = expandedId === module.id;
              const statusCfg = STATUS_CONFIG[module.status] ?? STATUS_CONFIG.draft;
              const StatusIcon = statusCfg.icon;
              const isCurrent = module.week_number === currentWeek;
              const isPast = module.week_number < currentWeek;

              return (
                <div key={module.id} className={`${isCurrent ? 'bg-red-900/5' : ''}`}>
                  <div
                    className="flex items-start gap-4 p-5 hover:bg-[#0A0C10] cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expanded ? null : module.id)}
                  >
                    {/* Week badge */}
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-sm flex-shrink-0 ${
                      isCurrent ? 'bg-[#BF0A30] text-white shadow-lg shadow-[#BF0A30]/25' :
                      isPast    ? 'bg-green-900/30 text-green-400' :
                                  'bg-[#2A2A2A] text-white/50'
                    }`}>
                      <span className="text-[10px] font-semibold opacity-70">WK</span>
                      <span className="text-lg leading-none">{module.week_number}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-white">{module.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${statusCfg.bg} ${statusCfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#BF0A30] text-white">Current Week</span>
                        )}
                      </div>
                      <p className="text-sm text-[#BF0A30] font-medium mb-1">{module.scripture}</p>
                      <p className="text-sm text-gray-500 truncate">{module.description}</p>
                      {module.published_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Published {new Date(module.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}{crosspointCount} crosspoints
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <Link
                        href={`/admin/crosspoints/modules/${module.week_number}`}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/crosspoints/modules/${module.week_number}/edit`}
                        className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/[0.08] rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === module.id ? null : module.id)}
                          className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/[0.08] rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenu === module.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-[#1E1E1E] border border-white/[0.06] rounded-xl shadow-xl z-10 py-1 overflow-hidden">
                            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:bg-white/[0.06]">
                              <Download className="w-4 h-4" /> Download PDF
                            </button>
                            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-white/70 hover:bg-white/[0.06]">
                              <Copy className="w-4 h-4" /> Duplicate
                            </button>
                            {module.status === 'draft' && (
                              <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-green-600 hover:bg-green-900/20">
                                <Globe className="w-4 h-4" /> Publish Now
                              </button>
                            )}
                            <div className="my-1 h-px bg-gray-100" />
                            <button className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-900/20">
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        {expanded
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Preview */}
                  {expanded && (
                    <div className="px-5 pb-5 border-t border-white/[0.04] bg-white/[0.02]">
                      <div className="pt-4 grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lesson Content</h4>
                          <p className="text-sm text-white/70 leading-relaxed line-clamp-4">{module.content}</p>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Discussion Questions</h4>
                            <ul className="space-y-1.5">
                              {(module.discussion_questions ?? []).slice(0, 3).map((q: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                                  <span className="w-4 h-4 bg-[#BF0A30] text-white text-[9px] font-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                                  <span className="line-clamp-2">{q}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Prayer Points</h4>
                            <ul className="space-y-1">
                              {(module.prayer_points ?? []).map((p: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                                  <span className="text-[#BF0A30]">&#8226;</span>
                                  <span className="line-clamp-1">{p}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button className="btn btn-secondary btn-sm gap-1.5">
                          <Download className="w-3.5 h-3.5" /> Download PDF
                        </button>
                        <Link href={`/admin/crosspoints/modules/${module.week_number}`} className="btn btn-primary btn-sm gap-1.5">
                          <ArrowUpRight className="w-3.5 h-3.5" /> View Full Module
                        </Link>
                        {module.status === 'draft' && (
                          <button className="btn btn-sm gap-1.5 bg-green-600 text-white hover:bg-green-700 ml-auto">
                            <Globe className="w-3.5 h-3.5" /> Publish to All Crosspoints
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add more prompt */}
      <div className="mt-6 p-6 bg-[#12151C] rounded-2xl border-2 border-dashed border-white/[0.06] text-center hover:border-[#BF0A30]/40 transition-colors">
        <div className="w-12 h-12 bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Plus className="w-6 h-6 text-[#BF0A30]" />
        </div>
        <h3 className="font-bold text-white mb-1">Add More Modules</h3>
        <p className="text-sm text-gray-500 mb-4">Create weekly study materials and publish them to all {crosspointCount} crosspoints at once</p>
        <Link href="/admin/crosspoints/modules/new" className="btn btn-primary gap-2">
          <Plus className="w-4 h-4" /> Create New Module
        </Link>
      </div>
    </AdminLayout>
  );
}
