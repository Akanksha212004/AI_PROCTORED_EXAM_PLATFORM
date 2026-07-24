// src/api/v1/controllers/reports.controller.ts

import type { Request, Response } from "express";
import * as reportsService from "../../../services/reports.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const listExamReports = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportsService.listExamReports(req.user!.id);
  res.status(200).json(result);
});

/** Used by the "View" button — same data as the exports below, just as JSON for the in-app modal. */
export const getExamReport = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportsService.getExamReportDetail(req.user!.id, req.params.examId as string);
  res.status(200).json(result);
});

export const exportExamReportCsv = asyncHandler(async (req: Request, res: Response) => {
  const { filename, csv } = await reportsService.exportExamReportCsv(req.user!.id, req.params.examId as string);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(csv);
});

export const exportExamReportPdf = asyncHandler(async (req: Request, res: Response) => {
  const { filename, buffer } = await reportsService.exportExamReportPdf(req.user!.id, req.params.examId as string);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.status(200).send(buffer);
});
