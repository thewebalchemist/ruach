import { useState } from 'react';
import { useRouter } from 'next/router';
import { Save, User, Shield } from 'lucide-react';
import { DepartmentLayout } from '@/components/connect/DepartmentLayout';
import { mockDepartments, mockMembers } from '@/data';

const MOCK_DATA = true;

type ApprovalMode = 'auto' | 'manual';

interface DeptSettingsForm {
  name: string;
  description: string;
  meetingDay: string;
  meetingTime: string;
  meetingVenue: string;
  approvalMode: ApprovalMode;
  requireLeaderApproval: boolean;
  maxMembers: string;
  isVisible: boolean;
}

export default function DepartmentSettingsPage() {
  const router = useRouter();
  const { deptId } = router.query;

  const department = mockDepartments.find(d => d.id === deptId);

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<DeptSettingsForm>({
    name: department?.name || '',
    description: department?.description || '',
    meetingDay: 'Sunday',
    meetingTime: 'After service',
    meetingVenue: 'Ruach Tabernacle',
    approvalMode: 'manual',
    requireLeaderApproval: true,
    maxMembers: department?.memberCount ? String(department.memberCount + 20) : '100',
    isVisible: true,
  });

  if (!department) {
    return <div className="min-h-screen flex items-center justify-center"><p>Department not found</p></div>;
  }

  const leader = mockMembers.find(m => m.id === department.leaderId);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <DepartmentLayout department={department} title="Settings">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Department Settings</h1>
          <p className="text-gray-500">Manage settings for {department.name}</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]"
        >
          <Save className="w-4 h-4" />{saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">Settings saved successfully.</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Department Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30] resize-none"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Members</label>
              <input
                type="number"
                min={1}
                className="w-full sm:w-48 px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                value={form.maxMembers}
                onChange={e => setForm(f => ({ ...f, maxMembers: e.target.value }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Publicly Visible</p>
                <p className="text-xs text-gray-500 mt-0.5">Show this department in the department directory</p>
              </div>
              <div
                onClick={() => setForm(f => ({ ...f, isVisible: !f.isVisible }))}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${form.isVisible ? 'bg-[#BF0A30]' : 'bg-gray-300 dark:bg-[#2D2D2D]'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isVisible ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Schedule */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Meeting Schedule</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Day</label>
              <select
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                value={form.meetingDay}
                onChange={e => setForm(f => ({ ...f, meetingDay: e.target.value }))}
              >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Time</label>
              <input
                type="text"
                placeholder="e.g. 2:00 PM or After service"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                value={form.meetingTime}
                onChange={e => setForm(f => ({ ...f, meetingTime: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Venue</label>
              <input
                type="text"
                placeholder="Meeting location"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-[#BF0A30]"
                value={form.meetingVenue}
                onChange={e => setForm(f => ({ ...f, meetingVenue: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Member Approval */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#BF0A30]" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Member Approval</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Control how new members join the department.</p>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-[#2D2D2D] rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
              <input
                type="radio"
                name="approvalMode"
                value="manual"
                checked={form.approvalMode === 'manual'}
                onChange={() => setForm(f => ({ ...f, approvalMode: 'manual' }))}
                className="mt-0.5"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Manual Approval</p>
                <p className="text-xs text-gray-500 mt-0.5">Department leader reviews and approves each join request before access is granted.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-[#2D2D2D] rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
              <input
                type="radio"
                name="approvalMode"
                value="auto"
                checked={form.approvalMode === 'auto'}
                onChange={() => setForm(f => ({ ...f, approvalMode: 'auto' }))}
                className="mt-0.5"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Auto-Approve</p>
                <p className="text-xs text-gray-500 mt-0.5">Members are automatically approved when they apply. Suitable for open departments.</p>
              </div>
            </label>
          </div>
          {form.approvalMode === 'manual' && (
            <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Require Leader Approval</p>
                <p className="text-xs text-gray-500">Only the department leader can approve requests</p>
              </div>
              <div
                onClick={() => setForm(f => ({ ...f, requireLeaderApproval: !f.requireLeaderApproval }))}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${form.requireLeaderApproval ? 'bg-[#BF0A30]' : 'bg-gray-300 dark:bg-[#3D3D3D]'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.requireLeaderApproval ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </div>
          )}
        </div>

        {/* Leader Info */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Department Leader</h2>
          {leader ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-[#252525] rounded-xl">
              <div className="w-14 h-14 rounded-full bg-[#BF0A30] flex items-center justify-center text-white font-semibold text-lg">
                {leader.firstName[0]}{leader.lastName[0]}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{leader.firstName} {leader.lastName}</p>
                <p className="text-sm text-gray-500">{leader.phone}</p>
                {leader.email && <p className="text-sm text-gray-500">{leader.email}</p>}
                <span className="mt-1 inline-block px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">Leader</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#252525] rounded-xl text-gray-500">
              <User className="w-8 h-8" />
              <p className="text-sm">No leader assigned</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">To transfer department leadership, contact the church administrator.</p>
        </div>

        {/* Sub-teams */}
        {department.subTeams && department.subTeams.length > 0 && (
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Sub-teams ({department.subTeams.length})</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {department.subTeams.map(team => (
                <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{team.name}</p>
                    <p className="text-xs text-gray-500">{team.memberCount} members</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DepartmentLayout>
  );
}
