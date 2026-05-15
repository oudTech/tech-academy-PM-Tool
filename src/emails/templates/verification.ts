import { emailBase } from "./base";

interface VerificationEmailProps {
  url: string;
  name?: string;
}

export function verificationEmail({ url, name }: VerificationEmailProps): string {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi there,";

  return emailBase({
    previewText: "Verify your TechAcademy PM email address to get started.",
    body: `
      <!-- Heading -->
      <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
        Verify your email
      </h1>
      <p style="margin:0 0 32px;color:#94a3b8;font-size:15px;line-height:1.6;">
        ${greeting} Welcome to TechAcademy PM. Confirm your email address to activate your account and start collaborating with your team.
      </p>

      <!-- Divider -->
      <div style="height:1px;background:linear-gradient(to right,transparent,#334155,transparent);margin-bottom:32px;"></div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${url}"
           style="display:inline-block;background-color:#6366f1;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:-0.1px;">
          Verify email address
        </a>
      </div>

      <!-- Expiry notice -->
      <div style="background-color:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px 20px;margin-bottom:32px;">
        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">
          <strong style="color:#94a3b8;">⏱ Link expires in 24 hours.</strong><br/>
          If it expires, you can request a new one from the sign-in page.
        </p>
      </div>

      <!-- Divider -->
      <div style="height:1px;background:#1e293b;border-top:1px solid #334155;margin-bottom:24px;"></div>

      <!-- Fallback link -->
      <p style="margin:0;color:#475569;font-size:12px;line-height:1.6;">
        Button not working? Copy and paste this link into your browser:<br/>
        <a href="${url}" style="color:#6366f1;text-decoration:none;word-break:break-all;">${url}</a>
      </p>
    `,
  });
}
