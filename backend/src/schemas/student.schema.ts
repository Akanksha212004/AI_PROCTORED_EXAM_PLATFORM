// src/schemas/student.schema.ts

import { z } from "zod";

export const listStudentsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;

export const updateStudentStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateStudentStatusInput = z.infer<typeof updateStudentStatusSchema>;
