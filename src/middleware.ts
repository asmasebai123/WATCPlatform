import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Middleware de protection des routes.
 * /dashboard, /onboarding, /test, /pfe, /careers → auth requise
 * /admin → role ADMIN
 */
export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as { role?: string })?.role;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/test/:path*",
    "/pfe/:path*",
    "/careers/:path*",
    "/admin/:path*",
  ],
};
