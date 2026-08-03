// import { NextRequest, NextResponse } from "next/server";

// const PROTECTED_PREFIX = "/dashboard";
// const AUTH_PAGES = ["/login", "/register", "/examiner-portal", "/admin/login"];

// /**
//  * Picks the correct login page to bounce an unauthenticated visitor to,
//  * based on which dashboard they were trying to reach — so an admin
//  * session timing out on /dashboard/admin/* lands back on /admin/login,
//  * not the student /login page (and vice versa for examiners/students).
//  */
// function loginPathFor(pathname: string): string {
//   if (pathname.startsWith("/dashboard/admin")) return "/admin/login";
//   if (pathname.startsWith("/dashboard/examiner")) return "/examiner-portal";
//   return "/login";
// }

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("access_token")?.value;
//   const { pathname } = request.nextUrl;

//   const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);
//   const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

//   if (isProtectedRoute && !token) {
//     const loginUrl = new URL(loginPathFor(pathname), request.url);
//     loginUrl.searchParams.set("redirect", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   if (isAuthPage && token) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/login",
//     "/register",
//     "/examiner-portal",
//     "/examiner-portal/:path*",
//     "/admin/login",
//   ],
// };


// // export const config = {
// //   matcher: [],
// // };





// const PROTECTED_PREFIX = "/dashboard";
// const AUTH_PAGES = ["/login", "/register", "/examiner-portal", "/admin/login"];

// /**
//  * Picks the correct login page to bounce an unauthenticated visitor to,
//  * based on which dashboard they were trying to reach — so an admin
//  * session timing out on /dashboard/admin/* lands back on /admin/login,
//  * not the student /login page (and vice versa for examiners/students).
//  */
// function loginPathFor(pathname: string): string {
//   if (pathname.startsWith("/dashboard/admin")) return "/admin/login";
//   if (pathname.startsWith("/dashboard/examiner")) return "/examiner-portal";
//   return "/login";
// }

// function getCookie(request: Request, name: string): string | undefined {
//   const cookieHeader = request.headers.get("cookie");
//   if (!cookieHeader) return undefined;
//   const match = cookieHeader
//     .split(";")
//     .map((c) => c.trim())
//     .find((c) => c.startsWith(`${name}=`));
//   return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
// }

// export function middleware(request: Request) {
//   const token = getCookie(request, "access_token");
//   const { pathname } = new URL(request.url);

//   const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);
//   const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

//   if (isProtectedRoute && !token) {
//     const loginUrl = new URL(loginPathFor(pathname), request.url);
//     loginUrl.searchParams.set("redirect", pathname);
//     return Response.redirect(loginUrl, 307);
//   }

//   if (isAuthPage && token) {
//     return Response.redirect(new URL("/", request.url), 307);
//   }

//   return undefined;
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/login",
//     "/register",
//     "/examiner-portal",
//     "/examiner-portal/:path*",
//     "/admin/login",
//   ],
// };






import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIX = "/dashboard";
const AUTH_PAGES = ["/login", "/register", "/examiner-portal", "/admin/login"];

function loginPathFor(pathname: string): string {
  if (pathname.startsWith("/dashboard/admin")) return "/admin/login";
  if (pathname.startsWith("/dashboard/examiner")) return "/examiner-portal";
  return "/login";
}

export function middleware(request: NextRequest) {
  // Built-in NextRequest cookie parser safely retrieves & decodes cookies
  const token = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith(PROTECTED_PREFIX);
  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (isProtectedRoute && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = loginPathFor(pathname);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl, 307);
  }

  if (isAuthPage && token) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = "/";
    return NextResponse.redirect(homeUrl, 307);
  }

  // MUST return NextResponse.next() so Vercel renders the App Router page
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