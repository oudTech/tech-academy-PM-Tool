import { type NextRequest, NextResponse } from "next/server";

// Route Handler — allowed to set/clear cookies unlike Server Components.
// Clears all Auth.js v5 session cookies then redirects to /login.
export async function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl, { status: 302 });

  const isProd = process.env.NODE_ENV === "production";
  const base = { maxAge: 0, path: "/", httpOnly: true, secure: isProd, sameSite: "lax" as const };

  // Auth.js v5 cookie names (http prefix in dev, __Secure- prefix in prod over HTTPS)
  response.cookies.set("authjs.session-token", "", base);
  response.cookies.set("__Secure-authjs.session-token", "", base);
  response.cookies.set("authjs.csrf-token", "", base);
  response.cookies.set("__Secure-authjs.csrf-token", "", base);
  // Legacy next-auth v4 names
  response.cookies.set("next-auth.session-token", "", base);
  response.cookies.set("__Secure-next-auth.session-token", "", base);

  return response;
}
