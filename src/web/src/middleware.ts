import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { pathname } = new URL(request.url);

  // If user is authenticated and tries to access home page, redirect to dashboard
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is unauthenticated and tries to access dashboard, redirect to home
  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  if (!session && isDashboard) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  // Apply middleware to home and dashboard routes
  matcher: ["/", "/dashboard", "/dashboard/:path*"],
};
