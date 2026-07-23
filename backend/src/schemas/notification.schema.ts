// src/schemas/notification.schema.ts

import { z } from "zod";

export const listNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(50).default(15),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
