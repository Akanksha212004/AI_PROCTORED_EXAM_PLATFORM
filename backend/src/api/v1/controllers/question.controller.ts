import type { Request, Response } from "express";
import * as questionService from "../../../services/question.service";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/apiError";

export const createQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await questionService.createQuestion(req.body, req.user!);
  res.status(201).json(question);
});

export const listQuestions = asyncHandler(async (req: Request, res: Response) => {
  const result = await questionService.listQuestions(req.query as never, req.user!);
  res.status(200).json(result);
});

export const getQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await questionService.getQuestionById(req.params.id, req.user!);
  res.status(200).json(question);
});

export const updateQuestion = asyncHandler(async (req: Request, res: Response) => {
  const question = await questionService.updateQuestion(req.params.id, req.body, req.user!);
  res.status(200).json(question);
});

export const deleteQuestion = asyncHandler(async (req: Request, res: Response) => {
  await questionService.deleteQuestion(req.params.id, req.user!);
  res.status(204).send();
});

export const uploadQuestionModelAnswer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
  const question = await questionService.attachModelAnswer(req.params.id, req.file.path, req.user!);
  res.status(200).json(question);
});
