import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIX = "/dashboard";
const AUTH_PAGES = ["/login", "/register", "/examiner-portal", "/admin/login"];

/**
 * Picks the correct login page to bounce an unauthenticated visitor to,
 * based on which dashboard they were trying to reach — so an admin
 * session timing out on /dashboard/admin/* lands back on /admin/login,
 * not the student /login page (and vice versa for examiners/students).
 */
function loginPathFor(pathname: string): string {
  if (pathname.startsWith("/dashboard/admin")) return "/admin/login";
  if (pathname.startsWith("/dashboard/examiner")) return "/examiner-portal";
  return "/login";
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL(loginPathFor(pathname), request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/examiner-portal",
    "/examiner-portal/:path*",
    "/admin/login",
  ],
};
