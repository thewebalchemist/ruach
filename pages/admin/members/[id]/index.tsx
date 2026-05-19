import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  ArrowLeft, Edit, Phone, Mail, MapPin, Calendar,
  Users, GraduationCap, Award, Clock, CheckCircle
} from 'lucide-react';
import { AdminLayout } from '@/components/connect/AdminLayout';
import { mockMembers, mockCrosspoints, mockDepartments, mockDiscipleshipCourses } from '@/data';

export default function MemberDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const member = mockMembers.find(m => m.id === id);
  const crosspoint = member?.crosspoint
    ? mockCrosspoints.find(cp => cp.id === member.crosspoint?.crosspointId)
    : null;

  if (!member) {
    return (
      <AdminLayout title="Member Not Found">
        <div className="text-center py-12">
          <p className="text-gray-500">Member not found</p>
          <Link href="/admin/members" className="text-[#BF0A30] hover:underline mt-4 inline-block">
            Back to Members
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const memberDepartments = member.departments.map(d => ({
    ...d,
    department: mockDepartments.find(dept => dept.id === d.departmentId),
  }));

  // FIX: discipleship is DiscipleshipProgress on UserAccount, not old shape
  const currentDisc = member.discipleship?.currentLevel;
  const completedLevels = member.discipleship?.completedLevels ?? [];
  const discCourse = currentDisc
    ? mockDiscipleshipCourses.find(c => c.level === currentDisc.level)
    : null;

  return (
    <AdminLayout title={`${member.firstName} ${member.lastName}`}>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/members" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="w-4 h-4" />Back to Members
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#BF0A30] flex items-center justify-center text-white text-xl font-bold">
              {member.firstName[0]}{member.lastName[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {member.firstName} {member.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-sm text-gray-500">{member.memberId}</span>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                  member.role === 'pastor' ? 'bg-[#BF0A30] text-white' :
                  member.role === 'leader' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-700'
                }`}>{member.role}</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {member.status}
                </span>
              </div>
            </div>
          </div>
          <Link
            href={`/admin/members/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#BF0A30] text-white rounded-lg hover:bg-[#B00325]"
          >
            <Edit className="w-4 h-4" />Edit Member
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center">
                  <Phone className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{member.phone}</p>
                </div>
              </div>
              {member.email && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{member.email}</p>
                  </div>
                </div>
              )}
              {member.address && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{member.address}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#252525] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {member.memberSince
                      ? new Date(member.memberSince).toLocaleDateString()
                      : new Date(member.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Personal Details</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {member.gender && (
                <div><span className="text-gray-500">Gender:</span> <span className="font-medium capitalize ml-1">{member.gender}</span></div>
              )}
              {member.dateOfBirth && (
                <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium ml-1">{member.dateOfBirth}</span></div>
              )}
              {member.occupation && (
                <div><span className="text-gray-500">Occupation:</span> <span className="font-medium ml-1">{member.occupation}</span></div>
              )}
              {member.maritalStatus && (
                <div><span className="text-gray-500">Marital Status:</span> <span className="font-medium capitalize ml-1">{member.maritalStatus}</span></div>
              )}
              <div><span className="text-gray-500">Branch:</span> <span className="font-medium capitalize ml-1">{member.branch.replace('ruach-', 'Ruach ')}</span></div>
              <div><span className="text-gray-500">Zone:</span> <span className="font-medium capitalize ml-1">{member.crosspointZone}</span></div>
            </div>
          </div>

          {/* Departments */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Departments</h2>
            {memberDepartments.length > 0 ? (
              <div className="space-y-3">
                {memberDepartments.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#252525] rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{d.department?.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{d.department?.name}</p>
                        <p className="text-sm text-gray-500">Joined {new Date(d.joinedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                      d.role === 'leader' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                    }`}>{d.role}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Not serving in any department</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Crosspoint */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />Crosspoint
            </h2>
            {crosspoint ? (
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{crosspoint.name}</p>
                <p className="text-sm text-gray-500">{crosspoint.area}</p>
                <p className="text-sm text-gray-500 mt-1">{crosspoint.meetingDay}s at {crosspoint.meetingTime}</p>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2D2D2D]">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                    member.crosspoint?.role === 'leader' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                  }`}>{member.crosspoint?.role}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Not assigned to a crosspoint</p>
            )}
          </div>

          {/* Connect Class - FIX: use connectGraduatedAt, not member.connectClass.completed */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />Connect Class
            </h2>
            {member.connectGraduatedAt ? (
              <div>
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Graduated</span>
                </div>
                <p className="text-sm text-gray-500">
                  Completed {new Date(member.connectGraduatedAt).toLocaleDateString()}
                </p>
                {member.isLegacyMember && (
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                    Legacy Member
                  </span>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Not yet completed</p>
            )}
          </div>

          {/* Discipleship - FIX: use DiscipleshipProgress shape (completedLevels + currentLevel) */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />Discipleship
            </h2>
            {member.discipleship ? (
              <div className="space-y-3">
                {/* Currently enrolled */}
                {currentDisc && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Currently: Level {currentDisc.level}
                    </p>
                    {discCourse && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">{discCourse.title}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Since {new Date(currentDisc.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {/* Completed levels */}
                {completedLevels.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Completed Levels</p>
                    <div className="space-y-1">
                      {completedLevels.map((cl) => (
                        <div key={cl.level} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Level {cl.level}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(cl.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Not enrolled in discipleship</p>
            )}
          </div>

          {/* Activity */}
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2D2D2D] p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />Activity
            </h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Last updated</span>
                <span className="font-medium">{new Date(member.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account created</span>
                <span className="font-medium">{new Date(member.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}