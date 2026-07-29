"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useLanguage } from "@/hooks/useLanguage";
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

const STRONG_PASSWORD_RULES = [
  { test: (v: string) => v.length >= 8, key: "passwordRule.length" },
  { test: (v: string) => /[A-Z]/.test(v), key: "passwordRule.uppercase" },
  { test: (v: string) => /[a-z]/.test(v), key: "passwordRule.lowercase" },
  { test: (v: string) => /\d/.test(v), key: "passwordRule.number" },
  { test: (v: string) => /[!@#$%^&*()\-_=+[\]{};:'",.<>\/?`~|\\]/.test(v), key: "passwordRule.special" },
];

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
  const { t } = useLanguage();

  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (form.name.trim().length < 2) nextErrors.name = t("validation.fullNameMin");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = t("validation.officialEmailInvalid");

    const failedRules = STRONG_PASSWORD_RULES.filter((rule) => !rule.test(form.password));
    if (failedRules.length > 0) nextErrors.password = t("validation.passwordWeak");
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = t("validation.passwordMismatch");

    if (form.institution.trim().length < 2) nextErrors.institution = t("validation.institutionRequired");
    if (form.department.trim().length < 2) nextErrors.department = t("validation.departmentRequired");
    if (form.designation.trim().length < 2) nextErrors.designation = t("validation.designationRequired");

    if (form.yearsOfExperience && Number(form.yearsOfExperience) < 0) {
      nextErrors.yearsOfExperience = t("validation.yearsInvalid");
    }

    if (form.accessRequestReason.trim().length < 10) {
      nextErrors.accessRequestReason = t("validation.reasonMin");
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
      toast.success(t("examinerRequest.successToast"));
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
        label={t("common.fullName")}
        autoComplete="name"
        placeholder="Dr. Ada Lovelace"
        value={form.name}
        onChange={(e) => update("name", e.target.value)}
        error={errors.name}
      />
      <Input
        label={t("common.officialEmail")}
        type="email"
        autoComplete="email"
        placeholder="you@institution.edu"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        error={errors.email}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label={t("common.institution")}
          placeholder="Indian Institute of Technology"
          value={form.institution}
          onChange={(e) => update("institution", e.target.value)}
          error={errors.institution}
        />
        <Input
          label={t("common.department")}
          placeholder="Computer Science"
          value={form.department}
          onChange={(e) => update("department", e.target.value)}
          error={errors.department}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label={t("common.designation")}
          placeholder="Associate Professor"
          value={form.designation}
          onChange={(e) => update("designation", e.target.value)}
          error={errors.designation}
        />
        <Input
          label={t("common.employeeIdOptional")}
          placeholder="EMP-00123"
          value={form.employeeId}
          onChange={(e) => update("employeeId", e.target.value)}
        />
      </div>

      <Input
        label={t("common.yearsOfExperienceOptional")}
        type="number"
        min={0}
        placeholder="5"
        value={form.yearsOfExperience}
        onChange={(e) => update("yearsOfExperience", e.target.value)}
        error={errors.yearsOfExperience}
      />

      <Textarea
        label={t("common.accessReason")}
        placeholder="Briefly describe the courses/exams you'll be creating on the platform."
        value={form.accessRequestReason}
        onChange={(e) => update("accessRequestReason", e.target.value)}
        error={errors.accessRequestReason}
      />

      <div>
        <Input
          label={t("common.password")}
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          error={errors.password}
          hint={t("common.passwordHint")}
        />
        <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {STRONG_PASSWORD_RULES.map((rule) => {
            const passed = rule.test(form.password);
            return (
              <li
                key={rule.key}
                className={`text-xs transition-colors ${passed ? "text-accent-teal" : "text-paper/40"}`}
              >
                {passed ? "✓" : "·"} {t(rule.key)}
              </li>
            );
          })}
        </ul>
      </div>

      <Input
        label={t("common.confirmPassword")}
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={form.confirmPassword}
        onChange={(e) => update("confirmPassword", e.target.value)}
        error={errors.confirmPassword}
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? t("common.submittingRequest") : t("common.submitRequest")}
      </Button>

      <p className="text-center text-sm text-paper/60">
        {t("examinerRequest.alreadyRequested")}{" "}
        <Link href="/examiner-portal" className="font-medium text-accent-sky underline underline-offset-4">
          {t("examinerRequest.backToLogin")}
        </Link>
      </p>
    </form>
  );
}
