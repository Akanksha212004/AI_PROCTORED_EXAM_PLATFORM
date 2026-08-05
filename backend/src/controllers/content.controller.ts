// src/controllers/content.controller.ts
//
// NOTE on response shape: every other controller in this codebase wraps
// its response in `ApiResponse` (a { statusCode, data, message, success }
// envelope). This one deliberately does NOT — it returns the raw
// `{ translations: string[] }` body directly.
//
// Why: frontend_ui/services/translationService.ts already exists and is
// already wired into hooks/useTranslatedTexts.ts, QuestionPanel, and the
// exam-session page. It does:
//
//   const { data } = await apiClient.post<{ translations: string[] }>(
//     "/content/translate", { texts, targetLang }
//   );
//   if (Array.isArray(data.translations) && ...) return data.translations;
//
// i.e. it expects `data.translations` directly on the response body,
// not `data.data.translations`. That file is working, already-tested
// scaffolding we were told not to touch — so this controller matches
// the contract IT already expects, rather than the other way around.

import type { NextFunction, Request, Response } from 'express';

import * as contentService from '../services/content.service';
import type { TranslateContentInput } from '../schemas/content.schema';

export async function translateContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { texts, targetLang } = req.body as TranslateContentInput;
    const translations = await contentService.translateBatch(texts, targetLang);
    // Explicit charset: res.json() sets "application/json" with no
    // charset by default in some Express/Node configs, and a handful of
    // proxies/CDNs then guess Latin-1 for anything without one. Spelling
    // it out here guarantees the Devanagari/other non-ASCII bytes are
    // interpreted as UTF-8 by every hop between here and the browser.
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).json({ translations });
  } catch (err) {
    next(err);
  }
}
