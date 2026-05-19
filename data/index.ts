import type { UserAccount, Guest, Member } from '@/types/connect';

export * from './connect';
export * from './discipleship';
export * from './organizations';
export * from './programs';

// ============================================
// MOCK USERS
// ============================================
export const mockUsers: UserAccount[] = [
  {
    id: 'user-001',
    email: 'james.mwangi@example.com',
    phone: '+254712345001',
    firstName: 'James',
    lastName: 'Mwangi',
    fullName: 'James Kamau Mwangi',
    role: 'admin',
    status: 'active',
    gender: 'male',
    branch: 'ruach-tabernacle',
    crosspointZone: 'west',
    isInCrosspoint: true,
    memberId: 'RT-00001',
    memberSince: '2015-01-15',
    connectCohortId: 'cc-2015-01',
    connectGraduatedAt: '2015-01-30',
    crosspoint: { crosspointId: 'cp-001', crosspointName: 'Kilimani Crosspoint', role: 'leader', joinedDate: '2015-02-01' },
    departments: [{ departmentId: 'crosspoints', role: 'leader', joinedDate: '2016-01-01', status: 'active' }],
    createdAt: '2015-01-15T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-002',
    email: 'grace.wanjiku@example.com',
    phone: '+254712345002',
    firstName: 'Grace',
    lastName: 'Wanjiku',
    fullName: 'Grace Njeri Wanjiku',
    role: 'leader',
    status: 'active',
    gender: 'female',
    branch: 'ruach-tabernacle',
    crosspointZone: 'east',
    isInCrosspoint: true,
    memberId: 'RT-00002',
    memberSince: '2016-03-20',
    connectCohortId: 'cc-2016-01',
    connectGraduatedAt: '2016-04-05',
    crosspoint: { crosspointId: 'cp-002', crosspointName: 'Westlands Crosspoint', role: 'member', joinedDate: '2016-05-01' },
    departments: [{ departmentId: 'kingdom-woman', role: 'leader', joinedDate: '2018-01-01', status: 'active' }],
    createdAt: '2016-03-20T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-003',
    email: 'peter.ochieng@example.com',
    phone: '+254712345003',
    firstName: 'Peter',
    lastName: 'Ochieng',
    fullName: 'Peter Otieno Ochieng',
    role: 'leader',
    status: 'active',
    gender: 'male',
    branch: 'ruach-tabernacle',
    crosspointZone: 'west',
    isInCrosspoint: true,
    memberId: 'RT-00003',
    memberSince: '2017-06-10',
    connectCohortId: 'cc-2017-02',
    connectGraduatedAt: '2017-06-25',
    crosspoint: { crosspointId: 'cp-001', crosspointName: 'Kilimani Crosspoint', role: 'member', joinedDate: '2017-07-01' },
    departments: [],
    createdAt: '2017-06-10T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-004',
    email: 'mary.njeri@example.com',
    phone: '+254712345004',
    firstName: 'Mary',
    lastName: 'Njeri',
    fullName: 'Mary Wambui Njeri',
    role: 'member',
    status: 'active',
    gender: 'female',
    branch: 'ruach-tabernacle',
    crosspointZone: 'south',
    isInCrosspoint: true,
    memberId: 'RT-00015',
    memberSince: '2020-02-14',
    connectCohortId: 'cc-2020-01',
    connectGraduatedAt: '2020-03-01',
    crosspoint: { crosspointId: 'cp-003', crosspointName: 'Langata Crosspoint', role: 'member', joinedDate: '2020-03-15' },
    departments: [{ departmentId: 'intercessors', role: 'member', joinedDate: '2020-06-01', status: 'active' }],
    createdAt: '2020-02-14T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-005',
    email: 'john.mutua@example.com',
    phone: '+254712345005',
    firstName: 'John',
    lastName: 'Mutua',
    fullName: 'John Kioko Mutua',
    role: 'member',
    status: 'active',
    gender: 'male',
    branch: 'ruach-tabernacle',
    crosspointZone: 'south',
    isInCrosspoint: true,
    memberId: 'RT-00020',
    memberSince: '2021-08-22',
    connectCohortId: 'cc-2021-03',
    connectGraduatedAt: '2021-09-05',
    crosspoint: { crosspointId: 'cp-003', crosspointName: 'Langata Crosspoint', role: 'treasurer', joinedDate: '2022-01-01' },
    departments: [{ departmentId: 'media', role: 'member', subTeamId: 'sound', joinedDate: '2022-03-01', status: 'active' }],
    createdAt: '2021-08-22T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-006',
    email: 'sarah.wangari@example.com',
    phone: '+254712345006',
    firstName: 'Sarah',
    lastName: 'Wangari',
    fullName: 'Sarah Muthoni Wangari',
    role: 'leader',
    status: 'active',
    gender: 'female',
    branch: 'ruach-tabernacle',
    crosspointZone: 'east',
    isInCrosspoint: true,
    memberId: 'RT-00008',
    memberSince: '2018-04-15',
    connectCohortId: 'cc-2018-02',
    connectGraduatedAt: '2018-05-01',
    crosspoint: { crosspointId: 'cp-004', crosspointName: 'South B Crosspoint', role: 'leader', joinedDate: '2019-01-01' },
    departments: [{ departmentId: 'r-kids', role: 'leader', joinedDate: '2019-06-01', status: 'active' }],
    createdAt: '2018-04-15T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-007',
    email: 'david.kiprop@example.com',
    phone: '+254712345007',
    firstName: 'David',
    lastName: 'Kiprop',
    fullName: 'David Kibet Kiprop',
    role: 'member',
    status: 'active',
    gender: 'male',
    branch: 'ruach-tabernacle',
    crosspointZone: 'north',
    isInCrosspoint: false,
    memberId: 'RT-00050',
    memberSince: '2024-05-10',
    connectCohortId: 'cc-2024-02',
    connectGraduatedAt: '2024-05-25',
    departments: [],
    createdAt: '2024-05-10T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

// Members = users with memberId set
export const mockMembers: Member[] = mockUsers.filter((u): u is Member => !!u.memberId);

// ============================================
// MOCK GUESTS
// ============================================
export const mockGuests: Guest[] = [
  {
    id: 'guest-001',
    firstName: 'Michael',
    lastName: 'Odhiambo',
    phone: '+254722111001',
    email: 'michael.o@email.com',
    visitDate: '2026-01-28',
    source: 'invite',
    invitedBy: 'user-004',
    followUpStatus: 'pending',
    branch: 'ruach-tabernacle',
    createdAt: '2026-01-28T10:00:00Z',
  },
  {
    id: 'guest-002',
    firstName: 'Ann',
    lastName: 'Mwende',
    phone: '+254722111002',
    visitDate: '2026-01-21',
    source: 'walk-in',
    followUpStatus: 'contacted',
    notes: 'Interested in Connect Class',
    branch: 'ruach-tabernacle',
    createdAt: '2026-01-21T09:00:00Z',
  },
  {
    id: 'guest-003',
    firstName: 'Brian',
    lastName: 'Kimani',
    phone: '+254722111003',
    email: 'brian.k@email.com',
    visitDate: '2026-02-02',
    source: 'online',
    followUpStatus: 'pending',
    branch: 'ruach-tabernacle',
    createdAt: '2026-02-02T11:00:00Z',
  },
];

// ============================================
// DATA HELPERS
// All lookups use UserAccount.id (not memberId)
// ============================================

/** Get any user (member or not) by their id */
export const getUserById = (id: string): UserAccount | undefined =>
  mockUsers.find(u => u.id === id);

/** Get a member by their id (same field - UserAccount.id) */
export const getMemberById = (id: string): Member | undefined =>
  mockMembers.find(m => m.id === id);

/** Get a member by their RT-00001 style memberId */
export const getMemberByMemberId = (memberId: string): Member | undefined =>
  mockMembers.find(m => m.memberId === memberId);

/** Current user for demo */
export const getCurrentUser = (): UserAccount => mockUsers[0];

// ============================================
// DASHBOARD STATS
// ============================================
import { mockConnectCohorts, mockConnectStudents, mockLegacyRequests } from './connect';
import { mockDiscipleshipCohorts, mockDiscipleshipStudents } from './discipleship';
import { mockCrosspoints, mockTransferRequests, mockDepartmentJoinRequests } from './organizations';
import { mockEvents, mockPrayerRequests, mockSuggestions } from './programs';

export const getDashboardStats = () => ({
  members: {
    total: mockMembers.length,
    leaders: mockMembers.filter(m => ['leader', 'admin', 'pastor'].includes(m.role)).length,
    active: mockMembers.filter(m => m.status === 'active').length,
  },
  guests: {
    total: mockGuests.length,
    pendingFollowUp: mockGuests.filter(g => g.followUpStatus === 'pending').length,
    thisMonth: mockGuests.filter(g => new Date(g.visitDate).getMonth() === new Date().getMonth()).length,
  },
  crosspoints: {
    total: mockCrosspoints.length,
    active: mockCrosspoints.filter(c => c.status === 'active').length,
    forming: mockCrosspoints.filter(c => c.status === 'forming').length,
    pendingTransfers: mockTransferRequests.filter(t => t.status === 'pending').length,
  },
  departments: {
    pendingRequests: mockDepartmentJoinRequests.filter(r => r.status === 'pending').length,
  },
  connect: {
    activeCohorts: mockConnectCohorts.filter(c => c.status === 'active').length,
    registrationOpen: mockConnectCohorts.filter(c => c.status === 'registration-open').length,
    totalStudents: mockConnectStudents.length,
    pendingLegacy: mockLegacyRequests.filter(r => r.status === 'pending').length,
  },
  discipleship: {
    activeCohorts: mockDiscipleshipCohorts.filter(c => c.status === 'active').length,
    totalStudents: mockDiscipleshipStudents.length,
  },
  events: {
    upcoming: mockEvents.filter(e => e.status === 'upcoming').length,
  },
  prayer: {
    pending: mockPrayerRequests.filter(p => p.status === 'pending').length,
    praying: mockPrayerRequests.filter(p => p.status === 'praying').length,
  },
  suggestions: {
    pending: mockSuggestions.filter(s => s.status === 'pending').length,
  },
});