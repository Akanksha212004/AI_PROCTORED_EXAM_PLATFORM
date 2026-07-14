// src/api/v1/controllers/proctorEvent.controller.ts

import type { Request, Response } from "express";
import * as proctorEventService from "../../../services/proctorEvent.service";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/apiError";

// POST /sessions/:id/proctor-events (student, JSON body: gaze log / tab-switch / multi-face)
export const submitEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await proctorEventService.submitEvent(req.params.id, req.body, req.user!);
  res.status(201).json(event);
});

// POST /sessions/:id/proctor-events/snapshot (student, multipart file)
export const submitSnapshot = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No snapshot file uploaded");
  const event = await proctorEventService.submitSnapshot(req.params.id, req.file.path, req.user!);
  res.status(201).json(event);
});

// GET /sessions/:id/proctor-events (examiner/admin — event timeline for review)
export const getSessionEvents = asyncHandler(async (req: Request, res: Response) => {
  const result = await proctorEventService.getSessionEvents(req.params.id, req.query as never, req.user!);
  res.status(200).json(result);
});

// GET /examiner/live-sessions (examiner/admin — polled every ~10s by the frontend)
export const getLiveSessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await proctorEventService.getLiveSessions(req.user!);
  res.status(200).json({ items: sessions });
});
