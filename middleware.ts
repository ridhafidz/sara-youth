import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Route yang hanya bisa diakses kalau BELUM login
const AUTH_ROUTES = ["/login", "/register"];

// Route yang hanya bisa diakses kalau SUDAH login
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/impact-assessment",
  "/impact-insights",
  "/sdgs-programs",
  "/sdgs-reports",
  "/settings",
  "/seed",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek keberadaan auth cookie yang kita set saat login
  const authToken = request.cookies.get("sara_auth_token")?.value;
  const isAuthenticated = !!authToken;

  // ── Root "/" → redirect ke login atau dashboard ────────────────────────────
  if (pathname === "/") {
    const destination = isAuthenticated ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // ── User sudah login → tidak boleh akses /login atau /register ─────────────
  if (isAuthenticated && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── User belum login → tidak boleh akses route protected ──────────────────
  if (
    !isAuthenticated &&
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    const loginUrl = new URL("/login", request.url);
    // Simpan halaman tujuan agar bisa redirect balik setelah login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Jalankan middleware di semua route kecuali static files & Next internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
