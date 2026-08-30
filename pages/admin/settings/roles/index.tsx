// pages/admin/settings/roles/index.tsx
// Roles & Permissions — list view. Gated by the 'settings.manage' permission
// itself (see AuthContext.hasPermission), not hardwired to any specific role —
// role-management is itself a delegable capability (Batch 3 design goal).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plus, Shield, Lock, Loader2, Users } from 'lucide-react';
import { AdminLayout, PageHeader, EmptyState } from '@/components/connect/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  permissionCount: number;
  memberCount: number;
}

export default function RolesListPage() {
  const router = useRouter();
  const { loading: authLoading, hasPermission } = useAuth();
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  async function authedFetch(path: string, init?: RequestInit) {
    const { data: { session } } = await supabase.auth.getSession();
    return fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  }

  async function loadRoles() {
    setLoading(true);
    const res = await authedFetch('/api/admin/roles');
    if (res.ok) {
      const data = await res.json();
      setRoles(data.roles);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (authLoading) return;
    if (!hasPermission('settings', 'manage')) { setLoading(false); return; }
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  async function createRole(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await authedFetch('/api/admin/roles', { method: 'POST', body: JSON.stringify({ name: newName }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Failed to create role'); return; }
    setCreating(false);
    setNewName('');
    router.push(`/admin/settings/roles/${data.id}`);
  }

  if (!authLoading && !hasPermission('settings', 'manage')) {
    return (
      <AdminLayout title="Roles & Permissions">
        <EmptyState icon={<Lock className="w-10 h-10" />} title="No access"
          description="You don't have permission to manage roles. Ask a super admin to grant it." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Roles & Permissions" description="Control which admin modules each role can access">
      <PageHeader
        title="Roles & Permissions"
        subtitle="Define roles and choose exactly which modules and actions each one grants"
        actions={
          <button onClick={() => setCreating(true)} className="btn btn-primary gap-2">
            <Plus className="w-4 h-4" /> New Role
          </button>
        }
      />

      {creating && (
        <form onSubmit={createRole} className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6 flex gap-3 items-start">
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Role name, e.g. Finance Officer" className="input flex-1" required />
          <button type="submit" className="btn btn-primary">Create</button>
          <button type="button" onClick={() => { setCreating(false); setError(''); }} className="btn btn-secondary">Cancel</button>
        </form>
      )}
      {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : roles.length === 0 ? (
        <EmptyState icon={<Shield className="w-10 h-10" />} title="No roles yet"
          description="Create your first role to start granting scoped admin access." />
      ) : (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] divide-y divide-gray-100 dark:divide-[#2D2D2D]">
          {roles.map(role => (
            <Link key={role.id} href={`/admin/settings/roles/${role.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#BF0A30]/10 flex items-center justify-center text-[#BF0A30] flex-shrink-0">
                  {role.isSystemRole ? <Lock className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    {role.name}
                    {role.isSystemRole && <span className="text-[10px] uppercase tracking-wide text-gray-400 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5">System</span>}
                  </p>
                  {role.description && <p className="text-sm text-gray-500">{role.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500 flex-shrink-0">
                <span>{role.permissionCount} permission{role.permissionCount === 1 ? '' : 's'}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {role.memberCount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
