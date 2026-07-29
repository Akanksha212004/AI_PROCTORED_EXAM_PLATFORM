
import { z } from "zod";

/** Body for POST /sessions/:id/proctor-events — TAB_SWITCH or FULLSCREEN_EXIT only.
 *  GAZE_LOG / MULTI_FACE_DETECTED / AUDIO_ANOMALY are all created
 *  server-side now (from ai-service's analysis of an uploaded
 *  snapshot or audio clip) — never trusted from the client directly. */
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