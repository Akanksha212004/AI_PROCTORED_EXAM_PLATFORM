// import type { DifficultyLevel, Prisma, QuestionBank, QuestionType } from "@prisma/client";

// import { prisma } from "../db/prisma";

// interface QuestionFilters {
//   subject?: string;
//   questionType?: QuestionType;
//   difficultyLevel?: DifficultyLevel;
// }

// export const questionRepository = {
//   create(data: Prisma.QuestionBankUncheckedCreateInput): Promise<QuestionBank> {
//     return prisma.questionBank.create({ data });
//   },

//   findById(id: string): Promise<QuestionBank | null> {
//     return prisma.questionBank.findUnique({ where: { id } });
//   },

//   async findMany(filters: QuestionFilters, page: number, pageSize: number) {
//     const where: Prisma.QuestionBankWhereInput = {
//       subject: filters.subject ? { equals: filters.subject, mode: "insensitive" } : undefined,
//       questionType: filters.questionType,
//       difficultyLevel: filters.difficultyLevel,
//     };

//     const [items, total] = await Promise.all([
//       prisma.questionBank.findMany({
//         where,
//         orderBy: { createdAt: "desc" },
//         skip: (page - 1) * pageSize,
//         take: pageSize,
//       }),
//       prisma.questionBank.count({ where }),
//     ]);

//     return { items, total, page, pageSize };
//   },

//   /** Used by the exam-paper randomizer — pulls the id pool for one selection rule. */
//   findIdsMatchingRule(filters: QuestionFilters): Promise<{ id: string }[]> {
//     return prisma.questionBank.findMany({
//       where: {
//         subject: { equals: filters.subject, mode: "insensitive" },
//         questionType: filters.questionType,
//         difficultyLevel: filters.difficultyLevel,
//       },
//       select: { id: true },
//     });
//   },

//   findManyByIds(ids: string[]): Promise<QuestionBank[]> {
//     return prisma.questionBank.findMany({ where: { id: { in: ids } } });
//   },

//   update(id: string, data: Prisma.QuestionBankUncheckedUpdateInput): Promise<QuestionBank> {
//     return prisma.questionBank.update({ where: { id }, data });
//   },

//   delete(id: string): Promise<QuestionBank> {
//     return prisma.questionBank.delete({ where: { id } });
//   },
// };





// src/repositories/question.repository.ts
//
// ONLY Prisma operations live here. No business rules, no validation,
// no HTTP concerns.
//
// ASSUMPTION: your Prisma client singleton is exported as a default
// export from `src/db/prisma.ts` (i.e. `export default prisma`). Adjust
// the import below if your project exports it differently (e.g. a
// named export from `src/db/index.ts` or `src/config/db.ts`).

import { prisma } from '../db/prisma';
import { Prisma, QuestionType } from '@prisma/client';
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
  ListQuestionsQuery,
} from '../schemas/question.schema';

const OPTION_BEARING_TYPES: QuestionType[] = [
  QuestionType.MCQ,
  QuestionType.MULTI_SELECT,
];

export type QuestionWithOptions = Prisma.QuestionBankGetPayload<{
  include: {
    options: true;
  };
}>;

/**
 * Atomically create a question and its options (if any).
 */
export async function createWithOptions(
  questionData: CreateQuestionInput,
  createdById: string
) {
  const { options, ...questionFields } = questionData;

  return prisma.$transaction(async (tx) => {
    const question = await tx.questionBank.create({
      data: {
        ...questionFields,
        createdById,
      },
    });

    if (
      OPTION_BEARING_TYPES.includes(question.questionType) &&
      options?.length
    ) {
      await tx.option.createMany({
        data: options.map((opt, index) => ({
          questionId: question.id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          sortOrder: index,
        })),
      });
    }

    return tx.questionBank.findUniqueOrThrow({
      where: {
        id: question.id,
      },
      include: {
        options: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  });
}

/**
 * Replace-strategy update: update scalar fields, then wipe + recreate
 * options in the same transaction.
 */
export async function updateWithOptions(
  id: string,
  questionData: UpdateQuestionInput
) {
  const { options, ...questionFields } = questionData;

  return prisma.$transaction(async (tx) => {
    const question = await tx.questionBank.update({
      where: {
        id,
      },
      data: questionFields,
    });

        await tx.option.deleteMany({
      where: {
        questionId: id,
      },
    });

    if (
      OPTION_BEARING_TYPES.includes(question.questionType) &&
      options?.length
    ) {
      await tx.option.createMany({
        data: options.map((opt, index) => ({
          questionId: id,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          sortOrder: index,
        })),
      });
    }

    return tx.questionBank.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        options: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  });
}

export async function findById(id: string) {
  return prisma.questionBank.findUnique({
    where: {
      id,
    },
    include: {
      options: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });
}

export async function findMany(
  filters: ListQuestionsQuery
) {
  const {
    subject,
    questionType,
    difficultyLevel,
    page,
    limit,
  } = filters;

  const where: Prisma.QuestionBankWhereInput = {
    ...(subject ? { subject } : {}),
    ...(questionType ? { questionType } : {}),
    ...(difficultyLevel ? { difficultyLevel } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.questionBank.findMany({
      where,
      include: {
        options: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.questionBank.count({
      where,
    }),
  ]);

  return {
    items,
    total,
  };
}

/**
 * Future-compatibility check for the Exam module: a question that is
 * already part of an exam's question pool (ExamQuestion) must not be
 * deleted, so exam configs never end up pointing at a missing question.
 */
export async function isUsedInAnyExam(id: string): Promise<boolean> {
  const count = await prisma.examQuestion.count({
    where: {
      questionId: id,
    },
  });

  return count > 0;
}

/**
 * Options rows cascade-delete automatically (schema: onDelete: Cascade
 * on Option -> QuestionBank). ExamQuestion has onDelete: Restrict on
 * QuestionBank, so the DB itself also rejects this delete if
 * isUsedInAnyExam() were ever skipped — the service-level check just
 * gives a friendlier 409 before hitting that DB constraint.
 */
export async function remove(id: string): Promise<void> {
  await prisma.questionBank.delete({
    where: {
      id,
    },
  });
}
/**
 * Updates only modelAnswerFileUrl (used by the model-answer upload
 * route). Deliberately NOT going through updateWithOptions — this is a
 * single-field patch, no need to touch options at all.
 */
export async function updateModelAnswerFileUrl(id: string, fileUrl: string) {
  return prisma.questionBank.update({
    where: { id },
    data: { modelAnswerFileUrl: fileUrl },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  });
}
