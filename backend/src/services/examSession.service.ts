// src/services/examSession.service.ts
//
// DELIBERATE SCOPE LIMITS for this "basic" pass (flagging clearly
// rather than silently omitting):
//   - No APScheduler-equivalent background job for auto-submit-on-
//     expiry. Instead, expiry is checked LAZILY the next time the
//     student's browser calls GET /sessions/:id (polling this every
//     ~10-30s from the frontend timer achieves the same practical
//     effect without adding a job-scheduling dependency). A true
//     background sweep can be added later (e.g. node-cron) without
//     changing this service's public functions.
//   - MULTI_SELECT scoring here is all-or-nothing (full marks only if
//     the selected set exactly equals the correct set). Partial credit
//     isn't specified in the doc; this is a documented judgment call.
//   - AI/LLM scoring of subjective answers is NOT done here — this
//     just creates PENDING SubjectiveGrading rows for the examiner
//     (and later LLM pipeline) to fill in. That's explicitly a
//     separate later task.
//   - Single-active-session-per-student-exam is already enforced by
//     the DB's @@unique([studentId, examId]) on ExamSession.

import fs from "fs";
import { ApiError } from "../utils/apiError";
import { QuestionType, Role, SessionStatus, Prisma } from "@prisma/client";
import { prisma } from "../db/prisma";

import * as examSessionRepository from "../repositories/examSession.repository";
import type { ExamForSession, SessionWithPaper } from "../repositories/examSession.repository";
import { generateSessionPaper } from "./examPaperGenerator";
import {
  submitAnswerSchema,
  SHORT_ANSWER_MAX_WORDS,
  LONG_ANSWER_MAX_WORDS,
  type SubmitAnswerInput,
} from "../schemas/examSession.schema";
import type { ZodError } from "zod";

export interface AuthUser {
  id: string;
  role: Role;
}

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return new ApiError(422, message);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function buildPaperForSession(exam: ExamForSession, studentId: string) {
  const rulesWithCandidates = await Promise.all(
    exam.selectionRules.map(async (rule) => {
      const candidates = await examSessionRepository.findCandidateQuestions({
        subject: rule.subject,
        questionType: rule.questionType,
        difficultyLevel: rule.difficultyLevel,
      });
      return { count: rule.count, candidates };
    })
  );

  return generateSessionPaper({
    examId: exam.id,
    studentId,
    randomizationMode: exam.randomizationMode,
    poolQuestions: exam.examQuestions.map((eq) => ({
      questionId: eq.questionId,
      marksOverride: eq.marksOverride,
      marks: eq.question.marks,
    })),
    rules: rulesWithCandidates,
  });
}

/** Strips answer-key info (isCorrect) and examiner-only fields before sending to the student. */
function toStudentSessionView(session: SessionWithPaper, timeRemainingSeconds: number) {
  const answersByQuestion = new Map(session.answers.map((a) => [a.questionId, a]));

  return {
    id: session.id,
    examId: session.examId,
    status: session.status,
    startTime: session.startTime,
    endTime: session.endTime,
    timeRemainingSeconds,
    exam: {
      title: session.exam.title,
      subject: session.exam.subject,
      durationMinutes: session.exam.durationMinutes,
      negativeMarkingEnabled: session.exam.negativeMarkingEnabled,
      webcamMonitoringEnabled: session.exam.webcamMonitoringEnabled,
      audioMonitoringEnabled: session.exam.audioMonitoringEnabled,
      multiFaceDetectionEnabled: session.exam.multiFaceDetectionEnabled,
      fullScreenModeEnabled: session.exam.fullScreenModeEnabled,
      gazeSensitivity: session.exam.gazeSensitivity,
      maxTabSwitchWarnings: session.exam.maxTabSwitchWarnings,
    },
    questions: session.sessionQuestions.map((sq) => {
      const existingAnswer = answersByQuestion.get(sq.questionId);
      return {
        questionId: sq.questionId,
        sequenceOrder: sq.sequenceOrder,
        marksAllocated: sq.marksAllocated,
        questionText: sq.question.questionText,
        questionType: sq.question.questionType,
        subject: sq.question.subject,
        difficultyLevel: sq.question.difficultyLevel,
        options:
          sq.question.questionType === QuestionType.MCQ || sq.question.questionType === QuestionType.MULTI_SELECT
            ? sq.question.options.map((o) => ({ id: o.id, optionText: o.optionText })) // no isCorrect
            : undefined,
        answer: existingAnswer
          ? {
              submittedText: existingAnswer.submittedText,
              submittedFileUrl: existingAnswer.submittedFileUrl,
              selectedOptionIds: existingAnswer.selectedOptions.map((so) => so.optionId),
              markedForReview: existingAnswer.markedForReview,
            }
          : null,
      };
    }),
  };
}

/**
 * Builds the student-facing view for `session` with ONE answer patched in
 * memory, instead of re-fetching the whole session (all questions + all
 * options + all answers) from the DB a second time.
 *
 * Every answer-save used to do TWO heavy `findSessionWithPaper` queries —
 * one inside assertSessionWritable() and a second one inside the
 * getSession() call made right after saving. On exams with many
 * questions/options that round-trip was slow enough to (a) make the
 * navigator's answered/not-answered color visibly lag behind the click,
 * and (b) occasionally blow past the frontend's request timeout under
 * rapid clicking, surfacing as a generic "Something went wrong" toast.
 * This keeps the response correct while only hitting the DB once.
 */
function toStudentSessionViewWithPatchedAnswer(
  session: SessionWithPaper,
  timeRemainingSeconds: number,
  questionId: string,
  patch: {
    submittedText?: string | null;
    submittedFileUrl?: string | null;
    selectedOptionIds?: string[];
    markedForReview?: boolean;
  }
) {
  const existing = session.answers.find((a) => a.questionId === questionId);

  const patchedAnswer = {
    ...(existing ?? {}),
    questionId,
    submittedText: patch.submittedText !== undefined ? patch.submittedText : existing?.submittedText ?? null,
    submittedFileUrl:
      patch.submittedFileUrl !== undefined ? patch.submittedFileUrl : existing?.submittedFileUrl ?? null,
    markedForReview: patch.markedForReview !== undefined ? patch.markedForReview : existing?.markedForReview ?? false,
    selectedOptions:
      patch.selectedOptionIds !== undefined
        ? patch.selectedOptionIds.map((optionId) => ({ optionId }))
        : existing?.selectedOptions ?? [],
  };

  const patchedSession = {
    ...session,
    answers: [...session.answers.filter((a) => a.questionId !== questionId), patchedAnswer],
  } as SessionWithPaper;

  return toStudentSessionView(patchedSession, timeRemainingSeconds);
}

function assertOwnsSession(session: { studentId: string }, currentUser: AuthUser) {
  if (session.studentId !== currentUser.id) {
    throw new ApiError(403, "You do not have access to this exam session");
  }
}

function computeTimeRemainingSeconds(session: SessionWithPaper): number {
  const elapsedMs = Date.now() - new Date(session.startTime).getTime();
  const totalMs = session.exam.durationMinutes * 60 * 1000;
  return Math.max(0, Math.floor((totalMs - elapsedMs) / 1000));
}

export async function startSession(examId: string, currentUser: AuthUser) {
  const exam = await examSessionRepository.findExamForSession(examId);
  if (!exam) throw new ApiError(404, "Exam not found");

  const now = Date.now();
  if (now < new Date(exam.startTime).getTime() || now > new Date(exam.endTime).getTime()) {
    throw new ApiError(403, "This exam is not currently open for entry");
  }

  const existing = await examSessionRepository.findActiveSession(currentUser.id, examId);
  if (existing) {
    if (existing.status === SessionStatus.IN_PROGRESS) {
      return getSession(existing.id, currentUser); // resume, don't regenerate
    }
    throw new ApiError(409, "You have already attempted this exam");
  }

  const paper = await buildPaperForSession(exam, currentUser.id);
  if (paper.length === 0) {
    throw new ApiError(400, "This exam has no questions configured yet");
  }

  const session = await examSessionRepository.createSessionWithPaper(currentUser.id, examId, paper);
  return getSession(session.id, currentUser);
}

export async function getSession(sessionId: string, currentUser: AuthUser) {
  const session = await examSessionRepository.findSessionWithPaper(sessionId);
  if (!session) throw new ApiError(404, "Session not found");
  assertOwnsSession(session, currentUser);

  const timeRemainingSeconds = computeTimeRemainingSeconds(session);

  // Lazy auto-submit: if time is up and it's still marked IN_PROGRESS,
  // finalize it now (see file header re: no background scheduler).
  if (session.status === SessionStatus.IN_PROGRESS && timeRemainingSeconds <= 0) {
    await finalizeSession(session.id, currentUser, SessionStatus.AUTO_SUBMITTED);
    const refreshed = await examSessionRepository.findSessionWithPaper(sessionId);
    if (!refreshed) throw new ApiError(404, "Session not found");
    return toStudentSessionView(refreshed, 0);
  }

  return toStudentSessionView(session, timeRemainingSeconds);
}

async function assertSessionWritable(sessionId: string, currentUser: AuthUser) {
  const session = await examSessionRepository.findSessionWithPaper(sessionId);
  if (!session) throw new ApiError(404, "Session not found");
  assertOwnsSession(session, currentUser);

  if (session.status !== SessionStatus.IN_PROGRESS) {
    throw new ApiError(409, "This session has already been submitted");
  }
  if (computeTimeRemainingSeconds(session) <= 0) {
    throw new ApiError(400, "Time is up — this session is being auto-submitted");
  }
  return session;
}

export async function submitAnswer(sessionId: string, payload: unknown, currentUser: AuthUser) {
  const parsed = submitAnswerSchema.safeParse(payload);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);

  const session = await assertSessionWritable(sessionId, currentUser);
  const timeRemainingSeconds = computeTimeRemainingSeconds(session);

  const { questionId, selectedOptionIds, submittedText, markedForReview, clearAnswer } =
    parsed.data as SubmitAnswerInput;

  const sessionQuestion = session.sessionQuestions.find((sq) => sq.questionId === questionId);
  if (!sessionQuestion) throw new ApiError(400, "This question is not part of your paper");

  const { questionType } = sessionQuestion.question;

  // Pure "mark for review" toggle or "clear answer" — no content validation needed,
  // these bypass the per-type answer checks below.
  if (clearAnswer) {
    await examSessionRepository.clearAnswer({
      examSessionId: sessionId,
      studentId: currentUser.id,
      questionId,
    });
    return toStudentSessionViewWithPatchedAnswer(session, timeRemainingSeconds, questionId, {
      submittedText: null,
      submittedFileUrl: null,
      selectedOptionIds: [],
    });
  }

  if (markedForReview !== undefined && selectedOptionIds === undefined && submittedText === undefined) {
    await examSessionRepository.setMarkedForReview({
      examSessionId: sessionId,
      studentId: currentUser.id,
      questionId,
      markedForReview,
    });
    return toStudentSessionViewWithPatchedAnswer(session, timeRemainingSeconds, questionId, { markedForReview });
  }

  if (questionType === QuestionType.IMAGE_UPLOAD) {
    throw new ApiError(400, "Use the file-upload endpoint for IMAGE_UPLOAD questions");
  }
  if (questionType === QuestionType.MCQ && (selectedOptionIds ?? []).length !== 1) {
    throw new ApiError(422, "MCQ requires exactly one selected option");
  }
  if (questionType === QuestionType.MULTI_SELECT && (selectedOptionIds ?? []).length < 1) {
    throw new ApiError(422, "MULTI_SELECT requires at least one selected option");
  }
  if (questionType === QuestionType.SHORT_ANSWER) {
    if (!submittedText) throw new ApiError(422, "submittedText is required");
    if (wordCount(submittedText) > SHORT_ANSWER_MAX_WORDS) {
      throw new ApiError(422, `Answer exceeds ${SHORT_ANSWER_MAX_WORDS} words`);
    }
  }
  if (questionType === QuestionType.LONG_ANSWER) {
    if (!submittedText) throw new ApiError(422, "submittedText is required");
    if (wordCount(submittedText) > LONG_ANSWER_MAX_WORDS) {
      throw new ApiError(422, `Answer exceeds ${LONG_ANSWER_MAX_WORDS} words`);
    }
  }

  await examSessionRepository.upsertAnswer({
    examSessionId: sessionId,
    studentId: currentUser.id,
    questionId,
    submittedText,
    selectedOptionIds:
      questionType === QuestionType.MCQ || questionType === QuestionType.MULTI_SELECT ? selectedOptionIds : undefined,
    markedForReview, // pass through so an answer + review-flag can be saved in one call too
  });

  return toStudentSessionViewWithPatchedAnswer(session, timeRemainingSeconds, questionId, {
    submittedText: submittedText ?? null,
    selectedOptionIds:
      questionType === QuestionType.MCQ || questionType === QuestionType.MULTI_SELECT ? selectedOptionIds : undefined,
    markedForReview,
  });
}

export async function submitAnswerFile(
  sessionId: string,
  questionId: string,
  filePath: string,
  currentUser: AuthUser
) {
  let session;
  try {
    session = await assertSessionWritable(sessionId, currentUser);
  } catch (err) {
    fs.unlink(filePath, () => undefined);
    throw err;
  }

  const sessionQuestion = session.sessionQuestions.find((sq) => sq.questionId === questionId);
  if (!sessionQuestion || sessionQuestion.question.questionType !== QuestionType.IMAGE_UPLOAD) {
    fs.unlink(filePath, () => undefined);
    throw new ApiError(400, "This question does not accept file uploads");
  }

  const filename = filePath.split(/[\\/]/).pop();
  const publicPath = `/uploads/answers/${filename}`;

  await examSessionRepository.updateAnswerFileUrl(sessionId, questionId, currentUser.id, publicPath);
  return getSession(sessionId, currentUser);
}

export async function submitSession(sessionId: string, currentUser: AuthUser) {
  await assertSessionWritable(sessionId, currentUser); // re-verifies ownership + not-yet-finalized
  return finalizeSession(sessionId, currentUser, SessionStatus.SUBMITTED);
}

/**
 * Shared by explicit student submission AND the lazy auto-submit path.
 * Auto-evaluates MCQ/MULTI_SELECT answers, queues subjective answers
 * for grading (SubjectiveGrading, status PENDING — filled in by the
 * examiner or a future LLM pipeline, both out of scope here), and
 * writes the auto-graded portion into Result.totalMarks.
 */
async function finalizeSession(
  sessionId: string,
  currentUser: AuthUser,
  finalStatus: typeof SessionStatus.SUBMITTED | typeof SessionStatus.AUTO_SUBMITTED
) {
  const session = await examSessionRepository.findSessionWithPaper(sessionId);
  if (!session) throw new ApiError(404, "Session not found");
  if (session.status !== SessionStatus.IN_PROGRESS) {
    return { status: session.status, alreadyFinalized: true };
  }

  const answersByQuestion = new Map(session.answers.map((a) => [a.questionId, a]));

  // IMPORTANT: this used to fire N independent DB calls concurrently via
  // Promise.all — faster than the original sequential loop, but each one
  // opened its own connection at (roughly) the same instant. On a hosted
  // Postgres with a capped/pooled connection limit (Neon, Supabase,
  // Railway, etc.) that connection burst is exactly what shows up as
  // "Error in PostgreSQL connection ... connection forcibly closed by the
  // remote host" — the provider/pooler resets connections it can't
  // accommodate. The fix keeps the speed win but does it over ONE
  // connection: compute everything in memory first (no DB calls in this
  // loop), then send all the writes together as a single batched
  // `prisma.$transaction([...])` call.
  let autoGradedTotal = 0;
  let pendingSubjectiveCount = 0;
  const writeOps: Prisma.PrismaPromise<unknown>[] = [];

  for (const sq of session.sessionQuestions) {
    const answer = answersByQuestion.get(sq.questionId);
    const { questionType } = sq.question;

    if (questionType === QuestionType.MCQ || questionType === QuestionType.MULTI_SELECT) {
      if (!answer) continue; // unattempted: 0 marks, no penalty

      const correctIds = new Set(sq.question.options.filter((o) => o.isCorrect).map((o) => o.id));
      const selectedIds = new Set(answer.selectedOptions.map((so) => so.optionId));
      const isExactMatch =
        correctIds.size === selectedIds.size && [...correctIds].every((id) => selectedIds.has(id));

      const marks = isExactMatch
        ? sq.marksAllocated
        : session.exam.negativeMarkingEnabled
        ? -sq.question.negativeMarks
        : 0;

      writeOps.push(examSessionRepository.setAnswerMarks(answer.id, marks));
      autoGradedTotal += marks;
    } else {
      // SHORT_ANSWER / LONG_ANSWER / IMAGE_UPLOAD -> queue for grading
      if (!answer) continue; // nothing submitted, nothing to grade
      writeOps.push(examSessionRepository.createPendingGrading(answer.id));
      pendingSubjectiveCount += 1;
    }
  }

  writeOps.push(examSessionRepository.updateSessionStatus(sessionId, finalStatus));
  writeOps.push(examSessionRepository.upsertResult(sessionId, autoGradedTotal));

  await prisma.$transaction(writeOps);

  return {
    status: finalStatus,
    autoGradedMarks: autoGradedTotal,
    pendingSubjectiveCount,
  };
}
