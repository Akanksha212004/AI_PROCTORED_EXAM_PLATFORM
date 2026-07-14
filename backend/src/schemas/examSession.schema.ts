// src/schemas/examSession.schema.ts

import { z } from "zod";

/** Body for POST /sessions/:id/answers — one answer at a time (autosave-per-question). */
export const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  // MCQ: exactly one; MULTI_SELECT: one or more. Cross-checked against
  // the question's actual type server-side (not just here), since we
  // don't know the type at this schema layer without a DB lookup.
  selectedOptionIds: z.array(z.string().min(1)).optional(),
  submittedText: z.string().trim().optional(),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;

// Word-count guardrails (doc: "text answers are stored with word count
// validation"). Kept generous and simple for this basic pass — a
// per-question configurable max isn't in the schema yet.
export const SHORT_ANSWER_MAX_WORDS = 200;
export const LONG_ANSWER_MAX_WORDS = 1500;
