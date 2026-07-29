"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, ChangeEvent } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/utils";

interface FormErrors {
  email?: string;
  password?: string;
}

/**
 * Examiner Portal's own login form. Posts to the same /auth/login
 * endpoint as the student LoginForm (one auth backend, role comes back
 * in the token) but is a completely separate page/flow — an examiner
 * never logs in through the student login page, and this form refuses
 * to proceed if the account it authenticates isn't actually EXAMINER.
 */
export function ExaminerLoginForm() {
  const { login, logout } = useAuth();
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

      if (user.role !== "EXAMINER") {
        // Right credentials, wrong portal — this page is examiner-only.
        // logout() does an immediate hard navigation to /login, so delay
        // it slightly to give the toast a moment to actually render.
        toast.error("This portal is for examiners only. Please use the student login page.", {
          duration: 4000,
        });
        setTimeout(() => logout(), 1200);
        return;
      }

      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      router.replace("/dashboard/examiner");
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@institution.edu"
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        error={errors.password}
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? "Signing in" : "Sign In"}
      </Button>

      <p className="text-center text-sm text-paper/60">
        Don&apos;t have an examiner account?{" "}
        <Link
          href="/examiner-portal/request-access"
          className="font-medium text-accent-sky underline underline-offset-4"
        >
          Request Examiner Access
        </Link>
      </p>

      <p className="text-center text-xs text-paper/40">
        <Link href="/login" className="underline underline-offset-4 hover:text-paper/60">
          Not an examiner? Go to student login
        </Link>
      </p>
    </form>
  );
}
