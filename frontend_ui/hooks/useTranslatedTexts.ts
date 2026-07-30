"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/hooks/useI18n";
import type { LanguageCode } from "@/lib/i18n/languages";
import { translationService } from "@/services/translationService";

// Module-level cache shared across every component instance for the
// lifetime of the tab — keyed by `${lang}::${originalText}`. Keeps
// repeated views of the same question (revisits, Previous/Next) free.
const cache = new Map<string, string>();

function cacheKey(lang: LanguageCode, text: string): string {
  return `${lang}::${text}`;
}

/**
 * Translates a list of dynamic (examiner-authored) strings into the
 * currently selected language — for rendering exam/question content,
 * not static UI chrome (use useI18n().t for that).
 *
 * Returns the original strings immediately (so there's never a blank
 * flash) and swaps in translated versions once they arrive. Falls back
 * to the originals untouched when the language is English or the
 * translation call fails.
 */
export function useTranslatedTexts(texts: string[]): { translated: string[]; isTranslating: boolean } {
  const { language } = useI18n();
  const [translated, setTranslated] = useState<string[]>(texts);
  const [isTranslating, setIsTranslating] = useState(false);
  const requestIdRef = useRef(0);

  // Stable dependency key — texts arrays are re-created on every render
  // by the caller, so compare by content, not reference.
  const textsKey = texts.join("\u241E");

  useEffect(() => {
    if (language === "en") {
      setTranslated(texts);
      setIsTranslating(false);
      return;
    }

    const cached = texts.map((text) => cache.get(cacheKey(language, text)));
    if (cached.every((value) => value !== undefined)) {
      setTranslated(cached as string[]);
      setIsTranslating(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsTranslating(true);
    // Show originals while the batch is in flight rather than blanking out.
    setTranslated(texts);

    translationService.translateBatch(texts, language).then((results) => {
      if (requestIdRef.current !== requestId) return; // a newer request superseded this one
      results.forEach((result, i) => cache.set(cacheKey(language, texts[i]), result));
      setTranslated(results);
      setIsTranslating(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textsKey, language]);

  return { translated, isTranslating };
}
