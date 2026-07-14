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
}

export interface SubmitSessionResult {
  status: SessionStatus;
  autoGradedMarks?: number;
  pendingSubjectiveCount?: number;
  alreadyFinalized?: boolean;
}
