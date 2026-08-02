// src/repositories/content.repository.ts
//
// Postgres-backed cache for machine-translated dynamic content. This is
// what makes Option A actually work: the same question/exam text is
// only ever sent to MyMemory ONCE per target language, no matter how
// many students, sessions, or page refreshes request it afterwards.

import crypto from 'crypto';

import { prisma } from '../db/prisma';

/**
 * A Postgres unique index on an arbitrary-length TEXT column (question
 * bodies can be long) is impractical, so we key the cache on a SHA-256
 * hash of the source text instead. sourceText itself is still stored in
 * full alongside it, purely so the cache is human-inspectable.
 */
export function hashSourceText(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/**
 * Looks up cached translations for a batch of source strings in one
 * query. Returns a Map from the ORIGINAL text (not the hash) to its
 * cached translation — texts with no cache entry simply won't have a
 * key in the returned map.
 */
export async function getCachedTranslations(
  texts: string[],
  targetLang: string
): Promise<Map<string, string>> {
  if (texts.length === 0) return new Map();

  const hashes = texts.map(hashSourceText);
  const rows = await prisma.translationCache.findMany({
    where: { targetLang, sourceTextHash: { in: hashes } },
    select: { sourceTextHash: true, translatedText: true },
  });

  const byHash = new Map(rows.map((r) => [r.sourceTextHash, r.translatedText]));

  const result = new Map<string, string>();
  texts.forEach((text, i) => {
    const hit = byHash.get(hashes[i]);
    if (hit !== undefined) result.set(text, hit);
  });
  return result;
}

/**
 * Persists a single freshly-translated string. Uses upsert (not
 * create) so a rare race between two concurrent cache-misses for the
 * exact same text doesn't throw on the unique constraint — the second
 * writer just overwrites with an (identical, or near-identical) result.
 */
export async function saveTranslation(
  sourceText: string,
  targetLang: string,
  translatedText: string
): Promise<void> {
  const sourceTextHash = hashSourceText(sourceText);
  await prisma.translationCache.upsert({
    where: { sourceTextHash_targetLang: { sourceTextHash, targetLang } },
    update: { translatedText },
    create: {
      sourceTextHash,
      // Defensive truncate — the Zod schema already caps incoming
      // texts at 5000 chars, this just protects the raw column too.
      sourceText: sourceText.slice(0, 8000),
      targetLang,
      translatedText,
    },
  });
}
