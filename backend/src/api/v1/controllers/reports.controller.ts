
// src/api/v1/controllers/reports.controller.ts

import type { Request, Response } from "express";
import * as reportsService from "../../../services/reports.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const listExamReports = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportsService.listExamReports(req.user!.id);
  res.status(200).json(result);
});

export const exportExamReport = asyncHandler(async (req: Request, res: Response) => {
  const { filename, csv } = await reportsService.exportExamReportCsv(req.user!.id, req.params.examId as string);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
});
