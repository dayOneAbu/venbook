import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token") ?? request.cookies.get("__Secure-better-auth.session_token");
  const { pathname } = request.nextUrl;

  // 1. Define public routes
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/venues") ||
    pathname.startsWith("/auth");

  // 2. Not logged in and not a public route -> Redirect to sign-in
  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    // Also exclude any request that looks like a file with an extension
    // (e.g. `/hero.jpeg`, `/assets/logo.png`) so public files are served
    // directly and not intercepted by this middleware.
    "/((?!api|_next/static|_next/image|favicon\.ico|.*\\..*).*)",
  ],
};
