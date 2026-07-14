// import type { DifficultyLevel, QuestionType } from "@/types/question";
 
// export type RandomizationMode = "FIXED" | "SHUFFLED_ORDER" | "PER_STUDENT_UNIQUE";
// export type GazeSensitivity = "LOW" | "MEDIUM" | "HIGH";
 
// export const RANDOMIZATION_MODES: RandomizationMode[] = ["FIXED", "SHUFFLED_ORDER", "PER_STUDENT_UNIQUE"];
// export const GAZE_SENSITIVITIES: GazeSensitivity[] = ["LOW", "MEDIUM", "HIGH"];
 
// export interface SelectionRule {
//   id?: string;
//   subject?: string;
//   questionType?: QuestionType;
//   difficultyLevel?: DifficultyLevel;
//   count: number;
// }
 
// export interface PoolQuestionRef {
//   id: string;
//   marksOverride?: number | null;
//   question: {
//     id: string;
//     questionText: string;
//     subject: string;
//     questionType: QuestionType;
//     difficultyLevel: DifficultyLevel;
//     marks: number;
//   };
// }
 
// export interface Exam {
//   id: string;
//   title: string;
//   subject: string;
//   durationMinutes: number;
//   startTime: string;
//   endTime: string;
//   randomizationMode: RandomizationMode;
//   negativeMarkingEnabled: boolean;
//   webcamMonitoringEnabled: boolean;
//   multiFaceDetectionEnabled: boolean;
//   fullScreenModeEnabled: boolean;
//   gazeSensitivity: GazeSensitivity;
//   maxTabSwitchWarnings: number;
//   selectionRules: SelectionRule[];
//   examQuestions: PoolQuestionRef[];
//   createdById?: string | null;
//   createdAt: string;
//   updatedAt: string;
// }
 
// /** Payload shape accepted by POST /exams and PUT /exams/:id */
// export interface ExamFormPayload {
//   title: string;
//   subject: string;
//   durationMinutes: number;
//   startTime: string;
//   endTime: string;
//   randomizationMode: RandomizationMode;
//   negativeMarkingEnabled: boolean;
//   webcamMonitoringEnabled: boolean;
//   multiFaceDetectionEnabled: boolean;
//   fullScreenModeEnabled: boolean;
//   gazeSensitivity: GazeSensitivity;
//   maxTabSwitchWarnings: number;
//   selectionRules?: SelectionRule[];
//   questionIds?: string[];
// }
 
// export interface ExamListFilters {
//   subject?: string;
//   page: number;
//   limit: number;
// }
 
// export interface ExamPagination {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
// }
 
// export interface ExamListResponse {
//   items: Exam[];
//   pagination: ExamPagination;
// }







// types/exam.ts

// import type { DifficultyLevel, QuestionType } from "@/types/question";

// export type RandomizationMode = "FIXED" | "SHUFFLED_ORDER" | "PER_STUDENT_UNIQUE";
// export type GazeSensitivity = "LOW" | "MEDIUM" | "HIGH";
// export type ExamStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

// export const RANDOMIZATION_MODES: RandomizationMode[] = ["FIXED", "SHUFFLED_ORDER", "PER_STUDENT_UNIQUE"];
// export const GAZE_SENSITIVITIES: GazeSensitivity[] = ["LOW", "MEDIUM", "HIGH"];

// export interface SelectionRule {
//   id?: string;
//   subject?: string;
//   questionType?: QuestionType;
//   difficultyLevel?: DifficultyLevel;
//   count: number;
// }

// export interface PoolQuestionRef {
//   id: string;
//   marksOverride?: number | null;
//   question: {
//     id: string;
//     questionText: string;
//     subject: string;
//     questionType: QuestionType;
//     difficultyLevel: DifficultyLevel;
//     marks: number;
//   };
// }

// export interface Exam {
//   id: string;
//   title: string;
//   subject: string;
//   durationMinutes: number;
//   startTime: string;
//   endTime: string;
//   randomizationMode: RandomizationMode;
//   negativeMarkingEnabled: boolean;
//   webcamMonitoringEnabled: boolean;
//   multiFaceDetectionEnabled: boolean;
//   fullScreenModeEnabled: boolean;
//   /** UI-only setting — no audio pipeline exists yet. */
//   audioMonitoringEnabled: boolean;
//   gazeSensitivity: GazeSensitivity;
//   maxTabSwitchWarnings: number;
//   selectionRules: SelectionRule[];
//   examQuestions: PoolQuestionRef[];
//   createdById?: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// /** Payload shape accepted by POST /exams and PUT /exams/:id */
// export interface ExamFormPayload {
//   title: string;
//   subject: string;
//   durationMinutes: number;
//   startTime: string;
//   endTime: string;
//   randomizationMode: RandomizationMode;
//   negativeMarkingEnabled: boolean;
//   webcamMonitoringEnabled: boolean;
//   multiFaceDetectionEnabled: boolean;
//   fullScreenModeEnabled: boolean;
//   audioMonitoringEnabled: boolean;
//   gazeSensitivity: GazeSensitivity;
//   maxTabSwitchWarnings: number;
//   selectionRules?: SelectionRule[];
//   questionIds?: string[];
// }

// export interface ExamListFilters {
//   subject?: string;
//   page: number;
//   limit: number;
// }

// export interface ExamPagination {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
// }

// export interface ExamListResponse {
//   items: Exam[];
//   pagination: ExamPagination;
// }




import type { DifficultyLevel, QuestionType } from "@/types/question";
 
export type RandomizationMode = "FIXED" | "SHUFFLED_ORDER" | "PER_STUDENT_UNIQUE";
export type GazeSensitivity = "LOW" | "MEDIUM" | "HIGH";
export type ExamStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";
 
export const RANDOMIZATION_MODES: RandomizationMode[] = ["FIXED", "SHUFFLED_ORDER", "PER_STUDENT_UNIQUE"];
export const GAZE_SENSITIVITIES: GazeSensitivity[] = ["LOW", "MEDIUM", "HIGH"];
export const EXAM_STATUSES: ExamStatus[] = ["DRAFT", "PUBLISHED", "CANCELLED"];
 
export interface SelectionRule {
  id?: string;
  subject?: string;
  questionType?: QuestionType;
  difficultyLevel?: DifficultyLevel;
  count: number;
}
 
export interface PoolQuestionRef {
  id: string;
  marksOverride?: number | null;
  question: {
    id: string;
    questionText: string;
    subject: string;
    questionType: QuestionType;
    difficultyLevel: DifficultyLevel;
    marks: number;
  };
}
 
export interface Exam {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: ExamStatus;
  startTime: string;
  endTime: string;
  randomizationMode: RandomizationMode;
  negativeMarkingEnabled: boolean;
  webcamMonitoringEnabled: boolean;
  multiFaceDetectionEnabled: boolean;
  fullScreenModeEnabled: boolean;
  audioMonitoringEnabled: boolean;
  gazeSensitivity: GazeSensitivity;
  maxTabSwitchWarnings: number;
  selectionRules: SelectionRule[];
  examQuestions: PoolQuestionRef[];
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}
 
/** Payload shape accepted by POST /exams and PUT /exams/:id */
export interface ExamFormPayload {
  title: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  status: ExamStatus;
  startTime: string;
  endTime: string;
  randomizationMode: RandomizationMode;
  negativeMarkingEnabled: boolean;
  webcamMonitoringEnabled: boolean;
  multiFaceDetectionEnabled: boolean;
  fullScreenModeEnabled: boolean;
  audioMonitoringEnabled: boolean;
  gazeSensitivity: GazeSensitivity;
  maxTabSwitchWarnings: number;
  selectionRules?: SelectionRule[];
  questionIds?: string[];
}
 
export interface ExamListFilters {
  subject?: string;
  status?: ExamStatus;
  page: number;
  limit: number;
}
 
export interface ExamPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
 
export interface ExamListResponse {
  items: Exam[];
  pagination: ExamPagination;
}
