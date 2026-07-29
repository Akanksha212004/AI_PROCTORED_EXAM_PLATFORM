// src/api/v1/controllers/adminExaminerRequest.controller.ts

import type { Request, Response } from "express";
import * as adminExaminerRequestService from "../../../services/adminExaminerRequest.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const listExaminerRequests = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminExaminerRequestService.listExaminerRequests(req.query);
  res.status(200).json(result);
});

export const approveExaminerRequest = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminExaminerRequestService.approveExaminerRequest(req.params.userId as string);
  res.status(200).json(result);
});

export const rejectExaminerRequest = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminExaminerRequestService.rejectExaminerRequest(
    req.params.userId as string,
    req.body
  );
  res.status(200).json(result);
});
