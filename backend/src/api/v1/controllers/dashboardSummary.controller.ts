// src/api/v1/controllers/dashboardSummary.controller.ts

import type { Request, Response } from "express";
import * as dashboardSummaryService from "../../../services/dashboardSummary.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await dashboardSummaryService.getDashboardSummary(req.user!.id);
  res.status(200).json(summary);
});
