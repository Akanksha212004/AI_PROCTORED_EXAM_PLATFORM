"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useI18n } from "@/hooks/useI18n";
import { extractErrorMessage } from "@/lib/utils";
import { authService } from "@/services/authService";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  institution: string;
  department: string;
  designation: string;
  employeeId: string;
  yearsOfExperience: string;
  accessRequestReason: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  institution?: string;
  department?: string;
  designation?: string;
  yearsOfExperience?: string;
  accessRequestReason?: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  institution: "",
  department: "",
  designation: "",
  employeeId: "",
  yearsOfExperience: "",
  accessRequestReason: "",
};

export function ExaminerAccessRequestForm() {
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

  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (form.name.trim().length < 2) nextErrors.name = "Full name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid official email address";

    const failedRules = STRONG_PASSWORD_RULES.filter((rule) => !rule.test(form.password));
    if (failedRules.length > 0) nextErrors.password = "Password does not meet all requirements";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    if (form.institution.trim().length < 2) nextErrors.institution = "Institution is required";
    if (form.department.trim().length < 2) nextErrors.department = "Department is required";
    if (form.designation.trim().length < 2) nextErrors.designation = "Designation is required";

    if (form.yearsOfExperience && Number(form.yearsOfExperience) < 0) {
      nextErrors.yearsOfExperience = "Enter a valid number of years";
    }

    if (form.accessRequestReason.trim().length < 10) {
      nextErrors.accessRequestReason = "Please provide a short reason (at least 10 characters)";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await authService.requestExaminerAccess({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        institution: form.institution.trim(),
        department: form.department.trim(),
        designation: form.designation.trim(),
        employeeId: form.employeeId.trim() || undefined,
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
        accessRequestReason: form.accessRequestReason.trim(),
      });
      toast.success(t("auth.requestAccess.submitted"));
      router.replace("/examiner-portal");
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
        placeholder="Dr. Ada Lovelace"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
      />
      <Input
        label={t("auth.requestAccess.officialEmail")}
        type="email"
        autoComplete="email"
        placeholder="you@institution.edu"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label={t("auth.requestAccess.institution")}
          placeholder="Indian Institute of Technology"
          value={form.institution}
          onChange={(e) => update("institution", e.target.value)}
          error={errors.institution}
        />
        <Input
          label={t("auth.requestAccess.department")}
          placeholder="Computer Science"
          value={form.department}
          onChange={(e) => update("department", e.target.value)}
          error={errors.department}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label={t("auth.requestAccess.designation")}
          placeholder="Associate Professor"
          value={form.designation}
          onChange={(e) => update("designation", e.target.value)}
          error={errors.designation}
        />
        <Input
          label={t("auth.requestAccess.employeeId")}
          placeholder="EMP-00123"
          value={form.employeeId}
          onChange={(e) => update("employeeId", e.target.value)}
        />
      </div>

      <Input
        label={t("auth.requestAccess.yearsOfExperience")}
        type="number"
        min={0}
        placeholder="5"
        value={form.yearsOfExperience}
        onChange={(e) => update("yearsOfExperience", e.target.value)}
        error={errors.yearsOfExperience}
      />

      <Textarea
        label={t("auth.requestAccess.reason")}
        placeholder="Briefly describe the courses/exams you'll be creating on the platform."
        value={form.accessRequestReason}
        onChange={(e) => update("accessRequestReason", e.target.value)}
        error={errors.accessRequestReason}
      />

      <div>
        <Input
          label={t("auth.requestAccess.password")}
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          hint={t("auth.requestAccess.passwordHint")}
        />
        <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {STRONG_PASSWORD_RULES.map((rule) => {
            const passed = rule.test(form.password);
            return (
              <li
                key={rule.label}
                className={`text-xs transition-colors ${passed ? "text-accent-teal" : "text-paper/40"}`}
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
        {isSubmitting ? t("auth.requestAccess.submitting") : t("auth.requestAccess.submit")}
      </Button>

      <p className="text-center text-sm text-paper/60">
        {t("auth.requestAccess.alreadyRequested")}{" "}
        <Link href="/examiner-portal" className="font-medium text-accent-sky underline underline-offset-4">
          {t("auth.requestAccess.backToLogin")}
        </Link>
      </p>
      <p className="text-center text-sm text-paper/60">
        {t("auth.requestAccess.alreadySubmitted")}{" "}
        <Link
          href="/examiner-portal/request-status"
          className="font-medium text-accent-sky underline underline-offset-4"
        >
          {t("auth.requestAccess.viewStatus")}
        </Link>
      </p>
    </form>
  );
}
