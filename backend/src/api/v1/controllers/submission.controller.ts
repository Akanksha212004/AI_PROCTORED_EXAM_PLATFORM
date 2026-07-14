// src/api/v1/controllers/submission.controller.ts

import type { Request, Response } from "express";
import * as submissionService from "../../../services/submission.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const listSubmissions = asyncHandler(async (req: Request, res: Response) => {
  const result = await submissionService.listSubmissions(req.query as never, req.user!);
  res.status(200).json(result);
});

export const getSubmission = asyncHandler(async (req: Request, res: Response) => {
  const submission = await submissionService.getSubmissionForGrading(req.params.id, req.user!);
  res.status(200).json(submission);
});

export const gradeAnswer = asyncHandler(async (req: Request, res: Response) => {
  const submission = await submissionService.gradeAnswer(req.params.answerId, req.body, req.user!);
  res.status(200).json(submission);
});

export const finalizeSubmission = asyncHandler(async (req: Request, res: Response) => {
  const result = await submissionService.finalizeSubmission(req.params.id, req.user!);
  res.status(200).json(result);
});
