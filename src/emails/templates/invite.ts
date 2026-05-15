import { emailBase } from "./base";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Developer",
  DESIGNER: "Designer",
  QA_TESTER: "QA Tester",
};

export function inviteEmail({
  url,
  name,
  invitedBy,
  role,
}: {
  url: string;
  name: string;
  invitedBy: string;
  role: string;
}): string {
  const roleLabel = ROLE_LABELS[role] ?? role;

  return emailBase({
    previewText: `${invitedBy} invited you to join TechAcademy PM as ${roleLabel}`,
    body: `
      <h1 style="margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">You're invited!</h1>
      <p style="margin:0 0 28px;color:#94a3b8;font-size:15px;line-height:1.6;">
        <strong style="color:#e2e8f0;">${invitedBy}</strong> has invited you to join
        <strong style="color:#e2e8f0;">TechAcademy PM</strong> as
        <strong style="color:#6366f1;">${roleLabel}</strong>.
      </p>

      <!-- Role badge -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
        <tr>
          <td style="background-color:#312e81;border:1px solid #4338ca;border-radius:8px;padding:12px 20px;">
            <span style="color:#a5b4fc;font-size:12px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;">Your role</span>
            <br/>
            <span style="color:#ffffff;font-size:16px;font-weight:700;">${roleLabel}</span>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 8px;color:#94a3b8;font-size:14px;">Hi <strong style="color:#e2e8f0;">${name}</strong>,</p>
      <p style="margin:0 0 28px;color:#94a3b8;font-size:14px;line-height:1.6;">
        Click the button below to set your password and activate your account.
        This invitation expires in <strong style="color:#e2e8f0;">7 days</strong>.
      </p>

      <!-- CTA button -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
        <tr>
          <td style="background-color:#6366f1;border-radius:10px;">
            <a href="${url}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;letter-spacing:-0.2px;">
              Accept Invitation &rarr;
            </a>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 4px;color:#64748b;font-size:12px;">Or copy this link into your browser:</p>
      <p style="margin:0 0 28px;word-break:break-all;">
        <a href="${url}" style="color:#6366f1;font-size:12px;">${url}</a>
      </p>

      <hr style="border:none;border-top:1px solid #334155;margin:0 0 24px;" />

      <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
        If you weren&apos;t expecting this invitation, you can ignore this email safely — your account will not be created unless you click the link above.
      </p>
    `,
  });
}
