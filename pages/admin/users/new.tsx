// pages/admin/users/new.tsx
// Admin: Create new teachers, leaders, HoDs with full details

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle, Loader2,
  Eye, EyeOff, UserPlus,
} from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';

type UserRole = 'teacher' | 'leader' | 'admin' | 'pastor';

interface NewUserForm {
  firstName:    string;
  lastName:     string;
  email:        string;
  phone:        string;
  role:         UserRole;
  gender:       string;
  dateOfBirth:  string;
  branch:       string;
  crosspointId: string;
  departmentId: string;
  sendWelcome:  boolean;
}

interface Credentials {
  email: string;
  password: string;
  loginUrl: string;
}

interface Option { id: string; name: string; area?: string }

const ROLE_CONFIG: Record<UserRole, { label: string; description: string; color: string; bg: string }> = {
  teacher: {
    label: 'Teacher',
    description: 'Can manage Connect and Discipleship cohorts, students, exams, and attendance',
    color: 'text-blue-600',
    bg:    'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  },
  leader: {
    label: 'Leader / HoD',
    description: 'Can lead a Crosspoint, department, or ministry area. Has access to leader dashboards',
    color: 'text-purple-600',
    bg:    'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  },
  admin: {
    label: 'Admin',
    description: 'Full access to all sections. Can create users, manage all programs and view all data',
    color: 'text-[#BF0A30]',
    bg:    'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  },
  pastor: {
    label: 'Pastor / Senior Leader',
    description: 'Highest-level access. Full authority across the entire platform',
    color: 'text-amber-600',
    bg:    'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  },
};

const BRANCHES = [
  { id: 'ruach-tabernacle', label: 'Ruach Tabernacle (Main)' },
  { id: 'ruach-east',       label: 'Ruach East' },
  { id: 'ruach-west',       label: 'Ruach West' },
  { id: 'ruach-south',      label: 'Ruach South' },
  { id: 'ruach-rivers',     label: 'Ruach Rivers' },
];

// Rejection-sampled so every character of `set` has exactly equal probability
// (a plain `% set.length` on a crypto-random byte would bias toward the
// low end of the set whenever set.length doesn't divide 256 evenly).
function secureRandomIndex(max: number): number {
  const bytes = new Uint8Array(1);
  const limit = 256 - (256 % max);
  let byte: number;
  do {
    crypto.getRandomValues(bytes);
    byte = bytes[0];
  } while (byte >= limit);
  return byte % max;
}

function generateTempPassword(): string {
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower  = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const syms   = '!@#';
  const all    = upper + lower + digits + syms;
  const rand   = (set: string) => set[secureRandomIndex(set.length)];
  const base   = Array.from({ length: 12 }, () => rand(all));
  // Guarantee at least one of each class
  base[0] = rand(upper);
  base[1] = rand(lower);
  base[2] = rand(digits);
  base[3] = rand(syms);
  // Fisher-Yates shuffle with crypto-secure randomness (unlike
  // `sort(() => Math.random() - 0.5)`, which is both weak and biased).
  for (let i = base.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [base[i], base[j]] = [base[j], base[i]];
  }
  return base.join('');
}

export default function CreateUserPage() {
  const [pageLoading, setPageLoading] = useState(true);
  const [crosspoints, setCrosspoints] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [form, setForm] = useState<NewUserForm>({
    firstName: '', lastName: '', email: '', phone: '',
    role: 'teacher', gender: '', dateOfBirth: '',
    branch: 'ruach-tabernacle', crosspointId: '', departmentId: '',
    sendWelcome: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [credentials,  setCredentials]  = useState<Credentials | null>(null);
  const [errors,       setErrors]       = useState<Partial<Record<keyof NewUserForm, string>>>({});
  const [apiError,     setApiError]     = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('crosspoints').select('id, name, area').eq('status', 'active').order('name'),
      supabase.from('departments').select('id, name').order('name'),
    ]).then(([cpRes, deptRes]) => {
      setCrosspoints(cpRes.data ?? []);
      setDepartments(deptRes.data ?? []);
      setPageLoading(false);
    });
  }, []);

  function update(field: keyof NewUserForm, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    setApiError('');
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof NewUserForm, string>> = {};
    if (!form.firstName.trim())  newErrors.firstName = 'First name is required';
    if (!form.lastName.trim())   newErrors.lastName  = 'Last name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Valid email is required';
    if (form.phone && !/^\+?[\d\s\-()]{10,}$/.test(form.phone))
      newErrors.phone = 'Enter a valid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleCreate() {
    if (!validate()) return;
    setSaving(true);
    setApiError('');

    const tempPassword = generateTempPassword();
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch('/api/admin/create-staff-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ ...form, tempPassword }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setApiError(body.error ?? 'Failed to create account.');
      return;
    }
    setCredentials({ email: form.email, password: tempPassword, loginUrl: '/auth/login' });
    setSuccess(true);
  }

  if (pageLoading) {
    return (
      <AdminLayout title="Create User">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#BF0A30] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (success && credentials) {
    return (
      <AdminLayout title="User Created">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
            Account Created!
          </h1>
          <p className="text-gray-500 mb-1">
            <strong className="text-white/70">{form.firstName} {form.lastName}</strong> has been added as a <strong className="text-[#BF0A30]">{ROLE_CONFIG[form.role].label}</strong>
          </p>
          {form.sendWelcome && (
            <p className="text-sm text-gray-500 mb-8">
              A welcome email with login instructions has been sent to <span className="font-medium">{form.email}</span>
            </p>
          )}

          <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2D2D2D] rounded-xl p-5 mb-8 text-left">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Login Credentials</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-white">{credentials.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Temp. Password</span>
                <span className="font-mono text-white">{credentials.password}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Role</span>
                <span className={`font-semibold capitalize ${ROLE_CONFIG[form.role].color}`}>{ROLE_CONFIG[form.role].label}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/members" className="btn btn-secondary flex-1">View All Users</Link>
            <button onClick={() => { setSuccess(false); setCredentials(null); setForm({ firstName: '', lastName: '', email: '', phone: '', role: 'teacher', gender: '', dateOfBirth: '', branch: 'ruach-tabernacle', crosspointId: '', departmentId: '', sendWelcome: true }); }}
              className="btn btn-primary flex-1 gap-2">
              <UserPlus className="w-4 h-4" /> Create Another
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Create User">
      <div className="max-w-3xl mx-auto">
        <PageHeader title="Create New User" subtitle="Add a teacher, leader, or admin to the platform" />

        {apiError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4 text-sm text-red-700 dark:text-red-300">{apiError}</div>
        )}

        <div className="space-y-6">

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="section-title mb-1">User Role</h2>
            <p className="text-sm text-gray-500 mb-4">Select the appropriate role — this determines what the user can access</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(ROLE_CONFIG) as [UserRole, typeof ROLE_CONFIG[UserRole]][]).map(([key, cfg]) => (
                <button key={key} onClick={() => update('role', key)}
                  className={`p-4 text-left border-2 rounded-xl transition-all ${
                    form.role === key ? cfg.bg + ' border-current ' + cfg.color : 'border-white/[0.06] hover:border-white/10 dark:hover:border-[#3D3D3D]'
                  }`}>
                  <p className={`font-bold text-sm mb-1 ${form.role === key ? cfg.color : 'text-white'}`}>{cfg.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{cfg.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="section-title mb-4">Personal Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">First Name<span className="required">*</span></label>
                <input value={form.firstName} onChange={e => update('firstName', e.target.value)}
                  placeholder="John" className={`input ${errors.firstName ? 'error' : ''}`} />
                {errors.firstName && <p className="form-error">{errors.firstName}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name<span className="required">*</span></label>
                <input value={form.lastName} onChange={e => update('lastName', e.target.value)}
                  placeholder="Kamau" className={`input ${errors.lastName ? 'error' : ''}`} />
                {errors.lastName && <p className="form-error">{errors.lastName}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select value={form.gender} onChange={e => update('gender', e.target.value)} className="select">
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} className="input" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="section-title mb-4">Contact & Login</h2>
            <p className="text-sm text-gray-500 mb-4">A secure password will be generated automatically by the server</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Email Address<span className="required">*</span></label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  placeholder="name@example.com" className={`input ${errors.email ? 'error' : ''}`} />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="flex">
                  <div className="phone-prefix"><span>+254</span></div>
                  <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                    placeholder="7XX XXX XXX" className={`input phone-input ${errors.phone ? 'error' : ''}`} />
                </div>
                {errors.phone && <p className="form-error">{errors.phone}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="section-title mb-4">Church Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select value={form.branch} onChange={e => update('branch', e.target.value)} className="select">
                  {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </div>

              {(form.role === 'leader') && (
                <div className="form-group">
                  <label className="form-label">Assigned Crosspoint</label>
                  <select value={form.crosspointId} onChange={e => update('crosspointId', e.target.value)} className="select">
                    <option value="">No crosspoint (yet)</option>
                    {crosspoints.map(cp => (
                      <option key={cp.id} value={cp.id}>{cp.name} — {cp.area}</option>
                    ))}
                  </select>
                </div>
              )}

              {(['teacher', 'leader'].includes(form.role)) && (
                <div className="form-group">
                  <label className="form-label">Department / Ministry</label>
                  <select value={form.departmentId} onChange={e => update('departmentId', e.target.value)} className="select">
                    <option value="">Select department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-semibold text-white text-sm">Send Welcome Email</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Send login credentials and a welcome message to <span className="font-medium">{form.email || 'the new user'}</span>
                </p>
              </div>
              <div
                onClick={() => update('sendWelcome', !form.sendWelcome)}
                className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${form.sendWelcome ? 'bg-[#BF0A30]' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-[#12151C] rounded-full shadow transition-transform ${form.sendWelcome ? 'translate-x-7' : 'translate-x-1'}`} />
              </div>
            </label>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/members" className="btn btn-secondary flex-1">Cancel</Link>
            <button onClick={handleCreate} disabled={saving} className="btn btn-primary flex-1 gap-2">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                : <><UserPlus className="w-4 h-4" /> Create {ROLE_CONFIG[form.role].label}</>}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
