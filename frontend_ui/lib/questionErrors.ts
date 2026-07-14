export function extractQuestionErrorMessage(error: unknown): string {
  const fallback = "Something went wrong. Please try again.";
 
  if (typeof error === "object" && error !== null && "response" in error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = (error as any).response;
    const data = response?.data;
 
    if (!data) return fallback;
    if (typeof data.message === "string") return data.message;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.errors)) {
      return data.errors
        .map((e: { field?: string; message?: string }) =>
          e.field ? `${e.field}: ${e.message}` : e.message
        )
        .filter(Boolean)
        .join(" ");
    }
  }
 
  return fallback;
}