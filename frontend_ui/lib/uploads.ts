// lib/uploads.ts
//
// Why this exists: the backend serves /uploads as a static route mounted
// at the Express app root (see src/app.ts — `app.use("/uploads", ...)`),
// which is OUTSIDE `API_V1_PREFIX`. Answer/model-answer records store a
// relative path like "/uploads/answers/xxxxx.png" (see
// examSession.service.ts#submitAnswerFile and
// question.service.ts#attachModelAnswer) — that's correct on the backend
// side, it's just relative by design.
//
// The bug was on the frontend: rendering that relative path directly as
// an <a href> / <img src> resolves it against whatever page is currently
// open (the Next.js app on its own port), not against the API. This
// derives the API's origin from the same NEXT_PUBLIC_API_BASE_URL env var
// lib/axios.ts already uses, and prefixes relative upload paths with it.
 
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";
 
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    // Fallback should be unreachable given the hardcoded default above,
    // but avoids a hard crash if the env var is ever set to something
    // unparsable as a URL.
    return API_BASE_URL;
  }
})();
 
/**
 * Resolves a relative `/uploads/...` path (as stored by the backend) into
 * an absolute URL pointing at the API's origin. Leaves already-absolute
 * URLs (http/https) untouched. Returns null for null/undefined input so
 * callers can keep using `{resolved && <a ...>}` guards unchanged.
 */
export function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}