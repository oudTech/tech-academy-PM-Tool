import { emailBase } from "./base";

interface WelcomeEmailProps {
  name: string;
  role: string;
  loginUrl: string;
}

const roleDescriptions: Record<string, string> = {
  ADMIN: "full platform access including user management, sprint control, and analytics.",
  PROJECT_MANAGER: "sprint planning, task creation, team management, and project analytics.",
  DEVELOPER: "task management, Kanban board, sprint participation, and PR tracking.",
  DESIGNER: "task management, design sprint participation, and asset collaboration.",
  QA_TESTER: "test case management, bug reporting, sprint testing, and quality reviews.",
};

export function welcomeEmail({ name, role, loginUrl }: WelcomeEmailProps): string {
  const firstName = name.split(" ")[0];
  const roleDesc = roleDescriptions[role] ?? "access to the TechAcademy PM platform.";
  const roleLabel = role.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  return emailBase({
    previewText: `Welcome to TechAcademy PM, ${firstName}! Your account is ready.`,
    body: `
      <!-- Heading -->
      <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
        Welcome aboard, ${firstName}! 👋
      </h1>
      <p style="margin:0 0 32px;color:#94a3b8;font-size:15px;line-height:1.6;">
        Your TechAcademy PM account is ready. You&apos;ve joined the team as a <strong style="color:#a5b4fc;">${roleLabel}</strong>, giving you ${roleDesc}
      </p>

      <!-- Divider -->
      <div style="height:1px;background:linear-gradient(to right,transparent,#334155,transparent);margin-bottom:32px;"></div>

      <!-- Feature list -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:32px;">
        ${[
          ["📋", "Kanban Board", "Drag & drop tasks across sprint columns"],
          ["🔥", "Sprint Planning", "Plan, start, and complete sprints with burndown charts"],
          ["📊", "Analytics", "Real-time velocity, module progress, and team stats"],
          ["🔔", "Notifications", "Stay updated on assignments, comments, and PRs"],
        ]
          .map(
            ([icon, title, desc]) => `
        <tr>
          <td style="padding:10px 0;vertical-align:top;width:36px;">
            <div style="background-color:#312e81;border-radius:8px;width:32px;height:32px;text-align:center;line-height:32px;font-size:16px;">${icon}</div>
          </td>
          <td style="padding:10px 0 10px 12px;vertical-align:top;">
            <strong style="color:#e2e8f0;font-size:14px;">${title}</strong><br/>
            <span style="color:#64748b;font-size:13px;">${desc}</span>
          </td>
        </tr>`,
          )
          .join("")}
      </table>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${loginUrl}"
           style="display:inline-block;background-color:#6366f1;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:10px;">
          Go to your workspace
        </a>
      </div>

      <!-- Divider -->
      <div style="height:1px;border-top:1px solid #334155;margin-bottom:24px;"></div>

      <p style="margin:0;color:#475569;font-size:12px;line-height:1.6;">
        Questions? Reach out to your team admin or project manager.
      </p>
    `,
  });
}
