// src/repositories/proctorEvent.repository.ts

import { prisma } from "../db/prisma";
import { ProctorEventType, SessionStatus } from "@prisma/client";

export async function createEvent(params: {
  examSessionId: string;
  eventType: ProctorEventType;
  gazeDirection?: string;
  gazeConfidence?: number;
  faceCount?: number;
  isFlagged: boolean;
  snapshotUrl?: string;
}) {
  return prisma.proctorEvent.create({
    data: {
      examSessionId: params.examSessionId,
      eventType: params.eventType,
      gazeDirection: params.gazeDirection,
      gazeConfidence: params.gazeConfidence,
      faceCount: params.faceCount,
      isFlagged: params.isFlagged,
      snapshotUrl: params.snapshotUrl,
    },
  });
}

export async function findSessionOwnedByStudent(sessionId: string, studentId: string) {
  return prisma.examSession.findFirst({
    where: { id: sessionId, studentId },
    select: { id: true, status: true },
  });
}

export async function findSessionOwnedByExaminer(sessionId: string, examinerId: string) {
  return prisma.examSession.findFirst({
    where: { id: sessionId, exam: { createdById: examinerId } },
    select: { id: true },
  });
}

export async function findEventsForSession(sessionId: string, page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.proctorEvent.findMany({
      where: { examSessionId: sessionId },
      orderBy: { occurredAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.proctorEvent.count({ where: { examSessionId: sessionId } }),
  ]);
  return { items, total };
}

/** Live (IN_PROGRESS) sessions for exams this examiner created, with a flagged-event count each. */
export async function findLiveSessionsForExaminer(examinerId: string) {
  const sessions = await prisma.examSession.findMany({
    where: { status: SessionStatus.IN_PROGRESS, exam: { createdById: examinerId } },
    select: {
      id: true,
      startTime: true,
      tabSwitchWarnings: true,
      student: { select: { name: true, email: true } },
      exam: { select: { id: true, title: true, durationMinutes: true, maxTabSwitchWarnings: true } },
      proctorEvents: {
        where: { isFlagged: true },
        select: { id: true },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return sessions;
}

export async function findLatestSnapshot(sessionId: string) {
  return prisma.proctorEvent.findFirst({
    where: { examSessionId: sessionId, eventType: "WEBCAM_SNAPSHOT" },
    orderBy: { occurredAt: "desc" },
    select: { snapshotUrl: true, occurredAt: true },
  });
}
