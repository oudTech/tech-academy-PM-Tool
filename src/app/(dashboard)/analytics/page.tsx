"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";
import {
  TrendingUp, TrendingDown, BarChart3, PieChart as PieIcon,
  Users, Clock, CheckCircle2, AlertCircle, Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Progress } from "@/components/ui/progress";
import { cn, ROLE_CONFIG, MODULE_CONFIG } from "@/lib/utils";
import type { DashboardStats } from "@/types";

const PRIORITY_COLORS = {
  LOW: "#94a3b8",
  MEDIUM: "#3b82f6",
  HIGH: "#f97316",
  CRITICAL: "#ef4444",
};

const STATUS_COLORS = {
  BACKLOG: "#6b7280",
  TODO: "#8b5cf6",
  IN_PROGRESS: "#3b82f6",
  REVIEW: "#f59e0b",
  TESTING: "#14b8a6",
  DONE: "#10b981",
};

const MOCK_ACTIVITY_DATA = [
  { date: "Mon", commits: 12, prs: 3, tasks: 8 },
  { date: "Tue", commits: 19, prs: 5, tasks: 12 },
  { date: "Wed", commits: 8, prs: 2, tasks: 6 },
  { date: "Thu", commits: 24, prs: 7, tasks: 15 },
  { date: "Fri", commits: 16, prs: 4, tasks: 10 },
  { date: "Sat", commits: 5, prs: 1, tasks: 3 },
  { date: "Sun", commits: 2, prs: 0, tasks: 2 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/dashboard")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .finally(() => setIsLoading(false));
  }, []);

  const statusData = stats
    ? Object.entries(stats.tasksByStatus).map(([status, count]) => ({
        name: status.replace("_", " "),
        value: count,
        color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#6b7280",
      }))
    : [];

  const priorityData = stats
    ? Object.entries(stats.tasksByPriority).map(([priority, count]) => ({
        name: priority,
        value: count,
        color: PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "#6b7280",
      }))
    : [];

  const completionRate = stats?.totalTasks
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-0.5">Project insights and performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Completion Rate",
            value: `${completionRate}%`,
            change: "+5%",
            trend: "up",
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-500/10",
          },
          {
            title: "Avg Story Points",
            value: stats?.totalTasks ? "7.2" : "—",
            change: "+0.8",
            trend: "up",
            icon: Zap,
            color: "text-navy-500",
            bg: "bg-navy-500/10",
          },
          {
            title: "Sprint Velocity",
            value: "42",
            change: "+4",
            trend: "up",
            icon: TrendingUp,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            title: "Bug Rate",
            value: stats?.totalTasks ? `${Math.round((stats.tasksByStatus["TODO"] || 0) / (stats.totalTasks || 1) * 100)}%` : "—",
            change: "-2%",
            trend: "down",
            icon: AlertCircle,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold mt-1">{isLoading ? "—" : kpi.value}</p>
                    <div className={cn(
                      "flex items-center gap-1 text-xs mt-1",
                      kpi.trend === "up" ? "text-green-500" : "text-red-500"
                    )}>
                      {kpi.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {kpi.change} vs last sprint
                    </div>
                  </div>
                  <div className={cn("p-2 rounded-xl", kpi.bg)}>
                    <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team Activity (This Week)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MOCK_ACTIVITY_DATA}>
                  <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                  <Area type="monotone" dataKey="commits" stroke="#6366f1" fill="url(#colorCommits)" strokeWidth={2} name="Commits" />
                  <Area type="monotone" dataKey="tasks" stroke="#10b981" fill="url(#colorTasks)" strokeWidth={2} name="Tasks Completed" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Status Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Task Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {statusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {statusData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
                      <span className="text-xs font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks by Module */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks by Platform Module</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats?.tasksByModule || []} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="module" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="count" name="Tasks" radius={[0, 4, 4, 0]}>
                    {(stats?.tasksByModule || []).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Priority breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priority Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {priorityData.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${stats?.totalTasks ? (item.value / stats.totalTasks) * 100 : 0}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Team Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Team Workload Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(stats?.teamStats || []).filter((m) => m.taskCount > 0).map(({ user, taskCount }) => (
                <div key={user.id} className="flex items-center gap-4">
                  <UserAvatar src={user.avatar} className="h-9 w-9 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG]?.label}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">{taskCount} tasks</span>
                    </div>
                    <Progress
                      value={stats?.totalTasks ? (taskCount / stats.totalTasks) * 100 : 0}
                      className="h-1.5"
                    />
                  </div>
                </div>
              ))}
              {!stats?.teamStats?.filter((m) => m.taskCount > 0).length && (
                <p className="text-sm text-muted-foreground text-center py-4">No workload data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
