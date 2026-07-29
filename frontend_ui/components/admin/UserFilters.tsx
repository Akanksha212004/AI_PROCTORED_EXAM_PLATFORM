"use client";

// components/admin/UserFilters.tsx

import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { PlatformRole } from "@/types/admin";

export interface UserFilterState {
  search: string;
  role: PlatformRole | "";
  status: "active" | "inactive" | "";
}

interface Props {
  value: UserFilterState;
  onChange: (next: UserFilterState) => void;
}

const ROLE_OPTIONS: { value: PlatformRole | ""; label: string }[] = [
  { value: "", label: "All Roles" },
  { value: "STUDENT", label: "Students" },
  { value: "EXAMINER", label: "Examiners" },
  { value: "ADMIN", label: "Admins" },
];

const STATUS_OPTIONS: { value: "active" | "inactive" | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Deactivated" },
];

const selectClasses =
  "h-11 rounded-lg border border-border bg-surface-muted px-3.5 text-sm text-paper transition-colors focus:border-accent-sky focus:outline-none";

export function UserFilters({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/40" />
        <input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search by name or email"
          className="w-full rounded-lg border border-border bg-surface-muted py-2.5 pl-9 pr-3 text-sm text-paper placeholder:text-paper/40 focus:border-accent-sky focus:outline-none"
        />
      </div>
      <select
        value={value.role}
        onChange={(e) => onChange({ ...value, role: e.target.value as PlatformRole | "" })}
        className={cn(selectClasses, "sm:w-44")}
      >
        {ROLE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        value={value.status}
        onChange={(e) => onChange({ ...value, status: e.target.value as "active" | "inactive" | "" })}
        className={cn(selectClasses, "sm:w-44")}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
