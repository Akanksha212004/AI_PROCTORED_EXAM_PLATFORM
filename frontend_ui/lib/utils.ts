import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely, resolving conflicts (last one wins). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract a human-readable message from a FastAPI error response. */
export function extractErrorMessage(error: unknown): string {
  const fallback = "Something went wrong. Please try again.";

  if (typeof error === "object" && error !== null && "response" in error) {
    // Axios error shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (error as any).response;
    const detail = response?.data?.detail;

    if (!detail) return fallback;
    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      return detail
        .map((d: { msg?: string }) => d.msg)
        .filter(Boolean)
        .join(" ");
    }
  }

  return fallback;
}

export function roleToDashboardPath(role: string): string {
  switch (role.toUpperCase()) {
    case "STUDENT":
      return "/dashboard/student";
    case "EXAMINER":
      return "/dashboard/examiner";
    case "ADMIN":
      return "/dashboard/admin";
    default:
      return "/login";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";
// Strip the "/api/v1" (or "/api/v2", etc.) suffix to get the backend's origin —
// e.g. "http://localhost:5000/api/v1" -> "http://localhost:5000".
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");

/**
 * The backend returns file paths as relative ("/uploads/model-answers/x.png"),
 * since it doesn't know its own public URL. The browser resolves a relative
 * href/src against the CURRENT page's origin though — which is the Next.js
 * dev server (localhost:3000), not Express (localhost:5000) — so links/images
 * 404. This prefixes relative paths with the backend's actual origin.
 */
export function getFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // already absolute, leave as-is
  return `${BACKEND_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}
