import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "esdfp-super-secret-jwt-key-change-in-production-2026"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("esdfp_session")?.value;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/accountant") ||
    pathname.startsWith("/user") ||
    pathname.startsWith("/profile");

  let session: { userId: number; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload as { userId: number; role: string };
    } catch {
      session = null;
    }
  }

  // Redirect logged-in users away from /login & /register to their home dashboard
  if (isAuthPage && session) {
    const role = (session.role || "").toLowerCase();
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    if (role === "accountant") return NextResponse.redirect(new URL("/accountant/dashboard", request.url));
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  // Enforce authentication on protected routes
  if (isProtectedPath && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based restrictions
  if (session && isProtectedPath) {
    const role = (session.role || "").toLowerCase();

    // Admin routes
    if (pathname.startsWith("/admin") && role !== "admin") {
      if (role === "accountant") return NextResponse.redirect(new URL("/accountant/dashboard", request.url));
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }

    // Accountant routes
    if (pathname.startsWith("/accountant") && role !== "accountant" && role !== "admin") {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/accountant/:path*",
    "/user/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
