import { NextResponse } from "next/server";

const protectedRoutes = ["private", "try"];
const authRoutes = ["/", "/daftar"];

export default async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const basePath = pathname.split("/")[1];
  const isProtectedRoute = protectedRoutes.includes(basePath);
  const isAuthRoute = authRoutes.includes(pathname);
  const token = request.cookies.get("token")?.value;

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/private", request.url));
  }

  return NextResponse.next();
}
