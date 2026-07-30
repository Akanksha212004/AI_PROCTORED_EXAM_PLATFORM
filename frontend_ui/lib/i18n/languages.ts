export type LanguageCode = "en" | "hi" | "te" | "ml" | "ta";

export interface LanguageOption {
  code: LanguageCode;
  /** English name — shown as a subtitle in the dropdown. */
  englishName: string;
  /** Name written in the language's own script — shown as the primary label. */
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", englishName: "English", nativeName: "English" },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी" },
  { code: "te", englishName: "Telugu", nativeName: "తెలుగు" },
  { code: "ml", englishName: "Malayalam", nativeName: "മലയാളം" },
  { code: "ta", englishName: "Tamil", nativeName: "தமிழ்" },
];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function isLanguageCode(value: string | null | undefined): value is LanguageCode {
  return Boolean(value) && SUPPORTED_LANGUAGES.some((l) => l.code === value);
}
