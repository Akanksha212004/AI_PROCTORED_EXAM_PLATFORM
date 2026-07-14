// src/repositories/submission.repository.ts

import { prisma } from "../db/prisma";
import { Prisma, SessionStatus, GradingStatus } from "@prisma/client";

export type SubmissionListItem = Prisma.ExamSessionGetPayload<{
  include: {
    exam: { select: { id: true; title: true; subject: true } };
    student: { select: { id: true; name: true; email: true } };
    result: true;
    answers: { include: { grading: true } };
  };
}>;

export async function findSubmittedSessions(
  examinerId: string,
  filters: { examId?: string; page: number; limit: number }
) {
  const where: Prisma.ExamSessionWhereInput = {
    status: { in: [SessionStatus.SUBMITTED, SessionStatus.AUTO_SUBMITTED] },
    exam: { createdById: examinerId },
    ...(filters.examId ? { examId: filters.examId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.examSession.findMany({
      where,
      include: {
        exam: { select: { id: true, title: true, subject: true } },
        student: { select: { id: true, name: true, email: true } },
        result: true,
        answers: { include: { grading: true } },
      },
      orderBy: { endTime: "desc" },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
    }),
    prisma.examSession.count({ where }),
  ]);

  return { items, total };
}

export type SessionForGrading = Prisma.ExamSessionGetPayload<{
  include: {
    exam: true;
    student: { select: { id: true; name: true; email: true } };
    sessionQuestions: { include: { question: { include: { options: true } } } };
    answers: { include: { selectedOptions: true; grading: true } };
    result: true;
  };
}>;

export async function findSessionForGrading(sessionId: string): Promise<SessionForGrading | null> {
  return prisma.examSession.findUnique({
    where: { id: sessionId },
    include: {
      exam: true,
      student: { select: { id: true, name: true, email: true } },
      sessionQuestions: {
        orderBy: { sequenceOrder: "asc" },
        include: { question: { include: { options: true } } },
      },
      answers: { include: { selectedOptions: true, grading: true } },
      result: true,
    },
  });
}

export async function findAnswerById(answerId: string) {
  return prisma.answer.findUnique({
    where: { id: answerId },
    include: { grading: true, examSession: { include: { exam: true } } },
  });
}

export async function gradeAnswer(answerId: string, examinerId: string, score: number, feedback?: string) {
  return prisma.$transaction(async (tx) => {
    await tx.subjectiveGrading.update({
      where: { answerId },
      data: {
        status: GradingStatus.GRADED,
        examinerId,
        examinerScore: score,
        feedback,
        gradedAt: new Date(),
      },
    });
    return tx.answer.update({ where: { id: answerId }, data: { marksAwarded: score } });
  });
}

export async function countPendingGradings(sessionId: string): Promise<number> {
  return prisma.subjectiveGrading.count({
    where: { status: GradingStatus.PENDING, answer: { examSessionId: sessionId } },
  });
}

export async function finalizeResult(sessionId: string) {
  const answers = await prisma.answer.findMany({
    where: { examSessionId: sessionId },
    select: { marksAwarded: true },
  });
  const totalMarks = answers.reduce((sum, a) => sum + (a.marksAwarded ?? 0), 0);

  return prisma.result.upsert({
    where: { examSessionId: sessionId },
    create: { examSessionId: sessionId, totalMarks, finalExaminerScore: totalMarks },
    update: { totalMarks, finalExaminerScore: totalMarks },
  });
}
