import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations";
import { validatePasswordResetToken } from "@/lib/tokens";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 },
      );
    }

    const { token, password } = validation.data;

    const result = await validatePasswordResetToken(token);
    if (!result) {
      return NextResponse.json(
        { error: "Reset link is invalid or has expired. Please request a new one." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: result.email },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.passwordResetToken
      .delete({ where: { token } })
      .catch(() => {});

    // Revoke all refresh tokens so existing sessions are invalidated
    const user = await prisma.user.findUnique({ where: { email: result.email } });
    if (user) {
      await prisma.refreshToken
        .updateMany({ where: { userId: user.id }, data: { revoked: true } })
        .catch(() => {});
    }

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
