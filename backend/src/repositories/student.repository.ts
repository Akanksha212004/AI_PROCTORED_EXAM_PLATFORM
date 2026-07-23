// src/repositories/student.repository.ts
//
// ONLY Prisma operations live here. "Student" here means "someone who
// has taken at least one exam this examiner created" — not every
// STUDENT account on the platform. Every query is scoped accordingly,
// same philosophy as dashboardSummary.repository.ts.

import { prisma } from "../db/prisma";
import { Role } from "@prisma/client";

function studentScopeFilter(examinerId: string, search?: string) {
  return {
    role: Role.STUDENT,
    examSessions: { some: { exam: { createdById: examinerId } } },
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function countStudents(examinerId: string, search?: string): Promise<number> {
  return prisma.user.count({ where: studentScopeFilter(examinerId, search) });
}

export async function findStudents(examinerId: string, search: string | undefined, skip: number, take: number) {
  return prisma.user.findMany({
    where: studentScopeFilter(examinerId, search),
    select: { id: true, name: true, email: true, isActive: true, createdAt: true },
    orderBy: { name: "asc" },
    skip,
    take,
  });
}

/** Raw session data for a batch of students, used to compute per-student stats (exams taken / average score / last active). */
export async function findSessionStatsForStudents(examinerId: string, studentIds: string[]) {
  return prisma.examSession.findMany({
    where: { studentId: { in: studentIds }, exam: { createdById: examinerId } },
    select: {
      studentId: true,
      status: true,
      startTime: true,
      endTime: true,
      result: { select: { totalMarks: true } },
      sessionQuestions: { select: { marksAllocated: true } },
    },
  });
}

/** Returns null if this student hasn't taken any exam belonging to this examiner (out of scope / doesn't exist). */
export async function findStudentById(examinerId: string, studentId: string) {
  return prisma.user.findFirst({
    where: { id: studentId, ...studentScopeFilter(examinerId) },
    select: { id: true, name: true, email: true, isActive: true, createdAt: true },
  });
}

/** Full exam-by-exam history for one student, scoped to this examiner's exams. */
export async function findSessionsForStudent(examinerId: string, studentId: string) {
  return prisma.examSession.findMany({
    where: { studentId, exam: { createdById: examinerId } },
    select: {
      id: true,
      status: true,
      startTime: true,
      endTime: true,
      exam: { select: { id: true, title: true, subject: true } },
      result: { select: { totalMarks: true } },
      sessionQuestions: { select: { marksAllocated: true } },
    },
    orderBy: { startTime: "desc" },
  });
}
