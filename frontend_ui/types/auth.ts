export type UserRole = "STUDENT" | "EXAMINER" | "ADMIN";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  /** Only meaningful for EXAMINER accounts; STUDENT/ADMIN are always APPROVED. */
  approvalStatus?: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

/** Public self-registration is STUDENT-only — examiners use ExaminerAccessRequestPayload instead. */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Submitted via the Examiner Portal's "Request Examiner Access" form. */
export interface ExaminerAccessRequestPayload {
  name: string;
  email: string;
  password: string;
  institution: string;
  department: string;
  designation: string;
  employeeId?: string;
  yearsOfExperience?: number;
  accessRequestReason: string;
}

/**
 * Lookup key for the Examiner Portal's "View Request Status" page —
 * applicant supplies EITHER the request/user id OR the official email
 * they applied with.
 */
export interface ExaminerRequestStatusQuery {
  requestId?: string;
  email?: string;
}

/** Response for a Request Status lookup. */
export interface ExaminerRequestStatusResponse {
  requestId: string;
  name: string;
  email: string;
  institution: string;
  department: string;
  designation: string;
  employeeId?: string;
  yearsOfExperience?: number;
  accessRequestReason: string;
  status: ApprovalStatus;
  /** Only present when status is REJECTED. */
  rejectionReason?: string;
}

/** Editable fields when resubmitting a REJECTED examiner access request. */
export interface ResubmitExaminerAccessRequestPayload {
  name: string;
  institution: string;
  department: string;
  designation: string;
  employeeId?: string;
  yearsOfExperience?: number;
  accessRequestReason: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  role: UserRole;
  user: User;
}

export interface DecodedToken {
  sub: string;
  role: UserRole;
  email: string;
  exp: number;
  iat: number;
}

export interface ApiError {
  detail: string | { msg: string; loc: (string | number)[]; type: string }[];
}
