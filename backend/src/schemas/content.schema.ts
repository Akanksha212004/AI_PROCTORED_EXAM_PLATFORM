// src/schemas/content.schema.ts
//
// Validates POST /content/translate — the endpoint the frontend's
// existing services/translationService.ts + hooks/useTranslatedTexts.ts
// already call (that code was written first; this schema/route just
// makes the contract it expects actually exist server-side).
//
// This is DIFFERENT from the static-UI i18n system (lib/i18n/translations
// on the frontend): that covers fixed interface strings pre-translated
// at build time. This covers arbitrary examiner/student-authored text
// pulled from Postgres (question text, exam titles, feedback, etc.)
// that can't be known ahead of time.

import { z } from 'zod';

// Mirrors LanguageCode from frontend_ui/lib/i18n/languages.ts, minus
// "en" — the frontend never calls this endpoint for English (see
// translationService.translateBatch's early return), so the backend
// only ever needs to handle these four.
export const TARGET_LANGUAGES = ['hi', 'te', 'ml', 'ta'] as const;

export const TargetLanguageEnum = z.enum(TARGET_LANGUAGES);

export const translateContentSchema = z.object({
  // Capped at 50 items / 5,000 chars each so one request can't either
  // blow through MyMemory's per-string byte limit or accidentally
  // exhaust the whole daily quota in a single call (e.g. a buggy
  // frontend loop). Question text, options, and exam titles are all
  // comfortably under this in normal use.
  texts: z
    .array(z.string().max(5000, 'Each text must be 5000 characters or fewer'))
    .min(1, 'texts must contain at least one item')
    .max(50, 'texts cannot contain more than 50 items per request'),
  targetLang: TargetLanguageEnum,
});

export type TranslateContentInput = z.infer<typeof translateContentSchema>;
