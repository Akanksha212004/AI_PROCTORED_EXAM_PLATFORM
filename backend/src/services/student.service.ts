// src/services/student.service.ts

import { SessionStatus } from "@prisma/client";
import type { ZodError } from "zod";

import { ApiError } from "../utils/apiError";
import * as studentRepository from "../repositories/student.repository";
import { listStudentsQuerySchema } from "../schemas/student.schema";

function zodErrorToApiError(zodError: ZodError): ApiError {
  const message = zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  return new ApiError(422, message);
}

interface SessionStat {
  status: SessionStatus;
  startTime: Date;
  endTime: Date | null;
  result: { totalMarks: number } | null;
  sessionQuestions: { marksAllocated: number }[];
}

function isFinalized(session: SessionStat): boolean {
  return (
    (session.status === SessionStatus.SUBMITTED || session.status === SessionStatus.AUTO_SUBMITTED) &&
    session.result !== null
  );
}

function computeSummaryStats(sessions: SessionStat[]) {
  const percentages = sessions
    .filter(isFinalized)
    .map((s) => {
      const maxMarks = s.sessionQuestions.reduce((sum, sq) => sum + sq.marksAllocated, 0);
      return maxMarks > 0 ? (s.result!.totalMarks / maxMarks) * 100 : null;
    })
    .filter((p): p is number => p !== null);

  const averageScore =
    percentages.length > 0 ? Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length) : null;

  const lastActiveTimes = sessions.map((s) => (s.endTime ?? s.startTime).getTime());
  const lastActive = lastActiveTimes.length > 0 ? new Date(Math.max(...lastActiveTimes)) : null;

  return { examsTaken: sessions.length, averageScore, lastActive };
}

export async function listStudents(examinerId: string, rawQuery: unknown) {
  const parsed = listStudentsQuerySchema.safeParse(rawQuery);
  if (!parsed.success) throw zodErrorToApiError(parsed.error);
  const { search, page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const [total, students] = await Promise.all([
    studentRepository.countStudents(examinerId, search),
    studentRepository.findStudents(examinerId, search, skip, limit),
  ]);

  const studentIds = students.map((s) => s.id);
  const sessions =
    studentIds.length > 0 ? await studentRepository.findSessionStatsForStudents(examinerId, studentIds) : [];

  const sessionsByStudent = new Map<string, SessionStat[]>();
  for (const session of sessions) {
    const list = sessionsByStudent.get(session.studentId) ?? [];
    list.push(session);
    sessionsByStudent.set(session.studentId, list);
  }

  const items = students.map((student) => ({
    id: student.id,
    name: student.name,
    email: student.email,
    isActive: student.isActive,
    joinedAt: student.createdAt,
    ...computeSummaryStats(sessionsByStudent.get(student.id) ?? []),
  }));

  return { items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getStudentDetail(examinerId: string, studentId: string) {
  const student = await studentRepository.findStudentById(examinerId, studentId);
  if (!student) throw new ApiError(404, "Student not found");

  const sessions = await studentRepository.findSessionsForStudent(examinerId, studentId);

  const examHistory = sessions.map((s) => {
    const maxMarks = s.sessionQuestions.reduce((sum, sq) => sum + sq.marksAllocated, 0);
    const finalized = isFinalized(s);
    const score = finalized && maxMarks > 0 ? Math.round((s.result!.totalMarks / maxMarks) * 100) : null;

    return {
      sessionId: s.id,
      examId: s.exam.id,
      examTitle: s.exam.title,
      subject: s.exam.subject,
      status: s.status,
      startTime: s.startTime,
      endTime: s.endTime,
      score,
      totalMarks: s.result?.totalMarks ?? null,
      maxMarks: maxMarks || null,
    };
  });

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    isActive: student.isActive,
    joinedAt: student.createdAt,
    ...computeSummaryStats(sessions),
    examHistory,
  };
}
