// src/schemas/submission.schema.ts

import { z } from "zod";

export const gradeAnswerSchema = z.object({
  score: z.number().min(0),
  feedback: z.string().trim().max(2000).optional(),
});

export const listSubmissionsQuerySchema = z.object({
  examId: z.string().optional(),
  status: z.enum(["PENDING_REVIEW", "FULLY_GRADED", "FULLY_AUTO_GRADED"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type GradeAnswerInput = z.infer<typeof gradeAnswerSchema>;
export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;
