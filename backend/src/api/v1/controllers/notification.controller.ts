// src/api/v1/controllers/notification.controller.ts

import type { Request, Response } from "express";
import * as notificationService from "../../../services/notification.service";
import { listNotificationsQuerySchema } from "../../../schemas/notification.schema";
import { ApiError } from "../../../utils/apiError";
import { asyncHandler } from "../../../utils/asyncHandler";

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const parsed = listNotificationsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(422, parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "));
  }

  const result = await notificationService.getNotifications(req.user!.id, parsed.data.limit);
  res.status(200).json(result);
});

export const markNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await notificationService.markAllRead(req.user!.id);
  res.status(200).json(result);
});
