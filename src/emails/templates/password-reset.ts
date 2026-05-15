import { emailBase } from "./base";

interface PasswordResetEmailProps {
  url: string;
  name?: string;
}

export function passwordResetEmail({ url, name }: PasswordResetEmailProps): string {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi there,";

  return emailBase({
    previewText: "Reset your TechAcademy PM password. Link expires in 1 hour.",
    body: `
      <!-- Lock icon -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;background-color:#1e3a5f;border:1px solid #2563eb40;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:26px;">
          🔑
        </div>
      </div>

      <!-- Heading -->
      <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:24px;font-weight:700;letter-spacing:-0.5px;text-align:center;">
        Reset your password
      </h1>
      <p style="margin:0 0 32px;color:#94a3b8;font-size:15px;line-height:1.6;text-align:center;">
        ${greeting} We received a request to reset your password. Click the button below to choose a new one.
      </p>

      <!-- Divider -->
      <div style="height:1px;background:linear-gradient(to right,transparent,#334155,transparent);margin-bottom:32px;"></div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${url}"
           style="display:inline-block;background-color:#6366f1;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:-0.1px;">
          Reset password
        </a>
      </div>

      <!-- Warning notice -->
      <div style="background-color:#1a0f0f;border:1px solid #7f1d1d50;border-radius:10px;padding:16px 20px;margin-bottom:32px;">
        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">
          <strong style="color:#fca5a5;">⚠️ Didn&apos;t request this?</strong><br/>
          Ignore this email &mdash; your password won&apos;t change. If you&apos;re concerned about your account security, contact your admin.
        </p>
      </div>

      <!-- Expiry notice -->
      <div style="background-color:#0f172a;border:1px solid #334155;border-radius:10px;padding:16px 20px;margin-bottom:32px;">
        <p style="margin:0;color:#64748b;font-size:13px;line-height:1.5;">
          <strong style="color:#94a3b8;">⏱ Link expires in 1 hour.</strong><br/>
          After that, you&apos;ll need to request a new reset link.
        </p>
      </div>

      <!-- Divider -->
      <div style="height:1px;border-top:1px solid #334155;margin-bottom:24px;"></div>

      <!-- Fallback link -->
      <p style="margin:0;color:#475569;font-size:12px;line-height:1.6;">
        Button not working? Copy and paste this link into your browser:<br/>
        <a href="${url}" style="color:#6366f1;text-decoration:none;word-break:break-all;">${url}</a>
      </p>
    `,
  });
}
