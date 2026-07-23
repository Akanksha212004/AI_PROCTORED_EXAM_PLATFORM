// src/api/v1/controllers/student.controller.ts

import type { Request, Response } from "express";
import * as studentService from "../../../services/student.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const listStudents = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.listStudents(req.user!.id, req.query);
  res.status(200).json(result);
});

export const getStudent = asyncHandler(async (req: Request, res: Response) => {
  const result = await studentService.getStudentDetail(req.user!.id, req.params.studentId as string);
  res.status(200).json(result);
});
