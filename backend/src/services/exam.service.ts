// import type { Exam, User } from "@prisma/client";

// import { examRepository, examSessionRepository } from "../repositories/exam.repository";
// import { questionRepository } from "../repositories/question.repository";
// import { ApiError } from "../utils/apiError";
// import { seededPick, seededShuffle } from "../utils/seededRandom";
// import { toQuestionForStudent } from "../utils/serializeQuestion";
// import type { CreateExamInput, UpdateExamInput } from "../schemas/exam.schema";

// interface SelectionRule {
//   subject: string;
//   questionType?: string;
//   difficultyLevel?: string;
//   count: number;
// }

// function assertCanModify(actingUser: User, ownerId: string) {
//   const isOwner = actingUser.role === "EXAMINER" && actingUser.id === ownerId;
//   const isAdmin = actingUser.role === "ADMIN";
//   if (!isOwner && !isAdmin) {
//     throw ApiError.forbidden("Only the exam's creator or an admin can modify it");
//   }
// }

// /** Public shape — hides `selectionRules` so students can't reverse-engineer the question pool. */
// function toExamPublic(exam: Exam) {
//   return {
//     id: exam.id,
//     subject: exam.subject,
//     durationMinutes: exam.durationMinutes,
//     startTime: exam.startTime,
//     endTime: exam.endTime,
//     negativeMarks: exam.negativeMarks,
//     proctoringSettings: exam.proctoringSettings,
//   };
// }

// /** Full shape — examiners/admins get the selection rules too. */
// function toExamFull(exam: Exam) {
//   return {
//     ...toExamPublic(exam),
//     randomizeQuestions: exam.randomizeQuestions,
//     selectionRules: exam.selectionRules,
//     createdById: exam.createdById,
//   };
// }

// export const examService = {
//   async create(input: CreateExamInput, createdBy: User) {
//     const exam = await examRepository.create({
//       subject: input.subject,
//       durationMinutes: input.durationMinutes,
//       startTime: input.startTime,
//       endTime: input.endTime,
//       negativeMarks: input.negativeMarks,
//       randomizeQuestions: input.randomizeQuestions,
//       selectionRules: input.selectionRules as never,
//       proctoringSettings: input.proctoringSettings as never,
//       createdById: createdBy.id,
//     });
//     return toExamFull(exam);
//   },

//   async list(actingUser: User) {
//     if (actingUser.role === "STUDENT") {
//       const now = new Date();
//       const exams = await examRepository.findMany({ startTime: { lte: now }, endTime: { gte: now } });
//       return exams.map(toExamPublic);
//     }
//     if (actingUser.role === "EXAMINER") {
//       const exams = await examRepository.findMany({ createdById: actingUser.id });
//       return exams.map(toExamFull);
//     }
//     const exams = await examRepository.findMany({}); // ADMIN sees everything
//     return exams.map(toExamFull);
//   },

//   async getById(id: string, actingUser: User) {
//     const exam = await examRepository.findById(id);
//     if (!exam) throw ApiError.notFound("Exam not found");
//     if (actingUser.role === "STUDENT") return toExamPublic(exam);
//     return toExamFull(exam);
//   },

//   async update(id: string, input: UpdateExamInput, actingUser: User) {
//     const existing = await examRepository.findById(id);
//     if (!existing) throw ApiError.notFound("Exam not found");
//     assertCanModify(actingUser, existing.createdById);

//     const updated = await examRepository.update(id, {
//       subject: input.subject,
//       durationMinutes: input.durationMinutes,
//       startTime: input.startTime,
//       endTime: input.endTime,
//       negativeMarks: input.negativeMarks,
//       randomizeQuestions: input.randomizeQuestions,
//       selectionRules: input.selectionRules as never,
//       proctoringSettings: input.proctoringSettings as never,
//     });
//     return toExamFull(updated);
//   },

//   async remove(id: string, actingUser: User) {
//     const existing = await examRepository.findById(id);
//     if (!existing) throw ApiError.notFound("Exam not found");
//     assertCanModify(actingUser, existing.createdById);
//     await examRepository.delete(id);
//   },

//   /**
//    * The randomization core. For each selection rule, pulls the matching
//    * candidate pool from question_bank and deterministically picks
//    * `count` of them, seeded by `${studentId}:${examId}:${ruleIndex}`.
//    * Two students get two independent seeds → two different papers.
//    * The same student re-requesting gets the identical result.
//    */
//   async generateQuestionSetForStudent(exam: Exam, studentId: string): Promise<string[]> {
//     const rules = exam.selectionRules as unknown as SelectionRule[];
//     const selectedIds: string[] = [];

//     for (let i = 0; i < rules.length; i++) {
//       const rule = rules[i];
//       const pool = await questionRepository.findIdsMatchingRule({
//         subject: rule.subject,
//         questionType: rule.questionType as never,
//         difficultyLevel: rule.difficultyLevel as never,
//       });

//       if (pool.length < rule.count) {
//         throw ApiError.badRequest(
//           `Not enough questions in the bank for subject "${rule.subject}"` +
//             (rule.questionType ? `, type ${rule.questionType}` : "") +
//             (rule.difficultyLevel ? `, difficulty ${rule.difficultyLevel}` : "") +
//             ` — need ${rule.count}, have ${pool.length}`
//         );
//       }

//       const seed = exam.randomizeQuestions
//         ? `${studentId}:${exam.id}:${i}`
//         : `fixed-order:${exam.id}:${i}`; // randomization off → everyone gets the same pool/order
//       const picked = seededPick(pool, rule.count, seed).map((q) => q.id);
//       selectedIds.push(...picked);
//     }

//     // Shuffle the overall question order too, so sections don't always
//     // appear in rule-definition order.
//     const orderSeed = exam.randomizeQuestions ? `order:${studentId}:${exam.id}` : `order:fixed:${exam.id}`;
//     return seededShuffle(selectedIds, orderSeed);
//   },

//   /**
//    * Starts (or resumes) a student's attempt: validates the exam window
//    * is currently open, generates the randomized paper on first entry,
//    * and returns it with all answer-key fields stripped.
//    *
//    * Timed countdown, answer submission, auto-submit-on-timeout, and
//    * evaluation are the Exam Engine module (next up) — this only covers
//    * "hand the student their randomized paper."
//    */
//   async startSession(examId: string, student: User) {
//     const exam = await examRepository.findById(examId);
//     if (!exam) throw ApiError.notFound("Exam not found");

//     const now = new Date();
//     if (now < exam.startTime || now > exam.endTime) {
//       throw ApiError.badRequest("This exam is not currently open");
//     }

//     let session = await examSessionRepository.findByStudentAndExam(student.id, examId);

//     if (!session) {
//       const assignedQuestionIds = await examService.generateQuestionSetForStudent(exam, student.id);
//       session = await examSessionRepository.create({
//         studentId: student.id,
//         examId,
//         startTime: now,
//         assignedQuestions: assignedQuestionIds,
//         status: "IN_PROGRESS",
//       });
//     } else if (session.status !== "IN_PROGRESS") {
//       throw ApiError.conflict("You have already completed this exam");
//     }

//     const assignedIds = session.assignedQuestions as unknown as string[];
//     const questions = await questionRepository.findManyByIds(assignedIds);
//     // Preserve the randomized order — `findManyByIds` doesn't guarantee it.
//     const orderedQuestions = assignedIds
//       .map((id) => questions.find((q) => q.id === id))
//       .filter((q): q is NonNullable<typeof q> => Boolean(q));

//     return {
//       sessionId: session.id,
//       examId: exam.id,
//       durationMinutes: exam.durationMinutes,
//       startTime: session.startTime,
//       questions: orderedQuestions.map(toQuestionForStudent),
//     };
//   },
// };



// src/services/exam.service.ts

import { ApiError } from "../utils/apiError";
import { Prisma, Role } from "@prisma/client";
import type { ZodError } from "zod";

import * as examRepository from "../repositories/exam.repository";
import type { ExamWithDetails } from "../repositories/exam.repository";

import {
  createExamSchema,
  updateExamSchema,
  listExamsQuerySchema,
  addPoolQuestionsSchema,
  type CreateExamInput,
  type UpdateExamInput,
} from "../schemas/exam.schema";

export interface AuthUser {
  id: string;
  role: Role;
}

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join(", ");
  return new ApiError(422, message);
}

function assertCanModify(exam: ExamWithDetails, currentUser: AuthUser): void {
  const isOwner = exam.createdById === currentUser.id;
  const isAdmin = currentUser.role === Role.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You do not have permission to modify this exam");
  }
}

export async function createExam(payload: unknown, currentUser: AuthUser) {
  const parsed = createExamSchema.safeParse(payload);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  // questionIds isn't part of createExamSchema's own shape (it's kept
  // separate from the pure exam-config schema) but the create endpoint
  // still accepts it for convenience — pull it off the raw payload.
  const questionIds = Array.isArray((payload as Record<string, unknown>)?.questionIds)
    ? ((payload as Record<string, unknown>).questionIds as string[])
    : undefined;

  return examRepository.createWithRulesAndPool(
    { ...(parsed.data as CreateExamInput), questionIds },
    currentUser.id
  );
}

export async function listExams(rawQuery: unknown) {
  const parsedQuery = listExamsQuerySchema.safeParse(rawQuery);
  if (!parsedQuery.success) throw zodErrorToApiError(parsedQuery.error);

  const { page, limit } = parsedQuery.data;
  const { items, total } = await examRepository.findMany(parsedQuery.data);

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getExamById(id: string) {
  const exam = await examRepository.findById(id);
  if (!exam) throw new ApiError(404, "Exam not found");
  return exam;
}

export async function updateExam(id: string, payload: unknown, currentUser: AuthUser) {
  const existing = await examRepository.findById(id);
  if (!existing) throw new ApiError(404, "Exam not found");

  assertCanModify(existing, currentUser);

  const parsed = updateExamSchema.safeParse(payload);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  try {
    return await examRepository.updateWithRules(id, parsed.data as UpdateExamInput);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw new ApiError(404, "Exam not found");
    }
    throw err;
  }
}

export async function deleteExam(id: string, currentUser: AuthUser): Promise<void> {
  const existing = await examRepository.findById(id);
  if (!existing) throw new ApiError(404, "Exam not found");

  assertCanModify(existing, currentUser);

  const hasSessions = await examRepository.hasSessions(id);
  if (hasSessions) {
    throw new ApiError(409, "Exam has student sessions and cannot be deleted");
  }

  try {
    await examRepository.remove(id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") throw new ApiError(404, "Exam not found");
      if (err.code === "P2003") {
        throw new ApiError(409, "Exam has student sessions and cannot be deleted");
      }
    }
    throw err;
  }
}

export async function addQuestionsToPool(examId: string, payload: unknown, currentUser: AuthUser) {
  const existing = await examRepository.findById(examId);
  if (!existing) throw new ApiError(404, "Exam not found");

  assertCanModify(existing, currentUser);

  const parsed = addPoolQuestionsSchema.safeParse(payload);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  await examRepository.addPoolQuestions(examId, parsed.data.questionIds);
  return examRepository.findById(examId);
}

export async function removeQuestionFromPool(examId: string, questionId: string, currentUser: AuthUser) {
  const existing = await examRepository.findById(examId);
  if (!existing) throw new ApiError(404, "Exam not found");

  assertCanModify(existing, currentUser);

  await examRepository.removePoolQuestion(examId, questionId);
  return examRepository.findById(examId);
}



export async function listAvailableExams() {
  return examRepository.findAvailableForStudents();
}
