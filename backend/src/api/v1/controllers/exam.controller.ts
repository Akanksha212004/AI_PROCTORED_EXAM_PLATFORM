// import type { Request, Response } from "express";

// import { examService } from "../../../services/exam.service";
// import { asyncHandler } from "../../../utils/asyncHandler";

// export const createExam = asyncHandler(async (req: Request, res: Response) => {
//   const exam = await examService.create(req.body, req.user!);
//   res.status(201).json(exam);
// });

// export const listExams = asyncHandler(async (req: Request, res: Response) => {
//   const exams = await examService.list(req.user!);
//   res.status(200).json(exams);
// });

// export const getExam = asyncHandler(async (req: Request, res: Response) => {
//   const exam = await examService.getById(req.params.id, req.user!);
//   res.status(200).json(exam);
// });

// export const updateExam = asyncHandler(async (req: Request, res: Response) => {
//   const exam = await examService.update(req.params.id, req.body, req.user!);
//   res.status(200).json(exam);
// });

// export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
//   await examService.remove(req.params.id, req.user!);
//   res.status(204).send();
// });

// /**
//  * Student-facing: opens (or resumes) their randomized attempt at this
//  * exam. Returns the paper with all answer keys stripped.
//  */
// export const startExamSession = asyncHandler(async (req: Request, res: Response) => {
//   const paper = await examService.startSession(req.params.id, req.user!);
//   res.status(200).json(paper);
// });



// src/api/v1/controllers/exam.controller.ts

import type { Request, Response } from "express";
import * as examService from "../../../services/exam.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const createExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await examService.createExam(req.body, req.user!);
  res.status(201).json(exam);
});

export const listExams = asyncHandler(async (req: Request, res: Response) => {
  const result = await examService.listExams(req.query as never);
  res.status(200).json(result);
});

export const getExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await examService.getExamById(req.params.id as string);
  res.status(200).json(exam);
});

export const updateExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await examService.updateExam(
    req.params.id as string,
    req.body,
    req.user!
  );
  res.status(200).json(exam);
});

export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
  await examService.deleteExam(req.params.id as string, req.user!);
  res.status(204).send();
});

export const addPoolQuestions = asyncHandler(async (req: Request, res: Response) => {
  const exam = await examService.addQuestionsToPool(
    req.params.id as string,
    req.body,
    req.user!
  );
  res.status(200).json(exam);
});

export const removePoolQuestion = asyncHandler(async (req: Request, res: Response) => {
  const exam = await examService.removeQuestionFromPool(
    req.params.id as string,
    req.params.questionId as string,
    req.user!
  );
  res.status(200).json(exam);
});

export const listAvailableExams = asyncHandler(async (_req: Request, res: Response) => {
  const items = await examService.listAvailableExams();
  res.status(200).json({ items });
});
