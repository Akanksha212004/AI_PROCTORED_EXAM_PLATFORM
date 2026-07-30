"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useI18n } from "@/hooks/useI18n";
import { extractErrorMessage } from "@/lib/utils";
import { authService } from "@/services/authService";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterForm() {
  const router = useRouter();
  const { t } = useI18n();

  const STRONG_PASSWORD_RULES = [
    { test: (v: string) => v.length >= 8, label: t("auth.requestAccess.passwordRuleMin8") },
    { test: (v: string) => /[A-Z]/.test(v), label: t("auth.requestAccess.passwordRuleUpper") },
    { test: (v: string) => /[a-z]/.test(v), label: t("auth.requestAccess.passwordRuleLower") },
    { test: (v: string) => /\d/.test(v), label: t("auth.requestAccess.passwordRuleNumber") },
    {
      test: (v: string) => /[!@#$%^&*()\-_=+[\]{};:'",.<>\/?`~|\\]/.test(v),
      label: t("auth.requestAccess.passwordRuleSpecial"),
    },
  ];

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (form.name.trim().length < 2) nextErrors.name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address";

    const failedRules = STRONG_PASSWORD_RULES.filter((rule) => !rule.test(form.password));
    if (failedRules.length > 0) nextErrors.password = "Password does not meet all requirements";

    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await authService.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      toast.success(t("auth.register.accountCreated"));
      router.replace("/login");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Input
        label={t("auth.requestAccess.fullName")}
        autoComplete="name"
        placeholder="Ada Lovelace"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
      />
      <Input
        label={t("auth.login.email")}
        type="email"
        autoComplete="email"
        placeholder="you@institution.edu"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
      />
      <div>
        <Input
          label={t("auth.login.password")}
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
        />
        <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {STRONG_PASSWORD_RULES.map((rule) => {
            const passed = rule.test(form.password);
            return (
              <li
                key={rule.label}
                className={`text-xs transition-colors ${
                  passed ? "text-accent-teal" : "text-paper/40"
                }`}
              >
                {passed ? "✓" : "·"} {rule.label}
              </li>
            );
          })}
        </ul>
      </div>

      <Input
        label={t("auth.requestAccess.confirmPassword")}
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={form.confirmPassword}
        onChange={(e) => update("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? t("auth.register.creatingAccount") : t("auth.register.createAccount")}
      </Button>

      <p className="text-center text-sm text-paper/60">
        {t("auth.register.alreadyHaveAccount")}{" "}
        <Link href="/login" className="font-medium text-accent-sky underline underline-offset-4">
          {t("auth.register.signIn")}
        </Link>
      </p>
    </form>
  );
}
