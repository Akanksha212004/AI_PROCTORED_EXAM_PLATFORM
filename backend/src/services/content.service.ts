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

// MyMemory occasionally returns its translation with HTML entities in
// it (numeric refs like `&#2325;` for a single Devanagari codepoint, or
// named ones like `&amp;`/`&quot;`) instead of the raw UTF-8 character.
// Left undecoded, these render as literal markup and — if the string is
// later re-encoded/re-parsed anywhere downstream — are exactly the kind
// of mismatch that produces mojibake instead of clean Devanagari. Decode
// them all here, once, right after the bytes come off the wire.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
};

function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity[0] === '#') {
      const isHex = entity[1] === 'x' || entity[1] === 'X';
      const codepoint = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isNaN(codepoint) ? match : String.fromCodePoint(codepoint);
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}

async function callMyMemory(text: string, targetLang: string): Promise<string> {
  // URLSearchParams percent-encodes each value as UTF-8 bytes (the same
  // thing encodeURIComponent does), so Devanagari/other non-ASCII text
  // round-trips correctly — this is NOT where the encoding gets lost.
  // We still build params through it explicitly (rather than manual
  // string concatenation) specifically to guarantee that encoding.
  const params = new URLSearchParams();
  params.set('q', text);
  params.set('langpair', `en|${targetLang}`);
  if (env.MYMEMORY_EMAIL) params.set('de', env.MYMEMORY_EMAIL);

  const response = await fetch(`${MYMEMORY_ENDPOINT}?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
    headers: {
      // Be explicit about what we accept back — some intermediary
      // caches/proxies fall back to a Latin-1-ish default charset when
      // the response has no (or an ambiguous) charset on its own
      // Content-Type, which is exactly how Devanagari turns into
      // mojibake. Asking for UTF-8 JSON explicitly avoids that.
      Accept: 'application/json; charset=utf-8',
    },
  });

  if (!response.ok) {
    throw new Error(`MyMemory responded with HTTP ${response.status}`);
  }

  // Decode the raw bytes as UTF-8 ourselves instead of trusting
  // response.json() to infer the right charset from headers that may be
  // missing or wrong. This is the safest point to guarantee correct
  // Devanagari decoding, since everything downstream (cache, API
  // response, frontend render) just passes this string through as-is.
  const rawBytes = await response.arrayBuffer();
  const rawText = new TextDecoder('utf-8').decode(rawBytes);

  const data = JSON.parse(rawText) as {
    responseData?: { translatedText?: string };
    responseStatus?: number | string;
  };

  const translated = data.responseData?.translatedText;
  if (!translated || String(data.responseStatus) !== '200') {
    throw new Error('MyMemory returned no usable translation');
  }
  return decodeHtmlEntities(translated);
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
