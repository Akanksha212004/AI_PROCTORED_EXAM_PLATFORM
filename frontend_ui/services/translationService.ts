import apiClient from "@/lib/axios";
import type { LanguageCode } from "@/lib/i18n/languages";

/**
 * Translates dynamic content — question text, answer options, exam
 * titles/instructions — that examiners authored in whatever language
 * they wrote it in. This is DIFFERENT from the static UI dictionaries in
 * lib/i18n/translations/*: those cover fixed interface strings ("Sign
 * In", "Next", nav labels); this covers arbitrary user-authored text
 * that can't be pre-translated ahead of time.
 *
 * Backend route: POST /content/translate — see
 * src/services/content.service.ts (Sarvam AI + Postgres cache).
 *
 * NOTE: there used to be a client-side fallback here that called
 * MyMemory directly from the browser if the backend call failed. It's
 * been removed on purpose: that fallback was the actual source of the
 * "alien script" / mojibake text students were seeing. If the backend
 * call fails for any reason, we now just show the original
 * (untranslated) text — same fail-soft philosophy as before, but
 * without a second, less reliable translation path that could produce
 * garbled output. An exam should never be blocked or broken by a
 * translation failure, and English text beats corrupted text.
 */
export const translationService = {
  async translateBatch(texts: string[], targetLang: LanguageCode): Promise<string[]> {
    if (targetLang === "en" || texts.length === 0) return texts;

    try {
      const { data } = await apiClient.post<{ translations: string[] }>("/content/translate", {
        texts,
        targetLang,
      });
      if (Array.isArray(data.translations) && data.translations.length === texts.length) {
        return data.translations;
      }
      return texts;
    } catch {
      // Fail soft — show the original text rather than breaking the exam
      // or risking a garbled/corrupted translation.
      return texts;
    }
  },
};
