import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Try to extract the 'token' from the user's browser cookies.
  const token = request.cookies.get("token")?.value;

  // If there is NO token, redirect the user back to the login page.
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If there is a token, allow the user to proceed.
  return NextResponse.next();
}

// This config tells Next.js which routes to protect.
export const config = {
  matcher: [
    "/dashboard/:path*", // Dashboard and all of its sub-pages.
    "/projects/:path*", // Projects and all of its sub-pages.
  ],
};
