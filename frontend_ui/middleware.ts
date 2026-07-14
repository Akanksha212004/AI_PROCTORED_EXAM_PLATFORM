import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIX = "/dashboard";
const AUTH_PAGES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
