// src/schemas/analytics.schema.ts

import { z } from "zod";

export const analyticsQuerySchema = z.object({
  weeks: z.coerce.number().int().positive().max(52).default(8),
  examLimit: z.coerce.number().int().positive().max(50).default(10),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
