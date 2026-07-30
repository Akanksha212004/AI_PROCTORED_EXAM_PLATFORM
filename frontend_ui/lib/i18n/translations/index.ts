import type { LanguageCode } from "@/lib/i18n/languages";

import { en, type TranslationDictionary } from "./en";
import { hi } from "./hi";
import { te } from "./te";
import { ml } from "./ml";
import { ta } from "./ta";

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en,
  hi,
  te,
  ml,
  ta,
};

export type { TranslationDictionary };
