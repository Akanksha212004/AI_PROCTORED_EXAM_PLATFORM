// src/api/v1/controllers/adminUser.controller.ts

import type { Request, Response } from "express";
import * as adminUserService from "../../../services/adminUser.service";
import { asyncHandler } from "../../../utils/asyncHandler";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminUserService.listUsers(req.query);
  res.status(200).json(result);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminUserService.getUser(req.params.userId as string);
  res.status(200).json(result);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminUserService.createUser(req.body);
  res.status(201).json(result);
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminUserService.setUserStatus(req.user!.id, req.params.userId as string, req.body);
  res.status(200).json(result);
});

export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const result = await adminUserService.setUserRole(req.user!.id, req.params.userId as string, req.body);
  res.status(200).json(result);
});
