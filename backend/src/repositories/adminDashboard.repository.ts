// src/repositories/adminDashboard.repository.ts
//
// ONLY Prisma operations live here. Unlike dashboardSummary.repository.ts
// (which scopes every query to one examiner's own exams/questions), every
// query here is platform-wide — this is what makes it an "admin" view.

import { GradingStatus, Role, SessionStatus } from "@prisma/client";

import { prisma } from "../db/prisma";

export async function countUsersByRole(): Promise<Record<Role, number>> {
  const rows = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
  const counts: Record<Role, number> = { STUDENT: 0, EXAMINER: 0, ADMIN: 0 };
  for (const row of rows) counts[row.role] = row._count._all;
  return counts;
}

export async function countActiveUsers(): Promise<number> {
  return prisma.user.count({ where: { isActive: true } });
}

export async function countQuestions(): Promise<number> {
  return prisma.questionBank.count();
}

export async function countExams(): Promise<number> {
  return prisma.exam.count();
}

export async function countLiveSessionsNow(): Promise<number> {
  return prisma.examSession.count({ where: { status: SessionStatus.IN_PROGRESS } });
}

export async function countPendingGradings(): Promise<number> {
  return prisma.subjectiveGrading.count({ where: { status: GradingStatus.PENDING } });
}

/**
 * Every finalized session platform-wide, with enough data to compute a
 * percentage: the session's totalMarks (from Result) and the max possible
 * marks (sum of that session's SessionQuestion.marksAllocated).
 */
export async function findFinalizedSessionsForAverage() {
  const sessions = await prisma.examSession.findMany({
    where: {
      status: { in: [SessionStatus.SUBMITTED, SessionStatus.AUTO_SUBMITTED] },
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

export async function findRecentQuestions(limit: number) {
  return prisma.questionBank.findMany({
    select: { id: true, questionText: true, createdAt: true, createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function findRecentExams(limit: number) {
  return prisma.exam.findMany({
    select: { id: true, title: true, createdAt: true, createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function findRecentSubmissions(limit: number) {
  return prisma.examSession.findMany({
    where: { status: { in: [SessionStatus.SUBMITTED, SessionStatus.AUTO_SUBMITTED] } },
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

export async function findRecentGradings(limit: number) {
  return prisma.subjectiveGrading.findMany({
    where: { status: GradingStatus.GRADED },
    select: {
      id: true,
      gradedAt: true,
      examiner: { select: { name: true } },
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

export async function findRecentUsers(limit: number) {
  return prisma.user.findMany({
    select: { id: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function findUpcomingExams(limit: number) {
  const now = new Date();
  return prisma.exam.findMany({
    where: { startTime: { gt: now } },
    select: { id: true, title: true, subject: true, startTime: true, durationMinutes: true },
    orderBy: { startTime: "asc" },
    take: limit,
  });
}
