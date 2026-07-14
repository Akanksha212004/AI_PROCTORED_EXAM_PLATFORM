// src/api/v1/controllers/examSession.controller.ts

import type { Request, Response } from "express";
import * as examSessionService from "../../../services/examSession.service";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/apiError";

// POST /exams/:examId/sessions — start (or resume) a session
export const startSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await examSessionService.startSession(req.params.examId, req.user!);
  res.status(201).json(session);
});

// GET /sessions/:id — resume / poll time remaining
export const getSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await examSessionService.getSession(req.params.id, req.user!);
  res.status(200).json(session);
});

// POST /sessions/:id/answers — submit/update one MCQ/MULTI_SELECT/text answer
export const submitAnswer = asyncHandler(async (req: Request, res: Response) => {
  const session = await examSessionService.submitAnswer(req.params.id, req.body, req.user!);
  res.status(200).json(session);
});

// POST /sessions/:id/answers/:questionId/upload — IMAGE_UPLOAD answers only
export const submitAnswerFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
  const session = await examSessionService.submitAnswerFile(
    req.params.id,
    req.params.questionId,
    req.file.path,
    req.user!
  );
  res.status(200).json(session);
});

// POST /sessions/:id/submit — final submission, triggers auto-evaluation
export const submitSession = asyncHandler(async (req: Request, res: Response) => {
  const result = await examSessionService.submitSession(req.params.id, req.user!);
  res.status(200).json(result);
});
