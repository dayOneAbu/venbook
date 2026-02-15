import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";

  // Define the root domain
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

  // 1. Determine the routing context
  const isPlatformSubdomain = hostname === `platform.${rootDomain}`;
  const isTenantSubdomain = !isPlatformSubdomain && hostname !== rootDomain && hostname.endsWith(`.${rootDomain}`);
  
  // If we are on a subdomain, we perform rewrites
  if (isPlatformSubdomain) {
    return NextResponse.rewrite(new URL(`/dashboard/platform${pathname}${request.nextUrl.search}`, request.url));
  }

  if (isTenantSubdomain) {
    const subdomain = hostname.split(".")[0];
    // Route to tenant admin if path starts with /admin, otherwise route to marketplace
    const tenantPath = pathname.startsWith("/admin") 
      ? `/dashboard/tenant${pathname}`
      : `/(marketplace)/venues/${subdomain}${pathname}`;
    return NextResponse.rewrite(new URL(`${tenantPath}${request.nextUrl.search}`, request.url));
  }

  // 2. Auth Protection Logic (for the root domain or direct paths)
  // NOTE: Full session validation (expiry, revocation) is enforced at the tRPC layer
  // via auth.api.getSession(). The middleware does a cookie-presence check for
  // page-level gating only. This is an intentional trade-off to avoid latency on
  // every page navigation.
  const sessionCookie = request.cookies.get("better-auth.session_token") ?? request.cookies.get("__Secure-better-auth.session_token");

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/venues") ||
    pathname.startsWith("/auth");

  // Redirect to sign-in if accessing dashboard areas without session
  if (!sessionCookie && !isPublicRoute && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    const next = encodeURIComponent(pathname);
    const signInPath = `/auth/owner/sign-in?redirect=${next}`;
    
    return NextResponse.redirect(new URL(signInPath, request.url));
  }

  // Redirect authenticated users away from auth pages
  if (sessionCookie && pathname.startsWith("/auth")) {
    // We can't easily know the role here without decoding the session (which is complex in middleware).
    // So we'll redirect to a "dispatcher" page or the most common landing page.
    // For now, let's redirect to the root, and let the client-side or specific page logic handle further routing if needed.
    // Or simpler: /venues for customers, /dashboard/tenant for owners (if we could know).
    // A safe bet is the homepage or venues list.
    return NextResponse.redirect(new URL("/venues", request.url));
  }

  // 3. Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\.ico|.*\\..*).*)",
  ],
};
