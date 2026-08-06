// src/services/content.service.ts
//
// Translates dynamic/database content (question text, exam titles,
// subjects, feedback, etc.) via Sarvam AI, backed by the Postgres cache
// in content.repository. Two things this deliberately guards against:
//
// 1. Thundering herd: if 50 students all switch to Hindi for the same
//    exam within the same second, the DB cache is empty for all of them
//    at first — without de-duping, that's 50 simultaneous outbound
//    calls for the identical string. `inFlight` collapses concurrent
//    requests for the same (text, targetLang) pair into one shared
//    promise, so only ONE actually reaches Sarvam; the rest just
//    await it.
// 2. Never blocking the UI: every failure (network error, Sarvam down,
//    malformed response, rate-limited) falls back to the original text
//    rather than throwing. An exam must never break because a
//    translation call failed.
//
// NOTE: This used to call MyMemory (a free, crowd-sourced Translation
// Memory lookup service). It was replaced with Sarvam AI because
// MyMemory doesn't run a real translation model for most requests —
// it fuzzy-matches against a shared community database, and for
// longer/uncommon sentences (exam guidelines, question text) that
// database has no good match. It then either stitches together
// mismatched fragments or returns already-corrupted entries that some
// other contributor submitted with the wrong encoding — that's what
// was producing mojibake ("alien script") in the UI, not an encoding
// bug on our side. Sarvam AI is a proper NMT model trained
// specifically on Indian languages, so it doesn't have this failure
// mode, and it doesn't need the defensive HTML-entity-decoding /
// manual-UTF8-decoding this file used to do just to work around
// MyMemory's quirks.

import { env } from '../core/config';
import * as contentRepository from '../repositories/content.repository';

const SARVAM_ENDPOINT = 'https://api.sarvam.ai/translate';

// Sarvam's sarvam-translate:v1 model accepts up to 2000 characters per
// call. Question text can occasionally run longer than that, so
// anything over the limit is left untranslated rather than silently
// truncated (a cut-off translation is worse than none) — the UI just
// falls back to the original English for that item.
const SARVAM_MAX_CHARS = 2000;

// Sarvam's target_language_code values — our LanguageCode ('hi' | 'te'
// | 'ml' | 'ta') needs the '-IN' region suffix.
const TARGET_LANGUAGE_CODES: Record<string, string> = {
  hi: 'hi-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  ta: 'ta-IN',
};

// Module-level map, shared across every request this process handles.
// Cleared as soon as each translation resolves (success or failure) —
// this is purely a short-lived de-dup for concurrent bursts, not a
// cache (that's Postgres's job).
const inFlight = new Map<string, Promise<string>>();

function inFlightKey(text: string, targetLang: string): string {
  return `${targetLang}::${text}`;
}

async function callSarvam(text: string, targetLang: string): Promise<string> {
  const targetLanguageCode = TARGET_LANGUAGE_CODES[targetLang];
  if (!targetLanguageCode) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }

  const response = await fetch(SARVAM_ENDPOINT, {
    method: 'POST',
    signal: AbortSignal.timeout(8000),
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': env.SARVAM_API_KEY,
    },
    body: JSON.stringify({
      input: text,
      source_language_code: 'en-IN',
      target_language_code: targetLanguageCode,
      // sarvam-translate:v1 (rather than mayura:v1) — supports the
      // full 2000-char input length and is the more general-purpose
      // model; we don't need mayura's colloquial/code-mixed modes for
      // formal exam content.
      model: 'sarvam-translate:v1',
      mode: 'formal',
    }),
  });

  if (!response.ok) {
    throw new Error(`Sarvam AI responded with HTTP ${response.status}`);
  }

  // Decode the raw bytes as UTF-8 ourselves instead of trusting
  // response.json() to infer the right charset from headers that may
  // be missing or wrong — this is the same safe pattern used
  // everywhere else in this codebase for non-ASCII text.
  const rawBytes = await response.arrayBuffer();
  const rawText = new TextDecoder('utf-8').decode(rawBytes);

  const data = JSON.parse(rawText) as {
    translated_text?: string;
    request_id?: string | null;
  };

  if (!data.translated_text) {
    throw new Error('Sarvam AI returned no usable translation');
  }
  return data.translated_text;
}

async function translateOneDeduped(text: string, targetLang: string): Promise<string> {
  const key = inFlightKey(text, targetLang);
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const translated = await callSarvam(text, targetLang);
      // Cache immediately — the very next request for this text (even
      // one that arrives milliseconds later) hits Postgres, not Sarvam.
      await contentRepository.saveTranslation(text, targetLang, translated);
      return translated;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

/**
 * Translates a batch of strings into targetLang. Cache-first: only
 * texts with no existing TranslationCache row are actually sent to
 * Sarvam AI. Always resolves — never rejects — so a translation
 * provider outage degrades to "shows original text" rather than a
 * broken page.
 */
export async function translateBatch(texts: string[], targetLang: string): Promise<string[]> {
  const normalized = texts.map((t) => t ?? '');

  const cached = await contentRepository.getCachedTranslations(normalized, targetLang);

  const results = await Promise.all(
    normalized.map(async (text) => {
      if (!text.trim()) return text;

      const hit = cached.get(text);
      if (hit !== undefined) return hit;

      if (text.length > SARVAM_MAX_CHARS) {
        // Too long for a single Sarvam call — fail soft rather than
        // sending a truncated/garbled request.
        return text;
      }

      try {
        return await translateOneDeduped(text, targetLang);
      } catch {
        return text; // fail soft — original text beats a broken exam
      }
    })
  );

  return results;
}
