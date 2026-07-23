// src/api/v1/controllers/analytics.controller.ts

import type { Request, Response } from "express";
import * as analyticsService from "../../../services/analytics.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const result = await analyticsService.getAnalytics(req.user!.id, req.query);
  res.status(200).json(result);
});
