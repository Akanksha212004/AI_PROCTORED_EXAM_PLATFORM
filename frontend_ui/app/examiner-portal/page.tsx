import type { Metadata } from "next";
import { Suspense } from "react";

import { ExaminerLoginForm } from "@/components/auth/ExaminerLoginForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export const metadata: Metadata = {
  title: "Examiner Portal | ProctorEd",
};

export default function ExaminerPortalPage() {
  return (
    <AuthLayout
      eyebrow="Examiner Portal"
      title="Sign in to your examiner account"
      subtitle="This portal is for faculty and examiners only."
      i18nKey="examinerLogin"
    >
      <Suspense fallback={null}>
        <ExaminerLoginForm />
      </Suspense>
    </AuthLayout>
  );
}
