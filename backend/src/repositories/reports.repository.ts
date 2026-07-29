// src/repositories/reports.repository.ts
//
// ONLY Prisma operations live here.
//
// Every function takes `examinerId: string | undefined`: pass a specific
// id to scope to that examiner's own exams (EXAMINER callers), or
// `undefined` to see every exam platform-wide (ADMIN callers).

import { prisma } from "../db/prisma";

export async function findExamsForReports(examinerId: string | undefined) {
  return prisma.exam.findMany({
    where: examinerId ? { createdById: examinerId } : {},
    select: {
      id: true,
      title: true,
      subject: true,
      status: true,
      createdAt: true,
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Returns null if this exam wasn't created by this examiner (or, for
 *  admin callers with examinerId undefined, only if it doesn't exist). */
export async function findExamOwnedByExaminer(examinerId: string | undefined, examId: string) {
  return prisma.exam.findFirst({
    where: { id: examId, ...(examinerId ? { createdById: examinerId } : {}) },
    select: { id: true, title: true, subject: true, passingMarks: true },
  });
}

export async function findSessionsForExamReport(examinerId: string | undefined, examId: string) {
  return prisma.examSession.findMany({
    where: { examId, ...(examinerId ? { exam: { createdById: examinerId } } : {}) },
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
