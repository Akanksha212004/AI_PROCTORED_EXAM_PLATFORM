// src/schemas/proctorEvent.schema.ts

import { z } from "zod";

/** Body for POST /sessions/:id/proctor-events — non-file events (gaze, tab-switch, multi-face). */
export const submitProctorEventSchema = z.object({
  eventType: z.enum(["GAZE_LOG", "TAB_SWITCH", "MULTI_FACE_DETECTED"]),
  gazeDirection: z.enum(["CENTER", "LEFT", "RIGHT", "AWAY"]).optional(),
  gazeConfidence: z.number().min(0).max(1).optional(),
  faceCount: z.number().int().min(0).optional(),
  isFlagged: z.boolean().default(false),
});

export type SubmitProctorEventInput = z.infer<typeof submitProctorEventSchema>;

export const listProctorEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
});

export type ListProctorEventsQuery = z.infer<typeof listProctorEventsQuerySchema>;
