import { useState } from 'react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { mockTeachers } from '@/data/connect';
import { CheckCircle, User, Bell, BookOpen, Shield } from 'lucide-react';

type Section = 'profile' | 'defaults' | 'notifications' | 'security';

export default function SettingsPage() {
  const teacher = mockTeachers[0];

  const [section,          setSection]         = useState<Section>('profile');
  const [firstName,        setFirstName]        = useState(teacher.firstName);
  const [lastName,         setLastName]         = useState(teacher.lastName);
  const [email,            setEmail]            = useState(teacher.email);
  const [phone,            setPhone]            = useState(teacher.phone);
  const [minAttendance,    setMinAttendance]    = useState(80);
  const [minExamScore,     setMinExamScore]     = useState(70);
  const [defaultCapacity,  setDefaultCapacity]  = useState(100);
  const [notifyWarning,    setNotifyWarning]    = useState(true);
  const [notifyGraduate,   setNotifyGraduate]   = useState(true);
  const [notifyLegacy,     setNotifyLegacy]     = useState(true);
  const [notifyNewStudent, setNotifyNewStudent] = useState(false);
  const [saved,            setSaved]            = useState(false);

  const save = () => {
    // production: PATCH /api/auth/me  or  /api/connect/settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your teacher account and preferences</p>
        </div>
        <button
          onClick={save}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-xl hover:bg-[#A0021F] shadow-md shadow-[#BF0A30]/20 transition-colors"
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Changes'}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar nav */}
        <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-2 shadow-sm h-fit">
          {SECTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-colors ${
                section === key
                  ? 'bg-gradient-to-r from-[#BF0A30] to-[#A0021F] text-white'
                  : 'text-white/50 hover:bg-white/5 dark:hover:bg-white/[0.05] hover:text-white dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">

          {/* Profile */}
          {section === 'profile' && (
            <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-6 shadow-sm">
              <h2 className="font-semibold text-white mb-5">Profile Information</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-[#BF0A30]/20">
                  {firstName[0]}{lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-white">{teacher.fullName}</p>
                  <p className="text-sm text-gray-500">{teacher.role} · {teacher.memberId}</p>
                  <button className="text-xs text-[#BF0A30] hover:underline mt-1">Change photo</button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Phone</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
              </div>
            </div>
          )}

          {/* Cohort Defaults */}
          {section === 'defaults' && (
            <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-6 shadow-sm">
              <h2 className="font-semibold text-white mb-1">Cohort Defaults</h2>
              <p className="text-sm text-gray-500 mb-5">These values are pre-filled when you create a new cohort.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Default Capacity</label>
                  <p className="text-xs text-gray-400 mb-2">Max students per cohort</p>
                  <input type="number" value={defaultCapacity} onChange={e => setDefaultCapacity(Number(e.target.value))} min={10} className="w-full sm:w-48 px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>

                <div className="bg-[#0A0C10] rounded-2xl p-5">
                  <p className="text-sm font-semibold text-white mb-4">Pass Requirements</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Minimum Attendance (%)</label>
                      <div className="relative">
                        <input type="number" value={minAttendance} onChange={e => setMinAttendance(Number(e.target.value))} min={0} max={100} className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#12151C] text-sm text-white focus:outline-none focus:border-[#BF0A30]" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Students must attend at least {minAttendance}% of sessions</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Minimum Exam Score (%)</label>
                      <input type="number" value={minExamScore} onChange={e => setMinExamScore(Number(e.target.value))} min={0} max={100} className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#12151C] text-sm text-white focus:outline-none focus:border-[#BF0A30]" />
                      <p className="text-xs text-gray-400 mt-1">Students must score at least {minExamScore}% on exams</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {section === 'notifications' && (
            <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-6 shadow-sm">
              <h2 className="font-semibold text-white mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-500 mb-5">Choose what email/push notifications you receive.</p>

              <div className="space-y-3">
                {[
                  { label: 'At-risk student warnings',     sub: 'When a student\'s attendance drops below the threshold',   val: notifyWarning,    set: setNotifyWarning    },
                  { label: 'Student graduation eligible',  sub: 'When a student meets all requirements for graduation',      val: notifyGraduate,   set: setNotifyGraduate   },
                  { label: 'New legacy requests',          sub: 'When someone submits a legacy member verification request', val: notifyLegacy,     set: setNotifyLegacy     },
                  { label: 'New student enrolled',         sub: 'When a new student registers in one of your cohorts',       val: notifyNewStudent, set: setNotifyNewStudent },
                ].map(({ label, sub, val, set }) => (
                  <div key={label} className="flex items-start justify-between p-4 bg-[#0A0C10] rounded-xl">
                    <div className="flex-1 mr-4">
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                    </div>
                    <button
                      onClick={() => set(!val)}
                      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${val ? 'bg-[#BF0A30]' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-[#12151C] rounded-full shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {section === 'security' && (
            <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-6 shadow-sm">
              <h2 className="font-semibold text-white mb-1">Security</h2>
              <p className="text-sm text-gray-500 mb-5">Manage your password and account security.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Current Password</label>
                  <input type="password" placeholder="Enter current password" className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">New Password</label>
                  <input type="password" placeholder="Enter new password" className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Confirm New Password</label>
                  <input type="password" placeholder="Confirm new password" className="w-full px-4 py-2.5 border border-white/[0.06] rounded-xl bg-[#0A0C10] text-sm text-white focus:outline-none focus:border-[#BF0A30]" />
                </div>
                <button className="px-6 py-2.5 bg-[#BF0A30] text-white text-sm font-medium rounded-xl hover:bg-[#A0021F] transition-colors">
                  Update Password
                </button>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-white mb-1">Account ID</p>
                  <p className="text-xs text-gray-400 font-mono">{teacher.id}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ConnectLayout>
  );
}