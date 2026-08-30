import { useState, useEffect } from 'react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { passwordMeetsPolicy, PASSWORD_RULES } from '@/lib/password';
import { CheckCircle, User, Bell, BookOpen, Shield, Loader2 } from 'lucide-react';

type Section = 'profile' | 'defaults' | 'notifications' | 'security';

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth();

  const [section, setSection] = useState<Section>('profile');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved]   = useState(false);
  const [pwError, setPwError]   = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? '');
      setLastName(profile.last_name ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  async function saveProfile() {
    if (!profile) return;
    setSaving(true); setError(''); setSaved(false);
    const { error: updateErr } = await supabase.from('profiles').update({
      first_name: firstName, last_name: lastName, phone: phone || null,
    }).eq('id', profile.id);
    setSaving(false);
    if (updateErr) { setError(updateErr.message); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    refreshProfile();
  }

  async function updatePassword() {
    setPwError(''); setPwSaved(false);
    if (!passwordMeetsPolicy(newPassword)) { setPwError('Password does not meet requirements.'); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords don't match."); return; }
    setPwSaving(true);
    const { error: pwErr } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (pwErr) { setPwError(pwErr.message); return; }
    setNewPassword(''); setConfirmPassword('');
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 3000);
  }

  const SECTIONS: { key: Section; label: string; icon: typeof User }[] = [
    { key: 'profile',       label: 'Profile',           icon: User      },
    { key: 'defaults',      label: 'Cohort Defaults',   icon: BookOpen  },
    { key: 'notifications', label: 'Notifications',     icon: Bell      },
    { key: 'security',      label: 'Security',          icon: Shield    },
  ];

  return (
    <ConnectLayout title="Settings">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your teacher account and preferences</p>
        </div>
        {section === 'profile' && (
          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-xl hover:bg-[#A0021F] shadow-md shadow-[#BF0A30]/20 transition-colors disabled:opacity-50"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-2 shadow-sm h-fit">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                section === key
                  ? 'bg-gradient-to-r from-[#BF0A30] to-[#A0021F] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">

          {section === 'profile' && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-5">Profile Information</h2>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-white/[0.04]">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#BF0A30]/20">
                  {firstName[0]}{lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{firstName} {lastName}</p>
                  <p className="text-sm text-gray-500 capitalize">{profile?.role} {profile?.member_id ? `· ${profile.member_id}` : ''}</p>
                </div>
              </div>

              {error && <div className="alert alert-error text-sm mb-4">{error}</div>}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                  <input type="email" value={profile?.email ?? ''} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-100 dark:bg-white/5 text-sm text-gray-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
              </div>
            </div>
          )}

          {section === 'defaults' && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Cohort Defaults</h2>
              <p className="text-sm text-gray-500">
                Capacity and pass requirements are set per cohort when you create it (see "New Cohort"), rather than as
                a global default — there isn't a per-teacher default to store yet.
              </p>
            </div>
          )}

          {section === 'notifications' && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-500">
                Per-notification-type preferences aren't available yet — you'll see all in-app notifications for your
                cohorts (at-risk warnings, legacy requests, etc.) on the dashboard.
              </p>
            </div>
          )}

          {section === 'security' && (
            <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200/70 dark:border-white/[0.05] p-6 shadow-sm">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Security</h2>
              <p className="text-sm text-gray-500 mb-5">Set a new password for your account.</p>

              <div className="space-y-4 max-w-sm">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password" className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" />
                  <ul className="mt-2 space-y-0.5">
                    {PASSWORD_RULES.map(rule => (
                      <li key={rule.id} className={`text-xs ${rule.test(newPassword) ? 'text-green-500' : 'text-gray-400'}`}>
                        {rule.test(newPassword) ? '✓' : '○'} {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password" className="w-full px-4 py-2.5 border border-gray-200 dark:border-white/[0.06] rounded-xl bg-gray-50 dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
                {pwError && <div className="alert alert-error text-sm">{pwError}</div>}
                <button onClick={updatePassword} disabled={pwSaving || !newPassword || !confirmPassword}
                  className="px-6 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-xl hover:bg-[#A0021F] transition-colors disabled:opacity-50">
                  {pwSaving ? 'Updating…' : pwSaved ? '✓ Updated' : 'Update Password'}
                </button>

                <div className="pt-4 border-t border-gray-100 dark:border-white/[0.04]">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Account ID</p>
                  <p className="text-xs text-gray-400 font-mono">{profile?.id}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConnectLayout>
  );
}
