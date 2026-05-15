# Tech Academy PM Tool

A Jira/Linear-style project management platform built specifically for the **Tech Academy & Solutions Hub** development team.

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Auth**: JWT (jose) + HTTP-only cookies
- **State**: Zustand
- **DnD**: @dnd-kit (Kanban drag-and-drop)
- **Charts**: Recharts
- **UI**: Custom shadcn/ui components + Radix UI

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/tech_academy_pm"
JWT_SECRET="your-minimum-32-character-secret-key-here"
```

### 3. Database setup

```bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Test Accounts

All accounts use password: `password123`

| Role | Email |
|------|-------|
| Admin | admin@techacademy.dev |
| Project Manager | pm@techacademy.dev |
| Developer | dev1@techacademy.dev |
| Developer | dev2@techacademy.dev |
| Designer | designer@techacademy.dev |
| QA Tester | qa@techacademy.dev |

## Features

### ✅ Authentication
- JWT-based auth with HTTP-only cookies
- Role-based access control (Admin, PM, Developer, Designer, QA)
- Protected routes via Next.js middleware

### ✅ Dashboard
- Live stats: total/completed/in-progress/pending tasks
- Active sprint progress with time tracking
- Task distribution pie chart
- Velocity chart by sprint
- Tasks by platform module
- Team workload overview
- Recent activity feed
- Upcoming deadlines

### ✅ Kanban Board
- 6 columns: Backlog → Todo → In Progress → Review → Testing → Done
- Drag-and-drop tasks between columns (@dnd-kit)
- Animated task cards with priority, module, due date
- Quick status updates
- Full task detail modal (edit, comment, delete)

### ✅ Sprint Management
- Create and manage sprints with goals, dates, capacity
- Start/complete sprint lifecycle
- Burndown chart (ideal vs actual)
- Task list per sprint with progress bar

### ✅ Task Management
- List and grid view modes
- Multi-filter: status, priority, type, assignee, module
- Sort by update time, priority, due date
- Full CRUD with optimistic updates
- Comments, linked PRs, acceptance criteria, story points

### ✅ Team
- Member cards with online status
- Role badges and skill tags
- Team groupings (Frontend, Backend, DevOps)

### ✅ Analytics
- KPI cards: completion rate, velocity, bug rate
- Team activity area chart
- Status distribution donut chart
- Module task breakdown bar chart
- Priority distribution
- Team workload progress bars

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login/register pages
│   ├── (dashboard)/      # Protected dashboard layout
│   │   ├── dashboard/    # Main dashboard
│   │   ├── board/        # Kanban board
│   │   ├── tasks/        # Task list
│   │   ├── sprints/      # Sprint management
│   │   ├── team/         # Team view
│   │   └── analytics/    # Analytics charts
│   └── api/              # REST API routes
├── components/
│   ├── ui/               # Base UI components
│   ├── layout/           # Sidebar, header
│   └── board/            # Kanban components
├── lib/
│   ├── auth.ts           # JWT utilities
│   ├── prisma.ts         # Database client
│   ├── utils.ts          # Helpers + config
│   └── validations.ts    # Zod schemas
├── store/                # Zustand stores
├── hooks/                # Custom React hooks
└── types/                # TypeScript types

prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Sample data
```

## Platform Modules Tracked

| Module | Description |
|--------|-------------|
| 🎓 Academy | Courses, lessons, quizzes, certificates |
| 💼 Internship | Applications, mentoring, performance |
| 🛍️ Marketplace | Professional profiles, gigs, matching |
| 🤝 Client Portal | Project requests, tracking, milestones |
| 🔐 Authentication | Login, registration, RBAC |
| ⚙️ Admin Dashboard | User management, analytics, moderation |
| 🔌 API Infrastructure | REST API, microservices, caching |
| 📱 Mobile App | React Native iOS/Android |
| 🚀 DevOps | CI/CD, Docker, Kubernetes |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Sync Prisma schema to DB
npm run db:seed      # Seed sample data
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run migrations
```
