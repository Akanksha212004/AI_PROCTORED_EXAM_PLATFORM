import type { QuestionType, DifficultyLevel, QuestionOption, Question } from "./question";

/** Best-guess draft returned by POST /questions/bulk-import/parse.
 *  Loosely typed on purpose — examiner edits every field before save. */
export interface DraftQuestion {
  tempId: string;
  questionText: string;
  questionType: QuestionType;
  subject: string;
  difficultyLevel: DifficultyLevel;
  marks: number;
  negativeMarks: number;
  options?: QuestionOption[];
  modelAnswerText?: string;
  sourceExcerpt?: string;
}

export interface BulkImportParseResponse {
  questions: DraftQuestion[];
}

export interface BulkImportConfirmResponse {
  questions: Question[];
}