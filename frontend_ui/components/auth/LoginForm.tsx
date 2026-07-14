"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, ChangeEvent } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage, roleToDashboardPath } from "@/lib/utils";

interface FormErrors {
  email?: string;
  password?: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

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
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
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
        label="Email address"
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
        {isSubmitting ? "Signing in" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-paper/60">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-accent-sky underline underline-offset-4">
          Create one
        </Link>
      </p>
    </form>
  );
}

