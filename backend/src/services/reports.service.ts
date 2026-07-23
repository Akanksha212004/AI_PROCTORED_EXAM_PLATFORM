// src/services/reports.service.ts

import { ApiError } from "../utils/apiError";
import * as analyticsRepository from "../repositories/analytics.repository";
import * as reportsRepository from "../repositories/reports.repository";

function csvEscape(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export async function listExamReports(examinerId: string) {
  const [exams, finalizedSessions] = await Promise.all([
    reportsRepository.findExamsForReports(examinerId),
    analyticsRepository.findFinalizedSessionsForAnalytics(examinerId),
  ]);

  const statsByExam = new Map<string, { attempts: number; sum: number; count: number; passed: number }>();
  for (const s of finalizedSessions) {
    const maxMarks = s.sessionQuestions.reduce((sum, sq) => sum + sq.marksAllocated, 0);
    const totalMarks = s.result?.totalMarks ?? 0;
    const bucket = statsByExam.get(s.examId) ?? { attempts: 0, sum: 0, count: 0, passed: 0 };
    bucket.attempts += 1;
    if (totalMarks >= s.exam.passingMarks) bucket.passed += 1;
    if (maxMarks > 0) {
      bucket.sum += (totalMarks / maxMarks) * 100;
      bucket.count += 1;
    }
    statsByExam.set(s.examId, bucket);
  }

  return exams.map((exam) => {
    const bucket = statsByExam.get(exam.id);
    return {
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      status: exam.status,
      createdAt: exam.createdAt,
      attempts: bucket?.attempts ?? 0,
      averageScore: bucket && bucket.count > 0 ? Math.round(bucket.sum / bucket.count) : null,
      passRate: bucket && bucket.attempts > 0 ? Math.round((bucket.passed / bucket.attempts) * 100) : null,
    };
  });
}

export async function exportExamReportCsv(examinerId: string, examId: string): Promise<{ filename: string; csv: string }> {
  const exam = await reportsRepository.findExamOwnedByExaminer(examinerId, examId);
  if (!exam) throw new ApiError(404, "Exam not found");

  const sessions = await reportsRepository.findSessionsForExamReport(examinerId, examId);

  const header = ["Student Name", "Email", "Status", "Marks Obtained", "Max Marks", "Percentage", "Submitted At"];
  const rows = sessions.map((s) => {
    const maxMarks = s.sessionQuestions.reduce((sum, sq) => sum + sq.marksAllocated, 0);
    const totalMarks = s.result?.totalMarks ?? null;
    const percentage = totalMarks !== null && maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : null;

    return [
      s.student.name,
      s.student.email,
      s.status,
      totalMarks ?? "",
      maxMarks || "",
      percentage !== null ? `${percentage}%` : "",
      s.endTime ? s.endTime.toISOString() : "",
    ];
  });

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
  const safeTitle = exam.title.replace(/[^a-z0-9]+/gi, "_").toLowerCase();

  return { filename: `${safeTitle}_report.csv`, csv };
}
