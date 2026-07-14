// src/services/submission.service.ts
//
// "Fully graded" isn't the same as "AI-graded" — this basic pass has
// no LLM scoring, so gradingStatus is only ever one of:
//   FULLY_AUTO_GRADED -> no subjective answers at all (pure MCQ/MULTI_SELECT exam)
//   PENDING_REVIEW    -> at least one SubjectiveGrading row still PENDING
//   FULLY_GRADED      -> every subjective answer has been manually graded

import { ApiError } from "../utils/apiError";
import { Role } from "@prisma/client";
import type { ZodError } from "zod";

import * as submissionRepository from "../repositories/submission.repository";
import type { SubmissionListItem, SessionForGrading } from "../repositories/submission.repository";
import { gradeAnswerSchema, listSubmissionsQuerySchema } from "../schemas/submission.schema";

export interface AuthUser {
  id: string;
  role: Role;
}

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return new ApiError(422, message);
}

function computeGradingStatus(session: SubmissionListItem): "FULLY_AUTO_GRADED" | "PENDING_REVIEW" | "FULLY_GRADED" {
  const gradings = session.answers.map((a) => a.grading).filter(Boolean);
  if (gradings.length === 0) return "FULLY_AUTO_GRADED";
  const pending = gradings.filter((g) => g!.status === "PENDING").length;
  return pending > 0 ? "PENDING_REVIEW" : "FULLY_GRADED";
}

function assertOwnsExam(session: { exam: { createdById: string | null } }, currentUser: AuthUser): void {
  const isOwner = session.exam.createdById === currentUser.id;
  const isAdmin = currentUser.role === Role.ADMIN;
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You do not have permission to view this submission");
  }
}

export async function listSubmissions(rawQuery: unknown, currentUser: AuthUser) {
  const parsed = listSubmissionsQuerySchema.safeParse(rawQuery);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  const { page, limit, examId, status } = parsed.data;
  const { items, total } = await submissionRepository.findSubmittedSessions(currentUser.id, {
    examId,
    page,
    limit,
  });

  const shaped = items.map((s) => ({
    id: s.id,
    examId: s.examId,
    examTitle: s.exam.title,
    examSubject: s.exam.subject,
    studentName: s.student.name,
    studentEmail: s.student.email,
    submittedAt: s.endTime,
    sessionStatus: s.status,
    autoGradedMarks: s.result?.totalMarks ?? 0,
    gradingStatus: computeGradingStatus(s),
    pendingCount: s.answers.filter((a) => a.grading?.status === "PENDING").length,
  }));

  const filtered = status ? shaped.filter((s) => s.gradingStatus === status) : shaped;

  return {
    items: filtered,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

function shapeSubmissionDetail(session: SessionForGrading) {
  return {
    id: session.id,
    examTitle: session.exam.title,
    studentName: session.student.name,
    studentEmail: session.student.email,
    submittedAt: session.endTime,
    status: session.status,
    totalMarks: session.result?.totalMarks ?? 0,
    questions: session.sessionQuestions.map((sq) => {
      const answer = session.answers.find((a) => a.questionId === sq.questionId);
      const isObjective = sq.question.questionType === "MCQ" || sq.question.questionType === "MULTI_SELECT";

      return {
        questionId: sq.questionId,
        questionText: sq.question.questionText,
        questionType: sq.question.questionType,
        marksAllocated: sq.marksAllocated,
        isObjective,
        options: isObjective
          ? sq.question.options.map((o) => ({ id: o.id, optionText: o.optionText, isCorrect: o.isCorrect }))
          : undefined,
        selectedOptionIds: answer?.selectedOptions.map((so) => so.optionId) ?? [],
        submittedText: answer?.submittedText ?? null,
        submittedFileUrl: answer?.submittedFileUrl ?? null,
        marksAwarded: answer?.marksAwarded ?? null,
        answerId: answer?.id ?? null,
        grading: answer?.grading
          ? {
              status: answer.grading.status,
              examinerScore: answer.grading.examinerScore,
              feedback: answer.grading.feedback,
            }
          : null,
      };
    }),
  };
}

export async function getSubmissionForGrading(sessionId: string, currentUser: AuthUser) {
  const session = await submissionRepository.findSessionForGrading(sessionId);
  if (!session) throw new ApiError(404, "Submission not found");
  assertOwnsExam(session, currentUser);
  return shapeSubmissionDetail(session);
}

export async function gradeAnswer(answerId: string, payload: unknown, currentUser: AuthUser) {
  const parsed = gradeAnswerSchema.safeParse(payload);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  const answer = await submissionRepository.findAnswerById(answerId);
  if (!answer) throw new ApiError(404, "Answer not found");
  if (!answer.grading) throw new ApiError(400, "This answer does not require manual grading");

  assertOwnsExam({ exam: answer.examSession.exam }, currentUser);

  await submissionRepository.gradeAnswer(answerId, currentUser.id, parsed.data.score, parsed.data.feedback);
  return getSubmissionForGrading(answer.examSessionId, currentUser);
}

export async function finalizeSubmission(sessionId: string, currentUser: AuthUser) {
  const session = await submissionRepository.findSessionForGrading(sessionId);
  if (!session) throw new ApiError(404, "Submission not found");
  assertOwnsExam(session, currentUser);

  const pending = await submissionRepository.countPendingGradings(sessionId);
  if (pending > 0) {
    throw new ApiError(409, `${pending} answer(s) still need grading before finalizing`);
  }

  return submissionRepository.finalizeResult(sessionId);
}
