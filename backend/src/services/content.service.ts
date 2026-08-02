// src/services/content.service.ts
//
// Translates dynamic/database content (question text, exam titles,
// subjects, feedback, etc.) via MyMemory, backed by the Postgres cache
// in content.repository. Two things this deliberately guards against:
//
// 1. Thundering herd: if 50 students all switch to Hindi for the same
//    exam within the same second, the DB cache is empty for all of them
//    at first — without de-duping, that's 50 simultaneous outbound
//    calls for the identical string. `inFlight` collapses concurrent
//    requests for the same (text, targetLang) pair into one shared
//    promise, so only ONE actually reaches MyMemory; the rest just
//    await it.
// 2. Never blocking the UI: every failure (network error, MyMemory
//    down, malformed response, rate-limited) falls back to the
//    original text rather than throwing. An exam must never break
//    because a translation call failed.

import { env } from '../core/config';
import * as contentRepository from '../repositories/content.repository';

const MYMEMORY_ENDPOINT = 'https://api.mymemory.translated.net/get';

// MyMemory caps each individual `q` at ~500 bytes. Question text can
// run longer than that, so anything over the limit is left untranslated
// rather than silently truncated (a cut-off translation is worse than
// none) — the UI just falls back to the original English for that item.
const MYMEMORY_MAX_BYTES = 490;

// Module-level map, shared across every request this process handles.
// Cleared as soon as each translation resolves (success or failure) —
// this is purely a short-lived de-dup for concurrent bursts, not a
// cache (that's Postgres's job).
const inFlight = new Map<string, Promise<string>>();

function inFlightKey(text: string, targetLang: string): string {
  return `${targetLang}::${text}`;
}

async function callMyMemory(text: string, targetLang: string): Promise<string> {
  const params = new URLSearchParams({
    q: text,
    langpair: `en|${targetLang}`,
  });
  if (env.MYMEMORY_EMAIL) params.set('de', env.MYMEMORY_EMAIL);

  const response = await fetch(`${MYMEMORY_ENDPOINT}?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`MyMemory responded with HTTP ${response.status}`);
  }

  const data = (await response.json()) as {
    responseData?: { translatedText?: string };
    responseStatus?: number | string;
  };

  const translated = data.responseData?.translatedText;
  if (!translated || String(data.responseStatus) !== '200') {
    throw new Error('MyMemory returned no usable translation');
  }
  return translated;
}

async function translateOneDeduped(text: string, targetLang: string): Promise<string> {
  const key = inFlightKey(text, targetLang);
  const existing = inFlight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const translated = await callMyMemory(text, targetLang);
      // Cache immediately — the very next request for this text (even
      // one that arrives milliseconds later) hits Postgres, not MyMemory.
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
 * MyMemory. Always resolves — never rejects — so a translation
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

      if (Buffer.byteLength(text, 'utf8') > MYMEMORY_MAX_BYTES) {
        // Too long for a single MyMemory call — fail soft rather than
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
