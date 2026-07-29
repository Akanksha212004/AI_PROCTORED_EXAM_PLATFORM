// src/api/v1/controllers/analytics.controller.ts

import type { Request, Response } from "express";
import * as analyticsService from "../../../services/analytics.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  // ADMIN sees analytics across every examiner's exams; EXAMINER only their own.
  const scopeId = req.user!.role === "ADMIN" ? undefined : req.user!.id;
  const result = await analyticsService.getAnalytics(scopeId, req.query);
  res.status(200).json(result);
});
