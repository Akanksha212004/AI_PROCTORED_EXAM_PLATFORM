import type { Request, Response } from "express";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/apiError";
import { extractRawText } from "../../../services/bulkImportExtract.service";
import { parseRawTextToDrafts } from "../../../services/bulkImportParser.service";
import * as questionRepository from "../../../repositories/question.repository";
 
/**
 * POST /questions/bulk-import/parse
 * Parses an uploaded PDF/DOCX and returns best-guess draft questions.
 * Nothing is written to the database here — this is read-only.
 */
export const parseBulkImportFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
 
  const existingSubjects = await questionRepository.findDistinctSubjects();
  const rawText = await extractRawText(req.file.buffer, req.file.mimetype);
 
  if (!rawText.trim()) {
    throw new ApiError(422, "Could not extract any text from the uploaded file");
  }
 
  const drafts = parseRawTextToDrafts(rawText, existingSubjects);
 
  if (drafts.length === 0) {
    throw new ApiError(422, "No questions could be identified in the uploaded file");
  }
 
  res.status(200).json({ questions: drafts });
});

import * as questionService from "../../../services/question.service";

/**
 * POST /questions/bulk-import/confirm
 * Takes the examiner-approved/edited question list and saves each one
 * via the existing single-question creation path.
 */
export const confirmBulkImport = asyncHandler(async (req: Request, res: Response) => {
  const questions = await questionService.confirmBulkImport(req.body, req.user!);
  res.status(201).json({ questions });
});