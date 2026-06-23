import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Search, Award, Download, CheckCircle, Calendar, Users } from 'lucide-react';
import { ConnectLayout } from '@/components/connect/ConnectLayout';
import { mockConnectStudents, mockConnectCohorts, getUserById } from '@/data/connect';

export default function GraduatesPage() {
  const [query,  setQuery]  = useState('');
  const [cohortF, setCohortF] = useState('all');

  // All completed students = graduates
  const graduates = mockConnectStudents.filter(s => s.status === 'completed' || s.certificateIssued);

  const filtered = graduates.filter(s => {
    const user   = getUserById(s.userId);
    const cohort = mockConnectCohorts.find(c => c.id === s.cohortId);
    if (!user) return false;
    const matchesQ = `${user.fullName} ${s.admissionNumber} ${s.assignedMemberId ?? ''}`.toLowerCase().includes(query.toLowerCase());
    const matchesC = cohortF === 'all' || s.cohortId === cohortF;
    return matchesQ && matchesC;
  });

  const totalWithCert  = graduates.filter(s => s.certificateIssued).length;
  const totalWithMembId = graduates.filter(s => !!s.assignedMemberId).length;

  const issueCertificate = (studentId: string) => {
    // production: PATCH /api/connect/students/:id { certificateIssued: true }
    console.log('Issue cert for', studentId);
  };

  const assignMemberId = (studentId: string) => {
    // production: PATCH /api/connect/students/:id + UserAccount.memberId
    console.log('Assign member ID for', studentId);
  };

  return (
    <ConnectLayout title="Graduates">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Graduates</h1>
          <p className="text-sm text-gray-500 mt-0.5">{graduates.length} total graduates</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-white/[0.06] rounded-xl text-sm font-medium text-white/70 hover:border-[#BF0A30] hover:text-[#BF0A30] transition-colors">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: Users,       val: graduates.length,     label: 'Total Graduates',    color: 'text-white', bg: 'bg-gray-100' },
          { icon: Award,       val: totalWithCert,        label: 'Certificates Issued', color: 'text-purple-600',              bg: 'bg-purple-100 dark:bg-purple-900/30' },
          { icon: CheckCircle, val: totalWithMembId,      label: 'Member IDs Assigned', color: 'text-green-600',              bg: 'bg-green-100 dark:bg-green-900/30' },
        ].map(({ icon: Icon, val, label, color, bg }) => (
          <div key={label} className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-4 shadow-sm">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-xl font-bold ${color}`}>{val}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search graduates..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-white/[0.06] rounded-xl bg-[#12151C] text-white focus:outline-none focus:border-[#BF0A30]"
          />
        </div>
        <select
          value={cohortF}
          onChange={e => setCohortF(e.target.value)}
          className="px-4 py-2.5 text-sm border border-white/[0.06] rounded-xl bg-[#12151C] text-white focus:outline-none focus:border-[#BF0A30]"
        >
          <option value="all">All Cohorts</option>
          {mockConnectCohorts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Graduates list */}
      {filtered.length === 0 ? (
        <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 p-16 text-center shadow-sm">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No graduates found</p>
          <p className="text-sm text-gray-400 mt-1">Graduates appear here once they complete Connect Class</p>
        </div>
      ) : (
        <div className="bg-[#12151C] rounded-2xl border border-white/[0.06]/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Graduate', 'Admission #', 'Cohort', 'Graduated', 'Member ID', 'Certificate', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(student => {
                  const user   = getUserById(student.userId);
                  const cohort = mockConnectCohorts.find(c => c.id === student.cohortId);
                  if (!user) return null;
                  return (
                    <tr key={student.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#BF0A30] to-[#7D0018] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.fullName}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-white/50">{student.admissionNumber}</td>
                      <td className="px-4 py-3 text-xs text-white/50">{cohort?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-white/50">
                          <Calendar className="w-3.5 h-3.5" />
                          {student.graduatedAt ? new Date(student.graduatedAt).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {student.assignedMemberId ? (
                          <span className="font-mono text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-lg">
                            {student.assignedMemberId}
                          </span>
                        ) : (
                          <button
                            onClick={() => assignMemberId(student.id)}
                            className="text-xs text-[#BF0A30] hover:underline font-medium"
                          >
                            Assign ID
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {student.certificateIssued ? (
                          <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" /> Issued
                          </span>
                        ) : (
                          <button
                            onClick={() => issueCertificate(student.id)}
                            className="flex items-center gap-1 text-xs text-purple-600 hover:underline font-medium"
                          >
                            <Award className="w-3.5 h-3.5" /> Issue
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/connect/students/${student.id}`} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg inline-block">
                          <GraduationCap className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ConnectLayout>
  );
}