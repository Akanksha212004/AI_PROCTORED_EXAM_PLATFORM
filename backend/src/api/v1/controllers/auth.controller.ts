import type { Request, Response } from "express";

import { authService } from "../../../services/auth.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  res.status(201).json(user);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const token = await authService.login(req.body);
  res.status(200).json(token);
});
