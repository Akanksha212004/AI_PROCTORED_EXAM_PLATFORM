// src/repositories/exam.repository.ts
//
// ONLY Prisma operations live here — same discipline as
// question.repository.ts. Prisma client imported the confirmed way:
// named export from ../db/prisma.

import { prisma } from "../db/prisma";
import { Prisma } from "@prisma/client";
import type { CreateExamInput, UpdateExamInput, ListExamsQuery } from "../schemas/exam.schema";

export type ExamWithDetails = Prisma.ExamGetPayload<{
  include: {
    selectionRules: true;
    examQuestions: {
      include: {
        question: {
          select: {
            id: true;
            questionText: true;
            subject: true;
            questionType: true;
            difficultyLevel: true;
            marks: true;
          };
        };
      };
    };
  };
}>;

const detailIncludes = {
  selectionRules: true,
  examQuestions: {
    include: {
      question: {
        select: {
          id: true,
          questionText: true,
          subject: true,
          questionType: true,
          difficultyLevel: true,
          marks: true,
        },
      },
    },
  },
} satisfies Prisma.ExamInclude;

/**
 * Atomically create an exam, its selection rules (if any), and its
 * curated question pool (if any).
 */
export async function createWithRulesAndPool(
  examData: CreateExamInput & { questionIds?: string[] },
  createdById: string
): Promise<ExamWithDetails> {
  const { selectionRules, questionIds, ...examFields } = examData;

  return prisma.$transaction(async (tx) => {
    const exam = await tx.exam.create({
      data: { ...examFields, createdById },
    });

    if (selectionRules?.length) {
      await tx.examSelectionRule.createMany({
        data: selectionRules.map((rule) => ({ ...rule, examId: exam.id })),
      });
    }

    if (questionIds?.length) {
      await tx.examQuestion.createMany({
        data: questionIds.map((questionId) => ({ examId: exam.id, questionId })),
        skipDuplicates: true,
      });
    }

    return tx.exam.findUniqueOrThrow({
      where: { id: exam.id },
      include: detailIncludes,
    });
  });
}

/**
 * Replace-strategy update for scalar fields + selection rules.
 * The curated question pool (examQuestions) is deliberately NOT
 * touched here — it's managed via addPoolQuestions/removePoolQuestion
 * below, since it's a many-to-many junction the UI adds/removes from
 * incrementally, unlike selection rules which are wholesale replaced.
 */
export async function updateWithRules(id: string, examData: UpdateExamInput): Promise<ExamWithDetails> {
  const { selectionRules, ...examFields } = examData;

  return prisma.$transaction(async (tx) => {
    await tx.exam.update({
      where: { id },
      data: examFields,
    });

    if (selectionRules !== undefined) {
      await tx.examSelectionRule.deleteMany({ where: { examId: id } });
      if (selectionRules.length) {
        await tx.examSelectionRule.createMany({
          data: selectionRules.map((rule) => ({ ...rule, examId: id })),
        });
      }
    }

    return tx.exam.findUniqueOrThrow({
      where: { id },
      include: detailIncludes,
    });
  });
}

export async function findById(id: string): Promise<ExamWithDetails | null> {
  return prisma.exam.findUnique({
    where: { id },
    include: detailIncludes,
  });
}

export async function findMany(filters: ListExamsQuery) {
  const { subject, status, page, limit } = filters;

  const where: Prisma.ExamWhereInput = {
    ...(subject ? { subject } : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.exam.findMany({
      where,
      include: detailIncludes,
      orderBy: { startTime: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.exam.count({ where }),
  ]);

  return { items, total };
}

/**
 * ExamSession has onDelete: Restrict on Exam — the DB itself would
 * reject deleting an exam with sessions. This app-level check gives a
 * friendlier 409 before hitting that constraint.
 */
export async function hasSessions(id: string): Promise<boolean> {
  const count = await prisma.examSession.count({ where: { examId: id } });
  return count > 0;
}

export async function remove(id: string): Promise<void> {
  await prisma.exam.delete({ where: { id } });
}

/** Adds questions to the curated pool; duplicates are silently skipped. */
export async function addPoolQuestions(examId: string, questionIds: string[]): Promise<void> {
  await prisma.examQuestion.createMany({
    data: questionIds.map((questionId) => ({ examId, questionId })),
    skipDuplicates: true,
  });
}

export async function removePoolQuestion(examId: string, questionId: string): Promise<void> {
  await prisma.examQuestion.deleteMany({ where: { examId, questionId } });
}

export async function findAvailableForStudents() {
  const now = new Date();
  return prisma.exam.findMany({
    where: { endTime: { gte: now }, status: "PUBLISHED", }, // upcoming + currently active; hides ended exams
    select: {
      id: true,
      title: true,
      subject: true,
      durationMinutes: true,
      startTime: true,
      endTime: true,
      totalMarks: true,
      passingMarks: true,
    },
    orderBy: { startTime: "asc" },
  });
}
