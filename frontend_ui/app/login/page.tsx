import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export const metadata: Metadata = {
  title: "Sign in | ProctorEd",
};

export default function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to your account"
      subtitle="Enter your credentials to access your dashboard."
    >
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
