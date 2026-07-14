// src/repositories/dashboardSummary.repository.ts
//
// ONLY Prisma operations live here. Every query is scoped to the
// logged-in examiner's own exams/questions — nothing here reads
// platform-wide data.

import { prisma } from "../db/prisma";
import { GradingStatus, SessionStatus } from "@prisma/client";

export async function countQuestions(examinerId: string): Promise<number> {
  return prisma.questionBank.count({ where: { createdById: examinerId } });
}

export async function countExams(examinerId: string): Promise<number> {
  return prisma.exam.count({ where: { createdById: examinerId } });
}

export async function countPendingGradings(examinerId: string): Promise<number> {
  return prisma.subjectiveGrading.count({
    where: {
      status: GradingStatus.PENDING,
      answer: { examSession: { exam: { createdById: examinerId } } },
    },
  });
}

/**
 * Every finalized session for this examiner's exams, with enough data
 * to compute a percentage: the session's totalMarks (from Result) and
 * the max possible marks (sum of that session's SessionQuestion.marksAllocated).
 */
export async function findFinalizedSessionsForAverage(examinerId: string) {
  const sessions = await prisma.examSession.findMany({
    where: {
      status: { in: [SessionStatus.SUBMITTED, SessionStatus.AUTO_SUBMITTED] },
      exam: { createdById: examinerId },
      result: { isNot: null },
    },
    select: {
      result: { select: { totalMarks: true } },
      sessionQuestions: { select: { marksAllocated: true } },
    },
  });

  return sessions.map((s) => ({
    totalMarks: s.result?.totalMarks ?? 0,
    maxMarks: s.sessionQuestions.reduce((sum, sq) => sum + sq.marksAllocated, 0),
  }));
}

export async function findRecentQuestions(examinerId: string, limit: number) {
  return prisma.questionBank.findMany({
    where: { createdById: examinerId },
    select: { id: true, questionText: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function findRecentExams(examinerId: string, limit: number) {
  return prisma.exam.findMany({
    where: { createdById: examinerId },
    select: { id: true, title: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function findRecentSubmissions(examinerId: string, limit: number) {
  return prisma.examSession.findMany({
    where: {
      status: { in: [SessionStatus.SUBMITTED, SessionStatus.AUTO_SUBMITTED] },
      exam: { createdById: examinerId },
    },
    select: {
      id: true,
      endTime: true,
      student: { select: { name: true } },
      exam: { select: { title: true } },
    },
    orderBy: { endTime: "desc" },
    take: limit,
  });
}

export async function findRecentGradings(examinerId: string, limit: number) {
  return prisma.subjectiveGrading.findMany({
    where: { examinerId, status: GradingStatus.GRADED },
    select: {
      id: true,
      gradedAt: true,
      answer: {
        select: {
          student: { select: { name: true } },
          examSession: { select: { exam: { select: { title: true } } } },
        },
      },
    },
    orderBy: { gradedAt: "desc" },
    take: limit,
  });
}

export async function findUpcomingExams(examinerId: string, limit: number) {
  const now = new Date();
  return prisma.exam.findMany({
    where: { createdById: examinerId, startTime: { gt: now } },
    select: { id: true, title: true, subject: true, startTime: true, durationMinutes: true },
    orderBy: { startTime: "asc" },
    take: limit,
  });
}
