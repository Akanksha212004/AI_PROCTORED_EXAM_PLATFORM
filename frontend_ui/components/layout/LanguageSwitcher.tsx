"use client";

// components/layout/LanguageSwitcher.tsx

import { Globe } from "lucide-react";

import { useLanguage } from "@/hooks/useLanguage";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/translations";
import type { LanguageCode } from "@/lib/i18n/translations";

interface Props {
  /** Use "light" on the dark left brand panel, "default" on the form panel. */
  variant?: "default" | "light";
}

export function LanguageSwitcher({ variant = "default" }: Props) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
        variant === "light"
          ? "border-white/15 bg-white/5 text-paper/70 hover:bg-white/10"
          : "border-border bg-surface-muted text-paper/70 hover:bg-white/5"
      }`}
    >
      <Globe className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{t("language.label")}</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        aria-label={t("language.label")}
        className="appearance-none bg-transparent pr-1 text-xs font-medium text-inherit focus:outline-none"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-surface text-paper">
            {lang.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
