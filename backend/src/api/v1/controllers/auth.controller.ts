
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

export const requestExaminerAccess = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.requestExaminerAccess(req.body);
  res.status(201).json(user);
});

export const getExaminerRequestStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.getExaminerRequestStatus(
    (req as any).validatedQuery ?? req.query
  );
  res.status(200).json(result);
});

export const resubmitExaminerAccessRequest = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resubmitExaminerAccessRequest(
    req.params.requestId as string,
    req.body
  );
  res.status(200).json(result);
});
