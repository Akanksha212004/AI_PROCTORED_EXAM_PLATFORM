// src/api/v1/controllers/adminDashboard.controller.ts

import type { Request, Response } from "express";
import * as adminDashboardService from "../../../services/adminDashboard.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const getAdminDashboardSummary = asyncHandler(async (_req: Request, res: Response) => {
  const summary = await adminDashboardService.getDashboardSummary();
  res.status(200).json(summary);
});
