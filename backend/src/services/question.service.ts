import fs from "fs";
import { ApiError } from '../utils/apiError';
import { Prisma, Role, QuestionType } from '@prisma/client';
import type { ZodError } from 'zod';

import * as questionRepository from "../repositories/question.repository";
import type { QuestionWithOptions } from '../repositories/question.repository';

import {
  createQuestionSchema,
  updateQuestionSchema,
  listQuestionsQuerySchema,
  type CreateQuestionInput,
  type UpdateQuestionInput,
} from '../schemas/question.schema';

/**
 * Minimal shape of the authenticated user your JWT auth middleware
 * attaches to `req.user`.
 */
export interface AuthUser {
  id: string;
  role: Role;
}

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(", ");

  return new ApiError(422, message);
}

/**
 * Strip isCorrect from options for non-privileged callers.
 */
export function sanitizeQuestion(
  question: QuestionWithOptions | null,
  viewerRole: Role
): Record<string, unknown> | null {
  if (!question) return question;
  const isPrivileged = viewerRole === Role.EXAMINER || viewerRole === Role.ADMIN;
  if (isPrivileged) return question;

  return {
    ...question,
    options: (question.options ?? []).map(({ isCorrect, ...rest }) => rest),
  };
}

export async function createQuestion(payload: unknown, currentUser: AuthUser): Promise<unknown> {
  const parsed = createQuestionSchema.safeParse(payload);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  const question = await questionRepository.createWithOptions(parsed.data as CreateQuestionInput, currentUser.id);
  return sanitizeQuestion(question, currentUser.role);
}

export async function listQuestions(rawQuery: unknown, currentUser: AuthUser) {
  const parsedQuery = listQuestionsQuerySchema.safeParse(rawQuery);
  if (!parsedQuery.success) throw zodErrorToApiError(parsedQuery.error);

  const { page, limit } = parsedQuery.data;
  const { items, total } = await questionRepository.findMany(parsedQuery.data);

  return {
    items: items.map((q) => sanitizeQuestion(q, currentUser.role)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getQuestionById(id: string, currentUser: AuthUser) {
  const question = await questionRepository.findById(id);
  if (!question) throw new ApiError(404, 'Question not found');
  return sanitizeQuestion(question, currentUser.role);
}

function assertCanModify(question: QuestionWithOptions, currentUser: AuthUser): void {
  const isOwner = question.createdById === currentUser.id;
  const isAdmin = currentUser.role === Role.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to modify this question');
  }
}

export async function updateQuestion(id: string, payload: unknown, currentUser: AuthUser) {
  const existing = await questionRepository.findById(id);
  if (!existing) throw new ApiError(404, 'Question not found');

  assertCanModify(existing, currentUser);

  const parsed = updateQuestionSchema.safeParse(payload);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  try {
    const updated = await questionRepository.updateWithOptions(id, parsed.data as UpdateQuestionInput);
    return sanitizeQuestion(updated, currentUser.role);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new ApiError(404, 'Question not found');
    }
    throw err;
  }
}

export async function deleteQuestion(id: string, currentUser: AuthUser): Promise<void> {
  const existing = await questionRepository.findById(id);
  if (!existing) throw new ApiError(404, 'Question not found');

  assertCanModify(existing, currentUser);

  const isUsed = await questionRepository.isUsedInAnyExam(id);
  if (isUsed) {
    throw new ApiError(409, 'Question is used in an exam and cannot be deleted');
  }

  try {
    await questionRepository.remove(id);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2025') throw new ApiError(404, 'Question not found');
      if (err.code === 'P2003') {
        throw new ApiError(409, 'Question is used in an exam and cannot be deleted');
      }
    }
    throw err;
  }
}

/**
 * Attaches an examiner-uploaded reference solution file to an
 * IMAGE_UPLOAD question.
 */
export async function attachModelAnswer(
  id: string,
  filePath: string,
  currentUser: AuthUser
) {
  const existing = await questionRepository.findById(id);

  if (!existing) {
    fs.unlink(filePath, () => undefined);
    throw new ApiError(404, "Question not found");
  }

  assertCanModify(existing, currentUser);

  if (existing.questionType !== QuestionType.IMAGE_UPLOAD) {
    fs.unlink(filePath, () => undefined);
    throw new ApiError(400, "Model answers can only be attached to IMAGE_UPLOAD questions");
  }

  const filename = filePath.split(/[\\/]/).pop();
  const publicPath = `/uploads/model-answers/${filename}`;

  const updated = await questionRepository.updateModelAnswerFileUrl(id, publicPath);
  return sanitizeQuestion(updated, currentUser.role);
}
