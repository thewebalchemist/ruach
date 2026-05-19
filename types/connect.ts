// ============================================
// RUACH CONNECT - TYPE DEFINITIONS
// Church Management System
// ============================================

// ============================================
// USER & AUTHENTICATION
// ============================================

export type UserRole = 'student' | 'member' | 'leader' | 'teacher' | 'admin' | 'pastor';
export type AccountStatus = 'pending' | 'active' | 'suspended' | 'inactive';
export type Gender = 'male' | 'female';

export type RuachBranch = 'ruach-tabernacle' | 'ruach-east' | 'ruach-west' | 'ruach-south' | 'ruach-rivers';
export type CrosspointZone = 'south' | 'east' | 'north' | 'west';

// Base User Account (for authentication & profile)
export interface UserAccount {
  id: string;
  email: string;
  passwordHash?: string;
  phone: string;
  firstName: string;
  lastName: string;
  fullName: string; // Official name for certificates
  role: UserRole;
  status: AccountStatus;
  avatar?: string;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  maritalStatus?: 'single' | 'married' | 'widowed' | 'divorced';
  branch: RuachBranch;
  crosspointZone: CrosspointZone;
  joinedRuachDate?: string;
  isInCrosspoint: boolean;
  
  // Member-specific fields (populated after Connect graduation)
  memberId?: string; // RT-00001 format - assigned after Connect
  memberSince?: string;
  connectCohortId?: string;
  connectGraduatedAt?: string;
  isLegacyMember?: boolean;
  
  // Relationships
  crosspoint?: CrosspointMembership;
  departments: DepartmentMembership[];
  discipleship?: DiscipleshipProgress;
  
  createdAt: string;
  updatedAt: string;
}

// Guest (first-time visitor, no account yet)
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  visitDate: string;
  source: 'walk-in' | 'invite' | 'online' | 'event';
  invitedBy?: string;
  followUpStatus: 'pending' | 'contacted' | 'converted' | 'declined';
  notes?: string;
  branch: RuachBranch;
  createdAt: string;
}

// ============================================
// CONNECT CLASS SYSTEM
// ============================================

export type ConnectCohortStatus = 'draft' | 'registration-open' | 'active' | 'completed' | 'cancelled';
export type ConnectClassType = 'physical' | 'virtual';
export type ConnectStudentStatus = 'registered' | 'enrolled' | 'in-progress' | 'completed' | 'failed' | 'dropped';

// Connect Cohort (batch of students)
export interface ConnectCohort {
  id: string;
  name: string;
  year: number;
  cohortNumber: number;
  description?: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  status: ConnectCohortStatus;
  teacherId: string;
  assistantTeacherIds: string[];
  whatsappLink?: string;
  maxCapacity: number;
  enrolledCount: number;
  passRequirement: {
    minAttendancePercent: number;
    minExamScore: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Individual class/session within a cohort
export interface ConnectClassSession {
  id: string;
  cohortId: string;
  sessionNumber: number;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: ConnectClassType;
  meetingLink?: string;
  venue?: string;
  resources: ConnectResource[];
  notes?: string;
  isCompleted: boolean;
}

// Resource attached to a class
export interface ConnectResource {
  id: string;
  sessionId: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  uploadedAt: string;
}

// Student enrollment in Connect
export interface ConnectStudent {
  id: string;
  userId: string;
  cohortId: string;
  admissionNumber: string; // CC-2026-001
  preferredClassType: ConnectClassType;
  acceptedJesus: 'yes' | 'no' | 'not-sure';
  status: ConnectStudentStatus;
  enrolledAt: string;
  attendance: ConnectAttendanceRecord[];
  examResults: ConnectExamResult[];
  totalAttendancePercent: number;
  averageExamScore: number;
  canGraduate: boolean;
  graduatedAt?: string;
  certificateIssued: boolean;
  assignedMemberId?: string;
  warnings: ConnectWarning[];
}

export interface ConnectAttendanceRecord {
  sessionId: string;
  sessionNumber: number;
  date: string;
  present: boolean;
  markedBy: string;
  markedAt: string;
}

export interface ConnectWarning {
  id: string;
  type: 'attendance' | 'exam' | 'general';
  message: string;
  sentAt: string;
  sentBy: string;
}

// ============================================
// CONNECT EXAMS/ASSIGNMENTS
// ============================================

export type ExamStatus = 'draft' | 'published' | 'closed';
export type QuestionType = 'multiple-choice' | 'true-false';

export interface ConnectExam {
  id: string;
  cohortId: string;
  title: string;
  description?: string;
  sessionId?: string;
  questions: ExamQuestion[];
  totalMarks: number;
  passingMarks: number;
  durationMinutes: number;
  availableFrom: string;
  availableUntil: string;
  status: ExamStatus;
  createdBy: string;
  createdAt: string;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

export interface ConnectExamResult {
  examId: string;
  examTitle: string;
  studentId: string;
  answers: { questionId: string; selectedAnswer: number }[];
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  gradedAt: string;
}

// ============================================
// LEGACY MEMBER VERIFICATION
// ============================================

export type LegacyMemberStatus = 'pending' | 'verified' | 'rejected';

export interface LegacyMemberRequest {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  cohortAttended: string;
  yearJoined: number;
  yearsAsMember: number;
  branch: RuachBranch;
  crosspointZone: CrosspointZone;
  additionalInfo?: string;
  status: LegacyMemberStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  assignedMemberId?: string;
}

// ============================================
// DISCIPLESHIP SYSTEM
// ============================================

export type DiscipleshipLevel = 1 | 2 | 3;
export type DiscipleshipCohortStatus = 'draft' | 'registration-open' | 'active' | 'completed';
export type DiscipleshipStudentStatus = 'registered' | 'enrolled' | 'in-progress' | 'completed' | 'failed' | 'dropped';

export interface DiscipleshipCourse {
  id: string;
  level: DiscipleshipLevel;
  title: string;
  description: string;
  totalSessions: number;
  durationWeeks: number;
  prerequisiteLevel?: DiscipleshipLevel;
}

export interface DiscipleshipCohort {
  id: string;
  courseId: string;
  level: DiscipleshipLevel;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  schedule: string;
  teacherId: string;
  assistantTeacherIds: string[];
  whatsappLink?: string;
  maxCapacity: number;
  enrolledCount: number;
  status: DiscipleshipCohortStatus;
  passRequirement: {
    minAttendancePercent: number;
    minExamScore: number;
  };
  createdAt: string;
}

export interface DiscipleshipClassSession {
  id: string;
  cohortId: string;
  sessionNumber: number;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'physical' | 'virtual';
  meetingLink?: string;
  venue?: string;
  resources: DiscipleshipResource[];
  notes?: string;
  isCompleted: boolean;
}

export interface DiscipleshipResource {
  id: string;
  sessionId: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  uploadedAt: string;
}

export interface DiscipleshipStudent {
  id: string;
  userId: string; // References UserAccount who must be a member
  cohortId: string;
  level: DiscipleshipLevel;
  admissionNumber: string; // KDC-2026-001
  status: DiscipleshipStudentStatus;
  enrolledAt: string;
  attendance: DiscipleshipAttendanceRecord[];
  examResults: DiscipleshipExamResult[];
  totalAttendancePercent: number;
  averageExamScore: number;
  canGraduate: boolean;
  graduatedAt?: string;
  certificateIssued: boolean;
  warnings: DiscipleshipWarning[];
}

export interface DiscipleshipAttendanceRecord {
  sessionId: string;
  sessionNumber: number;
  date: string;
  present: boolean;
  markedBy: string;
  markedAt: string;
}

export interface DiscipleshipWarning {
  id: string;
  type: 'attendance' | 'exam' | 'general';
  message: string;
  sentAt: string;
  sentBy: string;
}

export interface DiscipleshipExam {
  id: string;
  cohortId: string;
  level: DiscipleshipLevel;
  title: string;
  description?: string;
  sessionId?: string;
  questions: ExamQuestion[];
  totalMarks: number;
  passingMarks: number;
  durationMinutes: number;
  availableFrom: string;
  availableUntil: string;
  status: ExamStatus;
  createdBy: string;
  createdAt: string;
}

export interface DiscipleshipExamResult {
  examId: string;
  examTitle: string;
  studentId: string;
  answers: { questionId: string; selectedAnswer: number }[];
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  gradedAt: string;
}

export interface DiscipleshipProgress {
  userId: string;
  completedLevels: {
    level: DiscipleshipLevel;
    cohortId: string;
    completedAt: string;
    certificateIssued: boolean;
  }[];
  currentLevel?: {
    level: DiscipleshipLevel;
    cohortId: string;
    studentId: string;
    enrolledAt: string;
  };
}

// ============================================
// CROSSPOINT (Home Church)
// ============================================

export interface Crosspoint {
  id: string;
  name: string;
  zone: CrosspointZone;
  area: string;
  location: string;
  status: 'active' | 'inactive' | 'forming';
  maxMembers: number;
  memberCount: number;
  leaderId: string;
  assistantId?: string;
  treasurerId?: string;
  meetingDay: string;
  meetingTime: string;
  venue: string;
  createdAt: string;
}

export interface CrosspointMembership {
  crosspointId: string;
  crosspointName: string;
  role: 'member' | 'leader' | 'assistant' | 'treasurer';
  joinedDate: string;
}

export interface CrosspointModule {
  id: string;
  title: string;
  description: string;
  scripture: string;
  content: string;
  discussionQuestions: string[];
  prayerPoints: string[];
  weekNumber: number;
}

// ============================================
// DEPARTMENTS
// ============================================

export type DepartmentId = 
  | 'r-kids' | 'trendsetters' | 'bridge' | 'crosspoints'
  | 'r-warriors' | 'kingdom-woman' | 'marriage' | 'r-worship'
  | 'media' | 'intercessors' | 'evangelists' | 'hospitality'
  | 'care-counselling' | 'guest-experience';

export interface Department {
  id: DepartmentId;
  name: string;
  description: string;
  icon: string;
  leaderId: string;
  memberCount: number;
  subTeams?: SubTeam[];
}

export interface SubTeam {
  id: string;
  name: string;
  departmentId: DepartmentId;
  leaderId?: string;
  memberCount: number;
}

export interface DepartmentMembership {
  departmentId: DepartmentId;
  role: 'member' | 'leader' | 'assistant';
  subTeamId?: string;
  joinedDate: string;
  status: 'active' | 'inactive';
}

// ============================================
// EVENTS & COMMUNICATION
// ============================================

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'church-wide' | 'department' | 'crosspoint';
  departmentId?: DepartmentId;
  crosspointId?: string;
  startDate: string;
  endDate?: string;
  time: string;
  venue: string;
  capacity?: number;
  registeredCount: number;
  requiresRegistration: boolean;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface PrayerRequest {
  id: string;
  userId?: string;
  userName?: string;
  isAnonymous: boolean;
  category: 'healing' | 'provision' | 'guidance' | 'family' | 'thanksgiving' | 'other';
  request: string;
  isUrgent: boolean;
  status: 'pending' | 'praying' | 'answered';
  createdAt: string;
}

export interface Suggestion {
  id: string;
  userId?: string;
  isAnonymous: boolean;
  type: 'suggestion' | 'complaint' | 'feedback';
  category: 'general' | 'crosspoint' | 'service' | 'department';
  subject: string;
  message: string;
  status: 'pending' | 'reviewing' | 'resolved';
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  scope: 'all' | 'members' | 'leaders' | 'department' | 'crosspoint' | 'connect-cohort' | 'discipleship-cohort';
  targetId?: string;
  priority: 'low' | 'medium' | 'high';
  publishedAt: string;
  expiresAt?: string;
  authorId: string;
}

// ============================================
// REQUESTS & APPROVALS
// ============================================

export interface TransferRequest {
  id: string;
  userId: string;
  fromCrosspointId: string;
  toCrosspointId: string;
  reason: string;
  status: 'pending' | 'approved' | 'declined';
  requestDate: string;
}

export interface DepartmentJoinRequest {
  id: string;
  userId: string;
  departmentId: DepartmentId;
  subTeamId?: string;
  message?: string;
  status: 'pending' | 'approved' | 'declined';
  requestDate: string;
}

export interface FoodBankRequest {
  id: string;
  crosspointId: string;
  requestedById: string;
  beneficiaries: { userId: string; name: string }[];
  requestDate: string;
  status: 'pending' | 'approved' | 'fulfilled' | 'declined';
}

// ============================================
// ATTENDANCE IMPORT (Google Meet CSV)
// ============================================

export interface AttendanceImport {
  id: string;
  cohortId: string;
  sessionId: string;
  type: 'connect' | 'discipleship';
  fileName: string;
  importedBy: string;
  importedAt: string;
  matchedCount: number;
  unmatchedCount: number;
  unmatchedNames: string[];
}

// ============================================
// LEGACY TYPES (for backward compatibility)
// These map to old code that used separate Member type
// ============================================

// Helper type: A member is just a UserAccount with memberId set
export type Member = UserAccount & { memberId: string };

// Check if a user is a member
export const isMember = (user: UserAccount): user is Member => {
  return !!user.memberId;
};