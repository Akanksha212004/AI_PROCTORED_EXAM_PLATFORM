"use client";

import Cookies from "js-cookie";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { DEFAULT_LANGUAGE, isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";
import { TRANSLATIONS } from "@/lib/i18n/translations";

const LANGUAGE_COOKIE = "app_language";
const LANGUAGE_COOKIE_EXPIRY_DAYS = 365;

interface I18nContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  /**
   * Looks up a dot-path key in the active language's dictionary (falls
   * back to English if a key is somehow missing), and substitutes any
   * `{token}` placeholders with values from `vars`.
   *
   * Example: t("examTaking.questionOf", { current: 2, total: 10 })
   *   → "Question 2 of 10"
   */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function readByPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, source);
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  // Supports both `{token}` and `{{token}}` placeholder styles — some
  // dictionary entries (e.g. examTaking.questionOf) use double braces —
  // matching the double-brace form first so it's consumed whole rather
  // than leaving stray outer braces behind.
  return template.replace(/\{\{(\w+)\}\}|\{(\w+)\}/g, (match, doubleToken, singleToken) => {
    const token = doubleToken ?? singleToken;
    return token in vars ? String(vars[token]) : match;
  });
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Default to English on the server / first render so SSR and the
  // client's first paint always match; the real (persisted) language is
  // applied in the effect below, right after mount.
  const [language, setLanguageState] = useState<LanguageCode>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = Cookies.get(LANGUAGE_COOKIE);
    if (isLanguageCode(stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((next: LanguageCode) => {
    setLanguageState(next);
    Cookies.set(LANGUAGE_COOKIE, next, { expires: LANGUAGE_COOKIE_EXPIRY_DAYS, sameSite: "lax" });
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dictionary = TRANSLATIONS[language] ?? TRANSLATIONS[DEFAULT_LANGUAGE];
      const value = readByPath(dictionary, key) ?? readByPath(TRANSLATIONS[DEFAULT_LANGUAGE], key);
      if (typeof value !== "string") return key;
      return interpolate(value, vars);
    },
    [language]
  );

  const contextValue = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
