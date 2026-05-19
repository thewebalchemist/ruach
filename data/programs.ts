import type { Event, PrayerRequest, Suggestion, Notice } from '@/types/connect';

// Events
export const mockEvents: Event[] = [
  {
    id: 'event-001',
    title: 'Sunday Service',
    description: 'Weekly worship service',
    type: 'church-wide',
    startDate: '2026-02-08',
    time: '8:00 AM, 10:00 AM, 12:00 PM',
    venue: 'Ruach Tabernacle',
    registeredCount: 0,
    requiresRegistration: false,
    status: 'upcoming',
  },
  {
    id: 'event-002',
    title: 'Prayer Meeting',
    description: 'Mid-week prayer and intercession',
    type: 'church-wide',
    startDate: '2026-02-04',
    time: '6:00 PM',
    venue: 'Ruach Chapel',
    registeredCount: 45,
    requiresRegistration: false,
    status: 'upcoming',
  },
  {
    id: 'event-003',
    title: 'Kingdom Woman Conference 2026',
    description: 'Annual women\'s conference - "Daughters of the King"',
    type: 'department',
    departmentId: 'kingdom-woman',
    startDate: '2026-03-06',
    endDate: '2026-03-08',
    time: '9:00 AM - 5:00 PM',
    venue: 'Ruach Tabernacle',
    capacity: 500,
    registeredCount: 320,
    requiresRegistration: true,
    status: 'upcoming',
  },
  {
    id: 'event-004',
    title: 'R-Warriors Breakfast',
    description: 'Monthly men\'s fellowship',
    type: 'department',
    departmentId: 'r-warriors',
    startDate: '2026-02-15',
    time: '7:00 AM',
    venue: 'Nairobi Safari Club',
    capacity: 100,
    registeredCount: 67,
    requiresRegistration: true,
    status: 'upcoming',
  },
];

// Prayer Requests
export const mockPrayerRequests: PrayerRequest[] = [
  { id: 'pr-001', userId: 'user-004', userName: 'Mary W.', isAnonymous: false, category: 'healing', request: 'Please pray for my mother recovering from surgery.', isUrgent: true, status: 'praying', createdAt: '2026-01-28' },
  { id: 'pr-002', isAnonymous: true, category: 'provision', request: 'Praying for a job opportunity. Been searching for 3 months.', isUrgent: false, status: 'praying', createdAt: '2026-01-27' },
  { id: 'pr-003', userId: 'user-007', userName: 'David N.', isAnonymous: false, category: 'thanksgiving', request: 'Praising God for a successful business deal!', isUrgent: false, status: 'answered', createdAt: '2026-01-25' },
  { id: 'pr-004', isAnonymous: true, category: 'family', request: 'Please pray for my marriage. Going through a difficult season.', isUrgent: true, status: 'pending', createdAt: '2026-02-01' },
];

// Suggestions
export const mockSuggestions: Suggestion[] = [
  { id: 'sug-001', isAnonymous: true, type: 'suggestion', category: 'service', subject: 'Sound quality', message: 'The sound during 2nd service has been too loud lately.', status: 'reviewing', createdAt: '2026-01-26' },
  { id: 'sug-002', userId: 'user-005', isAnonymous: false, type: 'feedback', category: 'general', subject: 'Connect Class Appreciation', message: 'The Connect Class was amazing! Thank you.', status: 'resolved', createdAt: '2026-01-20' },
  { id: 'sug-003', isAnonymous: true, type: 'complaint', category: 'crosspoint', subject: 'Crosspoint meeting times', message: 'Our crosspoint meets too late for families with kids.', status: 'pending', createdAt: '2026-01-30' },
];

// Notices
export const mockNotices: Notice[] = [
  { id: 'notice-001', title: 'Connect Class Registration Open', content: 'March 2026 Connect Class registration is now open.', scope: 'all', priority: 'high', publishedAt: '2026-01-28', authorId: 'user-001' },
  { id: 'notice-002', title: 'Crosspoint Leaders Meeting', content: 'All CP leaders meeting this Saturday at 3 PM.', scope: 'leaders', priority: 'medium', publishedAt: '2026-01-30', authorId: 'user-001' },
];

// Helper functions
export const getUpcomingEvents = () => mockEvents.filter(e => e.status === 'upcoming');
export const getPendingPrayerRequests = () => mockPrayerRequests.filter(p => p.status === 'pending' || p.status === 'praying');
export const getPendingSuggestions = () => mockSuggestions.filter(s => s.status === 'pending');