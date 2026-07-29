// // src/services/proctorEvent.service.ts

// import { ApiError } from "../utils/apiError";
// import { Role, ProctorEventType, SessionStatus } from "@prisma/client";
// import fs from "fs";
// import type { ZodError } from "zod";

// import * as proctorEventRepository from "../repositories/proctorEvent.repository";
// import { submitProctorEventSchema, listProctorEventsQuerySchema } from "../schemas/proctorEvent.schema";

// export interface AuthUser {
//   id: string;
//   role: Role;
// }

// function zodErrorToApiError(zodError: ZodError): ApiError {
//   const message = zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
//   return new ApiError(422, message);
// }

// /** Student submits a non-file event (gaze log, tab-switch, multi-face count). */
// export async function submitEvent(sessionId: string, payload: unknown, currentUser: AuthUser) {
//   const parsed = submitProctorEventSchema.safeParse(payload);
//   if (!parsed.success) throw zodErrorToApiError(parsed.error);

//   const session = await proctorEventRepository.findSessionOwnedByStudent(sessionId, currentUser.id);
//   if (!session) throw new ApiError(404, "Session not found");
//   if (session.status !== SessionStatus.IN_PROGRESS) {
//     throw new ApiError(409, "This session is no longer active");
//   }

//   return proctorEventRepository.createEvent({
//     examSessionId: sessionId,
//     eventType: parsed.data.eventType as ProctorEventType,
//     gazeDirection: parsed.data.gazeDirection,
//     gazeConfidence: parsed.data.gazeConfidence,
//     faceCount: parsed.data.faceCount,
//     isFlagged: parsed.data.isFlagged,
//   });
// }

// /** Student uploads a webcam snapshot (separate multipart endpoint, no zod body validation needed). */
// export async function submitSnapshot(sessionId: string, filePath: string, currentUser: AuthUser) {
//   const session = await proctorEventRepository.findSessionOwnedByStudent(sessionId, currentUser.id);
//   if (!session) {
//     fs.unlink(filePath, () => undefined);
//     throw new ApiError(404, "Session not found");
//   }
//   if (session.status !== SessionStatus.IN_PROGRESS) {
//     fs.unlink(filePath, () => undefined);
//     throw new ApiError(409, "This session is no longer active");
//   }

//   const filename = filePath.split(/[\\/]/).pop();
//   const publicPath = `/uploads/proctor-snapshots/${filename}`;

//   return proctorEventRepository.createEvent({
//     examSessionId: sessionId,
//     eventType: ProctorEventType.WEBCAM_SNAPSHOT,
//     snapshotUrl: publicPath,
//     isFlagged: false,
//   });
// }

// function assertCanViewSession(hasAccess: boolean): void {
//   if (!hasAccess) throw new ApiError(403, "You do not have permission to view this session's proctoring data");
// }

// export async function getSessionEvents(sessionId: string, rawQuery: unknown, currentUser: AuthUser) {
//   const parsed = listProctorEventsQuerySchema.safeParse(rawQuery);
//   if (!parsed.success) throw zodErrorToApiError(parsed.error);

//   if (currentUser.role !== Role.ADMIN) {
//     const owned = await proctorEventRepository.findSessionOwnedByExaminer(sessionId, currentUser.id);
//     assertCanViewSession(Boolean(owned));
//   }

//   const { page, limit } = parsed.data;
//   const { items, total } = await proctorEventRepository.findEventsForSession(sessionId, page, limit);
//   return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
// }

// /**
//  * Live monitoring list — every IN_PROGRESS session for this examiner's
//  * exams, with a flagged-event count as a simple risk indicator.
//  * NOTE: this is polled by the frontend (no WebSocket push) — see
//  * proctorEvent.routes.ts header comment for why.
//  */
// export async function getLiveSessions(currentUser: AuthUser) {
//   const sessions = await proctorEventRepository.findLiveSessionsForExaminer(currentUser.id);

//   return Promise.all(
//     sessions.map(async (s) => {
//       const latestSnapshot = await proctorEventRepository.findLatestSnapshot(s.id);
//       return {
//         sessionId: s.id,
//         studentName: s.student.name,
//         studentEmail: s.student.email,
//         examId: s.exam.id,
//         examTitle: s.exam.title,
//         startTime: s.startTime,
//         tabSwitchWarnings: s.tabSwitchWarnings,
//         maxTabSwitchWarnings: s.exam.maxTabSwitchWarnings,
//         flaggedEventCount: s.proctorEvents.length,
//         latestSnapshotUrl: latestSnapshot?.snapshotUrl ?? null,
//       };
//     })
//   );
// }




import { ApiError } from "../utils/apiError";
import { Role, ProctorEventType, SessionStatus } from "@prisma/client";
import fs from "fs";
import type { ZodError } from "zod";

import * as proctorEventRepository from "../repositories/proctorEvent.repository";
import { submitProctorEventSchema, listProctorEventsQuerySchema } from "../schemas/proctorEvent.schema";
import { analyzeSnapshot, analyzeAudioClip, thresholdsForSensitivity } from "./aiService.client";

export interface AuthUser {
  id: string;
  role: Role;
}

// Per-session "was a phone seen in the PREVIOUS snapshot too" tracker,
// used to require two consecutive detections before flagging one (see
// submitSnapshot). In-memory is fine here — it's just a debounce
// window, not data of record (the real per-frame confidence is still
// persisted to the DB via the MOBILE_PHONE_DETECTED event whenever
// ai-service reports a hit, confirmed or not). Doesn't survive a
// backend restart or work across multiple server instances, but for
// a single dev/small-deployment process that's an acceptable
// trade-off for the noise reduction it buys.
const lastFrameMobileConfidence = new Map<string, number | null>();

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return new ApiError(422, message);
}

/** Student submits a non-file event. Now TAB_SWITCH only — see schema. */
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
    isFlagged: parsed.data.isFlagged,
  });
}

/**
 * Student uploads a webcam snapshot. This is where real detection now
 * happens: the frame is sent to ai-service, analyzed against this
 * exam's gazeSensitivity, and the result — including the snapshot
 * itself — is persisted as a single ProctorEvent row.
 */
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

  const thresholds = thresholdsForSensitivity(session.exam.gazeSensitivity);
  const analysis = await analyzeSnapshot(filePath, thresholds);

  // ai-service unreachable / failed — save the frame as a plain
  // snapshot with no analysis rather than losing the upload entirely.
  if (!analysis) {
    const event = await proctorEventRepository.createEvent({
      examSessionId: sessionId,
      eventType: ProctorEventType.WEBCAM_SNAPSHOT,
      snapshotUrl: publicPath,
      isFlagged: false,
    });
    return { ...event, mobileDeviceDetected: false, mobileDeviceConfidence: null };
  }

  // A phone in frame is independent of face count/gaze (it can be
  // held up right alongside a normally-positioned, single, centered
  // face), so it's persisted as its own DB row rather than folded into
  // the gaze/face-count branches below. It's ALSO merged into every
  // response this function returns (see the `mobileFields` spread on
  // every return below) — without that, the only way to ever see a
  // phone detection was the examiner dashboard's event list, minutes
  // or hours later; the student taking the exam right now got no live
  // warning at all, because the primary event this endpoint returns
  // to the browser is a different DB row (GAZE_LOG /
  // MULTI_FACE_DETECTED) that never carried this data.
  //
  // REQUIRE TWO CONSECUTIVE HITS before flagging: a lightweight
  // detector at a low-enough confidence threshold to catch real
  // held-up phones (~0.3) also fires isolated single-frame false
  // positives on background clutter at similar confidence — the
  // false-positive and true-positive score distributions overlap too
  // much in that range to separate with a threshold alone. A phone
  // actually being used stays in frame across more than one capture
  // cycle; a stray misclassification on one frame doesn't repeat on
  // the next. This costs one extra capture cycle (~CAPTURE_INTERVAL_MS)
  // of detection latency in exchange for filtering that noise.
  const previousConfidence = lastFrameMobileConfidence.get(sessionId) ?? null;
  const confirmedMobileDetected = analysis.mobileDeviceDetected && previousConfidence !== null;
  lastFrameMobileConfidence.set(
    sessionId,
    analysis.mobileDeviceDetected ? analysis.mobileDeviceConfidence ?? 1 : null
  );

  if (confirmedMobileDetected) {
    await proctorEventRepository.createEvent({
      examSessionId: sessionId,
      eventType: ProctorEventType.MOBILE_PHONE_DETECTED,
      snapshotUrl: publicPath,
      mobileDeviceConfidence: analysis.mobileDeviceConfidence ?? undefined,
      mobileDeviceBoundingBox: analysis.mobileDeviceBoundingBox ?? undefined,
      isFlagged: true,
    });
  }
  const mobileFields = {
    mobileDeviceDetected: confirmedMobileDetected,
    mobileDeviceConfidence: analysis.mobileDeviceConfidence,
  };

  // Multiple people, or nobody in frame.
  if (analysis.faceCount !== 1) {
    const isMultiPerson = analysis.faceCount > 1;
    const isFlagged = isMultiPerson ? session.exam.multiFaceDetectionEnabled : true;

    const event = await proctorEventRepository.createEvent({
      examSessionId: sessionId,
      eventType: ProctorEventType.MULTI_FACE_DETECTED,
      snapshotUrl: publicPath,
      faceCount: analysis.faceCount,
      isFlagged,
    });
    return { ...event, ...mobileFields };
  }

  // Exactly one face — log the gaze reading. Only AWAY is flaggable;
  // LEFT/RIGHT are informational (a real but mild turn).
  const event = await proctorEventRepository.createEvent({
    examSessionId: sessionId,
    eventType: ProctorEventType.GAZE_LOG,
    snapshotUrl: publicPath,
    faceCount: 1,
    gazeDirection: analysis.gazeDirection ?? undefined,
    gazeConfidence: analysis.gazeConfidence ?? undefined,
    isFlagged: analysis.gazeDirection === "AWAY",
  });
  return { ...event, ...mobileFields };
}

/**
 * Student uploads a short recorded audio clip (WAV). Forwarded to
 * ai-service for real Voice Activity Detection (webrtcvad) — replaces
 * the earlier "client computes its own RMS volume and decides for
 * itself" approach with a server-side verdict the client can't fake
 * or skip. Unlike webcam snapshots, the audio file is NEVER kept
 * after analysis — it's deleted in every code path below, success or
 * failure, since there's no proctoring reason to retain raw audio
 * once a voice-activity verdict has been extracted from it.
 */
export async function submitAudioClip(sessionId: string, filePath: string, currentUser: AuthUser) {
  const session = await proctorEventRepository.findSessionOwnedByStudent(sessionId, currentUser.id);
  if (!session) {
    fs.unlink(filePath, () => undefined);
    throw new ApiError(404, "Session not found");
  }
  if (session.status !== SessionStatus.IN_PROGRESS) {
    fs.unlink(filePath, () => undefined);
    throw new ApiError(409, "This session is no longer active");
  }

  const analysis = await analyzeAudioClip(filePath);
  fs.unlink(filePath, () => undefined); // always discard the clip — analyzed, not stored

  // ai-service unreachable / failed — fail open rather than silently
  // dropping the signal: no event is recorded for this cycle, the
  // next clip will retry. (Mirrors submitSnapshot's fail-open policy.)
  if (!analysis) return null;

  return proctorEventRepository.createEvent({
    examSessionId: sessionId,
    eventType: ProctorEventType.AUDIO_ANOMALY,
    audioLevel: analysis.voicedFrameRatio,
    isFlagged: analysis.isSpeechDetected,
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