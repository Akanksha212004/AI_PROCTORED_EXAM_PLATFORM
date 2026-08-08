"use client";

// components/exams/SubjectCombobox.tsx
//
// Not a generic ui/ primitive — deliberately kept exam-specific since
// it wraps subject-picking behavior (list from Question Bank + free
// text for a brand-new subject), not a general-purpose pattern yet.
// If another module needs the same combobox behavior later, this is
// the one to lift into components/ui/.

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

import { useAutoTranslate } from "@/hooks/useAutoTranslate";

function LocalizedText({ text }: { text: string }) {
  const translated = useAutoTranslate(text);
  return <>{translated}</>;
}

interface SubjectComboboxProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  subjects: string[];
  placeholder?: string; 
  error?: string;
}

export function SubjectCombobox({ label, value, onChange, subjects, placeholder= "Select subject...", error }: SubjectComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = subjects.filter((s) => s.toLowerCase().includes(value.trim().toLowerCase()));
  const isNewSubject = value.trim().length > 0 && !subjects.some((s) => s.toLowerCase() === value.trim().toLowerCase());

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label className="text-sm font-medium text-paper/80">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className={cn(
          "h-11 w-full rounded-lg border bg-surface-muted px-3.5 text-sm text-paper placeholder:text-muted",
          "border-border transition-colors duration-150 focus:border-accent-sky focus:outline-none",
          error && "border-accent-rose focus:border-accent-rose"
        )}
      />
      {error && <p className="text-xs font-medium text-accent-rose">{error}</p>}

      {isOpen && (filtered.length > 0 || isNewSubject) && (
        <div className="absolute top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-card-surface shadow-card">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setIsOpen(false);
              }}
              className="block w-full px-3.5 py-2 text-left text-sm text-paper hover:bg-white/5"
            >
              <LocalizedText text={s} />
            </button>
          ))}
          {isNewSubject && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="block w-full border-t border-border px-3.5 py-2 text-left text-sm text-accent-sky hover:bg-white/5"
            >
              <LocalizedText text="New subject:" /> &quot;{value.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
