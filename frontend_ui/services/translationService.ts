// import apiClient from "@/lib/axios";
// import type { LanguageCode } from "@/lib/i18n/languages";

// /**
//  * Translates dynamic content — question text, answer options, exam
//  * titles/instructions — that examiners authored in whatever language
//  * they wrote it in. This is DIFFERENT from the static UI dictionaries in
//  * lib/i18n/translations/*: those cover fixed interface strings ("Sign
//  * In", "Next", nav labels); this covers arbitrary user-authored text
//  * that can't be pre-translated ahead of time.
//  *
//  * NOTE (backend): this endpoint does not exist yet. It needs to be added
//  * as an authenticated route, e.g.
//  *   POST /content/translate
//  *   body: { texts: string[], targetLang: "hi" | "te" | "ml" | "ta" }
//  *   returns: { translations: string[] }  (same order/length as `texts`)
//  *
//  * Suggested backend implementation: call a machine translation provider
//  * (Google Cloud Translate, Azure Translator, etc.) server-side — keeps
//  * the API key off the client and lets you cache/rate-limit centrally.
//  * Until that route exists, this service fails soft: on any error it
//  * simply returns the original, untranslated text so the exam is never
//  * blocked or broken for the student.
//  */
// export const translationService = {
//   async translateBatch(texts: string[], targetLang: LanguageCode): Promise<string[]> {
//     if (targetLang === "en" || texts.length === 0) return texts;

//     try {
//       const { data } = await apiClient.post<{ translations: string[] }>("/content/translate", {
//         texts,
//         targetLang,
//       });
//       if (Array.isArray(data.translations) && data.translations.length === texts.length) {
//         return data.translations;
//       }
//       return texts;
//     } catch {
//       // Fail soft — show the original text rather than breaking the exam.
//       return texts;
//     }
//   },
// };






import apiClient from "@/lib/axios";
import type { LanguageCode } from "@/lib/i18n/languages";

/**
 * Helper: Cleans up HTML entities and Mojibake symbols so scripts like
 * Devanagari (Hindi), Tamil, Telugu, etc. render 100% cleanly.
 */
function decodeCleanUTF8(text: string): string {
  if (typeof window === "undefined" || !text) return text;
  try {
    const parser = new DOMParser();
    const decoded = parser.parseFromString(text, "text/html").body.textContent;
    return decoded || text;
  } catch {
    return text;
  }
}

/**
 * Fallback: Clean MyMemory API call with proper URL encoding
 * to prevent character corruption (αñ... symbols).
 */
async function fallbackMyMemoryTranslate(text: string, targetLang: string): Promise<string> {
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=en|${targetLang}`;
    const res = await fetch(url);
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    return translated ? decodeCleanUTF8(translated) : text;
  } catch {
    return text;
  }
}

export const translationService = {
  async translateBatch(texts: string[], targetLang: LanguageCode): Promise<string[]> {
    if (targetLang === "en" || texts.length === 0) return texts;

    try {
      // 1. Primary Attempt: Call Backend Translation API
      const { data } = await apiClient.post<{ translations: string[] }>("/content/translate", {
        texts,
        targetLang,
      });

      if (Array.isArray(data.translations) && data.translations.length === texts.length) {
        return data.translations.map((t) => decodeCleanUTF8(t));
      }
      throw new Error("Invalid backend translation response");
    } catch {
      // 2. Soft Fallback: Call MyMemory API cleanly without breaking exam or showing alien script
      const translatedArray = await Promise.all(
        texts.map((text) => fallbackMyMemoryTranslate(text, targetLang))
      );
      return translatedArray;
    }
  },
};