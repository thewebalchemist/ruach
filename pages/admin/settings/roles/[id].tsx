// pages/admin/settings/roles/[id].tsx
// Edit one role: name/description, the permission matrix, and who holds it.
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Trash2, UserPlus, X } from 'lucide-react';
import { AdminLayout } from '@/components/connect/AdminLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Permission { id: string; moduleKey: string; action: string; description: string; }
interface Member { grantId: string; userId: string; departmentId: string | null; name: string; email: string; grantedAt: string; }
interface Department { id: string; name: string; }
interface UserSearchResult { id: string; name: string; email: string; }

export default function RoleDetailPage() {
  const router = useRouter();
  const roleId = router.query.id as string | undefined;
  const { hasPermission } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSystemRole, setIsSystemRole] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [members, setMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [assignQuery, setAssignQuery] = useState('');
  const [assignResults, setAssignResults] = useState<UserSearchResult[]>([]);
  const [assignDept, setAssignDept] = useState('');
  const [showAssign, setShowAssign] = useState(false);

  const authedFetch = useCallback(async (path: string, init?: RequestInit) => {
    const { data: { session } } = await supabase.auth.getSession();
    return fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
        ...(init?.headers ?? {}),
      },
    });
  }, []);

  const load = useCallback(async () => {
    if (!roleId) return;
    setLoading(true);
    const [roleRes, permsRes, deptRes] = await Promise.all([
      authedFetch(`/api/admin/roles/${roleId}`),
      authedFetch('/api/admin/permissions'),
      supabase.from('departments').select('id, name').order('name'),
    ]);

    if (roleRes.ok) {
      const data = await roleRes.json();
      setName(data.role.name);
      setDescription(data.role.description ?? '');
      setIsSystemRole(data.role.isSystemRole);
      setSelectedIds(new Set(data.permissionIds));
      setMembers(data.members);
    } else {
      setError('Role not found');
    }
    if (permsRes.ok) {
      const data = await permsRes.json();
      setAllPermissions(data.permissions);
    }
    if (deptRes.data) setDepartments(deptRes.data);
    setLoading(false);
  }, [roleId, authedFetch]);

  useEffect(() => { load(); }, [load]);

  async function saveDetails() {
    setSaving(true); setError(''); setNotice('');
    const res = await authedFetch(`/api/admin/roles/${roleId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name, description }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to save'); return; }
    setNotice('Saved');
  }

  async function savePermissions() {
    setSaving(true); setError(''); setNotice('');
    const res = await authedFetch(`/api/admin/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissionIds: Array.from(selectedIds) }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.error ?? 'Failed to save permissions'); return; }
    setNotice('Permissions updated');
  }

  async function deleteRole() {
    if (!confirm(`Delete the "${name}" role? This revokes it from everyone who holds it.`)) return;
    const res = await authedFetch(`/api/admin/roles/${roleId}`, { method: 'DELETE' });
    if (res.ok) router.push('/admin/settings/roles');
    else { const d = await res.json(); setError(d.error ?? 'Failed to delete role'); }
  }

  function toggle(permId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(permId) ? next.delete(permId) : next.add(permId);
      return next;
    });
  }

  function toggleModule(moduleKey: string, permIds: string[], allSelected: boolean) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      permIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  }

  async function searchUsers(q: string) {
    setAssignQuery(q);
    if (q.trim().length < 2) { setAssignResults([]); return; }
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(8);
    setAssignResults((data ?? []).map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}`.trim(), email: u.email })));
  }

  async function assignUser(userId: string) {
    const res = await authedFetch(`/api/admin/roles/${roleId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ userId, departmentId: assignDept || null }),
    });
    if (res.ok) {
      setShowAssign(false); setAssignQuery(''); setAssignResults([]); setAssignDept('');
      load();
    } else {
      const d = await res.json(); setError(d.error ?? 'Failed to assign role');
    }
  }

  async function revoke(grantId: string) {
    const res = await authedFetch(`/api/admin/roles/${roleId}/assign?grantId=${grantId}`, { method: 'DELETE' });
    if (res.ok) load();
  }

  if (!hasPermission('settings', 'manage')) {
    return <AdminLayout title="Roles & Permissions"><p className="text-gray-500">You don't have permission to view this.</p></AdminLayout>;
  }

  if (loading) {
    return <AdminLayout title="Roles & Permissions"><div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div></AdminLayout>;
  }

  const moduleGroups = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.moduleKey] ??= []).push(p);
    return acc;
  }, {});

  return (
    <AdminLayout title={name || 'Role'}>
      <Link href="/admin/settings/roles" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Roles & Permissions
      </Link>

      {error && <div className="alert alert-error text-sm mb-4">{error}</div>}
      {notice && <div className="alert alert-success text-sm mb-4">{notice}</div>}

      {/* Details */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5 mb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className="input" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button onClick={saveDetails} disabled={saving} className="btn btn-primary gap-2">
            <Save className="w-4 h-4" /> Save Details
          </button>
          {!isSystemRole && (
            <button onClick={deleteRole} className="btn btn-secondary text-red-600 gap-2">
              <Trash2 className="w-4 h-4" /> Delete Role
            </button>
          )}
        </div>
      </div>

      {/* Permission matrix */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Permissions</h3>
          <button onClick={savePermissions} disabled={saving} className="btn btn-primary btn-sm gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Permissions
          </button>
        </div>
        <div className="space-y-1">
          {Object.entries(moduleGroups).map(([moduleKey, perms]) => {
            const ids = perms.map(p => p.id);
            const allSelected = ids.every(id => selectedIds.has(id));
            return (
              <div key={moduleKey} className="flex items-start gap-4 py-2.5 border-b border-gray-100 dark:border-[#2D2D2D] last:border-0">
                <div className="w-36 flex-shrink-0 pt-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">
                    <input type="checkbox" checked={allSelected} onChange={() => toggleModule(moduleKey, ids, allSelected)} />
                    {moduleKey.replace('-', ' ')}
                  </label>
                </div>
                <div className="flex flex-wrap gap-3 flex-1">
                  {perms.map(p => (
                    <label key={p.id} title={p.description} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.04] rounded-lg px-2.5 py-1.5 cursor-pointer">
                      <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggle(p.id)} />
                      {p.action}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Members */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Who holds this role</h3>
          <button onClick={() => setShowAssign(s => !s)} className="btn btn-secondary btn-sm gap-2">
            <UserPlus className="w-3.5 h-3.5" /> Assign
          </button>
        </div>

        {showAssign && (
          <div className="bg-gray-50 dark:bg-white/[0.03] rounded-lg p-4 mb-4">
            <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-3">
              <input value={assignQuery} onChange={e => searchUsers(e.target.value)}
                placeholder="Search by name or email…" className="input" autoFocus />
              <select value={assignDept} onChange={e => setAssignDept(e.target.value)} className="input">
                <option value="">Churchwide</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {assignResults.length > 0 && (
              <div className="space-y-1">
                {assignResults.map(u => (
                  <button key={u.id} onClick={() => assignUser(u.id)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white dark:hover:bg-white/5 flex justify-between items-center text-sm">
                    <span className="text-gray-800 dark:text-gray-200">{u.name || u.email}</span>
                    <span className="text-gray-400">{u.email}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {members.length === 0 ? (
          <p className="text-sm text-gray-500">No one holds this role yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
            {members.map(m => (
              <div key={m.grantId} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{m.name || m.email}</p>
                  <p className="text-xs text-gray-500">
                    {m.departmentId ? departments.find(d => d.id === m.departmentId)?.name ?? m.departmentId : 'Churchwide'}
                  </p>
                </div>
                <button onClick={() => revoke(m.grantId)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
