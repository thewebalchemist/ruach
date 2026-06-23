import { useState } from 'react';
import { Save, BookOpen, Calendar, Shield } from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';

const MOCK_DATA = true;

interface KDCLevelRequirement {
  level: number;
  minAttendancePercent: number;
  minExamScore: number;
}

interface DiscipleshipSettings {
  programName: string;
  programDescription: string;
  academicYearStart: string;
  academicYearEnd: string;
  maxCapacityPerCohort: number;
  autoRemindersEnabled: boolean;
  reminderDaysBefore: number;
  levelRequirements: KDCLevelRequirement[];
}

const defaultSettings: DiscipleshipSettings = {
  programName: 'Kingdom Discipleship Class (KDC)',
  programDescription: 'A structured 3-level discipleship program designed to build believers from new converts into mature, multiplying disciples.',
  academicYearStart: '2026-01-01',
  academicYearEnd: '2026-12-31',
  maxCapacityPerCohort: 40,
  autoRemindersEnabled: true,
  reminderDaysBefore: 2,
  levelRequirements: [
    { level: 1, minAttendancePercent: 80, minExamScore: 70 },
    { level: 2, minAttendancePercent: 80, minExamScore: 70 },
    { level: 3, minAttendancePercent: 80, minExamScore: 70 },
  ],
};

export default function DiscipleshipSettingsPage() {
  const [settings, setSettings] = useState<DiscipleshipSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateLevelReq(level: number, field: 'minAttendancePercent' | 'minExamScore', value: number) {
    setSettings(s => ({
      ...s,
      levelRequirements: s.levelRequirements.map(r =>
        r.level === level ? { ...r, [field]: value } : r
      ),
    }));
  }

  return (
    <DiscipleshipLayout title="Settings">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Discipleship Settings</h1>
          <p className="text-gray-500">Configure the KDC program requirements and calendar</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-[#BF0A30] text-white rounded-lg text-sm font-medium hover:bg-[#B00325]"
        >
          <Save className="w-4 h-4" />{saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">Settings saved successfully.</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Program Info */}
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[#BF0A30]" />
            <h2 className="font-semibold text-white">Program Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Program Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white focus:outline-none focus:border-[#BF0A30]"
                value={settings.programName}
                onChange={e => setSettings(s => ({ ...s, programName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Description</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white focus:outline-none focus:border-[#BF0A30] resize-none"
                value={settings.programDescription}
                onChange={e => setSettings(s => ({ ...s, programDescription: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Default Max Capacity per Cohort</label>
              <input
                type="number"
                min={5}
                max={200}
                className="w-full sm:w-48 px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white focus:outline-none focus:border-[#BF0A30]"
                value={settings.maxCapacityPerCohort}
                onChange={e => setSettings(s => ({ ...s, maxCapacityPerCohort: Number(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        {/* Academic Calendar */}
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#BF0A30]" />
            <h2 className="font-semibold text-white">Academic Calendar</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Academic Year Start</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white focus:outline-none focus:border-[#BF0A30]"
                value={settings.academicYearStart}
                onChange={e => setSettings(s => ({ ...s, academicYearStart: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Academic Year End</label>
              <input
                type="date"
                className="w-full px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white focus:outline-none focus:border-[#BF0A30]"
                value={settings.academicYearEnd}
                onChange={e => setSettings(s => ({ ...s, academicYearEnd: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {/* Pass Requirements per Level */}
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#BF0A30]" />
            <h2 className="font-semibold text-white">Pass Requirements</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Set minimum thresholds students must meet to pass each level.</p>
          <div className="space-y-4">
            {settings.levelRequirements.map(req => (
              <div key={req.level} className="p-4 bg-white/[0.04] rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#BF0A30] text-white flex items-center justify-center font-bold">
                    L{req.level}
                  </div>
                  <p className="font-medium text-white">Level {req.level}</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Minimum Attendance
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={50}
                        max={100}
                        step={5}
                        className="flex-1"
                        value={req.minAttendancePercent}
                        onChange={e => updateLevelReq(req.level, 'minAttendancePercent', Number(e.target.value))}
                      />
                      <span className="w-12 text-center font-semibold text-white text-sm">
                        {req.minAttendancePercent}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">
                      Minimum Exam Score
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={40}
                        max={100}
                        step={5}
                        className="flex-1"
                        value={req.minExamScore}
                        onChange={e => updateLevelReq(req.level, 'minExamScore', Number(e.target.value))}
                      />
                      <span className="w-12 text-center font-semibold text-white text-sm">
                        {req.minExamScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5">
          <h2 className="font-semibold text-white mb-4">Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Automatic session reminders</p>
                <p className="text-xs text-gray-500 mt-0.5">Send reminders to students before each session</p>
              </div>
              <div
                onClick={() => setSettings(s => ({ ...s, autoRemindersEnabled: !s.autoRemindersEnabled }))}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                  settings.autoRemindersEnabled ? 'bg-[#BF0A30]' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 bg-[#12151C] rounded-full shadow transition-transform ${settings.autoRemindersEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
            </label>
            {settings.autoRemindersEnabled && (
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">
                  Days before session to send reminder
                </label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  className="w-24 px-4 py-2.5 text-sm border border-white/10 dark:border-[#2D2D2D] rounded-lg bg-transparent text-white focus:outline-none focus:border-[#BF0A30]"
                  value={settings.reminderDaysBefore}
                  onChange={e => setSettings(s => ({ ...s, reminderDaysBefore: Number(e.target.value) }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </DiscipleshipLayout>
  );
}
