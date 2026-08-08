"use client";

import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand bg-[length:140%_140%] bg-left text-white shadow-md shadow-accent-sky/25 transition-[background-position,box-shadow] duration-300 hover:bg-right hover:shadow-lg hover:shadow-accent-sky/30",
  secondary: "bg-transparent border border-border text-paper hover:bg-white/5",
  ghost: "bg-transparent text-paper hover:bg-white/5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold tracking-tight",
          "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
