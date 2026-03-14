import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

const authRoutes = ["/login", "/signup", "/reset-password"];
const protectedRoutes = [
  "/dashboard",
  "/products",
  "/receipts",
  "/deliveries",
  "/adjustments",
  "/transfers",
  "/move-history",
  "/warehouses",
  "/locations",
  "/profile",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE_NAME)?.value);

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!hasSession && isProtectedRoute) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/receipts/:path*",
    "/deliveries/:path*",
    "/adjustments/:path*",
    "/transfers/:path*",
    "/move-history/:path*",
    "/warehouses/:path*",
    "/locations/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
    "/reset-password",
  ],
};
