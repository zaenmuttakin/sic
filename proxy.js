import { NextResponse } from "next/server";

const protectedRoutes = ["private", "try"];
const authRoutes = ["/", "/daftar"];

export async function proxy(request) {
  const pathname = request.nextUrl.pathname;
  const basePath = pathname.split("/")[1];
  const isProtectedRoute = protectedRoutes.includes(basePath);
  const isAuthRoute = authRoutes.includes(pathname);
  const token = request.cookies.get("token");

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/private", request.url));
  }

  return NextResponse.next();
}
