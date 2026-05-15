import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createEmailVerificationToken(email: string): Promise<string> {
  const token = generateSecureToken();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h

  // Delete any existing token for this email before creating a new one
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });

  return token;
}

export async function validateEmailVerificationToken(
  token: string,
): Promise<{ email: string } | null> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return null;
  }
  return { email: record.identifier };
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const token = generateSecureToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 h

  await prisma.passwordResetToken.deleteMany({ where: { email } });
  await prisma.passwordResetToken.create({ data: { email, token, expires } });

  return token;
}

export async function validatePasswordResetToken(
  token: string,
): Promise<{ email: string } | null> {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.expires < new Date()) {
    await prisma.passwordResetToken.delete({ where: { token } });
    return null;
  }
  return { email: record.email };
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = generateSecureToken();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Revoke all previous refresh tokens for this user
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });

  await prisma.refreshToken.create({ data: { token, userId, expires } });
  return token;
}

export async function createInviteToken(userId: string): Promise<string> {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Revoke any existing invite tokens for this user
  await prisma.inviteToken.deleteMany({ where: { userId } });
  await prisma.inviteToken.create({ data: { token, userId, expiresAt } });

  return token;
}

export async function validateInviteToken(
  token: string,
): Promise<{ userId: string } | null> {
  const record = await prisma.inviteToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.expiresAt < new Date()) {
    await prisma.inviteToken.delete({ where: { token } });
    return null;
  }
  return { userId: record.userId };
}

export async function consumeInviteToken(token: string): Promise<void> {
  await prisma.inviteToken.deleteMany({ where: { token } });
}

export async function validateAndRotateRefreshToken(
  token: string,
): Promise<{ userId: string; newToken: string } | null> {
  const record = await prisma.refreshToken.findUnique({ where: { token } });
  if (!record || record.revoked || record.expires < new Date()) return null;

  // Revoke the old token and issue a new one (rotation)
  await prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } });
  const newToken = await createRefreshToken(record.userId);

  return { userId: record.userId, newToken };
}
