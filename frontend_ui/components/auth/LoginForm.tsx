"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, ChangeEvent } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { extractErrorMessage, roleToDashboardPath } from "@/lib/utils";

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!email.trim()) nextErrors.email = t("validation.emailRequired");
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = t("validation.emailInvalid");

    if (!password) nextErrors.password = t("validation.passwordRequired");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const user = await login({ email: email.trim().toLowerCase(), password });
      toast.success(`${t("login.welcomeToast")}, ${user.name.split(" ")[0]}`);
      const redirectTarget = searchParams.get("redirect");
      router.replace(redirectTarget || roleToDashboardPath(user.role));
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Input
        label={t("common.emailAddress")}
        type="email"
        autoComplete="email"
        placeholder="you@institution.edu"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        label={t("common.password")}
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        error={errors.password}
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? t("common.signingIn") : t("common.signIn")}
      </Button>

      <p className="text-center text-sm text-paper/60">
        {t("common.dontHaveAccount")}{" "}
        <Link href="/register" className="font-medium text-accent-sky underline underline-offset-4">
          {t("common.createOne")}
        </Link>
      </p>

      <div className="mt-2 border-t border-border pt-5 text-center">
        <p className="text-sm text-paper/60">{t("common.facultyExaminer")}</p>
        <p className="mt-0.5 text-xs text-paper/40">{t("common.accessExaminerPortal")}</p>
        <Link
          href="/examiner-portal"
          className="mt-3 inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-paper transition-colors hover:bg-white/5"
        >
          {t("common.examinerPortal")}
        </Link>
      </div>
    </form>
  );
}
