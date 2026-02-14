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
    // Route to tenant admin if path starts with /admin, otherwise could be a tenant public site (if implemented)
    const tenantPath = pathname.startsWith("/admin") 
      ? `/dashboard/tenant/${subdomain}${pathname}`
      : `/(marketplace)/venues/${subdomain}${pathname}`; // Fallback or public view logic
    return NextResponse.rewrite(new URL(`${tenantPath}${request.nextUrl.search}`, request.url));
  }

  // 2. Auth Protection Logic (for the root domain or direct paths)
  const sessionCookie = request.cookies.get("better-auth.session_token") ?? request.cookies.get("__Secure-better-auth.session_token");

  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/venues") ||
    pathname.startsWith("/auth");

  // Redirect to sign-in if accessing dashboard areas without session
  if (!sessionCookie && !isPublicRoute && (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))) {
    const next = encodeURIComponent(pathname);
    const signInPath = pathname.includes("platform") || pathname.startsWith("/admin")
      ? `/auth/owner/sign-in?redirect=${next}`
      : `/auth/customer/sign-in?redirect=${next}`;
    
    return NextResponse.redirect(new URL(signInPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\.ico|.*\\..*).*)",
  ],
};
