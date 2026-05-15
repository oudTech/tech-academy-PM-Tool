import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("ðŸŒ± Seeding database...");

  // Create labels
  await Promise.all([
    prisma.label.upsert({ where: { name: "frontend" }, update: {}, create: { name: "frontend", color: "#3b82f6" } }),
    prisma.label.upsert({ where: { name: "backend" }, update: {}, create: { name: "backend", color: "#10b981" } }),
    prisma.label.upsert({ where: { name: "api" }, update: {}, create: { name: "api", color: "#8b5cf6" } }),
    prisma.label.upsert({ where: { name: "database" }, update: {}, create: { name: "database", color: "#f59e0b" } }),
    prisma.label.upsert({ where: { name: "auth" }, update: {}, create: { name: "auth", color: "#ef4444" } }),
    prisma.label.upsert({ where: { name: "ui/ux" }, update: {}, create: { name: "ui/ux", color: "#ec4899" } }),
    prisma.label.upsert({ where: { name: "testing" }, update: {}, create: { name: "testing", color: "#14b8a6" } }),
    prisma.label.upsert({ where: { name: "devops" }, update: {}, create: { name: "devops", color: "#f97316" } }),
  ]);

  const hashedPassword = await bcrypt.hash("password123", 12);
  // Seeded users are pre-verified so they can log in without email confirmation
  const verifiedAt = new Date();

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: "admin@techacademy.dev" },
    update: { emailVerified: verifiedAt, status: "ACTIVE" },
    create: {
      email: "admin@techacademy.dev",
      name: "Alex Johnson",
      password: hashedPassword,
      role: "ADMIN",
      bio: "Platform architect & team lead",
      skills: ["Architecture", "DevOps", "TypeScript", "PostgreSQL"],
      avatar: null,
      image: null,
      isOnline: true,
      emailVerified: verifiedAt,
      status: "ACTIVE",
    },
  });

  const pm = await prisma.user.upsert({
    where: { email: "pm@techacademy.dev" },
    update: { emailVerified: verifiedAt, status: "ACTIVE" },
    create: {
      email: "pm@techacademy.dev",
      name: "Sarah Chen",
      password: hashedPassword,
      role: "PROJECT_MANAGER",
      bio: "Product strategy & sprint planning",
      skills: ["Agile", "Scrum", "Jira", "Product Management"],
      avatar: null,
      image: null,
      isOnline: true,
      emailVerified: verifiedAt,
      status: "ACTIVE",
    },
  });

  const dev1 = await prisma.user.upsert({
    where: { email: "dev1@techacademy.dev" },
    update: { emailVerified: verifiedAt, status: "ACTIVE" },
    create: {
      email: "dev1@techacademy.dev",
      name: "Marcus Williams",
      password: hashedPassword,
      role: "DEVELOPER",
      bio: "Full-stack developer, React & Node.js expert",
      skills: ["React", "Node.js", "TypeScript", "GraphQL"],
      avatar: null,
      image: null,
      isOnline: true,
      emailVerified: verifiedAt,
      status: "ACTIVE",
    },
  });

  const dev2 = await prisma.user.upsert({
    where: { email: "dev2@techacademy.dev" },
    update: { emailVerified: verifiedAt, status: "ACTIVE" },
    create: {
      email: "dev2@techacademy.dev",
      name: "Priya Patel",
      password: hashedPassword,
      role: "DEVELOPER",
      bio: "Backend specialist, API & microservices",
      skills: ["Python", "FastAPI", "PostgreSQL", "Redis"],
      avatar: null,
      image: null,
      isOnline: false,
      emailVerified: verifiedAt,
      status: "ACTIVE",
    },
  });

  const designer = await prisma.user.upsert({
    where: { email: "designer@techacademy.dev" },
    update: { emailVerified: verifiedAt, status: "ACTIVE" },
    create: {
      email: "designer@techacademy.dev",
      name: "Zoe Martinez",
      password: hashedPassword,
      role: "DESIGNER",
      bio: "UI/UX designer, design systems expert",
      skills: ["Figma", "Design Systems", "Tailwind CSS", "Framer"],
      avatar: null,
      image: null,
      isOnline: true,
      emailVerified: verifiedAt,
      status: "ACTIVE",
    },
  });

  const qa = await prisma.user.upsert({
    where: { email: "qa@techacademy.dev" },
    update: { emailVerified: verifiedAt, status: "ACTIVE" },
    create: {
      email: "qa@techacademy.dev",
      name: "James Kim",
      password: hashedPassword,
      role: "QA_TESTER",
      bio: "QA engineer, automation & testing",
      skills: ["Cypress", "Jest", "Playwright", "Testing Library"],
      avatar: null,
      image: null,
      isOnline: false,
      emailVerified: verifiedAt,
      status: "ACTIVE",
    },
  });

  console.log("âœ… Users created");

  // Create project
  const project = await prisma.project.upsert({
    where: { id: "clproject001" },
    update: {},
    create: {
      id: "clproject001",
      name: "Tech Academy & Solutions Hub",
      description: "A comprehensive multi-module platform combining online learning, internship management, professional marketplace, and client solutions hub.",
      color: "#6366f1",
    },
  });

  // Create platform modules
  const moduleData = [
    { id: "mod_academy", module: "ACADEMY", name: "Academy Module", color: "#3b82f6", description: "Courses, video lessons, quizzes, assignments, and learning paths" },
    { id: "mod_internship", module: "INTERNSHIP", name: "Internship System", color: "#10b981", description: "Internship applications, task assignments, mentor reviews, performance tracking" },
    { id: "mod_marketplace", module: "MARKETPLACE", name: "Professional Marketplace", color: "#8b5cf6", description: "Professional profiles, portfolio, skill verification, gig marketplace" },
    { id: "mod_client_portal", module: "CLIENT_PORTAL", name: "Client Solutions Hub", color: "#f59e0b", description: "Client project requests, developer assignments, progress tracking" },
    { id: "mod_authentication", module: "AUTHENTICATION", name: "Authentication", color: "#ef4444", description: "Login, registration, OAuth, JWT, role-based access control" },
    { id: "mod_admin_dashboard", module: "ADMIN_DASHBOARD", name: "Admin Dashboard", color: "#ec4899", description: "User management, analytics, platform moderation, content management" },
    { id: "mod_api_infrastructure", module: "API_INFRASTRUCTURE", name: "API Infrastructure", color: "#14b8a6", description: "REST API, microservices, API gateway, documentation" },
    { id: "mod_devops", module: "DEVOPS", name: "DevOps", color: "#f97316", description: "CI/CD, Docker, Kubernetes, monitoring, deployment pipelines" },
    { id: "mod_mobile_app", module: "MOBILE_APP", name: "Mobile App", color: "#06b6d4", description: "React Native mobile application for iOS and Android" },
  ] as const;

  for (const mod of moduleData) {
    await prisma.projectModule.upsert({
      where: { id: mod.id },
      update: {},
      create: { ...mod, projectId: project.id },
    });
  }

  console.log("âœ… Project modules created");

  // Create teams
  await Promise.all([
    prisma.team.upsert({
      where: { id: "team_frontend" },
      update: {},
      create: { id: "team_frontend", name: "Frontend Team", description: "React, UI/UX, and design system", color: "#3b82f6", projectId: project.id },
    }),
    prisma.team.upsert({
      where: { id: "team_backend" },
      update: {},
      create: { id: "team_backend", name: "Backend Team", description: "API, database, and microservices", color: "#10b981", projectId: project.id },
    }),
    prisma.team.upsert({
      where: { id: "team_devops" },
      update: {},
      create: { id: "team_devops", name: "DevOps Team", description: "Infrastructure, CI/CD, and deployments", color: "#f59e0b", projectId: project.id },
    }),
  ]);

  const teamMemberships = [
    { teamId: "team_frontend", userId: dev1.id, role: "LEAD" },
    { teamId: "team_frontend", userId: designer.id, role: "MEMBER" },
    { teamId: "team_frontend", userId: qa.id, role: "MEMBER" },
    { teamId: "team_backend", userId: dev2.id, role: "LEAD" },
    { teamId: "team_backend", userId: dev1.id, role: "MEMBER" },
    { teamId: "team_devops", userId: admin.id, role: "LEAD" },
  ];

  for (const m of teamMemberships) {
    await prisma.teamMember.upsert({
      where: { teamId_userId: { teamId: m.teamId, userId: m.userId } },
      update: {},
      create: m,
    });
  }

  console.log("âœ… Teams created");

  // Create sprints
  const now = new Date();
  const sprint1Start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sprint1End = new Date(now.getFullYear(), now.getMonth() - 1, 14);
  const sprint2Start = new Date(now.getFullYear(), now.getMonth(), 1);
  const sprint2End = new Date(now.getFullYear(), now.getMonth(), 14);
  const sprint3Start = new Date(now.getFullYear(), now.getMonth(), 15);
  const sprint3End = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const sprint1 = await prisma.sprint.upsert({
    where: { id: "sprint_001" },
    update: {},
    create: {
      id: "sprint_001",
      name: "Sprint 1 - Foundation",
      goal: "Set up project foundation, authentication system, and database architecture",
      startDate: sprint1Start,
      endDate: sprint1End,
      status: "COMPLETED",
      velocity: 42,
      capacity: 40,
      projectId: project.id,
      createdById: admin.id,
    },
  });

  const sprint2 = await prisma.sprint.upsert({
    where: { id: "sprint_002" },
    update: {},
    create: {
      id: "sprint_002",
      name: "Sprint 2 - Core Features",
      goal: "Build Academy module, user dashboards, and internship application flow",
      startDate: sprint2Start,
      endDate: sprint2End,
      status: "ACTIVE",
      velocity: 0,
      capacity: 50,
      projectId: project.id,
      createdById: pm.id,
    },
  });

  const sprint3 = await prisma.sprint.upsert({
    where: { id: "sprint_003" },
    update: {},
    create: {
      id: "sprint_003",
      name: "Sprint 3 - Marketplace",
      goal: "Implement professional marketplace, client portal, and payment integration",
      startDate: sprint3Start,
      endDate: sprint3End,
      status: "PLANNING",
      velocity: 0,
      capacity: 55,
      projectId: project.id,
      createdById: pm.id,
    },
  });

  console.log("âœ… Sprints created");

  // Create tasks (using string literals for all enum values)
  const tasksData = [
    {
      id: "task_001",
      title: "Set up Next.js project with TypeScript",
      description: "Initialize the project with Next.js 14, TypeScript, Tailwind CSS, and configure the folder structure",
      type: "TASK",
      status: "DONE",
      priority: "HIGH",
      storyPoints: 3,
      estimatedHours: 4,
      actualHours: 3.5,
      moduleId: "mod_api_infrastructure",
      sprintId: sprint1.id,
      creatorId: admin.id,
      assigneeId: dev1.id,
      order: 0,
    },
    {
      id: "task_002",
      title: "Design and implement PostgreSQL database schema",
      description: "Create comprehensive Prisma schema with all entities, relationships, and migrations",
      type: "TASK",
      status: "DONE",
      priority: "CRITICAL",
      storyPoints: 8,
      estimatedHours: 12,
      actualHours: 14,
      moduleId: "mod_api_infrastructure",
      sprintId: sprint1.id,
      creatorId: admin.id,
      assigneeId: dev2.id,
      order: 1,
    },
    {
      id: "task_003",
      title: "Implement JWT authentication system",
      description: "Build secure JWT-based auth with refresh tokens, role-based access control, and session management",
      type: "FEATURE",
      status: "DONE",
      priority: "CRITICAL",
      storyPoints: 13,
      estimatedHours: 20,
      actualHours: 22,
      moduleId: "mod_authentication",
      sprintId: sprint1.id,
      creatorId: pm.id,
      assigneeId: dev2.id,
      order: 2,
    },
    {
      id: "task_004",
      title: "Create design system and component library",
      description: "Establish Tailwind-based design tokens, reusable components, and Figma design system",
      type: "TASK",
      status: "DONE",
      priority: "HIGH",
      storyPoints: 8,
      estimatedHours: 16,
      actualHours: 18,
      moduleId: "mod_admin_dashboard",
      sprintId: sprint1.id,
      creatorId: pm.id,
      assigneeId: designer.id,
      order: 3,
    },
    {
      id: "task_005",
      title: "Build Academy course listing page",
      description: "Create the main academy landing page with course cards, categories, search, and filtering",
      acceptanceCriteria: "- Courses displayed in grid/list view\n- Filter by category, difficulty, duration\n- Search functionality\n- Responsive design",
      type: "FEATURE",
      status: "IN_PROGRESS",
      priority: "HIGH",
      storyPoints: 8,
      estimatedHours: 12,
      actualHours: 6,
      moduleId: "mod_academy",
      sprintId: sprint2.id,
      creatorId: pm.id,
      assigneeId: dev1.id,
      order: 0,
      dueDate: new Date(sprint2End.getTime() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "task_006",
      title: "Implement video lesson player",
      description: "Custom video player with progress tracking, bookmarks, subtitles, and playback speed control",
      type: "FEATURE",
      status: "IN_PROGRESS",
      priority: "HIGH",
      storyPoints: 13,
      estimatedHours: 20,
      actualHours: 8,
      moduleId: "mod_academy",
      sprintId: sprint2.id,
      creatorId: admin.id,
      assigneeId: dev1.id,
      order: 1,
    },
    {
      id: "task_007",
      title: "Design internship application form",
      description: "Multi-step application form with file uploads, skills assessment, and portfolio submission",
      type: "FEATURE",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      storyPoints: 5,
      estimatedHours: 8,
      actualHours: 4,
      moduleId: "mod_internship",
      sprintId: sprint2.id,
      creatorId: pm.id,
      assigneeId: designer.id,
      order: 2,
    },
    {
      id: "task_008",
      title: "User registration and onboarding flow",
      description: "Complete registration flow with email verification, role selection, profile setup, and welcome email",
      type: "FEATURE",
      status: "REVIEW",
      priority: "HIGH",
      storyPoints: 8,
      estimatedHours: 14,
      actualHours: 13,
      moduleId: "mod_authentication",
      sprintId: sprint2.id,
      creatorId: pm.id,
      assigneeId: dev2.id,
      order: 0,
      linkedPRs: ["https://github.com/techacademy/platform/pull/42"],
    },
    {
      id: "task_009",
      title: "Admin user management dashboard",
      description: "CRUD operations for users, role assignments, bulk actions, and audit logs",
      type: "FEATURE",
      status: "REVIEW",
      priority: "MEDIUM",
      storyPoints: 8,
      estimatedHours: 16,
      actualHours: 14,
      moduleId: "mod_admin_dashboard",
      sprintId: sprint2.id,
      creatorId: admin.id,
      assigneeId: dev2.id,
      order: 1,
      linkedPRs: ["https://github.com/techacademy/platform/pull/38"],
    },
    {
      id: "task_010",
      title: "Write E2E tests for authentication flow",
      description: "Playwright tests covering login, registration, password reset, and session management",
      type: "TASK",
      status: "TESTING",
      priority: "MEDIUM",
      storyPoints: 5,
      estimatedHours: 8,
      actualHours: 9,
      moduleId: "mod_authentication",
      sprintId: sprint2.id,
      creatorId: admin.id,
      assigneeId: qa.id,
      order: 0,
    },
    {
      id: "task_011",
      title: "Implement mentor assignment system",
      description: "Algorithm for matching interns with mentors based on skills, availability, and project needs",
      type: "FEATURE",
      status: "TODO",
      priority: "HIGH",
      storyPoints: 8,
      estimatedHours: 16,
      moduleId: "mod_internship",
      sprintId: sprint2.id,
      creatorId: pm.id,
      assigneeId: dev2.id,
      order: 0,
      dueDate: sprint2End,
    },
    {
      id: "task_012",
      title: "Build progress tracking dashboard for interns",
      description: "Real-time progress visualization with milestones, task completion, skill assessment scores",
      type: "FEATURE",
      status: "TODO",
      priority: "MEDIUM",
      storyPoints: 5,
      estimatedHours: 10,
      moduleId: "mod_internship",
      sprintId: sprint2.id,
      creatorId: pm.id,
      assigneeId: dev1.id,
      order: 1,
    },
    {
      id: "task_013",
      title: "Professional profile creation system",
      description: "Rich profile builder with portfolio sections, skill endorsements, experience timeline, and public URL",
      type: "FEATURE",
      status: "BACKLOG",
      priority: "HIGH",
      storyPoints: 13,
      estimatedHours: 24,
      moduleId: "mod_marketplace",
      sprintId: sprint3.id,
      creatorId: admin.id,
      assigneeId: dev1.id,
      order: 0,
    },
    {
      id: "task_014",
      title: "Implement gig marketplace search and matching",
      description: "AI-powered matching algorithm for connecting clients with professionals based on skills and requirements",
      type: "FEATURE",
      status: "BACKLOG",
      priority: "HIGH",
      storyPoints: 21,
      estimatedHours: 40,
      moduleId: "mod_marketplace",
      sprintId: sprint3.id,
      creatorId: pm.id,
      order: 1,
    },
    {
      id: "task_015",
      title: "Client project request portal",
      description: "Form wizard for clients to submit project requirements, budget, timeline, and technical specifications",
      type: "FEATURE",
      status: "BACKLOG",
      priority: "HIGH",
      storyPoints: 13,
      estimatedHours: 20,
      moduleId: "mod_client_portal",
      sprintId: sprint3.id,
      creatorId: pm.id,
      assigneeId: dev2.id,
      order: 2,
    },
    {
      id: "task_016",
      title: "Fix: Login page crashes on mobile Safari",
      description: "Authentication form fails to submit on iOS Safari due to cookie SameSite policy",
      type: "BUG",
      status: "TODO",
      priority: "CRITICAL",
      storyPoints: 2,
      estimatedHours: 3,
      bugSeverity: "CRITICAL",
      moduleId: "mod_authentication",
      sprintId: sprint2.id,
      creatorId: qa.id,
      assigneeId: dev1.id,
      order: 3,
    },
    {
      id: "task_017",
      title: "Implement real-time notifications with WebSockets",
      description: "Socket.io integration for real-time notifications, online presence, and live updates",
      type: "FEATURE",
      status: "BACKLOG",
      priority: "MEDIUM",
      storyPoints: 8,
      estimatedHours: 16,
      moduleId: "mod_api_infrastructure",
      creatorId: admin.id,
      order: 0,
    },
    {
      id: "task_018",
      title: "Set up CI/CD pipeline with GitHub Actions",
      description: "Automated testing, building, and deployment pipeline for staging and production environments",
      type: "TASK",
      status: "IN_PROGRESS",
      priority: "HIGH",
      storyPoints: 8,
      estimatedHours: 12,
      actualHours: 5,
      moduleId: "mod_devops",
      sprintId: sprint2.id,
      creatorId: admin.id,
      assigneeId: admin.id,
      order: 3,
    },
    {
      id: "task_019",
      title: "Mobile app React Native setup",
      description: "Initialize React Native project with Expo, set up navigation, theming, and shared component library",
      type: "TASK",
      status: "BACKLOG",
      priority: "LOW",
      storyPoints: 5,
      estimatedHours: 8,
      moduleId: "mod_mobile_app",
      creatorId: admin.id,
      order: 0,
    },
    {
      id: "task_020",
      title: "Performance optimization - API response caching",
      description: "Implement Redis caching layer for frequently accessed API endpoints to improve response times",
      type: "IMPROVEMENT",
      status: "BACKLOG",
      priority: "MEDIUM",
      storyPoints: 5,
      estimatedHours: 8,
      moduleId: "mod_api_infrastructure",
      creatorId: admin.id,
      order: 1,
    },
  ];

  for (const task of tasksData) {
    const { dueDate, ...rest } = task as typeof task & { dueDate?: Date };
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: {
        ...rest,
        projectId: project.id,
        linkedPRs: (task as { linkedPRs?: string[] }).linkedPRs || [],
        ...(dueDate ? { dueDate } : {}),
      } as any,
    });
  }

  console.log("âœ… Tasks created");

  // Create comments
  await prisma.comment.upsert({
    where: { id: "comment_001" },
    update: {},
    create: {
      id: "comment_001",
      content: "I've started working on the course card components. The grid layout is looking great! Should I use CSS Grid or Flexbox for the responsive behavior?",
      taskId: "task_005",
      authorId: dev1.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: "comment_002" },
    update: {},
    create: {
      id: "comment_002",
      content: "@Marcus Let's go with CSS Grid for the main layout and Flexbox for the card internals. Check the Figma designs I uploaded.",
      taskId: "task_005",
      authorId: designer.id,
    },
  });

  await prisma.comment.upsert({
    where: { id: "comment_003" },
    update: {},
    create: {
      id: "comment_003",
      content: "PR is ready for review. I've added comprehensive tests and the authentication flow is working end-to-end including refresh token rotation.",
      taskId: "task_008",
      authorId: dev2.id,
    },
  });

  // Create activity logs
  const activities = [
    { action: "task_created", details: "Created task: Build Academy course listing page", userId: pm.id, taskId: "task_005" },
    { action: "task_updated", details: "Status changed from TODO to IN_PROGRESS", userId: dev1.id, taskId: "task_005" },
    { action: "task_updated", details: "Status changed from IN_PROGRESS to REVIEW", userId: dev2.id, taskId: "task_008" },
    { action: "pr_linked", details: "Linked PR #42: feat/user-registration-flow", userId: dev2.id, taskId: "task_008" },
    { action: "sprint_started", details: "Sprint 2 - Core Features started", userId: pm.id },
    { action: "comment_added", details: "New comment on: Build Academy course listing page", userId: dev1.id, taskId: "task_005" },
    { action: "task_created", details: "Bug reported: Login page crashes on mobile Safari", userId: qa.id, taskId: "task_016" },
    { action: "task_assigned", details: "Task assigned to Marcus Williams", userId: pm.id, taskId: "task_016" },
  ];

  for (let i = 0; i < activities.length; i++) {
    const hoursAgo = (activities.length - i) * 3;
    await prisma.activityLog.create({
      data: {
        ...activities[i],
        createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      },
    });
  }

  // Create notifications
  await prisma.notification.createMany({
    data: [
      {
        type: "TASK_ASSIGNED",
        message: "You were assigned to: Fix: Login page crashes on mobile Safari",
        recipientId: dev1.id,
        senderId: pm.id,
        taskId: "task_016",
        read: false,
      },
      {
        type: "COMMENT_ADDED",
        message: "@Marcus Left a comment on: Build Academy course listing page",
        recipientId: dev1.id,
        senderId: designer.id,
        taskId: "task_005",
        read: false,
      },
      {
        type: "PR_REVIEW",
        message: "PR #42 is ready for your review",
        recipientId: pm.id,
        senderId: dev2.id,
        taskId: "task_008",
        read: false,
      },
      {
        type: "SPRINT_UPDATE",
        message: "Sprint 2 is 60% complete - 3 days remaining",
        recipientId: dev1.id,
        senderId: pm.id,
        read: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("âœ… Activity logs and notifications created");
  console.log("\nðŸŽ‰ Database seeded successfully!");
  console.log("\nðŸ“§ Test accounts:");
  console.log("   Admin:      admin@techacademy.dev / password123");
  console.log("   PM:         pm@techacademy.dev / password123");
  console.log("   Developer:  dev1@techacademy.dev / password123");
  console.log("   Developer:  dev2@techacademy.dev / password123");
  console.log("   Designer:   designer@techacademy.dev / password123");
  console.log("   QA Tester:  qa@techacademy.dev / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

