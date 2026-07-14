// types/question.ts
//
// Mirrors the REAL backend exactly:
// - QuestionType / DifficultyLevel enums (prisma/schema.prisma)
// - question.schema.ts (create/update validation shape)
// - question.repository.ts (QuestionWithOptions payload shape)

export type QuestionType =
  | "MCQ"
  | "MULTI_SELECT"
  | "SHORT_ANSWER"
  | "LONG_ANSWER"
  | "IMAGE_UPLOAD";

export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

export const QUESTION_TYPES: QuestionType[] = [
  "MCQ",
  "MULTI_SELECT",
  "SHORT_ANSWER",
  "LONG_ANSWER",
  "IMAGE_UPLOAD",
];

export const DIFFICULTY_LEVELS: DifficultyLevel[] = ["EASY", "MEDIUM", "HARD"];

export interface QuestionOption {
  id?: string; // absent for new, not-yet-saved options in the form
  optionText: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  subject: string;
  difficultyLevel: DifficultyLevel;
  marks: number;
  negativeMarks: number;
  modelAnswerText?: string | null;
  modelAnswerFileUrl?: string | null;
  options: QuestionOption[];
  createdById?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload shape accepted by POST /questions and PATCH /questions/:id */
export interface QuestionFormPayload {
  questionText: string;
  questionType: QuestionType;
  subject: string;
  difficultyLevel: DifficultyLevel;
  marks: number;
  negativeMarks: number;
  options?: QuestionOption[];
  modelAnswerText?: string;
  modelAnswerFileUrl?: string;
}

export interface QuestionListFilters {
  search?: string; // client-side only — backend has no ?search= param yet
  subject?: string;
  questionType?: QuestionType;
  difficultyLevel?: DifficultyLevel;
  page: number;
  limit: number;
}

export interface QuestionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Shape returned by GET /questions: { items, pagination } */
export interface QuestionListResponse {
  items: Question[];
  pagination: QuestionPagination;
}
