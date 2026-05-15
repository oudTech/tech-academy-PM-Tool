"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Target, AlertTriangle, TrendingUp, Users, Calendar,
  CheckCircle2, Clock, ListTodo, Layers,
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  cn, formatRelativeTime, formatDate, PRIORITY_CONFIG, STATUS_CONFIG,
  ROLE_CONFIG, calculateSprintProgress,
} from "@/lib/utils";
import type { DashboardStats } from "@/types";

const VELOCITY_DATA = [
  { sprint: "S1", planned: 40, completed: 42 },
  { sprint: "S2", planned: 50, completed: 38 },
  { sprint: "S3", planned: 55, completed: 0 },
];

const STATUS_COLORS: Record<string, string> = {
  DONE:        "#10b981",
  IN_PROGRESS: "#3b82f6",
  REVIEW:      "#f59e0b",
  TESTING:     "#14b8a6",
  TODO:        "#6b7280",
  BACKLOG:     "#374151",
};

// ── Bento cell sub-components ──────────────────────────────────────────────

function SprintCell({ stats }: { stats: DashboardStats | null }) {
  const sprintTimeProgress = stats?.activeSprint
    ? calculateSprintProgress(stats.activeSprint.startDate, stats.activeSprint.endDate)
    : 0;

  const statusCounts = (stats?.activeSprint?.tasks || []).reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const blockedCount = statusCounts["BACKLOG"] || 0;

  if (!stats?.activeSprint) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-white/20">
        <Target className="h-10 w-10" />
        <p className="text-[13px]">No active sprint</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div>
        <p className="text-[11px] text-white/40 uppercase tracking-widest mb-0.5">Active Sprint</p>
        <p className="text-[15px] font-semibold text-white leading-tight">{stats.activeSprint.name}</p>
        {stats.activeSprint.goal && (
          <p className="text-[12px] text-white/50 mt-1 line-clamp-2">{stats.activeSprint.goal}</p>
        )}
      </div>

      <div className="space-y-2.5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-white/40">Tasks done</span>
            <span className="text-[12px] font-medium text-white tabular-nums">{stats.sprintProgress}%</span>
          </div>
          <Progress value={stats.sprintProgress} className="h-1" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-white/40">Time elapsed</span>
            <span className={cn("text-[12px] font-medium tabular-nums", sprintTimeProgress > stats.sprintProgress + 20 ? "text-amber-400" : "text-white")}>
              {sprintTimeProgress}%
            </span>
          </div>
          <Progress value={sprintTimeProgress} className="h-1 [&>div]:bg-amber-500" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-auto">
        {Object.entries(statusCounts).map(([status, count]) => (
          <span
            key={status}
            className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-medium",
              STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.bg,
              STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color
            )}
          >
            {STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label} {count}
          </span>
        ))}
      </div>

      <div className="flex gap-3 text-[11px] text-white/40">
        <span>{formatDate(stats.activeSprint.startDate)} →</span>
        <span>{formatDate(stats.activeSprint.endDate)}</span>
        <span className="ml-auto">{stats.activeSprint.capacity}h cap.</span>
      </div>

      {blockedCount > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-3 w-3 text-red-400 shrink-0" />
          <p className="text-[11px] text-red-400">{blockedCount} critical item{blockedCount > 1 ? "s" : ""} not started</p>
        </div>
      )}
    </div>
  );
}

function MetricsCell({ stats }: { stats: DashboardStats | null }) {
  const completionRate = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  const metrics = [
    { label: "Total",       value: stats?.totalTasks      || 0, icon: Layers,       sub: `${completionRate}% done` },
    { label: "Done",        value: stats?.completedTasks  || 0, icon: CheckCircle2, sub: "completed" },
    { label: "Active",      value: stats?.inProgressTasks || 0, icon: Clock,        sub: "in progress" },
    { label: "Pending",     value: stats?.pendingTasks    || 0, icon: ListTodo,     sub: "todo + backlog" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 h-full items-center">
      {metrics.map((m) => (
        <div key={m.label} className="flex flex-col items-center justify-center text-center gap-0.5">
          <m.icon className="h-4 w-4 text-white/20 mb-1" />
          <span className="text-2xl font-semibold text-white tabular-nums leading-none">{m.value}</span>
          <span className="text-[10px] text-white/40">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

function ActivityCell({ stats }: { stats: DashboardStats | null }) {
  const activities = stats?.recentActivity?.slice(0, 6) || [];

  return (
    <div className="flex flex-col h-full">
      <p className="text-[11px] text-white/40 uppercase tracking-widest mb-3">Recent Activity</p>
      {activities.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-white/20 text-[12px]">No activity yet</div>
      ) : (
        <div className="flex-1 space-y-3 overflow-hidden">
          {activities.map((a) => (
            <div key={a.id} className="flex items-start gap-2">
              <UserAvatar src={a.user?.avatar} className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] leading-snug">
                  <span className="font-medium text-white/80">{a.user?.name}</span>{" "}
                  <span className="text-white/40">{a.details}</span>
                </p>
                <p className="text-[10px] text-white/25 mt-0.5">{formatRelativeTime(a.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DeadlinesCell({ stats }: { stats: DashboardStats | null }) {
  const deadlines = stats?.upcomingDeadlines || [];

  return (
    <div className="flex flex-col h-full">
      <p className="text-[11px] text-white/40 uppercase tracking-widest mb-3">Upcoming Deadlines</p>
      {deadlines.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-white/20 text-[12px]">None upcoming</div>
      ) : (
        <div className="flex-1 space-y-2.5 overflow-hidden">
          {deadlines.slice(0, 4).map((task) => (
            <div key={task.id} className="flex items-start gap-2">
              <div className={cn("h-1.5 w-1.5 rounded-full mt-1.5 shrink-0", PRIORITY_CONFIG[task.priority]?.dot)} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-white/80 truncate">{task.title}</p>
                <p className="text-[10px] text-white/30">{formatDate(task.dueDate!)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusCell({ stats }: { stats: DashboardStats | null }) {
  const statusData = stats
    ? Object.entries(stats.tasksByStatus).map(([status, count]) => ({
        name:  STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
        value: count,
        color: STATUS_COLORS[status] || "#6b7280",
      }))
    : [];

  return (
    <div className="flex h-full gap-4 items-center">
      <div className="shrink-0">
        <ResponsiveContainer width={110} height={110}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" innerRadius={32} outerRadius={52} paddingAngle={2} dataKey="value">
              {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-1.5">
        <p className="text-[11px] text-white/40 uppercase tracking-widest mb-2">Status</p>
        {statusData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-[11px] text-white/50 flex-1 truncate">{item.name}</span>
            <span className="text-[11px] font-medium text-white/70 tabular-nums">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamCell({ stats }: { stats: DashboardStats | null }) {
  const team = stats?.teamStats?.slice(0, 6) || [];
  const maxTasks = Math.max(...team.map((t) => t.taskCount), 1);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-white/40 uppercase tracking-widest">Team Workload</p>
        <Users className="h-3.5 w-3.5 text-white/20" />
      </div>
      {team.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-white/20 text-[12px]">No team data</div>
      ) : (
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
          {team.map(({ user, taskCount }) => (
            <div key={user.id} className="flex flex-col items-center gap-2 text-center">
              <div className="relative">
                <UserAvatar src={user.avatar} className="h-9 w-9" />
                {user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500 border border-background" />
                )}
              </div>
              <div>
                <p className="text-[12px] text-white/70 font-medium leading-none truncate max-w-[80px]">{user.name}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG]?.label}</p>
              </div>
              <div className="w-full">
                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white/25 transition-all duration-500"
                    style={{ width: `${(taskCount / maxTasks) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/30 tabular-nums mt-0.5">{taskCount} tasks</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VelocityCell() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-white/40 uppercase tracking-widest">Velocity</p>
        <TrendingUp className="h-3.5 w-3.5 text-white/20" />
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={VELOCITY_DATA} barSize={12} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="sprint" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "4px", fontSize: 11 }}
            />
            <Bar dataKey="planned"   name="Planned"   fill="rgba(255,255,255,0.08)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="completed" name="Completed" fill="rgba(255,255,255,0.35)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Cell wrapper ───────────────────────────────────────────────────────────

function BentoCell({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(
        "bg-card border border-border rounded-lg p-4 overflow-hidden",
        "hover:border-white/10 transition-colors duration-200",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats]         = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/dashboard")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 auto-rows-[200px]">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-muted/20 animate-pulse rounded-lg",
              i === 0 && "md:col-span-2 md:row-span-2",
              i === 2 && "md:col-span-2 md:row-span-2",
              i === 4 && "md:col-span-3",
              i === 5 && "md:col-span-3",
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3 auto-rows-[200px]">
      {/* Sprint — tall (2×2) */}
      <BentoCell className="md:col-span-2 md:row-span-2" delay={0}>
        <SprintCell stats={stats} />
      </BentoCell>

      {/* Metrics — standard (2×1) */}
      <BentoCell className="md:col-span-2" delay={0.05}>
        <MetricsCell stats={stats} />
      </BentoCell>

      {/* Activity — tall (2×2) */}
      <BentoCell className="md:col-span-2 md:row-span-2" delay={0.1}>
        <ActivityCell stats={stats} />
      </BentoCell>

      {/* Deadlines — standard (2×1) */}
      <BentoCell className="md:col-span-2" delay={0.15}>
        <DeadlinesCell stats={stats} />
      </BentoCell>

      {/* Status distribution — wide (3×1) */}
      <BentoCell className="md:col-span-3" delay={0.2}>
        <StatusCell stats={stats} />
      </BentoCell>

      {/* Velocity — wide (3×1) */}
      <BentoCell className="md:col-span-3" delay={0.25}>
        <VelocityCell />
      </BentoCell>

      {/* Team workload — full width (6×1) */}
      <BentoCell className="md:col-span-6" delay={0.3}>
        <TeamCell stats={stats} />
      </BentoCell>
    </div>
  );
}
