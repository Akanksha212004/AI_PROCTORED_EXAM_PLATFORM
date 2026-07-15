import { z } from "zod";
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from "./question.schema";
import { createQuestionSchema } from "./question.schema";

export const draftQuestionSchema = z.object({
  tempId: z.string(),
  questionText: z.string(),
  questionType: z.enum(QUESTION_TYPES),
  subject: z.string(),
  difficultyLevel: z.enum(DIFFICULTY_LEVELS),
  marks: z.number(),
  negativeMarks: z.number().default(0),
  options: z
    .array(z.object({ optionText: z.string(), isCorrect: z.boolean() }))
    .optional(),
  modelAnswerText: z.string().optional(),
  sourceExcerpt: z.string().optional(),
});

export type DraftQuestion = z.infer<typeof draftQuestionSchema>;

// Reuses createQuestionSchema directly — same validation rules the
// single-question create endpoint already enforces (option counts,
// MCQ-exactly-one-correct, modelAnswerText requirement, etc).
export const confirmBulkImportSchema = z.object({
  questions: z.array(createQuestionSchema).min(1),
});

export type ConfirmBulkImportInput = z.infer<typeof confirmBulkImportSchema>;