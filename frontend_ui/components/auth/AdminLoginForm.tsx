"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, ChangeEvent } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { extractErrorMessage } from "@/lib/utils";

interface FormErrors {
  email?: string;
  password?: string;
}

/**
 * Admin-only login. Posts to the same /auth/login endpoint as every
 * other role (one auth backend, role comes back in the token) but this
 * page — /admin/login — is never linked from any public page, nav bar,
 * or other login screen. Anyone who authenticates here without an
 * ADMIN role is logged straight back out.
 *
 * Deliberately minimal: no "create account" link, no links out to the
 * student or examiner flows. This is a back-door-style entry point —
 * it should look and behave like one.
 */
export function AdminLoginForm() {
  const { login, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address";

    if (!password) nextErrors.password = "Password is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const user = await login({ email: email.trim().toLowerCase(), password });

      if (user.role !== "ADMIN") {
        // Right credentials, wrong portal. Deliberately vague — this
        // page should not confirm or deny which roles exist.
        // logout() does an immediate hard navigation to /login, so delay
        // it slightly to give the toast a moment to actually render.
        toast.error("Invalid credentials.", { duration: 4000 });
        setTimeout(() => logout(), 1200);
        return;
      }

      toast.success(`${t("auth.login.welcomeBack")}, ${user.name.split(" ")[0]}`);
      router.replace("/dashboard/admin");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Input
        label={t("auth.login.email")}
        type="email"
        autoComplete="email"
        placeholder="admin@institution.edu"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        label={t("auth.login.password")}
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        error={errors.password}
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? t("auth.adminLogin.signingIn") : t("auth.adminLogin.signIn")}
      </Button>
    </form>
  );
}
