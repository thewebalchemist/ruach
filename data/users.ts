import { UserAccount, Guest, Member } from '@/types';

export const USE_MOCK_DATA = true;

export const generateMemberId = (num: number, isLegacy = false) =>
  `${isLegacy ? 'RTL' : 'RT'}-${String(num).padStart(5, '0')}`;

// ============================================
// MOCK USERS
// Everyone is a UserAccount.
// - Founding/legacy pastors: isLegacyMember = true, memberId set
// - Regular members: memberId set, connectGraduatedAt set
// - No separate Attendee type: attendees are UserAccounts without memberId
// - No separate Guest type here: guests are in mockGuests below
// ============================================
export const mockUsers: UserAccount[] = [

  // ── Founding / Legacy members ──────────────────────────────────
  {
    id: 'user-001',
    email: 'julian@ruach.church',
    phone: '+254722000001',
    firstName: 'Julian',
    lastName: 'Kyula',
    fullName: 'Julian Kyula',
    role: 'pastor',
    status: 'active',
    gender: 'male',
    branch: 'ruach-tabernacle',
    crosspointZone: 'west',
    isInCrosspoint: false,
    isLegacyMember: true,
    memberId: 'RTL-00001',
    memberSince: '2010-01-01',
    connectCohortId: 'founding',
    connectGraduatedAt: '2010-01-01',
    departments: [{ departmentId: 'crosspoints', role: 'leader', joinedDate: '2010-01-01', status: 'active' }],
    createdAt: '2010-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'user-002',
    email: 'grace@ruach.church',
    phone: '+254722000002',
    firstName: 'Grace',
    lastName: 'Kyula',
    fullName: 'Grace Kyula',
    role: 'pastor',
    status: 'active',
    gender: 'female',
    branch: 'ruach-tabernacle',
    crosspointZone: 'west',
    isInCrosspoint: false,
    isLegacyMember: true,
    memberId: 'RTL-00002',
    memberSince: '2010-01-01',
    connectCohortId: 'founding',
    connectGraduatedAt: '2010-01-01',
    departments: [{ departmentId: 'kingdom-woman', role: 'leader', joinedDate: '2010-01-01', status: 'active' }],
    createdAt: '2010-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },

  // ── Regular members (Connect graduates) ───────────────────────
  {
    id: 'user-003',
    email: 'james.mwangi@email.com',
    phone: '+254723456789',
    firstName: 'James',
    lastName: 'Mwangi',
    fullName: 'James Mwangi',
    role: 'leader',
    status: 'active',
    gender: 'male',
    address: 'Kilimani, Nairobi',
    occupation: 'Software Engineer',
    branch: 'ruach-tabernacle',
    crosspointZone: 'west',
    isInCrosspoint: true,
    memberId: 'RT-00015',
    memberSince: '2023-04-15',
    connectCohortId: 'connect-2023-03',
    connectGraduatedAt: '2023-04-15',
    crosspoint: {
      crosspointId: 'cp-001',
      crosspointName: 'Kilimani Crosspoint',
      role: 'leader',
      joinedDate: '2023-05-01',
    },
    departments: [
      { departmentId: 'media', role: 'member', joinedDate: '2023-06-01', status: 'active' },
      { departmentId: 'crosspoints', role: 'leader', joinedDate: '2023-05-01', status: 'active' },
    ],
    // DiscipleshipProgress shape: completedLevels + currentLevel
    discipleship: {
      userId: 'user-003',
      completedLevels: [
        { level: 1, cohortId: 'disc-1-2023', completedAt: '2023-11-01', certificateIssued: true },
      ],
      currentLevel: {
        level: 2,
        cohortId: 'disc-2-2024',
        studentId: 'dstud-003',
        enrolledAt: '2024-01-15',
      },
    },
    createdAt: '2023-04-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'user-004',
    email: 'mary.wanjiku@email.com',
    phone: '+254712345678',
    firstName: 'Mary',
    lastName: 'Wanjiku',
    fullName: 'Mary Wanjiku',
    role: 'member',
    status: 'active',
    gender: 'female',
    address: 'Westlands, Nairobi',
    occupation: 'Nurse',
    branch: 'ruach-tabernacle',
    crosspointZone: 'east',
    isInCrosspoint: true,
    memberId: 'RT-00016',
    memberSince: '2023-07-20',
    connectCohortId: 'connect-2023-06',
    connectGraduatedAt: '2023-07-20',
    crosspoint: {
      crosspointId: 'cp-002',
      crosspointName: 'Westlands Crosspoint',
      role: 'member',
      joinedDate: '2023-08-01',
    },
    departments: [
      { departmentId: 'care-counselling', role: 'member', joinedDate: '2023-09-01', status: 'active' },
      { departmentId: 'kingdom-woman', role: 'member', joinedDate: '2023-08-15', status: 'active' },
    ],
    // Level 1 completed
    discipleship: {
      userId: 'user-004',
      completedLevels: [
        { level: 1, cohortId: 'disc-1-2024', completedAt: '2024-05-15', certificateIssued: true },
      ],
    },
    createdAt: '2023-07-20T00:00:00Z',
    updatedAt: '2024-11-15T00:00:00Z',
  },
  {
    id: 'user-005',
    email: 'peter.ochieng@email.com',
    phone: '+254734567890',
    firstName: 'Peter',
    lastName: 'Ochieng',
    fullName: 'Peter Ochieng',
    role: 'member',
    status: 'active',
    gender: 'male',
    address: 'Langata, Nairobi',
    occupation: 'Accountant',
    branch: 'ruach-tabernacle',
    crosspointZone: 'south',
    isInCrosspoint: true,
    memberId: 'RT-00025',
    memberSince: '2024-10-15',
    connectCohortId: 'connect-2024-09',
    connectGraduatedAt: '2024-10-15',
    crosspoint: {
      crosspointId: 'cp-003',
      crosspointName: 'Langata Crosspoint',
      role: 'treasurer',
      joinedDate: '2024-11-01',
    },
    departments: [
      { departmentId: 'r-warriors', role: 'member', joinedDate: '2024-11-15', status: 'active' },
    ],
    createdAt: '2024-10-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'user-006',
    email: 'sarah.kimani@email.com',
    phone: '+254745678901',
    firstName: 'Sarah',
    lastName: 'Kimani',
    fullName: 'Sarah Kimani',
    role: 'leader',
    status: 'active',
    gender: 'female',
    address: 'South B, Nairobi',
    occupation: 'Teacher',
    branch: 'ruach-tabernacle',
    crosspointZone: 'south',
    isInCrosspoint: true,
    memberId: 'RT-00030',
    memberSince: '2024-02-20',
    connectCohortId: 'connect-2024-01',
    connectGraduatedAt: '2024-02-20',
    crosspoint: {
      crosspointId: 'cp-004',
      crosspointName: 'South B Crosspoint',
      role: 'leader',
      joinedDate: '2024-03-01',
    },
    departments: [
      { departmentId: 'r-kids', role: 'leader', joinedDate: '2024-03-15', status: 'active' },
      { departmentId: 'crosspoints', role: 'leader', joinedDate: '2024-03-01', status: 'active' },
    ],
    createdAt: '2024-02-20T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'user-007',
    email: 'david.njoroge@email.com',
    phone: '+254756789012',
    firstName: 'David',
    lastName: 'Njoroge',
    fullName: 'David Njoroge',
    role: 'member',
    status: 'active',
    gender: 'male',
    address: 'Karen, Nairobi',
    occupation: 'Business Owner',
    branch: 'ruach-tabernacle',
    crosspointZone: 'west',
    isInCrosspoint: false,
    memberId: 'RT-00042',
    memberSince: '2024-12-10',
    connectCohortId: 'connect-2024-11',
    connectGraduatedAt: '2024-12-10',
    departments: [
      { departmentId: 'hospitality', role: 'member', joinedDate: '2024-12-20', status: 'active' },
    ],
    createdAt: '2024-12-10T00:00:00Z',
    updatedAt: '2024-12-20T00:00:00Z',
  },
  {
    id: 'user-008',
    email: 'lucy.akinyi@email.com',
    phone: '+254767890123',
    firstName: 'Lucy',
    lastName: 'Akinyi',
    fullName: 'Lucy Akinyi',
    role: 'member',
    status: 'active',
    gender: 'female',
    address: 'Eastleigh, Nairobi',
    occupation: 'Marketing Executive',
    branch: 'ruach-tabernacle',
    crosspointZone: 'east',
    isInCrosspoint: true,
    memberId: 'RT-00050',
    memberSince: '2025-02-15',
    connectCohortId: 'connect-2025-01',
    connectGraduatedAt: '2025-02-15',
    crosspoint: {
      crosspointId: 'cp-001',
      crosspointName: 'Kilimani Crosspoint',
      role: 'member',
      joinedDate: '2025-03-01',
    },
    departments: [
      { departmentId: 'r-worship', role: 'member', subTeamId: 'vocals', joinedDate: '2025-03-15', status: 'active' },
    ],
    createdAt: '2025-02-15T00:00:00Z',
    updatedAt: '2025-03-15T00:00:00Z',
  },

  // ── Regular attendees (no memberId — Connect is the gateway) ──
  // These people attend church but haven't done Connect yet.
  // They are UserAccounts without memberId/connectGraduatedAt.
  {
    id: 'attendee-001',
    email: 'samuel.kiprono@email.com',
    phone: '+254744444444',
    firstName: 'Samuel',
    lastName: 'Kiprono',
    fullName: 'Samuel Kiprono',
    role: 'student',       // Will become 'member' after Connect
    status: 'active',
    gender: 'male',
    branch: 'ruach-tabernacle',
    crosspointZone: 'north',
    isInCrosspoint: false,
    departments: [],
    createdAt: '2025-10-15T00:00:00Z',
    updatedAt: '2026-01-28T00:00:00Z',
  },
  {
    id: 'attendee-002',
    email: 'agnes.muthoni@email.com',
    phone: '+254755555555',
    firstName: 'Agnes',
    lastName: 'Muthoni',
    fullName: 'Agnes Muthoni',
    role: 'student',
    status: 'active',
    gender: 'female',
    branch: 'ruach-tabernacle',
    crosspointZone: 'south',
    isInCrosspoint: false,
    departments: [],
    createdAt: '2025-11-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'attendee-003',
    email: '',
    phone: '+254766666666',
    firstName: 'Brian',
    lastName: 'Omondi',
    fullName: 'Brian Omondi',
    role: 'student',
    status: 'active',
    gender: 'male',
    branch: 'ruach-tabernacle',
    crosspointZone: 'east',
    isInCrosspoint: false,
    departments: [],
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
];

// ── Members = users with memberId ──────────────────────────────────────────
export const mockMembers: Member[] = mockUsers.filter((u): u is Member => !!u.memberId);

// ── Guests (first-time visitors, no account yet) ───────────────────────────
// Note: Guests are NOT UserAccounts. They have no login/role.
// Once they start attending regularly they get a UserAccount (attendee),
// and after Connect they become a member.
export const mockGuests: Guest[] = [
  {
    id: 'guest-001',
    firstName: 'John',
    lastName: 'Kamau',
    phone: '+254711111111',
    email: 'john.kamau@email.com',
    visitDate: '2026-01-26',
    source: 'walk-in',
    followUpStatus: 'pending',
    notes: 'First time visitor, interested in young adults ministry',
    branch: 'ruach-tabernacle',
    createdAt: '2026-01-26T00:00:00Z',
  },
  {
    id: 'guest-002',
    firstName: 'Faith',
    lastName: 'Otieno',
    phone: '+254722222222',
    email: 'faith.otieno@email.com',
    visitDate: '2026-01-26',
    source: 'invite',
    invitedBy: 'user-004',   // Mary Wanjiku invited her
    followUpStatus: 'contacted',
    notes: 'Looking for a church home',
    branch: 'ruach-tabernacle',
    createdAt: '2026-01-26T00:00:00Z',
  },
  {
    id: 'guest-003',
    firstName: 'Michael',
    lastName: 'Wambua',
    phone: '+254733333333',
    visitDate: '2026-02-02',
    source: 'online',
    followUpStatus: 'pending',
    notes: 'Found us through YouTube, first physical visit',
    branch: 'ruach-tabernacle',
    createdAt: '2026-02-02T00:00:00Z',
  },
];

// ============================================
// HELPERS
// ============================================

/** Get any user by UserAccount.id */
export const getUserById = (id: string): UserAccount | undefined =>
  mockUsers.find(u => u.id === id);

/** Get a member (confirmed Connect graduate) by UserAccount.id */
export const getMemberById = (id: string): Member | undefined =>
  mockMembers.find(m => m.id === id);

/** Get a member by their RT-00001 / RTL-00001 memberId */
export const getMemberByMemberId = (memberId: string): Member | undefined =>
  mockMembers.find(m => m.memberId === memberId);

/** Get a guest by id */
export const getGuestById = (id: string): Guest | undefined =>
  mockGuests.find(g => g.id === id);

/** All users (members + attendees), no guests */
export const getAllUsers = (): UserAccount[] => mockUsers;

/** Leaders and above */
export const getLeaders = (): UserAccount[] =>
  mockUsers.filter(u => ['leader', 'admin', 'pastor'].includes(u.role));

/** Attendees = users without memberId (haven't done Connect) */
export const getAttendees = (): UserAccount[] =>
  mockUsers.filter(u => !u.memberId);