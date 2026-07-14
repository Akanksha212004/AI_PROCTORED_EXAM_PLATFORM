// components/exams/examErrors.ts
//
// CONFIRMED backend error shape (from validate.middleware.ts and the
// global error middleware implied by ApiError's docstring): responses
// are `{ detail: ... }` — either a string (ApiError-thrown messages)
// or an array of Zod issues (422 validation failures). This replaces
// the earlier guess-based extractQuestionErrorMessage now that the
// real shape is confirmed; feel free to swap that one over to this
// logic too since it's the same backend.

export function extractExamErrorMessage(error: unknown): string {
  const fallback = "Something went wrong. Please try again.";

  if (typeof error === "object" && error !== null && "response" in error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (error as any).response;
    const detail = response?.data?.detail;

    if (!detail) return fallback;
    if (typeof detail === "string") return detail;

    if (Array.isArray(detail)) {
      return detail
        .map((issue: { path?: (string | number)[]; message?: string }) =>
          issue.path?.length ? `${issue.path.join(".")}: ${issue.message}` : issue.message
        )
        .filter(Boolean)
        .join(" ");
    }
  }

  return fallback;
}
