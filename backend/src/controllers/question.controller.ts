
import type { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import * as questionService from '../services/question.service';
import type { AuthUser } from '../services/question.service';

function getAuthUser(req: Request): AuthUser {
  return req.user as unknown as AuthUser;
}

export async function createQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const question = await questionService.createQuestion(req.body, getAuthUser(req));
    res.status(201).json(new ApiResponse(201, question, 'Question created successfully'));
  } catch (err) {
    next(err);
  }
}

export async function listQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await questionService.listQuestions(req.query, getAuthUser(req));
    res.status(200).json(new ApiResponse(200, result, 'Questions fetched successfully'));
  } catch (err) {
    next(err);
  }
}

export async function getQuestionById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const question = await questionService.getQuestionById(String(req.params.id), getAuthUser(req));
    res.status(200).json(new ApiResponse(200, question, 'Question fetched successfully'));
  } catch (err) {
    next(err);
  }
}

export async function updateQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const question = await questionService.updateQuestion(String(req.params.id), req.body, getAuthUser(req));
    res.status(200).json(new ApiResponse(200, question, 'Question updated successfully'));
  } catch (err) {
    next(err);
  }
}

export async function deleteQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await questionService.deleteQuestion(String(req.params.id), getAuthUser(req));
    res.status(200).json(new ApiResponse(200, null, 'Question deleted successfully'));
  } catch (err) {
    next(err);
  }
}
