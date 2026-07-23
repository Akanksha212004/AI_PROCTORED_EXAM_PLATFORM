// src/services/analytics.service.ts

import type { ZodError } from "zod";

import { ApiError } from "../utils/apiError";
import * as analyticsRepository from "../repositories/analytics.repository";
import { analyticsQuerySchema } from "../schemas/analytics.schema";

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return new ApiError(422, message);
}

interface SessionRow {
  id: string;
  examId: string;
  startTime: Date;
  endTime: Date | null;
  exam: { title: string; subject: string; passingMarks: number };
  result: { totalMarks: number } | null;
  sessionQuestions: { marksAllocated: number }[];
}

interface Derived {
  examId: string;
  examTitle: string;
  subject: string;
  weekKey: string;
  percentage: number | null;
  passed: boolean;
}

/** Monday 00:00 UTC of the week containing `date`. */
function startOfWeekUTC(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d;
}

function lastNWeekStarts(n: number): string[] {
  const thisWeekStart = startOfWeekUTC(new Date());
  const weeks: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(thisWeekStart);
    d.setUTCDate(d.getUTCDate() - i * 7);
    weeks.push(d.toISOString().slice(0, 10));
  }
  return weeks;
}

function derive(sessions: SessionRow[]): Derived[] {
  return sessions.map((s) => {
    const maxMarks = s.sessionQuestions.reduce((sum, sq) => sum + sq.marksAllocated, 0);
    const totalMarks = s.result?.totalMarks ?? 0;
    const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : null;
    const passed = totalMarks >= s.exam.passingMarks;
    const activityDate = s.endTime ?? s.startTime;

    return {
      examId: s.examId,
      examTitle: s.exam.title,
      subject: s.exam.subject,
      weekKey: startOfWeekUTC(activityDate).toISOString().slice(0, 10),
      percentage,
      passed,
    };
  });
}

function buildScoreTrend(derived: Derived[], weeks: number) {
  const byWeek = new Map<string, { sum: number; count: number; attempts: number }>();
  for (const d of derived) {
    const bucket = byWeek.get(d.weekKey) ?? { sum: 0, count: 0, attempts: 0 };
    bucket.attempts += 1;
    if (d.percentage !== null) {
      bucket.sum += d.percentage;
      bucket.count += 1;
    }
    byWeek.set(d.weekKey, bucket);
  }

  return lastNWeekStarts(weeks).map((weekStart) => {
    const bucket = byWeek.get(weekStart);
    return {
      weekStart,
      averageScore: bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : null,
      attempts: bucket?.attempts ?? 0,
    };
  });
}

function buildSubjectPerformance(derived: Derived[]) {
  const bySubject = new Map<string, { sum: number; count: number; attempts: number }>();
  for (const d of derived) {
    const bucket = bySubject.get(d.subject) ?? { sum: 0, count: 0, attempts: 0 };
    bucket.attempts += 1;
    if (d.percentage !== null) {
      bucket.sum += d.percentage;
      bucket.count += 1;
    }
    bySubject.set(d.subject, bucket);
  }

  return Array.from(bySubject.entries())
    .map(([subject, bucket]) => ({
      subject,
      averageScore: bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : null,
      attempts: bucket.attempts,
    }))
    .sort((a, b) => b.attempts - a.attempts);
}

function buildPassFailRate(derived: Derived[]) {
  const total = derived.length;
  const passed = derived.filter((d) => d.passed).length;
  return { passed, failed: total - passed, total, passRate: total > 0 ? Math.round((passed / total) * 100) : null };
}

function buildExamComparison(derived: Derived[], limit: number) {
  const byExam = new Map<
    string,
    { examTitle: string; subject: string; sum: number; count: number; attempts: number; passed: number }
  >();
  for (const d of derived) {
    const bucket = byExam.get(d.examId) ?? {
      examTitle: d.examTitle,
      subject: d.subject,
      sum: 0,
      count: 0,
      attempts: 0,
      passed: 0,
    };
    bucket.attempts += 1;
    if (d.passed) bucket.passed += 1;
    if (d.percentage !== null) {
      bucket.sum += d.percentage;
      bucket.count += 1;
    }
    byExam.set(d.examId, bucket);
  }

  return Array.from(byExam.entries())
    .map(([examId, bucket]) => ({
      examId,
      examTitle: bucket.examTitle,
      subject: bucket.subject,
      attempts: bucket.attempts,
      averageScore: bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : null,
      passRate: bucket.attempts > 0 ? Math.round((bucket.passed / bucket.attempts) * 100) : null,
    }))
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, limit);
}

export async function getAnalytics(examinerId: string, rawQuery: unknown) {
  const parsed = analyticsQuerySchema.safeParse(rawQuery);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);
  const { weeks, examLimit } = parsed.data;

  const sessions = await analyticsRepository.findFinalizedSessionsForAnalytics(examinerId);
  const derived = derive(sessions);

  return {
    scoreTrend: buildScoreTrend(derived, weeks),
    subjectPerformance: buildSubjectPerformance(derived),
    passFailRate: buildPassFailRate(derived),
    examComparison: buildExamComparison(derived, examLimit),
  };
}
