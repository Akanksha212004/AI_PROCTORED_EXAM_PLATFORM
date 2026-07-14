// src/schemas/question.schema.ts
//
// All doc-mandated validation rules live here, in one place, so both
// create and update go through identical checks:
//   a) MCQ            -> exactly ONE correct option, >= 2 options total
//   b) MULTI_SELECT   -> at least ONE correct option, >= 2 options total
//   c) SHORT_ANSWER / LONG_ANSWER -> modelAnswerText required
//   d) IMAGE_UPLOAD   -> marks must be explicitly defined (enforced by
//                        `marks` being a required positive int for every
//                        question type — see base schema below)
//   e) marks > 0 (int), negativeMarks >= 0
//
// NOTE on PATCH semantics: the update schema requires the SAME full
// shape as create (not a partial patch). Every rule above is
// cross-field (depends on questionType), so a partial update could
// silently leave a question in an invalid state (e.g. changing
// questionType from SHORT_ANSWER to MCQ without ever supplying
// options). Requiring the full object on PATCH keeps every question
// always fully valid.

import { z } from 'zod';

export const QUESTION_TYPES = ['MCQ', 'MULTI_SELECT', 'SHORT_ANSWER', 'LONG_ANSWER', 'IMAGE_UPLOAD'] as const;
export const DIFFICULTY_LEVELS = ['EASY', 'MEDIUM', 'HARD'] as const;

export const QuestionTypeEnum = z.enum(QUESTION_TYPES);

export const DifficultyLevelEnum = z.enum(DIFFICULTY_LEVELS);

const OPTION_BEARING_TYPES: readonly string[] = ['MCQ', 'MULTI_SELECT'];
const TEXT_ANSWER_TYPES: readonly string[] = ['SHORT_ANSWER', 'LONG_ANSWER'];

const optionSchema = z.object({
  optionText: z.string().trim().min(1, 'optionText is required'),
  isCorrect: z.boolean(),
});

const questionBaseSchema = z.object({
  questionText: z.string().trim().min(1, 'questionText is required'),
  questionType: z.enum(QUESTION_TYPES),
  subject: z.string().trim().min(1, 'subject is required'),
  difficultyLevel: z.enum(DIFFICULTY_LEVELS),
  marks: z.coerce.number().int('marks must be an integer').positive('marks must be greater than 0'),
  negativeMarks: z.coerce.number().min(0, 'negativeMarks cannot be negative').default(0),
  options: z.array(optionSchema).optional(),
  modelAnswerText: z.string().trim().min(1).optional(),
  modelAnswerFileUrl: z.string().url('modelAnswerFileUrl must be a valid URL').optional(),
});

type QuestionInput = z.infer<typeof questionBaseSchema>;

function applyCrossFieldRules(data: QuestionInput, ctx: z.RefinementCtx): void {
  const { questionType, options, modelAnswerText } = data;

  if (OPTION_BEARING_TYPES.includes(questionType)) {
    if (!options || options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: `${questionType} requires at least 2 options`,
      });
      return;
    }

    const correctCount = options.filter((o) => o.isCorrect).length;

    if (questionType === 'MCQ' && correctCount !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'MCQ must have exactly one correct option',
      });
    }

    if (questionType === 'MULTI_SELECT' && correctCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'MULTI_SELECT must have at least one correct option',
      });
    }
  } else if (options && options.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['options'],
      message: `options should not be provided for questionType ${questionType}`,
    });
  }

  if (TEXT_ANSWER_TYPES.includes(questionType) && !modelAnswerText) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['modelAnswerText'],
      message: `modelAnswerText is required for questionType ${questionType}`,
    });
  }

  // IMAGE_UPLOAD's "marks must be explicitly defined" rule is already
  // satisfied because `marks` is a required positive int for every
  // question type in questionBaseSchema above — no extra check needed.
}

export const createQuestionSchema = questionBaseSchema.superRefine(applyCrossFieldRules);
export const updateQuestionSchema = questionBaseSchema.superRefine(applyCrossFieldRules);

export const listQuestionsQuerySchema = z.object({
  subject: z.string().trim().optional(),
  questionType: z.enum(QUESTION_TYPES).optional(),
  difficultyLevel: z.enum(DIFFICULTY_LEVELS).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;
export type OptionInput = z.infer<typeof optionSchema>;