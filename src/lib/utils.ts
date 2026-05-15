import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import {
  BookOpen, Briefcase, ShoppingBag, Users, Shield,
  Settings2, Server, Smartphone, GitBranch, Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "No date";
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy 'at' h:mm a");
}

export const PRIORITY_CONFIG = {
  LOW:      { label: "Low",      color: "text-white/35",   bg: "bg-white/5",      dot: "bg-white/20" },
  MEDIUM:   { label: "Medium",   color: "text-white/55",   bg: "bg-white/[0.06]", dot: "bg-white/50" },
  HIGH:     { label: "High",     color: "text-white/55",   bg: "bg-white/[0.06]", dot: "bg-orange-400" },
  CRITICAL: { label: "Critical", color: "text-red-400",    bg: "bg-red-500/10",   dot: "bg-red-400" },
} as const;

export const STATUS_CONFIG = {
  BACKLOG:     { label: "Backlog",     color: "text-white/35",  bg: "bg-white/[0.04]" },
  TODO:        { label: "Todo",        color: "text-white/50",  bg: "bg-white/[0.05]" },
  IN_PROGRESS: { label: "In Progress", color: "text-white/70",  bg: "bg-white/[0.07]" },
  REVIEW:      { label: "Review",      color: "text-amber-300", bg: "bg-amber-500/10" },
  TESTING:     { label: "Testing",     color: "text-white/60",  bg: "bg-white/[0.06]" },
  DONE:        { label: "Done",        color: "text-green-400", bg: "bg-green-500/10" },
} as const;

export const TYPE_CONFIG = {
  FEATURE:     { label: "Feature",     icon: "feat",  color: "text-white/40" },
  BUG:         { label: "Bug",         icon: "bug",   color: "text-red-400/80" },
  IMPROVEMENT: { label: "Improvement", icon: "impr",  color: "text-white/40" },
  TASK:        { label: "Task",        icon: "task",  color: "text-white/40" },
  STORY:       { label: "Story",       icon: "story", color: "text-white/40" },
  EPIC:        { label: "Epic",        icon: "epic",  color: "text-white/40" },
} as const;

export const ROLE_CONFIG = {
  ADMIN:           { label: "Admin",           color: "text-white/60", bg: "bg-white/[0.06]" },
  PROJECT_MANAGER: { label: "Project Manager", color: "text-white/60", bg: "bg-white/[0.06]" },
  DEVELOPER:       { label: "Developer",       color: "text-white/60", bg: "bg-white/[0.06]" },
  DESIGNER:        { label: "Designer",        color: "text-white/60", bg: "bg-white/[0.06]" },
  QA_TESTER:       { label: "QA Tester",       color: "text-white/60", bg: "bg-white/[0.06]" },
} as const;

export const MODULE_CONFIG: Record<string, { label: string; color: string; icon: LucideIcon }> = {
  ACADEMY:            { label: "Academy",       color: "#7a6848", icon: BookOpen },
  INTERNSHIP:         { label: "Internship",    color: "#607050", icon: Briefcase },
  MARKETPLACE:        { label: "Marketplace",   color: "#685878", icon: ShoppingBag },
  CLIENT_PORTAL:      { label: "Client Portal", color: "#786038", icon: Users },
  AUTHENTICATION:     { label: "Auth",          color: "#784848", icon: Shield },
  ADMIN_DASHBOARD:    { label: "Admin",         color: "#685868", icon: Settings2 },
  API_INFRASTRUCTURE: { label: "API",           color: "#407060", icon: Server },
  MOBILE_APP:         { label: "Mobile",        color: "#6a5e50", icon: Smartphone },
  DEVOPS:             { label: "DevOps",        color: "#785830", icon: GitBranch },
  GENERAL:            { label: "General",       color: "#585450", icon: Layers },
};

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}


export function calculateSprintProgress(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const now = Date.now();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

export function calculateTaskCompletion(tasks: Array<{ status: string }>): number {
  if (!tasks.length) return 0;
  const done = tasks.filter((t) => t.status === "DONE").length;
  return Math.round((done / tasks.length) * 100);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
