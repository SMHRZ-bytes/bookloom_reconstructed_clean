import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const url = req.nextUrl;
    const path = url.pathname;

    const isAuthPage = path.startsWith("/auth");
    const isApiAuthRoute = path.startsWith("/api/auth");
    const isPublicApiRoute = path.startsWith("/api/public");

    // ✅ Skip all middleware logic for public and API routes
    if (isApiAuthRoute || isPublicApiRoute) {
      return NextResponse.next();
    }

    // ✅ If user is logged in and on an auth page -> redirect to dashboard
    if (token && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ✅ If user not logged in and tries to access protected page -> redirect to login
    const isProtectedRoute =
      path.startsWith("/dashboard") ||
      path.startsWith("/admin") ||
      path.startsWith("/editor") ||
      path.startsWith("/profile");

    if (!token && isProtectedRoute) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // ✅ Role-based access
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (
      path.startsWith("/editor") &&
      token?.role !== "EDITOR" &&
      token?.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // ✅ Allow all requests; logic handled above
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
