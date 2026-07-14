// src/services/proctorEvent.service.ts

import { ApiError } from "../utils/apiError";
import { Role, ProctorEventType, SessionStatus } from "@prisma/client";
import fs from "fs";
import type { ZodError } from "zod";

import * as proctorEventRepository from "../repositories/proctorEvent.repository";
import { submitProctorEventSchema, listProctorEventsQuerySchema } from "../schemas/proctorEvent.schema";

export interface AuthUser {
  id: string;
  role: Role;
}

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return new ApiError(422, message);
}

/** Student submits a non-file event (gaze log, tab-switch, multi-face count). */
export async function submitEvent(sessionId: string, payload: unknown, currentUser: AuthUser) {
  const parsed = submitProctorEventSchema.safeParse(payload);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  const session = await proctorEventRepository.findSessionOwnedByStudent(sessionId, currentUser.id);
  if (!session) throw new ApiError(404, "Session not found");
  if (session.status !== SessionStatus.IN_PROGRESS) {
    throw new ApiError(409, "This session is no longer active");
  }

  return proctorEventRepository.createEvent({
    examSessionId: sessionId,
    eventType: parsed.data.eventType as ProctorEventType,
    gazeDirection: parsed.data.gazeDirection,
    gazeConfidence: parsed.data.gazeConfidence,
    faceCount: parsed.data.faceCount,
    isFlagged: parsed.data.isFlagged,
  });
}

/** Student uploads a webcam snapshot (separate multipart endpoint, no zod body validation needed). */
export async function submitSnapshot(sessionId: string, filePath: string, currentUser: AuthUser) {
  const session = await proctorEventRepository.findSessionOwnedByStudent(sessionId, currentUser.id);
  if (!session) {
    fs.unlink(filePath, () => undefined);
    throw new ApiError(404, "Session not found");
  }
  if (session.status !== SessionStatus.IN_PROGRESS) {
    fs.unlink(filePath, () => undefined);
    throw new ApiError(409, "This session is no longer active");
  }

  const filename = filePath.split(/[\\/]/).pop();
  const publicPath = `/uploads/proctor-snapshots/${filename}`;

  return proctorEventRepository.createEvent({
    examSessionId: sessionId,
    eventType: ProctorEventType.WEBCAM_SNAPSHOT,
    snapshotUrl: publicPath,
    isFlagged: false,
  });
}

function assertCanViewSession(hasAccess: boolean): void {
  if (!hasAccess) throw new ApiError(403, "You do not have permission to view this session's proctoring data");
}

export async function getSessionEvents(sessionId: string, rawQuery: unknown, currentUser: AuthUser) {
  const parsed = listProctorEventsQuerySchema.safeParse(rawQuery);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  if (currentUser.role !== Role.ADMIN) {
    const owned = await proctorEventRepository.findSessionOwnedByExaminer(sessionId, currentUser.id);
    assertCanViewSession(Boolean(owned));
  }

  const { page, limit } = parsed.data;
  const { items, total } = await proctorEventRepository.findEventsForSession(sessionId, page, limit);
  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

/**
 * Live monitoring list — every IN_PROGRESS session for this examiner's
 * exams, with a flagged-event count as a simple risk indicator.
 * NOTE: this is polled by the frontend (no WebSocket push) — see
 * proctorEvent.routes.ts header comment for why.
 */
export async function getLiveSessions(currentUser: AuthUser) {
  const sessions = await proctorEventRepository.findLiveSessionsForExaminer(currentUser.id);

  return Promise.all(
    sessions.map(async (s) => {
      const latestSnapshot = await proctorEventRepository.findLatestSnapshot(s.id);
      return {
        sessionId: s.id,
        studentName: s.student.name,
        studentEmail: s.student.email,
        examId: s.exam.id,
        examTitle: s.exam.title,
        startTime: s.startTime,
        tabSwitchWarnings: s.tabSwitchWarnings,
        maxTabSwitchWarnings: s.exam.maxTabSwitchWarnings,
        flaggedEventCount: s.proctorEvents.length,
        latestSnapshotUrl: latestSnapshot?.snapshotUrl ?? null,
      };
    })
  );
}
