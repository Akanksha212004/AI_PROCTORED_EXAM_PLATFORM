/**
 * Auth service — the Node equivalent of `app/services/auth_service.py`.
 * Business logic lives here; controllers stay thin.
 */
import { userRepository } from "../repositories/user.repository";
import { signAccessToken, verifyPassword } from "../core/security";
import { ApiError } from "../utils/apiError";
import { toUserRead } from "../utils/serializeUser";
import * as adminExaminerRequestRepository from "../repositories/adminExaminerRequest.repository";
import type { RegisterInput } from "../schemas/user.schema";
import type { LoginInput } from "../schemas/auth.schema";
import type {
  ExaminerRequestStatusQuery,
  RequestExaminerAccessInput,
  ResubmitExaminerAccessRequestInput,
} from "../schemas/examinerAccess.schema";

export const authService = {
  /**
   * Public self-registration — STUDENT only. `role` is intentionally
   * not accepted here (see registerSchema); examiners must go through
   * requestExaminerAccess() below instead.
   */
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }
    const user = await userRepository.create({ ...input, role: "STUDENT" });
    return toUserRead(user);
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw ApiError.unauthorized("Invalid email or password");
    }
    if (!user.isActive) {
      throw ApiError.forbidden("This account has been deactivated");
    }

    // Examiner accounts created via the Request Examiner Access flow
    // can't log in until an admin reviews them.
    if (user.role === "EXAMINER") {
      if (user.approvalStatus === "PENDING") {
        throw ApiError.forbidden("Your examiner account is awaiting administrator approval.");
      }
      if (user.approvalStatus === "REJECTED") {
        throw ApiError.forbidden(
          user.rejectionReason
            ? `Your examiner access request was rejected: ${user.rejectionReason}`
            : "Your examiner access request was rejected. Please contact the administrator."
        );
      }
    }

    const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });

    return {
      access_token: accessToken,
      token_type: "bearer",
      role: user.role,
      user: toUserRead(user),
    };
  },

  /**
   * Creates a PENDING EXAMINER account from the public "Request
   * Examiner Access" form. No token is issued — the applicant must
   * wait for admin approval, then log in via the Examiner Portal.
   */
  async requestExaminerAccess(input: RequestExaminerAccessInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict("An account with this email already exists");
    }
    const user = await userRepository.createExaminerRequest(input);
    return toUserRead(user);
  },

  /**
   * Public "View Request Status" lookup — by Request ID (the User.id
   * handed back at submission time) or by official email. Never
   * exposes the password hash; safe for an unauthenticated applicant.
   * Shape matches the frontend's `ExaminerRequestStatusResponse` type.
   */
  async getExaminerRequestStatus(query: ExaminerRequestStatusQuery) {
    const user = query.requestId
      ? await adminExaminerRequestRepository.findExaminerById(query.requestId)
      : query.email
        ? await adminExaminerRequestRepository.findExaminerByEmail(query.email)
        : null;

    if (!user) {
      throw ApiError.notFound("No examiner access request found for the details provided");
    }

    return {
      requestId: user.id,
      name: user.name,
      email: user.email,
      institution: user.institution ?? "",
      department: user.department ?? "",
      designation: user.designation ?? "",
      employeeId: user.employeeId ?? undefined,
      yearsOfExperience: user.yearsOfExperience ?? undefined,
      accessRequestReason: user.accessRequestReason ?? "",
      status: user.approvalStatus,
      rejectionReason: user.rejectionReason ?? undefined,
    };
  },

  /**
   * Applicant edits and resubmits a REJECTED request — identified by
   * `:requestId` in the URL. Resets the request back to PENDING for
   * another round of admin review; credentials are untouched.
   */
  async resubmitExaminerAccessRequest(
    requestId: string,
    input: ResubmitExaminerAccessRequestInput
  ) {
    const existing = await adminExaminerRequestRepository.findExaminerById(requestId);
    if (!existing) {
      throw ApiError.notFound("No examiner access request found for the details provided");
    }
    if (existing.approvalStatus !== "REJECTED") {
      throw ApiError.badRequest("Only a rejected request can be edited and resubmitted");
    }

    const updated = await adminExaminerRequestRepository.resubmit(existing.id, input);

    return {
      requestId: updated.id,
      name: updated.name,
      email: updated.email,
      institution: updated.institution ?? "",
      department: updated.department ?? "",
      designation: updated.designation ?? "",
      employeeId: updated.employeeId ?? undefined,
      yearsOfExperience: updated.yearsOfExperience ?? undefined,
      accessRequestReason: updated.accessRequestReason ?? "",
      status: updated.approvalStatus,
      rejectionReason: updated.rejectionReason ?? undefined,
    };
  },
};
