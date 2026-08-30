import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, MapPin, Calendar, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

interface CrosspointRow {
  id: string; name: string; area: string; status: string;
  member_count: number; max_members: number; meeting_day: string | null; meeting_time: string | null;
  profiles: { first_name: string; last_name: string } | null;
}

export default function CrosspointsPage() {
  const [search, setSearch] = useState('');
  const [crosspoints, setCrosspoints] = useState<CrosspointRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('crosspoints')
      .select('id, name, area, status, member_count, max_members, meeting_day, meeting_time, profiles!leader_id(first_name, last_name)')
      .order('name');
    setCrosspoints((data as any) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = crosspoints.filter(cp =>
    `${cp.name} ${cp.area}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Crosspoints">
      <PageHeader title="Crosspoints" subtitle={`${crosspoints.length} home churches`}
        actions={<Link href="/admin/crosspoints/new" className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg"><Plus className="w-4 h-4" />Create</Link>} />

      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cp) => (
          <div key={cp.id} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <div className="flex justify-between mb-3">
              <div><h3 className="font-semibold">{cp.name}</h3><p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{cp.area}</p></div>
              <span className={`h-fit px-2 py-0.5 text-xs font-medium rounded-full ${cp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{cp.status}</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{cp.member_count}/{cp.max_members} members</p>
            {cp.meeting_day && <p className="text-sm text-gray-500 flex items-center gap-1 mb-4"><Calendar className="w-3 h-3" />{cp.meeting_day}s {cp.meeting_time}</p>}
            {cp.profiles && <p className="text-sm text-gray-500 mb-4">Leader: {cp.profiles.first_name} {cp.profiles.last_name}</p>}
            <Link href={`/admin/crosspoints/${cp.id}`} className="block w-full text-center px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">View Details</Link>
          </div>
        ))}
        {filtered.length === 0 && <p className="col-span-full text-center text-gray-500 py-12">No crosspoints found</p>}
      </div>
      )}
    </AdminLayout>
  );
}
