import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "DEVELOPER", "DESIGNER", "QA_TESTER"]).optional(),
});

export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().optional(),
  acceptanceCriteria: z.string().optional(),
  type: z.enum(["FEATURE", "BUG", "IMPROVEMENT", "TASK", "STORY", "EPIC"]),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "REVIEW", "TESTING", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  storyPoints: z.number().int().min(0).max(100).optional().nullable(),
  estimatedHours: z.number().min(0).optional().nullable(),
  actualHours: z.number().min(0).optional().nullable(),
  dueDate: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  sprintId: z.string().optional().nullable(),
  moduleId: z.string().optional().nullable(),
  projectId: z.string(),
  linkedPRs: z.array(z.string()).optional(),
  bugSeverity: z.string().optional().nullable(),
});

export const sprintSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  goal: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  capacity: z.number().int().min(0).optional(),
  projectId: z.string(),
});

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  taskId: z.string(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type SprintInput = z.infer<typeof sprintSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
