// src/api/v1/controllers/settings.controller.ts

import type { Request, Response } from "express";
import * as settingsService from "../../../services/settings.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const result = await settingsService.updateProfile(req.user!.id, req.body);
  res.status(200).json(result);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await settingsService.changePassword(req.user!.id, req.body);
  res.status(200).json(result);
});
