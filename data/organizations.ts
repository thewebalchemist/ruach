import { Crosspoint, Department, CrosspointModule, TransferRequest, DepartmentJoinRequest } from '@/types';

// Crosspoints
export const mockCrosspoints: Crosspoint[] = [
  {
    id: 'cp-001',
    name: 'Kilimani Crosspoint',
    zone: 'west',
    location: 'Kilimani, Nairobi',
    area: 'Kilimani',
    status: 'active',
    maxMembers: 15,
    memberCount: 12,
    leaderId: 'user-003',
    meetingDay: 'Wednesday',
    meetingTime: '7:00 PM',
    venue: "James' Residence, Kilimani",
    createdAt: '2023-05-01',
  },
  {
    id: 'cp-002',
    name: 'Westlands Crosspoint',
    zone: 'west',
    location: 'Westlands, Nairobi',
    area: 'Westlands',
    status: 'active',
    maxMembers: 15,
    memberCount: 10,
    leaderId: 'user-010',
    meetingDay: 'Thursday',
    meetingTime: '6:30 PM',
    venue: 'Community Hall, Westlands',
    createdAt: '2023-06-15',
  },
  {
    id: 'cp-003',
    name: 'Langata Crosspoint',
    zone: 'south',
    location: 'Langata, Nairobi',
    area: 'Langata',
    status: 'active',
    maxMembers: 15,
    memberCount: 8,
    leaderId: 'user-012',
    treasurerId: 'user-005',
    meetingDay: 'Tuesday',
    meetingTime: '7:00 PM',
    venue: "Esther's Home, Langata",
    createdAt: '2024-01-10',
  },
  {
    id: 'cp-004',
    name: 'South B Crosspoint',
    zone: 'east',
    location: 'South B, Nairobi',
    area: 'South B',
    status: 'active',
    maxMembers: 15,
    memberCount: 14,
    leaderId: 'user-006',
    meetingDay: 'Wednesday',
    meetingTime: '6:00 PM',
    venue: "Sarah's Residence, South B",
    createdAt: '2024-03-01',
  },
  {
    id: 'cp-005',
    name: 'Karen Crosspoint',
    zone: 'south',
    location: 'Karen, Nairobi',
    area: 'Karen',
    status: 'forming',
    maxMembers: 15,
    memberCount: 5,
    leaderId: 'user-015',
    meetingDay: 'Saturday',
    meetingTime: '10:00 AM',
    venue: 'TBD',
    createdAt: '2025-12-01',
  },
];

// Crosspoint Modules
export const mockCrosspointModules: CrosspointModule[] = [
  {
    id: 'cpm-001',
    title: 'The Power of Prayer',
    description: 'Understanding and practicing effective prayer',
    scripture: 'Matthew 6:9-13',
    content: 'Prayer is communication with God...',
    discussionQuestions: [
      'What does your prayer life look like?',
      'Share a testimony of answered prayer.',
      'How can we pray more effectively?',
    ],
    prayerPoints: [
      'Pray for a deeper prayer life',
      'Pray for specific needs in the group',
      'Pray for our church leadership',
    ],
    weekNumber: 1,
  },
  {
    id: 'cpm-002',
    title: 'Walking in Purpose',
    description: "Discovering God's purpose for your life",
    scripture: 'Jeremiah 29:11, Ephesians 2:10',
    content: 'God created you with a purpose...',
    discussionQuestions: [
      'What do you believe your purpose is?',
      'What gifts has God given you?',
      'How are you using those gifts?',
    ],
    prayerPoints: [
      'Pray for clarity of purpose',
      'Pray for courage to step out in faith',
      'Pray for opportunities to serve',
    ],
    weekNumber: 2,
  },
  {
    id: 'cpm-003',
    title: 'Building Strong Relationships',
    description: 'Biblical principles for healthy relationships',
    scripture: '1 Corinthians 13:4-7',
    content: 'Relationships are at the heart of community...',
    discussionQuestions: [
      'What makes relationships challenging?',
      'How has forgiveness impacted your life?',
      'What does healthy communication look like?',
    ],
    prayerPoints: [
      'Pray for healing in broken relationships',
      'Pray for unity in families',
      'Pray for the crosspoint community',
    ],
    weekNumber: 3,
  },
];

// Transfer Requests
export const mockTransferRequests: TransferRequest[] = [
  {
    id: 'tr-001',
    userId: 'user-007',
    fromCrosspointId: 'cp-002',
    toCrosspointId: 'cp-001',
    reason: 'Relocated to Kilimani area',
    status: 'pending',
    requestDate: '2026-01-28',
  },
];

// Departments
export const mockDepartments: Department[] = [
  { id: 'r-kids', name: 'R-Kids Church', description: "Children's ministry (0-12 years)", icon: '👶', leaderId: 'user-006', memberCount: 25 },
  { id: 'trendsetters', name: 'Trendsetters', description: 'Teens Church (13-17 years)', icon: '🔥', leaderId: 'user-045', memberCount: 35 },
  { id: 'bridge', name: 'Bridge', description: 'Youth Church (18-30 years)', icon: '🌉', leaderId: 'user-050', memberCount: 80 },
  { id: 'crosspoints', name: 'Crosspoints', description: 'Home Church Ministry', icon: '🏠', leaderId: 'user-001', memberCount: 150 },
  { id: 'r-warriors', name: 'R-Warriors', description: "Men's Ministry", icon: '⚔️', leaderId: 'user-055', memberCount: 45 },
  { id: 'kingdom-woman', name: 'Kingdom Woman', description: "Women's Ministry", icon: '👑', leaderId: 'user-002', memberCount: 65 },
  { id: 'marriage', name: 'Marriage Ministry', description: 'Supporting marriages', icon: '💒', leaderId: 'user-065', memberCount: 40 },
  { id: 'r-worship', name: 'R-Worship', description: 'Worship & Creative Arts', icon: '🎵', leaderId: 'user-070', memberCount: 50, subTeams: [
    { id: 'vocals', name: 'Vocals', departmentId: 'r-worship', memberCount: 20 },
    { id: 'band', name: 'Band', departmentId: 'r-worship', memberCount: 15 },
    { id: 'dance', name: 'Dance', departmentId: 'r-worship', memberCount: 15 },
  ]},
  { id: 'media', name: 'Media Team', description: 'Photography, Video, Sound', icon: '📹', leaderId: 'user-075', memberCount: 30, subTeams: [
    { id: 'sound', name: 'Sound', departmentId: 'media', memberCount: 8 },
    { id: 'camera', name: 'Camera', departmentId: 'media', memberCount: 10 },
    { id: 'graphics', name: 'Graphics', departmentId: 'media', memberCount: 6 },
    { id: 'social', name: 'Social Media', departmentId: 'media', memberCount: 6 },
  ]},
  { id: 'intercessors', name: 'Intercessors', description: 'Prayer Ministry', icon: '🙏', leaderId: 'user-080', memberCount: 40 },
  { id: 'evangelists', name: 'Evangelists', description: 'Outreach & Missions', icon: '📢', leaderId: 'user-085', memberCount: 25 },
  { id: 'hospitality', name: 'Hospitality', description: 'Ushering & Protocol', icon: '🤝', leaderId: 'user-090', memberCount: 35 },
  { id: 'care-counselling', name: 'Care & Counselling', description: 'Pastoral Care', icon: '💚', leaderId: 'user-095', memberCount: 15 },
  { id: 'guest-experience', name: 'Guest Experience', description: 'Welcoming first-timers', icon: '✨', leaderId: 'user-100', memberCount: 20 },
];

// Department Join Requests
export const mockDepartmentJoinRequests: DepartmentJoinRequest[] = [
  {
    id: 'djr-001',
    userId: 'user-007',
    departmentId: 'r-worship',
    subTeamId: 'band',
    message: 'I play keyboard and would love to serve.',
    status: 'pending',
    requestDate: '2026-01-25',
  },
  {
    id: 'djr-002',
    userId: 'user-004',
    departmentId: 'intercessors',
    message: 'I feel called to prayer ministry.',
    status: 'pending',
    requestDate: '2026-01-28',
  },
];

// Helper functions
export const getCrosspointById = (id: string) => mockCrosspoints.find(cp => cp.id === id);
export const getDepartmentById = (id: string) => mockDepartments.find(d => d.id === id);
export const getActiveCrosspoints = () => mockCrosspoints.filter(cp => cp.status === 'active');
export const getPendingTransfers = () => mockTransferRequests.filter(t => t.status === 'pending');
export const getPendingJoinRequests = () => mockDepartmentJoinRequests.filter(r => r.status === 'pending');