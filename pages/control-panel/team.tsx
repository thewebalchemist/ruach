// pages/control-panel/team.tsx
// Team member management — admin/pastor only.
// Create accounts for media team, teachers, leaders, pastors.
import { useEffect, useState } from 'react';
import {
  UserPlus, Loader2, X, CheckCircle, AlertCircle,
  Eye, EyeOff, Copy, Check, Shield, Users, ChevronDown,
} from 'lucide-react';
import CPLayout from '@/components/control-panel/CPLayout';
import { supabase } from '@/lib/supabase';

type StaffRole = 'admin' | 'pastor' | 'media' | 'teacher' | 'leader';
type Status    = 'active' | 'pending' | 'suspended' | 'inactive';

interface TeamMember {
  id:         string;
  email:      string;
  first_name: string;
  last_name:  string;
  role:       StaffRole;
  status:     Status;
}

const ROLE_META: Record<StaffRole, { label: string; color: string; bg: string }> = {
  admin:   { label: 'Admin',      color: '#BF0A30', bg: '#BF0A3018' },
  pastor:  { label: 'Pastor',     color: '#D4AF37', bg: '#D4AF3718' },
  media:   { label: 'Media Team', color: '#7C3AED', bg: '#7C3AED18' },
  teacher: { label: 'Teacher',    color: '#0891B2', bg: '#0891B218' },
  leader:  { label: 'Leader',     color: '#10B981', bg: '#10B98118' },
};

const INVITABLE_ROLES: { value: StaffRole; label: string; desc: string }[] = [
  { value: 'media',   label: 'Media Team', desc: 'Manages sermons, series, events & live stream' },
  { value: 'teacher', label: 'Teacher',    desc: 'Leads Connect Class & Discipleship cohorts' },
  { value: 'leader',  label: 'Leader',     desc: 'Church administrative leader' },
  { value: 'pastor',  label: 'Pastor',     desc: 'Full admin access — for senior church leaders' },
];

const inp = "w-full px-3 py-2.5 bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF0A30]";
const lbl = "block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1.5";

interface Credentials { email: string; password: string; loginUrl: string; }

export default function TeamPage() {
  const [loading,  setLoading]  = useState(true);
  const [members,  setMembers]  = useState<TeamMember[]>([]);
  const [filter,   setFilter]   = useState<StaffRole | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [creds,    setCreds]    = useState<Credentials | null>(null);

  // Invite form state
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [role,      setRole]      = useState<StaffRole>('media');
  const [inviting,  setInviting]  = useState(false);
  const [inviteErr, setInviteErr] = useState('');

  // Credential display
  const [showPwd, setShowPwd] = useState(false);
  const [copied,  setCopied]  = useState<'email' | 'password' | null>(null);

  // Auth + role gating handled centrally by CPLayout (allow=admin,pastor).
  useEffect(() => { loadMembers(); }, []);

  async function loadMembers() {
    const { data } = await (supabase as any)
      .from('profiles')
      .select('id, email, first_name, last_name, role, status')
      .in('role', ['admin', 'pastor', 'media', 'teacher', 'leader'])
      .order('role')
      .order('last_name');
    setMembers((data || []) as TeamMember[]);
    setLoading(false);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteErr(''); setInviting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/control-panel/invite-member', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ firstName, lastName, email, role }),
      });

      const json = await res.json();
      if (!res.ok) { setInviteErr(json.error ?? 'Something went wrong'); return; }

      setCreds(json.credentials);
      setShowForm(false);
      resetForm();
      loadMembers();
    } catch {
      setInviteErr('Network error. Please try again.');
    } finally {
      setInviting(false);
    }
  }

  function resetForm() {
    setFirstName(''); setLastName(''); setEmail(''); setRole('media'); setInviteErr('');
  }

  async function updateRole(memberId: string, newRole: StaffRole) {
    await (supabase as any).from('profiles').update({ role: newRole }).eq('id', memberId);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
  }

  async function updateStatus(memberId: string, newStatus: Status) {
    await (supabase as any).from('profiles').update({ status: newStatus }).eq('id', memberId);
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, status: newStatus } : m));
  }

  function copyToClipboard(text: string, type: 'email' | 'password') {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  const STAFF_ROLES: StaffRole[] = ['admin', 'pastor', 'media', 'teacher', 'leader'];
  const displayed = filter === 'all' ? members : members.filter(m => m.role === filter);

  const roleCounts = STAFF_ROLES.reduce((acc, r) => {
    acc[r] = members.filter(m => m.role === r).length;
    return acc;
  }, {} as Record<StaffRole, number>);

  return (
    <CPLayout
      title="Team Members"
      subtitle="Manage who has access to the control panel and church admin"
      allow={['admin', 'pastor']}
      actions={
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white text-sm font-semibold rounded-xl hover:bg-[#A00828] transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      }
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Role stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {STAFF_ROLES.map(r => {
              const meta = ROLE_META[r];
              return (
                <button
                  key={r}
                  onClick={() => setFilter(prev => prev === r ? 'all' : r)}
                  className={`flex flex-col gap-1 p-4 rounded-2xl border transition-all text-left ${
                    filter === r
                      ? 'border-transparent shadow-sm'
                      : 'bg-white dark:bg-[#1A1A1A] border-gray-100 dark:border-[#2A2A2A] hover:border-gray-200 dark:hover:border-[#333]'
                  }`}
                  style={filter === r ? { background: meta.bg, borderColor: meta.color + '30' } : {}}
                >
                  <p className="text-2xl font-black" style={{ color: meta.color }}>{roleCounts[r]}</p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{meta.label}</p>
                </button>
              );
            })}
          </div>

          {/* Member list */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  {filter === 'all' ? 'All Members' : ROLE_META[filter].label}
                  <span className="ml-2 text-gray-400 font-normal">({displayed.length})</span>
                </h2>
              </div>
              {filter !== 'all' && (
                <button onClick={() => setFilter('all')} className="text-xs text-[#BF0A30] hover:underline">Clear filter</button>
              )}
            </div>

            {displayed.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No team members found.</p>
                <button onClick={() => setShowForm(true)} className="mt-2 text-sm text-[#BF0A30] font-medium hover:underline">
                  Invite your first team member →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-[#222]">
                {displayed.map(member => {
                  const meta = ROLE_META[member.role];
                  const initials = (member.first_name[0] ?? '') + (member.last_name[0] ?? '');
                  return (
                    <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: meta.bg, color: meta.color }}
                      >
                        {initials.toUpperCase() || '?'}
                      </div>

                      {/* Name + email */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{member.email}</p>
                      </div>

                      {/* Status badge */}
                      <span className={`hidden sm:inline-flex px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                        member.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {member.status}
                      </span>

                      {/* Role selector */}
                      <div className="relative hidden md:flex">
                        <select
                          value={member.role}
                          onChange={e => updateRole(member.id, e.target.value as StaffRole)}
                          className="appearance-none text-xs font-semibold px-3 py-1.5 pr-6 rounded-lg border transition-colors cursor-pointer focus:outline-none"
                          style={{
                            background:  meta.bg,
                            color:       meta.color,
                            borderColor: meta.color + '30',
                          }}
                        >
                          {STAFF_ROLES.map(r => (
                            <option key={r} value={r}>{ROLE_META[r].label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: meta.color }} />
                      </div>

                      {/* Suspend / restore */}
                      {member.status === 'active' ? (
                        <button
                          onClick={() => {
                            if (confirm(`Suspend ${member.first_name}? They will lose access to the control panel.`)) {
                              updateStatus(member.id, 'suspended');
                            }
                          }}
                          className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors flex-shrink-0"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => updateStatus(member.id, 'active')}
                          className="text-xs text-gray-400 hover:text-green-500 font-medium transition-colors flex-shrink-0"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Invite modal ────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowForm(false); resetForm(); }} />
          <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#BF0A30]/10 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-[#BF0A30]" />
                </div>
                <h2 className="font-bold text-gray-900 dark:text-white">Invite Team Member</h2>
              </div>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222] text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="Julian" className={inp} />
                </div>
                <div>
                  <label className={lbl}>Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} required placeholder="Kyula" className={inp} />
                </div>
              </div>

              <div>
                <label className={lbl}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@ruachtabernacle.org" className={inp} />
              </div>

              <div>
                <label className={lbl}>Role &amp; Access Level</label>
                <div className="space-y-2">
                  {INVITABLE_ROLES.map(({ value, label, desc }) => {
                    const meta = ROLE_META[value];
                    return (
                      <label
                        key={value}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          role === value
                            ? 'border-transparent'
                            : 'border-gray-100 dark:border-[#2A2A2A] hover:border-gray-200 dark:hover:border-[#333]'
                        }`}
                        style={role === value ? { background: meta.bg, borderColor: meta.color + '40' } : {}}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={value}
                          checked={role === value}
                          onChange={() => setRole(value)}
                          className="mt-0.5 flex-shrink-0 accent-[#BF0A30]"
                        />
                        <div>
                          <p className="text-sm font-semibold" style={{ color: role === value ? meta.color : undefined }}>{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {inviteErr && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{inviteErr}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={inviting} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#BF0A30] hover:bg-[#A00828] disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
                  {inviting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2.5 border border-gray-200 dark:border-[#333] text-sm font-medium text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center">
                A temporary password will be generated. Share it securely with the team member — they can change it via Forgot Password.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ── Credentials display ─────────────────────────────────────────────── */}
      {creds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 pt-6 pb-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">Account Created</h2>
              <p className="text-sm text-gray-500 text-center mb-6">Share these credentials securely with the team member.</p>

              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{creds.email}</p>
                    <button onClick={() => copyToClipboard(creds.email, 'email')} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#222] text-gray-400 hover:text-gray-700 transition-colors">
                      {copied === 'email' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Temporary Password</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {showPwd ? creds.password : '•'.repeat(creds.password.length)}
                    </p>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setShowPwd(p => !p)} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#222] text-gray-400 transition-colors">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => copyToClipboard(creds.password, 'password')} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-[#222] text-gray-400 hover:text-gray-700 transition-colors">
                        {copied === 'password' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3">
                  <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    This password is shown once. The member can change it by clicking <strong>Forgot Password</strong> on the login page.
                  </p>
                </div>

                <p className="text-xs text-center text-gray-400">Login at: <span className="font-semibold">{creds.loginUrl}</span></p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button onClick={() => setCreds(null)} className="w-full py-2.5 bg-[#BF0A30] hover:bg-[#A00828] text-white text-sm font-semibold rounded-xl transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </CPLayout>
  );
}
