import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public lightweight endpoint — returns verification status for a given email.
// Used by the login page to surface "please verify your email" before
// attempting signIn, which would otherwise give a generic "CredentialsSignin" error.
// Returns the same response shape whether the user exists or not to
// avoid leaking email enumeration in error messages — caller decides UX.
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email || typeof email !== "string") {
    return NextResponse.json({ verified: true }); // Neutral — let signIn decide
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { emailVerified: true, password: true, status: true },
    });

    // If no user, or OAuth-only user (no password), let signIn handle it
    if (!user || !user.password) {
      return NextResponse.json({ verified: true, status: "ACTIVE" });
    }

    return NextResponse.json({
      verified: !!user.emailVerified,
      status: user.status,
    });
  } catch {
    return NextResponse.json({ verified: true, status: "ACTIVE" }); // Fail open
  }
}
