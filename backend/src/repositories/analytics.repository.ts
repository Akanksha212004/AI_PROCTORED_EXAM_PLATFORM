// src/repositories/analytics.repository.ts
//
// ONLY Prisma operations live here. One query returns every finalized
// session for this examiner's exams with just enough data (marks +
// max marks + passing threshold + subject + timestamps) that the
// service layer can derive all four analytics views from it in memory
// instead of running four separate aggregate queries.

import { prisma } from "../db/prisma";
import { SessionStatus } from "@prisma/client";

export async function findFinalizedSessionsForAnalytics(examinerId: string) {
  return prisma.examSession.findMany({
    where: {
      status: { in: [SessionStatus.SUBMITTED, SessionStatus.AUTO_SUBMITTED] },
      exam: { createdById: examinerId },
      result: { isNot: null },
    },
    select: {
      id: true,
      examId: true,
      startTime: true,
      endTime: true,
      exam: { select: { title: true, subject: true, passingMarks: true } },
      result: { select: { totalMarks: true } },
      sessionQuestions: { select: { marksAllocated: true } },
    },
  });
}
