// types/submission.ts

import type { QuestionType } from "@/types/question";

export type GradingStatus = "FULLY_AUTO_GRADED" | "PENDING_REVIEW" | "FULLY_GRADED";

export interface SubmissionListItem {
  id: string;
  examId: string;
  examTitle: string;
  examSubject: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string | null;
  sessionStatus: "SUBMITTED" | "AUTO_SUBMITTED";
  autoGradedMarks: number;
  gradingStatus: GradingStatus;
  pendingCount: number;
}

export interface SubmissionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SubmissionListResponse {
  items: SubmissionListItem[];
  pagination: SubmissionPagination;
}

export interface SubmissionQuestionDetail {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  marksAllocated: number;
  isObjective: boolean;
  options?: { id: string; optionText: string; isCorrect: boolean }[];
  selectedOptionIds: string[];
  submittedText: string | null;
  submittedFileUrl: string | null;
  marksAwarded: number | null;
  answerId: string | null;
  grading: { status: string; examinerScore: number | null; feedback: string | null } | null;
}

export interface SubmissionDetail {
  id: string;
  examTitle: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string | null;
  status: string;
  totalMarks: number;
  questions: SubmissionQuestionDetail[];
}

export interface GradeAnswerPayload {
  score: number;
  feedback?: string;
}
