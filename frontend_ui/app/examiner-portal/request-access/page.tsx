import type { Metadata } from "next";

import { ExaminerAccessRequestForm } from "@/components/auth/ExaminerAccessRequestForm";
import { AuthLayout } from "@/components/layout/AuthLayout";

export const metadata: Metadata = {
  title: "Request Examiner Access | ProctorEd",
};

export default function ExaminerAccessRequestPage() {
  return (
    <AuthLayout
      eyebrow="Examiner Portal"
      title="Request Examiner Access"
      subtitle="Tell us a bit about yourself — an administrator will review and approve your account."
      i18nKey="examinerRequest"
    >
      <ExaminerAccessRequestForm />
    </AuthLayout>
  );
}
