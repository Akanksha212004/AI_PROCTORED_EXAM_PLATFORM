// types/examSession.ts

import type { DifficultyLevel, QuestionType } from "@/types/question";
import type { GazeSensitivity, RandomizationMode } from "@/types/exam";

export type SessionStatus = "IN_PROGRESS" | "SUBMITTED" | "AUTO_SUBMITTED" | "EXPIRED";

export interface AvailableExam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
}

export interface SessionOption {
  id: string;
  optionText: string;
}

export interface SessionAnswer {
  submittedText: string | null;
  submittedFileUrl: string | null;
  selectedOptionIds: string[];
  markedForReview: boolean;
}

export interface SessionQuestionView {
  questionId: string;
  sequenceOrder: number;
  marksAllocated: number;
  questionText: string;
  questionType: QuestionType;
  subject: string;
  difficultyLevel: DifficultyLevel;
  options?: SessionOption[];
  answer: SessionAnswer | null;
}

export interface SessionExamView {
  title: string;
  subject: string;
  durationMinutes: number;
  negativeMarkingEnabled: boolean;
  webcamMonitoringEnabled: boolean;
  multiFaceDetectionEnabled: boolean;
  fullScreenModeEnabled: boolean;
  gazeSensitivity: GazeSensitivity;
  maxTabSwitchWarnings: number;
}

export interface ExamSessionView {
  id: string;
  examId: string;
  status: SessionStatus;
  startTime: string;
  endTime: string | null;
  timeRemainingSeconds: number;
  exam: SessionExamView;
  questions: SessionQuestionView[];
}

export interface SubmitAnswerPayload {
  questionId: string;
  selectedOptionIds?: string[];
  submittedText?: string;
  markedForReview?: boolean;
  clearAnswer?: boolean;
}

export interface SubmitSessionResult {
  status: SessionStatus;
  autoGradedMarks?: number;
  pendingSubjectiveCount?: number;
  alreadyFinalized?: boolean;
}

// --- Student's own submission history + report (added for dashboard) ---

export type GradingStatus = "FULLY_AUTO_GRADED" | "PENDING_REVIEW" | "FULLY_GRADED";

export interface MySubmissionListItem {
  id: string;
  examId: string;
  examTitle: string;
  examSubject: string;
  status: SessionStatus;
  submittedAt: string | null;
  totalMarks: number;
  maxMarks: number;
  passingMarks: number;
  gradingStatus: GradingStatus;
}

export interface MySubmissionListResponse {
  items: MySubmissionListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ReportOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

export interface ReportQuestion {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  marksAllocated: number;
  isObjective: boolean;
  options?: ReportOption[];
  selectedOptionIds: string[];
  submittedText: string | null;
  submittedFileUrl: string | null;
  marksAwarded: number | null;
  answerId: string | null;
  grading: {
    status: string;
    examinerScore: number | null;
    feedback: string | null;
  } | null;
}

export interface SubmissionReport {
  id: string;
  examTitle: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string | null;
  status: SessionStatus;
  totalMarks: number;
  questions: ReportQuestion[];
}