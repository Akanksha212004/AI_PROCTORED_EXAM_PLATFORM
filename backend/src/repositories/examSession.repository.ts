// src/repositories/examSession.repository.ts
//
// ONLY Prisma operations live here, matching the discipline of
// question.repository.ts / exam.repository.ts.

import { prisma } from "../db/prisma";
import { Prisma, QuestionType } from "@prisma/client";

export type ExamForSession = Prisma.ExamGetPayload<{
  include: {
    selectionRules: true;
    examQuestions: { include: { question: { select: { id: true; marks: true } } } };
  };
}>;

export async function findExamForSession(examId: string): Promise<ExamForSession | null> {
  return prisma.exam.findUnique({
    where: { id: examId },
    include: {
      selectionRules: true,
      examQuestions: { include: { question: { select: { id: true, marks: true } } } },
    },
  });
}

/** Candidate pool for one selection rule (subject/type/difficulty match). */
export async function findCandidateQuestions(filter: {
  subject?: string | null;
  questionType?: QuestionType | null;
  difficultyLevel?: string | null;
}) {
  return prisma.questionBank.findMany({
    where: {
      ...(filter.subject ? { subject: filter.subject } : {}),
      ...(filter.questionType ? { questionType: filter.questionType } : {}),
      ...(filter.difficultyLevel ? { difficultyLevel: filter.difficultyLevel as never } : {}),
    },
    select: { id: true, marks: true },
  });
}

export async function findActiveSession(studentId: string, examId: string) {
  return prisma.examSession.findUnique({
    where: { studentId_examId: { studentId, examId } },
  });
}

/** Atomically creates the session AND its generated paper (SessionQuestion rows). */
export async function createSessionWithPaper(
  studentId: string,
  examId: string,
  paper: { questionId: string; marksAllocated: number }[]
) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.examSession.create({
      data: { studentId, examId, startTime: new Date() },
    });

    await tx.sessionQuestion.createMany({
      data: paper.map((item, index) => ({
        examSessionId: session.id,
        questionId: item.questionId,
        sequenceOrder: index,
        marksAllocated: item.marksAllocated,
      })),
    });

    return session;
  });
}

export type SessionWithPaper = Prisma.ExamSessionGetPayload<{
  include: {
    exam: true;
    sessionQuestions: {
      include: {
        question: { include: { options: true } };
      };
    };
    answers: { include: { selectedOptions: true } };
  };
}>;

export async function findSessionWithPaper(id: string): Promise<SessionWithPaper | null> {
  return prisma.examSession.findUnique({
    where: { id },
    include: {
      exam: true,
      sessionQuestions: {
        orderBy: { sequenceOrder: "asc" },
        include: { question: { include: { options: true } } },
      },
      answers: { include: { selectedOptions: true } },
    },
  });
}

export async function isQuestionInSession(examSessionId: string, questionId: string): Promise<boolean> {
  const count = await prisma.sessionQuestion.count({ where: { examSessionId, questionId } });
  return count > 0;
}

/** Replace-strategy upsert: scalar fields + selected options, in one transaction. */
export async function upsertAnswer(params: {
  examSessionId: string;
  studentId: string;
  questionId: string;
  submittedText?: string;
  selectedOptionIds?: string[];
  markedForReview?: boolean;
}) {
  const { examSessionId, studentId, questionId, submittedText, selectedOptionIds, markedForReview } = params;

  return prisma.$transaction(async (tx) => {
    const answer = await tx.answer.upsert({
      where: { examSessionId_questionId: { examSessionId, questionId } },
      create: {
        examSessionId,
        studentId,
        questionId,
        submittedText,
        ...(markedForReview !== undefined ? { markedForReview } : {}),
      },
      update: {
        submittedText,
        timeOfSubmission: new Date(),
        ...(markedForReview !== undefined ? { markedForReview } : {}),
      },
    });

    if (selectedOptionIds !== undefined) {
      await tx.answerOption.deleteMany({ where: { answerId: answer.id } });
      if (selectedOptionIds.length > 0) {
        await tx.answerOption.createMany({
          data: selectedOptionIds.map((optionId) => ({ answerId: answer.id, optionId })),
        });
      }
    }

    return answer;
  });
}

/** Toggles the review-flag only — never touches submittedText/options/fileUrl. */
export async function setMarkedForReview(params: {
  examSessionId: string;
  studentId: string;
  questionId: string;
  markedForReview: boolean;
}) {
  const { examSessionId, studentId, questionId, markedForReview } = params;

  return prisma.answer.upsert({
    where: { examSessionId_questionId: { examSessionId, questionId } },
    create: { examSessionId, studentId, questionId, markedForReview },
    update: { markedForReview },
  });
}

/** Wipes an answer's content (text/options/file) but keeps the row — markedForReview is preserved. */
export async function clearAnswer(params: {
  examSessionId: string;
  studentId: string;
  questionId: string;
}) {
  const { examSessionId, studentId, questionId } = params;

  return prisma.$transaction(async (tx) => {
    const answer = await tx.answer.upsert({
      where: { examSessionId_questionId: { examSessionId, questionId } },
      create: { examSessionId, studentId, questionId },
      update: { submittedText: null, submittedFileUrl: null },
    });

    await tx.answerOption.deleteMany({ where: { answerId: answer.id } });

    return answer;
  });
}

export async function updateAnswerFileUrl(examSessionId: string, questionId: string, studentId: string, fileUrl: string) {
  return prisma.answer.upsert({
    where: { examSessionId_questionId: { examSessionId, questionId } },
    create: { examSessionId, questionId, studentId, submittedFileUrl: fileUrl },
    update: { submittedFileUrl: fileUrl, timeOfSubmission: new Date() },
  });
}

export async function updateSessionStatus(id: string, status: "SUBMITTED" | "AUTO_SUBMITTED" | "EXPIRED") {
  return prisma.examSession.update({
    where: { id },
    data: { status, endTime: new Date() },
  });
}

export async function setAnswerMarks(answerId: string, marksAwarded: number) {
  return prisma.answer.update({ where: { id: answerId }, data: { marksAwarded } });
}

export async function createPendingGrading(answerId: string) {
  return prisma.subjectiveGrading.create({ data: { answerId, status: "PENDING" } });
}

export async function upsertResult(examSessionId: string, totalMarks: number) {
  return prisma.result.upsert({
    where: { examSessionId },
    create: { examSessionId, totalMarks },
    update: { totalMarks },
  });
}
