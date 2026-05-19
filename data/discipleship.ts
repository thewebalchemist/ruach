import { 
    DiscipleshipCourse, 
    DiscipleshipCohort, 
    DiscipleshipClassSession,
    DiscipleshipStudent,
    DiscipleshipExam,
    DiscipleshipLevel
  } from '@/types';
  
  export const generateDiscipleshipAdmissionNumber = (year: number, sequence: number): string => {
    return `KDC-${year}-${String(sequence).padStart(3, '0')}`;
  };
  
  export const mockDiscipleshipCourses: DiscipleshipCourse[] = [
    {
      id: 'kdc-level-1',
      level: 1,
      title: 'Foundations of Faith',
      description: 'Essential doctrines, spiritual disciplines, and understanding your identity in Christ',
      totalSessions: 8,
      durationWeeks: 8,
    },
    {
      id: 'kdc-level-2',
      level: 2,
      title: 'Growing in Grace',
      description: 'Deeper Bible study, character development, and understanding spiritual gifts',
      totalSessions: 10,
      durationWeeks: 10,
      prerequisiteLevel: 1,
    },
    {
      id: 'kdc-level-3',
      level: 3,
      title: 'Leadership & Ministry',
      description: 'Spiritual leadership principles, ministry skills, and multiplication',
      totalSessions: 12,
      durationWeeks: 12,
      prerequisiteLevel: 2,
    },
  ];
  
  export const mockDiscipleshipCohorts: DiscipleshipCohort[] = [
    {
      id: 'kdc-l1-2026-q1',
      courseId: 'kdc-level-1',
      level: 1,
      name: 'KDC Level 1 - Q1 2026',
      year: 2026,
      startDate: '2026-02-01',
      endDate: '2026-03-29',
      registrationDeadline: '2026-01-28',
      schedule: 'Saturdays 2:00 PM - 4:00 PM',
      teacherId: 'teacher-001',
      assistantTeacherIds: ['teacher-002'],
      whatsappLink: 'https://chat.whatsapp.com/kdcl1q12026',
      maxCapacity: 50,
      enrolledCount: 32,
      status: 'active',
      passRequirement: { minAttendancePercent: 80, minExamScore: 70 },
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'kdc-l2-2026-q1',
      courseId: 'kdc-level-2',
      level: 2,
      name: 'KDC Level 2 - Q1 2026',
      year: 2026,
      startDate: '2026-02-01',
      endDate: '2026-04-12',
      registrationDeadline: '2026-01-28',
      schedule: 'Sundays 4:00 PM - 6:00 PM',
      teacherId: 'teacher-001',
      assistantTeacherIds: [],
      whatsappLink: 'https://chat.whatsapp.com/kdcl2q12026',
      maxCapacity: 40,
      enrolledCount: 18,
      status: 'active',
      passRequirement: { minAttendancePercent: 80, minExamScore: 70 },
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'kdc-l3-2026-q1',
      courseId: 'kdc-level-3',
      level: 3,
      name: 'KDC Level 3 - Q1 2026',
      year: 2026,
      startDate: '2026-02-08',
      endDate: '2026-05-03',
      registrationDeadline: '2026-02-05',
      schedule: 'Wednesdays 6:00 PM - 8:00 PM',
      teacherId: 'teacher-002',
      assistantTeacherIds: [],
      whatsappLink: '',
      maxCapacity: 30,
      enrolledCount: 8,
      status: 'registration-open',
      passRequirement: { minAttendancePercent: 80, minExamScore: 70 },
      createdAt: '2026-01-15T00:00:00Z',
    },
  ];
  
  export const mockDiscipleshipSessions: DiscipleshipClassSession[] = [
    {
      id: 'kdc-session-001',
      cohortId: 'kdc-l1-2026-q1',
      sessionNumber: 1,
      title: 'Session 1: Understanding Salvation',
      description: 'The gospel message and what it means to be saved',
      date: '2026-02-01',
      startTime: '14:00',
      endTime: '16:00',
      type: 'physical',
      venue: 'Ruach Training Center',
      meetingLink: 'https://meet.google.com/kdc-level1',
      resources: [],
      notes: '',
      isCompleted: true,
    },
    {
      id: 'kdc-session-002',
      cohortId: 'kdc-l1-2026-q1',
      sessionNumber: 2,
      title: 'Session 2: The Authority of Scripture',
      description: 'Understanding the Bible as God\'s Word',
      date: '2026-02-08',
      startTime: '14:00',
      endTime: '16:00',
      type: 'physical',
      venue: 'Ruach Training Center',
      meetingLink: 'https://meet.google.com/kdc-level1',
      resources: [],
      notes: '',
      isCompleted: true,
    },
    {
      id: 'kdc-session-003',
      cohortId: 'kdc-l1-2026-q1',
      sessionNumber: 3,
      title: 'Session 3: Prayer & Communion with God',
      description: 'Developing a consistent prayer life',
      date: '2026-02-15',
      startTime: '14:00',
      endTime: '16:00',
      type: 'virtual',
      meetingLink: 'https://meet.google.com/kdc-level1',
      resources: [],
      notes: '',
      isCompleted: false,
    },
  ];
  
  export const mockDiscipleshipStudents: DiscipleshipStudent[] = [
    {
      id: 'kdc-student-001',
      userId: 'user-member-001', // References a UserAccount with memberId
      cohortId: 'kdc-l1-2026-q1',
      level: 1,
      admissionNumber: 'KDC-2026-001',
      status: 'in-progress',
      enrolledAt: '2026-01-20T10:00:00Z',
      attendance: [
        { sessionId: 'kdc-session-001', sessionNumber: 1, date: '2026-02-01', present: true, markedBy: 'teacher-001', markedAt: '2026-02-01T16:30:00Z' },
        { sessionId: 'kdc-session-002', sessionNumber: 2, date: '2026-02-08', present: true, markedBy: 'teacher-001', markedAt: '2026-02-08T16:30:00Z' },
      ],
      examResults: [],
      totalAttendancePercent: 100,
      averageExamScore: 0,
      canGraduate: false,
      certificateIssued: false,
      warnings: [],
    },
    {
      id: 'kdc-student-002',
      userId: 'user-member-002',
      cohortId: 'kdc-l1-2026-q1',
      level: 1,
      admissionNumber: 'KDC-2026-002',
      status: 'in-progress',
      enrolledAt: '2026-01-21T14:00:00Z',
      attendance: [
        { sessionId: 'kdc-session-001', sessionNumber: 1, date: '2026-02-01', present: true, markedBy: 'teacher-001', markedAt: '2026-02-01T16:30:00Z' },
        { sessionId: 'kdc-session-002', sessionNumber: 2, date: '2026-02-08', present: false, markedBy: 'teacher-001', markedAt: '2026-02-08T16:30:00Z' },
      ],
      examResults: [],
      totalAttendancePercent: 50,
      averageExamScore: 0,
      canGraduate: false,
      certificateIssued: false,
      warnings: [
        { id: 'w-kdc-001', type: 'attendance', message: 'You missed Session 2. Please maintain 80% attendance.', sentAt: '2026-02-09T08:00:00Z', sentBy: 'teacher-001' }
      ],
    },
  ];
  
  export const mockDiscipleshipExams: DiscipleshipExam[] = [
    {
      id: 'kdc-exam-001',
      cohortId: 'kdc-l1-2026-q1',
      level: 1,
      title: 'Level 1 Final Assessment',
      description: 'Comprehensive exam covering all 8 sessions',
      questions: [
        { id: 'kdcq1', questionNumber: 1, type: 'multiple-choice', question: 'What is the primary source of truth for a believer?', options: ['Personal experience', 'The Bible', 'Church tradition', 'Human wisdom'], correctAnswer: 1, marks: 10 },
        { id: 'kdcq2', questionNumber: 2, type: 'true-false', question: 'The Holy Spirit is an impersonal force.', options: ['True', 'False'], correctAnswer: 1, marks: 10 },
        { id: 'kdcq3', questionNumber: 3, type: 'multiple-choice', question: 'Which is NOT a fruit of the Spirit?', options: ['Love', 'Joy', 'Prosperity', 'Peace'], correctAnswer: 2, marks: 10 },
      ],
      totalMarks: 30,
      passingMarks: 21,
      durationMinutes: 45,
      availableFrom: '2026-03-29T14:00:00Z',
      availableUntil: '2026-04-05T23:59:59Z',
      status: 'draft',
      createdBy: 'teacher-001',
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];
  
  export const getDiscipleshipCourseById = (id: string) => mockDiscipleshipCourses.find(c => c.id === id);
  export const getDiscipleshipCourseByLevel = (level: DiscipleshipLevel) => mockDiscipleshipCourses.find(c => c.level === level);
  export const getDiscipleshipCohortById = (id: string) => mockDiscipleshipCohorts.find(c => c.id === id);
  export const getDiscipleshipCohortsByLevel = (level: DiscipleshipLevel) => mockDiscipleshipCohorts.filter(c => c.level === level);
  export const getDiscipleshipSessionsByCohort = (cohortId: string) => mockDiscipleshipSessions.filter(s => s.cohortId === cohortId);
  export const getDiscipleshipStudentsByCohort = (cohortId: string) => mockDiscipleshipStudents.filter(s => s.cohortId === cohortId);
  export const getDiscipleshipStudentByUserId = (userId: string) => mockDiscipleshipStudents.find(s => s.userId === userId);
  export const getDiscipleshipExamsByCohort = (cohortId: string) => mockDiscipleshipExams.filter(e => e.cohortId === cohortId);