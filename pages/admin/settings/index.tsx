import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Save, Bell, Users, Home, Building2, Shield, Database, Loader2 } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, loading: authLoading, session } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state for general
  const [churchName, setChurchName] = useState('');
  const [churchLocation, setChurchLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Form state for members
  const [memberIdPrefix, setMemberIdPrefix] = useState('RT');
  const [legacyPrefix, setLegacyPrefix] = useState('RTL');
  const [requireConnect, setRequireConnect] = useState(true);

  // Form state for crosspoints
  const [maxCpMembers, setMaxCpMembers] = useState('15');
  const [minCpMembers, setMinCpMembers] = useState('5');
  const [requireTransferApproval, setRequireTransferApproval] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth/login?redirectTo=/admin/settings'); return; }
    if (!['admin', 'pastor'].includes(profile.role)) { router.push('/'); return; }
    loadSettings();
  }, [authLoading, profile]);

  async function loadSettings() {
    setLoading(true);
    const res = await fetch('/api/admin/settings', {
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.church_name) setChurchName(data.church_name);
      if (data.church_location) setChurchLocation(data.church_location);
      if (data.contact_email) setContactEmail(data.contact_email);
      if (data.contact_phone) setContactPhone(data.contact_phone);
      if (data.member_id_prefix) setMemberIdPrefix(data.member_id_prefix);
      if (data.legacy_member_id_prefix) setLegacyPrefix(data.legacy_member_id_prefix);
      if (data.require_connect_for_membership !== undefined) setRequireConnect(data.require_connect_for_membership === 'true');
      if (data.max_crosspoint_members) setMaxCpMembers(data.max_crosspoint_members);
      if (data.min_crosspoint_members) setMinCpMembers(data.min_crosspoint_members);
      if (data.require_transfer_approval !== undefined) setRequireTransferApproval(data.require_transfer_approval === 'true');
    }
    setLoading(false);
  }

  async function handleSave(entries: Record<string, string>) {
    setSaving(true);
    setSaveSuccess(false);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(entries),
    });
    setSaving(false);
    if (res.ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'crosspoints', label: 'Crosspoints', icon: Home },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data', icon: Database },
  ];

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-7 h-7 text-[#BF0A30] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <PageHeader title="Settings" subtitle="Configure system preferences" />

      {saveSuccess && (
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-3 mb-6">
          <p className="text-sm text-green-300 font-medium">Settings saved successfully.</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-left ${
                  activeTab === tab.id
                    ? 'bg-[#BF0A30]/10 text-[#BF0A30]'
                    : 'text-white/50 hover:bg-white/[0.06]'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
              <h2 className="font-semibold text-white mb-6">Church Information</h2>
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Church Name</label>
                  <input type="text" value={churchName} onChange={e => setChurchName(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Location</label>
                  <input type="text" value={churchLocation} onChange={e => setChurchLocation(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Contact Email</label>
                  <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Contact Phone</label>
                  <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
                </div>
                <button
                  onClick={() => handleSave({
                    church_name: churchName,
                    church_location: churchLocation,
                    contact_email: contactEmail,
                    contact_phone: contactPhone,
                  })}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-lg hover:bg-[#B00325] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
              <h2 className="font-semibold text-white mb-6">Member Settings</h2>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Member ID Prefix</label>
                  <input type="text" value={memberIdPrefix} onChange={e => setMemberIdPrefix(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
                  <p className="text-xs text-gray-500 mt-1">e.g., RT-00001</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Legacy Member ID Prefix</label>
                  <input type="text" value={legacyPrefix} onChange={e => setLegacyPrefix(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
                  <p className="text-xs text-gray-500 mt-1">For founding members</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Require Connect Class for Membership</p>
                    <p className="text-sm text-gray-500">Members must complete Connect Class</p>
                  </div>
                  <button
                    onClick={() => setRequireConnect(!requireConnect)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${requireConnect ? 'bg-[#BF0A30]' : 'bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-[#12151C] rounded-full transition-all ${requireConnect ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>
                <button
                  onClick={() => handleSave({
                    member_id_prefix: memberIdPrefix,
                    legacy_member_id_prefix: legacyPrefix,
                    require_connect_for_membership: String(requireConnect),
                  })}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'crosspoints' && (
            <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
              <h2 className="font-semibold text-white mb-6">Crosspoint Settings</h2>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Maximum Members per Crosspoint</label>
                  <input type="number" value={maxCpMembers} onChange={e => setMaxCpMembers(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Minimum Members to Activate</label>
                  <input type="number" value={minCpMembers} onChange={e => setMinCpMembers(e.target.value)} className="w-full px-4 py-2.5 text-sm border border-white/10 rounded-lg bg-[#12151C]" />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Require Transfer Approval</p>
                    <p className="text-sm text-gray-500">Members need approval to transfer</p>
                  </div>
                  <button
                    onClick={() => setRequireTransferApproval(!requireTransferApproval)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${requireTransferApproval ? 'bg-[#BF0A30]' : 'bg-gray-600'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-[#12151C] rounded-full transition-all ${requireTransferApproval ? 'right-1' : 'left-1'}`}></span>
                  </button>
                </div>
                <button
                  onClick={() => handleSave({
                    max_crosspoint_members: maxCpMembers,
                    min_crosspoint_members: minCpMembers,
                    require_transfer_approval: String(requireTransferApproval),
                  })}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
              <h2 className="font-semibold text-white mb-6">Notification Settings</h2>
              <div className="space-y-4 max-w-xl">
                {[
                  { label: 'New Guest Notifications', desc: 'Alert when new guest registers' },
                  { label: 'Prayer Request Alerts', desc: 'Notify intercessors of new requests' },
                  { label: 'Event Reminders', desc: 'Send reminders before events' },
                  { label: 'Connect Class Reminders', desc: 'Remind attendees about upcoming classes' },
                  { label: 'Transfer Request Alerts', desc: 'Notify leaders of transfer requests' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <button className={`relative w-12 h-6 rounded-full ${i < 3 ? 'bg-[#BF0A30]' : 'bg-gray-600'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-[#12151C] rounded-full ${i < 3 ? 'right-1' : 'left-1'}`}></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
              <h2 className="font-semibold text-white mb-6">Security Settings</h2>
              <div className="space-y-6 max-w-xl">
                <div className="p-4 bg-amber-900/20 border border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-200">These settings affect all users. Make changes carefully.</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                  </div>
                  <button className="relative w-12 h-6 bg-gray-600 rounded-full">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-[#12151C] rounded-full"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/[0.04] rounded-lg">
                  <div>
                    <p className="font-medium text-white">Session Timeout</p>
                    <p className="text-sm text-gray-500">Auto logout after inactivity</p>
                  </div>
                  <select className="px-3 py-1.5 text-sm border border-white/10 rounded-lg bg-[#12151C]">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>Never</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-6">
              <h2 className="font-semibold text-white mb-6">Data Management</h2>
              <div className="space-y-6 max-w-xl">
                <div className="p-4 border border-white/[0.06] rounded-lg">
                  <h3 className="font-medium text-white mb-2">Export Data</h3>
                  <p className="text-sm text-gray-500 mb-4">Download all church data as CSV or Excel</p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium border border-white/10 rounded-lg hover:bg-white/[0.06]">Export Members</button>
                    <button className="px-4 py-2 text-sm font-medium border border-white/10 rounded-lg hover:bg-white/[0.06]">Export Crosspoints</button>
                    <button className="px-4 py-2 text-sm font-medium border border-white/10 rounded-lg hover:bg-white/[0.06]">Export All</button>
                  </div>
                </div>
                <div className="p-4 border border-white/[0.06] rounded-lg">
                  <h3 className="font-medium text-white mb-2">Import Data</h3>
                  <p className="text-sm text-gray-500 mb-4">Import members from CSV file</p>
                  <button className="px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg">Upload CSV</button>
                </div>
                <div className="p-4 border border-red-900 rounded-lg bg-red-900/20">
                  <h3 className="font-medium text-red-200 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-400 mb-4">These actions cannot be undone</p>
                  <button className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Reset All Data</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
