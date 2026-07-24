// src/repositories/reports.repository.ts
//
// ONLY Prisma operations live here.

import { prisma } from "../db/prisma";

export async function findExamsForReports(examinerId: string) {
  return prisma.exam.findMany({
    where: { createdById: examinerId },
    select: { id: true, title: true, subject: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

/** Returns null if this exam wasn't created by this examiner. */
export async function findExamOwnedByExaminer(examinerId: string, examId: string) {
  return prisma.exam.findFirst({
    where: { id: examId, createdById: examinerId },
    select: { id: true, title: true, subject: true, passingMarks: true },
  });
}

export async function findSessionsForExamReport(examinerId: string, examId: string) {
  return prisma.examSession.findMany({
    where: { examId, exam: { createdById: examinerId } },
    select: {
      status: true,
      startTime: true,
      endTime: true,
      student: { select: { name: true, email: true } },
      result: { select: { totalMarks: true } },
      sessionQuestions: { select: { marksAllocated: true } },
    },
    orderBy: { startTime: "desc" },
  });
}
