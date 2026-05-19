import { useState } from 'react';
import { Award, Search, Download } from 'lucide-react';
import { DiscipleshipLayout } from '@/components/connect/DiscipleshipLayout';
import { mockDiscipleshipStudents, mockDiscipleshipCohorts, mockDiscipleshipCourses } from '@/data/discipleship';
import { mockMembers } from '@/data';

const MOCK_DATA = true;

// Supplement mock data with additional completed graduates for demo
const additionalGraduates = [
  { id: 'kdc-grad-001', userId: 'user-003', cohortId: 'kdc-l1-2026-q1', level: 1 as const, admissionNumber: 'KDC-2025-045', status: 'completed' as const, enrolledAt: '2025-09-01T10:00:00Z', attendance: [], examResults: [], totalAttendancePercent: 95, averageExamScore: 88, canGraduate: true, certificateIssued: true, certificateIssuedAt: '2025-11-15T10:00:00Z', warnings: [] },
  { id: 'kdc-grad-002', userId: 'user-004', cohortId: 'kdc-l1-2026-q1', level: 1 as const, admissionNumber: 'KDC-2025-046', status: 'completed' as const, enrolledAt: '2025-09-01T10:00:00Z', attendance: [], examResults: [], totalAttendancePercent: 87, averageExamScore: 75, canGraduate: true, certificateIssued: true, certificateIssuedAt: '2025-11-15T10:00:00Z', warnings: [] },
  { id: 'kdc-grad-003', userId: 'user-005', cohortId: 'kdc-l2-2026-q1', level: 2 as const, admissionNumber: 'KDC-2025-022', status: 'completed' as const, enrolledAt: '2025-06-01T10:00:00Z', attendance: [], examResults: [], totalAttendancePercent: 100, averageExamScore: 92, canGraduate: true, certificateIssued: false, warnings: [] },
];

export default function DiscipleshipGraduatesPage() {
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [issuingId, setIssuingId] = useState<string | null>(null);
  const [issued, setIssued] = useState<Set<string>>(new Set());

  const allStudents = [...mockDiscipleshipStudents, ...additionalGraduates];
  const graduates = allStudents.filter(s => s.status === 'completed');

  const enriched = graduates.map(s => {
    const member = mockMembers.find(m => m.id === s.userId);
    const cohort = mockDiscipleshipCohorts.find(c => c.id === s.cohortId);
    const course = cohort ? mockDiscipleshipCourses.find(c => c.id === cohort.courseId) : null;
    return { ...s, member, cohort, course };
  });

  const filtered = enriched.filter(s => {
    const name = s.member ? `${s.member.firstName} ${s.member.lastName}` : s.admissionNumber;
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase()) || s.admissionNumber.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = filterLevel === 'all' || s.level === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const stats = {
    total: enriched.length,
    certified: enriched.filter(s => s.certificateIssued || issued.has(s.id)).length,
    level1: enriched.filter(s => s.level === 1).length,
    level2: enriched.filter(s => s.level === 2).length,
    level3: enriched.filter(s => s.level === 3).length,
  };

  function handleIssueCertificate(id: string) {
    setIssuingId(id);
    setTimeout(() => {
      setIssued(prev => new Set([...prev, id]));
      setIssuingId(null);
    }, 1000);
  }

  return (
    <DiscipleshipLayout title="Graduates">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Graduates</h1>
          <p className="text-gray-500">Students who have completed KDC levels</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-[#BF0A30] to-[#8B0000] rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">{stats.total} Total Graduates</h2>
            <p className="text-white/70 text-sm">{stats.certified} certificates issued</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-xl font-bold">{stats.level1}</p>
            <p className="text-white/70 text-sm">Level 1</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.level2}</p>
            <p className="text-white/70 text-sm">Level 2</p>
          </div>
          <div>
            <p className="text-xl font-bold">{stats.level3}</p>
            <p className="text-white/70 text-sm">Level 3</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search graduates..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-[#2D2D2D] rounded-lg bg-transparent text-gray-900 dark:text-white"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 1, 2, 3] as const).map(l => (
              <button
                key={l}
                onClick={() => setFilterLevel(l)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filterLevel === l
                    ? 'bg-[#BF0A30] text-white'
                    : 'border border-gray-300 dark:border-[#2D2D2D] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]'
                }`}
              >
                {l === 'all' ? 'All Levels' : `Level ${l}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Graduates List */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D]">
        <div className="divide-y divide-gray-100 dark:divide-[#2D2D2D]">
          {filtered.map(student => {
            const hasCertificate = student.certificateIssued || issued.has(student.id);
            const isIssuing = issuingId === student.id;

            return (
              <div key={student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-[#252525]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#8B0000] flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {student.member
                      ? `${student.member.firstName[0]}${student.member.lastName[0]}`
                      : 'KD'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {student.member ? `${student.member.firstName} ${student.member.lastName}` : 'Unknown Member'}
                      </p>
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">Level {student.level} Graduate</span>
                      {hasCertificate && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Award className="w-3.5 h-3.5" />Certified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{student.admissionNumber} &bull; {student.cohort?.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>Attendance: <span className="text-green-600 font-medium">{student.totalAttendancePercent}%</span></span>
                      {student.averageExamScore > 0 && (
                        <span>Exam: <span className="text-green-600 font-medium">{student.averageExamScore}%</span></span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasCertificate ? (
                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-[#2D2D2D] rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#252525]">
                      <Download className="w-3.5 h-3.5" />Download Certificate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleIssueCertificate(student.id)}
                      disabled={isIssuing}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325] disabled:opacity-60"
                    >
                      <Award className="w-3.5 h-3.5" />
                      {isIssuing ? 'Issuing...' : 'Issue Certificate'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500">No graduates found</div>
        )}
      </div>
    </DiscipleshipLayout>
  );
}
