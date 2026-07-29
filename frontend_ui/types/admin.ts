// types/admin.ts

export type AdminActivityType =
  | "question_added"
  | "exam_created"
  | "submission"
  | "graded"
  | "user_registered";

export interface AdminActivityItem {
  type: AdminActivityType;
  message: string;
  timestamp: string;
}

export interface AdminUpcomingExamItem {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  durationMinutes: number;
}

export interface AdminDashboardSummary {
  totalUsers: number;
  totalStudents: number;
  totalExaminers: number;
  totalAdmins: number;
  activeUsers: number;
  inactiveUsers: number;
  totalQuestions: number;
  totalExams: number;
  liveSessionsNow: number;
  pendingGradingCount: number;
  averageScore: number | null;
  recentActivity: AdminActivityItem[];
  upcomingExams: AdminUpcomingExamItem[];
}

export type PlatformRole = "STUDENT" | "EXAMINER" | "ADMIN";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  isActive: boolean;
  createdAt: string;
  /** Exams taken (students) or exams created (examiners/admins) — whichever applies to this role. */
  activityCount: number;
}

export interface PlatformUsersResponse {
  items: PlatformUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: PlatformRole;
}

export type ExaminerApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ExaminerRequest {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  approvalStatus: ExaminerApprovalStatus;
  institution: string | null;
  department: string | null;
  designation: string | null;
  employeeId: string | null;
  yearsOfExperience: number | null;
  accessRequestReason: string | null;
  rejectionReason: string | null;
  createdAt: string;
}

export interface ExaminerRequestsResponse {
  items: ExaminerRequest[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
