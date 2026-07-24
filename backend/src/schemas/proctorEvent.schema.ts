// src/schemas/proctorEvent.schema.ts

import { z } from "zod";

/** Body for POST /sessions/:id/proctor-events — TAB_SWITCH and FULLSCREEN_EXIT
 *  only. GAZE_LOG / MULTI_FACE_DETECTED are created server-side inside
 *  submitSnapshot, from ai-service's analysis — never trusted from
 *  the client directly. */
export const submitProctorEventSchema = z.object({
  eventType: z.enum(["TAB_SWITCH", "FULLSCREEN_EXIT"]),
  isFlagged: z.boolean().default(false),
});

export type SubmitProctorEventInput = z.infer<typeof submitProctorEventSchema>;

export const listProctorEventsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
});

export type ListProctorEventsQuery = z.infer<typeof listProctorEventsQuerySchema>;
