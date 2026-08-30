// pages/member/departments.tsx
// Member-facing: browse serving departments, see your own memberships, request to join others

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, Heart, CheckCircle, Clock, Send, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Department { id: string; name: string; description: string | null }
interface Membership { department_id: string; role: string; status: string }
interface JoinRequest { department_id: string; status: string }

export default function MemberDepartmentsPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const [deptRes, membershipRes, requestRes] = await Promise.all([
      supabase.from('departments').select('id, name, description').order('name'),
      supabase.from('department_memberships').select('department_id, role, status').eq('user_id', profile.id),
      supabase.from('department_join_requests').select('department_id, status').eq('user_id', profile.id).eq('status', 'pending'),
    ]);
    setDepartments(deptRes.data ?? []);
    setMemberships(membershipRes.data ?? []);
    setRequests(requestRes.data ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/member/login'); return; }
    load();
  }, [authLoading, profile, router, load]);

  async function submitRequest(deptId: string) {
    if (!profile) return;
    setSubmitting(true);
    await supabase.from('department_join_requests').insert({
      user_id: profile.id, department_id: deptId, message: message.trim() || null,
    });
    setSubmitting(false);
    setRequestingId(null);
    setMessage('');
    load();
  }

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F0F2F5] dark:bg-[#080808]"><Loader2 className="w-8 h-8 animate-spin text-[#BF0A30]" /></div>;
  }

  const myActiveIds = new Set(memberships.filter(m => m.status === 'active').map(m => m.department_id));
  const pendingIds = new Set(requests.map(r => r.department_id));
  const myDepartments = departments.filter(d => myActiveIds.has(d.id));
  const otherDepartments = departments.filter(d => !myActiveIds.has(d.id));

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#111]/98 backdrop-blur-xl border-b border-gray-200/80 dark:border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/member" className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"><ArrowLeft className="w-4 h-4" /></Link>
          <p className="font-black text-gray-900 dark:text-white text-sm">Serving Departments</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {myDepartments.length > 0 && (
          <div>
            <h2 className="section-title mb-3">Your Departments</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {myDepartments.map(d => {
                const m = memberships.find(x => x.department_id === d.id);
                return (
                  <Link key={d.id} href={`/department/${d.id}`} className="flex items-center gap-3 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-green-200 dark:border-green-900/40 p-4 hover:border-green-400 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{d.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{m?.role}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="section-title mb-3">All Departments</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {otherDepartments.map(d => {
              const isPending = pendingIds.has(d.id);
              return (
                <div key={d.id} className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{d.name}</p>
                      {d.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{d.description}</p>}
                    </div>
                  </div>
                  {isPending ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600"><Clock className="w-3.5 h-3.5" />Request Pending</span>
                  ) : (
                    <button onClick={() => setRequestingId(d.id)} className="text-xs font-bold text-[#BF0A30] hover:underline">Request to Join</button>
                  )}
                </div>
              );
            })}
            {otherDepartments.length === 0 && myDepartments.length === 0 && (
              <p className="text-sm text-gray-500 col-span-full text-center py-8">No departments available yet</p>
            )}
          </div>
        </div>
      </main>

      {requestingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Request to Join {departments.find(d => d.id === requestingId)?.name}</h3>
              <button onClick={() => { setRequestingId(null); setMessage(''); }} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <textarea
              rows={3}
              placeholder="Tell the department leader why you'd like to join (optional)"
              className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white resize-none mb-4"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button
              onClick={() => submitRequest(requestingId)}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white rounded-lg text-sm font-bold hover:bg-[#A0021F] disabled:opacity-50"
            >
              <Send className="w-4 h-4" />{submitting ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
