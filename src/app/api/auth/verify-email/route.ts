import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEmailVerificationToken } from "@/lib/tokens";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const result = await validateEmailVerificationToken(token);
    if (!result) {
      return NextResponse.json(
        { error: "Token is invalid or has expired" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email: result.email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    await prisma.user.update({
      where: { email: result.email },
      data: { emailVerified: new Date() },
    });

    // Clean up the used token
    await prisma.verificationToken
      .delete({ where: { token } })
      .catch(() => {});

    return NextResponse.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: resend verification email
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Return 200 to avoid email enumeration
      return NextResponse.json({ message: "If your email exists, a verification link has been sent." });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    const { createEmailVerificationToken } = await import("@/lib/tokens");
    const { sendVerificationEmail } = await import("@/lib/email");
    const token = await createEmailVerificationToken(email);
    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Verification email sent" });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
