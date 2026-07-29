// src/services/adminExaminerRequest.service.ts

import type { ZodError } from "zod";

import { ApiError } from "../utils/apiError";
import { toUserRead } from "../utils/serializeUser";
import * as adminExaminerRequestRepository from "../repositories/adminExaminerRequest.repository";
import {
  rejectExaminerRequestSchema,
  type RejectExaminerRequestInput,
} from "../schemas/examinerAccess.schema";
import { listUsersQuerySchema } from "../schemas/admin.schema";

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return new ApiError(422, message);
}

/** Defaults to PENDING requests; status query param can override to review APPROVED/REJECTED history. */
export async function listExaminerRequests(rawQuery: unknown) {
  const parsed = listUsersQuerySchema
    .pick({ page: true, limit: true })
    .safeParse(rawQuery);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  const statusRaw = (rawQuery as Record<string, unknown> | undefined)?.status;
  const status =
    statusRaw === "APPROVED" || statusRaw === "REJECTED" ? statusRaw : "PENDING";

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    adminExaminerRequestRepository.countByStatus(status),
    adminExaminerRequestRepository.findByStatus(status, skip, limit),
  ]);

  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function approveExaminerRequest(userId: string) {
  const existing = await adminExaminerRequestRepository.findExaminerById(userId);
  if (!existing) throw ApiError.notFound("Examiner request not found");
  if (existing.approvalStatus === "APPROVED") {
    throw ApiError.badRequest("This examiner has already been approved");
  }

  const updated = await adminExaminerRequestRepository.approve(userId);
  return toUserRead(updated);
}

export async function rejectExaminerRequest(userId: string, rawInput: unknown) {
  const parsed = rejectExaminerRequestSchema.safeParse(rawInput ?? {});
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  const existing = await adminExaminerRequestRepository.findExaminerById(userId);
  if (!existing) throw ApiError.notFound("Examiner request not found");
  if (existing.approvalStatus === "REJECTED") {
    throw ApiError.badRequest("This examiner request has already been rejected");
  }

  const updated = await adminExaminerRequestRepository.reject(
    userId,
    (parsed.data as RejectExaminerRequestInput).reason
  );
  return toUserRead(updated);
}
