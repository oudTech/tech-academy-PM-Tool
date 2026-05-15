export type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "DESIGNER" | "QA_TESTER";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "REVIEW" | "TESTING" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskType = "FEATURE" | "BUG" | "IMPROVEMENT" | "TASK" | "STORY" | "EPIC";
export type SprintStatus = "PLANNING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export type PlatformModule =
  | "ACADEMY"
  | "INTERNSHIP"
  | "MARKETPLACE"
  | "CLIENT_PORTAL"
  | "AUTHENTICATION"
  | "ADMIN_DASHBOARD"
  | "API_INFRASTRUCTURE"
  | "MOBILE_APP"
  | "DEVOPS"
  | "GENERAL";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: Role;
  isOnline: boolean;
  bio?: string | null;
  skills: string[];
  createdAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface ProjectModule {
  id: string;
  name: string;
  module: PlatformModule;
  description?: string | null;
  color: string;
  projectId: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal?: string | null;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  velocity: number;
  capacity: number;
  projectId: string;
  createdById: string;
  createdBy?: User;
  tasks?: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  acceptanceCriteria?: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints?: number | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  dueDate?: string | null;
  order: number;
  linkedPRs: string[];
  bugSeverity?: string | null;
  projectId: string;
  sprintId?: string | null;
  moduleId?: string | null;
  assigneeId?: string | null;
  creatorId: string;
  parentId?: string | null;
  assignee?: User | null;
  creator?: User;
  sprint?: Sprint | null;
  module?: ProjectModule | null;
  comments?: Comment[];
  subtasks?: Task[];
  labels?: Array<{ label: Label }>;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  recipientId: string;
  senderId?: string | null;
  sender?: User | null;
  taskId?: string | null;
  link?: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details?: string | null;
  userId: string;
  user: User;
  taskId?: string | null;
  task?: Task | null;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  projectId: string;
  members?: TeamMember[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  user: User;
  role: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  createdAt: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  sprintProgress: number;
  activeSprint?: Sprint | null;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  tasksByModule: Array<{ module: string; count: number; color: string }>;
  recentActivity: ActivityLog[];
  upcomingDeadlines: Task[];
  teamStats: Array<{ user: User; taskCount: number; completedCount: number }>;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  color: string;
}

export interface BurndownDataPoint {
  date: string;
  ideal: number;
  actual: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
