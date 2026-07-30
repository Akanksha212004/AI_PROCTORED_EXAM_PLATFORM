"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/hooks/useI18n";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

interface Props {
  /** "dark" for the ink/surface backgrounds on auth + dashboard pages (default). */
  variant?: "dark" | "light";
  className?: string;
}

export function LanguageSwitcher({ variant = "dark", className }: Props) {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const active = SUPPORTED_LANGUAGES.find((l) => l.code === language) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("language.change")}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors",
          variant === "dark"
            ? "border-border bg-surface-muted text-paper/80 hover:bg-white/5"
            : "border-black/10 bg-white text-ink/80 hover:bg-black/5"
        )}
      >
        <Globe className="h-4 w-4" />
        <span>{active.nativeName}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full z-40 mt-2 w-48 overflow-hidden rounded-xl border shadow-card",
            variant === "dark" ? "border-border bg-surface" : "border-black/10 bg-white"
          )}
        >
          <ul>
            {SUPPORTED_LANGUAGES.map((option) => {
              const isActive = option.code === language;
              return (
                <li key={option.code}>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage(option.code);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left text-sm transition-colors",
                      variant === "dark"
                        ? isActive
                          ? "bg-accent-sky/10 text-accent-sky"
                          : "text-paper/80 hover:bg-white/5"
                        : isActive
                          ? "bg-accent-sky/10 text-accent-sky"
                          : "text-ink/80 hover:bg-black/5"
                    )}
                  >
                    <span className="flex flex-col">
                      <span className="font-medium">{option.nativeName}</span>
                      <span className={cn("text-xs", variant === "dark" ? "text-paper/40" : "text-ink/40")}>
                        {option.englishName}
                      </span>
                    </span>
                    {isActive && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
