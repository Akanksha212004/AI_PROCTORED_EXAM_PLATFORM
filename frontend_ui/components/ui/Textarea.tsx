"use client";

import { TextareaHTMLAttributes, forwardRef, useId } from "react";

import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, rows = 4, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-sm font-medium text-paper/80">
          {label}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={Boolean(error)}
          className={cn(
            "w-full resize-y rounded-lg border bg-surface-muted px-3.5 py-2.5 text-sm text-paper placeholder:text-muted",
            "border-border",
            "transition-colors duration-150 focus:border-accent-sky focus:outline-none",
            error && "border-accent-rose focus:border-accent-rose",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-accent-rose">{error}</p>
        ) : hint ? (
          <p className="text-xs text-muted">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
