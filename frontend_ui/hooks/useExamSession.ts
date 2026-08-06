"use client";

// hooks/useExamSession.ts
//
// Local timer ticks every second for smooth UI; every 20s it resyncs
// with the server's authoritative timeRemainingSeconds (server clock
// always wins — this just avoids hammering the API every second).
// When local time hits 0, it proactively calls submitSession() so the
// student doesn't have to wait for the next resync to be kicked out.

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { examSessionService } from "@/services/examSessionService";
import { extractExamErrorMessage } from "@/components/exams/examErrors";
import type { ExamSessionView, SubmitSessionResult } from "@/types/examSession";

const RESYNC_INTERVAL_MS = 20_000;
const TEXT_AUTOSAVE_DEBOUNCE_MS = 1500;

export function useExamSession(sessionId: string) {
  const [session, setSession] = useState<ExamSessionView | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState<SubmitSessionResult | null>(null);

  const textDebounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Keyed per-question (NOT a single shared ref) so selecting an option on
  // Q1 and then quickly switching to Q2 doesn't cancel Q1's pending save.
  const optionDebounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const hasAutoSubmitted = useRef(false);

  const [visitedQuestionIds, setVisitedQuestionIds] = useState<Set<string>>(new Set());

  const fetchSession = useCallback(async () => {
    try {
      const data = await examSessionService.getSession(sessionId);
      setSession(data);
      setTimeRemaining(data.timeRemainingSeconds);
      if (data.status !== "IN_PROGRESS" && !finalResult) {
        setFinalResult({ status: data.status });
      }
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, finalResult]);

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Resync with server periodically (source of truth for time + to
  // catch a lazy server-side auto-submit from another tab/device).
  useEffect(() => {
    if (!session || session.status !== "IN_PROGRESS") return;
    const interval = setInterval(fetchSession, RESYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [session, fetchSession]);

  // Local 1s countdown for smooth UI.
  useEffect(() => {
    if (!session || session.status !== "IN_PROGRESS") return;
    const interval = setInterval(() => {
      setTimeRemaining((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const submitExam = useCallback(async () => {
    if (hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;
    setIsSubmitting(true);
    try {
      const result = await examSessionService.submitSession(sessionId);
      setFinalResult(result);
      setSession((s) => (s ? { ...s, status: result.status } : s));
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
      hasAutoSubmitted.current = false; // allow retry on failure
    } finally {
      setIsSubmitting(false);
    }
  }, [sessionId]);

  // Time's up -> submit automatically.
  useEffect(() => {
    if (session?.status === "IN_PROGRESS" && timeRemaining <= 0) {
      submitExam();
    }
  }, [timeRemaining, session, submitExam]);

  function selectOptions(questionId: string, optionIds: string[]) {
    // 1. Optimistic, IMMUTABLE update — goes through setSession so React
    //    actually re-renders (the navigator sidebar's color depends on
    //    this state), unlike mutating session.questions in place which
    //    React can't detect and never repaints from.
    setSession((s) => {
      if (!s) return s;
      return {
        ...s,
        questions: s.questions.map((q) =>
          q.questionId === questionId
            ? {
                ...q,
                answer: {
                  submittedText: q.answer?.submittedText ?? null,
                  submittedFileUrl: q.answer?.submittedFileUrl ?? null,
                  markedForReview: q.answer?.markedForReview ?? false,
                  selectedOptionIds: optionIds,
                },
              }
            : q
        ),
      };
    });

    // 2. Debounce the actual network save PER QUESTION so rapid clicks on
    //    the same question coalesce into one request, without cancelling
    //    saves for other questions the student has since moved on to.
    if (optionDebounceTimers.current[questionId]) {
      clearTimeout(optionDebounceTimers.current[questionId]);
    }
    optionDebounceTimers.current[questionId] = setTimeout(async () => {
      try {
        const updated = await examSessionService.submitAnswer(sessionId, {
          questionId,
          selectedOptionIds: optionIds,
        });
        setSession(updated); // reconcile with server truth
      } catch (err) {
        toast.error(extractExamErrorMessage(err));
      }
    }, 300);
  }

  function setTextDraft(questionId: string, text: string) {
    // Optimistic local update so typing feels instant.
    setSession((s) => {
      if (!s) return s;
      return {
        ...s,
        questions: s.questions.map((q) =>
          q.questionId === questionId
            ? { ...q, answer: { ...(q.answer ?? { submittedFileUrl: null, selectedOptionIds: [], markedForReview: false }), submittedText: text } }
            : q
        ),
      };
    });

    if (textDebounceTimers.current[questionId]) {
      clearTimeout(textDebounceTimers.current[questionId]);
    }
    textDebounceTimers.current[questionId] = setTimeout(async () => {
      try {
        // An empty/whitespace-only box means the student cleared their
        // answer, not "no answer yet". The backend deliberately REJECTS
        // an empty submittedText for SHORT_ANSWER/LONG_ANSWER (422:
        // "submittedText is required") — that's correct for the normal
        // save path, but it means typing something and then deleting it
        // all was hitting that same validation and surfacing a
        // confusing error. Route empty text through clearAnswer instead,
        // which explicitly supports wiping an answer without erroring.
        if (text.trim().length === 0) {
          await examSessionService.clearAnswer(sessionId, questionId);
        } else {
          await examSessionService.submitAnswer(sessionId, { questionId, submittedText: text });
        }
      } catch (err) {
        toast.error(extractExamErrorMessage(err));
      }
    }, TEXT_AUTOSAVE_DEBOUNCE_MS);
  }

  const markVisited = useCallback((questionId: string) => {
    setVisitedQuestionIds((prev) => {
      if (prev.has(questionId)) return prev; // no-op, avoids extra re-render
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  }, []);

  async function uploadFile(questionId: string, file: File) {
    try {
      const updated = await examSessionService.submitAnswerFile(sessionId, questionId, file);
      setSession(updated);
      toast.success("File uploaded");
    } catch (err) {
      toast.error(extractExamErrorMessage(err));
    }
  }

  async function toggleMarkForReview(questionId: string, current: boolean) {
  try {
    const updated = await examSessionService.setMarkedForReview(sessionId, questionId, !current);
    setSession(updated);
  } catch (err) {
    toast.error(extractExamErrorMessage(err));
  }
}

async function clearAnswer(questionId: string) {
  // pending debounced text-save ko cancel karo, warna clear ke baad purana text wapas aa sakta hai
  if (textDebounceTimers.current[questionId]) {
    clearTimeout(textDebounceTimers.current[questionId]);
  }
  try {
    const updated = await examSessionService.clearAnswer(sessionId, questionId);
    setSession(updated);
    toast.success("Response cleared");
  } catch (err) {
    toast.error(extractExamErrorMessage(err));
  }
}

  return {
    session,
  timeRemaining,
  isLoading,
  isSubmitting,
  finalResult,
  visitedQuestionIds,   
  markVisited,          
  toggleMarkForReview,
  clearAnswer,        
  selectOptions,
  setTextDraft,
  uploadFile,
  submitExam,
  };
}
