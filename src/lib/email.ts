import { Resend } from "resend";
import { verificationEmail, passwordResetEmail, welcomeEmail, inviteEmail } from "@/emails";

// ── Resend client ─────────────────────────────────────────────────────────────

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM =
  process.env.EMAIL_FROM || '"TechAcademy PM" <noreply@techacademy.dev>';

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// ── Retry helper ──────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 800,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (attempts <= 1) throw err;
    await new Promise((r) => setTimeout(r, delayMs));
    return withRetry(fn, attempts - 1, delayMs * 2);
  }
}

// ── Core send ─────────────────────────────────────────────────────────────────

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  /** Used only in the dev console fallback to surface clickable links */
  previewUrl?: string;
}

async function send({ to, subject, html, previewUrl }: SendOptions): Promise<void> {
  if (!resend) {
    // Dev fallback — no API key configured
    console.log(
      [
        "",
        "📧  [EMAIL — set RESEND_API_KEY to send real emails]",
        `  To:      ${to}`,
        `  Subject: ${subject}`,
        previewUrl ? `  Link:    ${previewUrl}` : "",
        "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    return;
  }

  const { error } = await withRetry(() =>
    resend!.emails.send({ from: FROM, to, subject, html }),
  );

  if (error) {
    // Resend returns structured errors — surface them clearly
    console.error(`[email] Failed to send "${subject}" to ${to}:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string,
): Promise<void> {
  const url = `${APP_URL}/verify-email?token=${token}`;
  await send({
    to: email,
    subject: "Verify your TechAcademy PM account",
    html: verificationEmail({ url, name }),
    previewUrl: url,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  name?: string,
): Promise<void> {
  const url = `${APP_URL}/reset-password?token=${token}`;
  await send({
    to: email,
    subject: "Reset your TechAcademy PM password",
    html: passwordResetEmail({ url, name }),
    previewUrl: url,
  });
}

export async function sendInviteEmail(
  email: string,
  token: string,
  name: string,
  invitedBy: string,
  role: string,
): Promise<void> {
  const url = `${APP_URL}/set-password?token=${token}`;
  await send({
    to: email,
    subject: `You're invited to TechAcademy PM`,
    html: inviteEmail({ url, name, invitedBy, role }),
    previewUrl: url,
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: string,
): Promise<void> {
  const loginUrl = `${APP_URL}/login`;
  await send({
    to: email,
    subject: `Welcome to TechAcademy PM, ${name.split(" ")[0]}!`,
    html: welcomeEmail({ name, role, loginUrl }),
    previewUrl: loginUrl,
  });
}
