import { useState } from 'react';
import { Save, Bell, Users, Home, Building2, Shield, Database } from 'lucide-react';
import { AdminLayout, PageHeader } from '@/components/connect/AdminLayout';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'crosspoints', label: 'Crosspoints', icon: Home },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data', icon: Database },
  ];

  return (
    <AdminLayout title="Settings">
      <PageHeader title="Settings" subtitle="Configure system preferences" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg text-left ${
                  activeTab === tab.id
                    ? 'bg-[#BF0A30]/10 text-[#BF0A30]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#252525]'
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
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Church Information</h2>
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Church Name</label>
                  <input type="text" defaultValue="Ruach Assemblies" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input type="text" defaultValue="Nairobi, Kenya" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                  <input type="email" defaultValue="info@ruach.church" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                  <input type="tel" defaultValue="+254 700 000 000" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-lg hover:bg-[#B00325]">
                  <Save className="w-4 h-4" />Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Member Settings</h2>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Member ID Prefix</label>
                  <input type="text" defaultValue="RT" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
                  <p className="text-xs text-gray-500 mt-1">e.g., RT-00001</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Legacy Member ID Prefix</label>
                  <input type="text" defaultValue="RTL" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
                  <p className="text-xs text-gray-500 mt-1">For founding members</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Require Connect Class for Membership</p>
                    <p className="text-sm text-gray-500">Members must complete Connect Class</p>
                  </div>
                  <button className="relative w-12 h-6 bg-[#BF0A30] rounded-full">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                  </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-lg">
                  <Save className="w-4 h-4" />Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'crosspoints' && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Crosspoint Settings</h2>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Members per Crosspoint</label>
                  <input type="number" defaultValue="15" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Members to Activate</label>
                  <input type="number" defaultValue="5" className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg" />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Require Transfer Approval</p>
                    <p className="text-sm text-gray-500">Members need approval to transfer</p>
                  </div>
                  <button className="relative w-12 h-6 bg-[#BF0A30] rounded-full">
                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                  </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-lg">
                  <Save className="w-4 h-4" />Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
              <div className="space-y-4 max-w-xl">
                {[
                  { label: 'New Guest Notifications', desc: 'Alert when new guest registers' },
                  { label: 'Prayer Request Alerts', desc: 'Notify intercessors of new requests' },
                  { label: 'Event Reminders', desc: 'Send reminders before events' },
                  { label: 'Connect Class Reminders', desc: 'Remind attendees about upcoming classes' },
                  { label: 'Transfer Request Alerts', desc: 'Notify leaders of transfer requests' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <button className={`relative w-12 h-6 rounded-full ${i < 3 ? 'bg-[#BF0A30]' : 'bg-gray-300'}`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full ${i < 3 ? 'right-1' : 'left-1'}`}></span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h2>
              <div className="space-y-6 max-w-xl">
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">These settings affect all users. Make changes carefully.</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Require 2FA for admin accounts</p>
                  </div>
                  <button className="relative w-12 h-6 bg-gray-300 rounded-full">
                    <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#252525] rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Session Timeout</p>
                    <p className="text-sm text-gray-500">Auto logout after inactivity</p>
                  </div>
                  <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg">
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
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Data Management</h2>
              <div className="space-y-6 max-w-xl">
                <div className="p-4 border border-gray-200 dark:border-[#2D2D2D] rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Export Data</h3>
                  <p className="text-sm text-gray-500 mb-4">Download all church data as CSV or Excel</p>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">Export Members</button>
                    <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">Export Crosspoints</button>
                    <button className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">Export All</button>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 dark:border-[#2D2D2D] rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Import Data</h3>
                  <p className="text-sm text-gray-500 mb-4">Import members from CSV file</p>
                  <button className="px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg">Upload CSV</button>
                </div>
                <div className="p-4 border border-red-200 dark:border-red-900 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">These actions cannot be undone</p>
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
