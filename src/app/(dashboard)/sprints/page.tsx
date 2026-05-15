"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Rocket, Calendar, Target, ChevronDown, ChevronRight,
  Play, CheckCircle, Clock, Loader2, TrendingUp, BarChart2,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { sprintSchema, type SprintInput } from "@/lib/validations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Separator } from "@/components/ui/separator";
import { cn, formatDate, STATUS_CONFIG, PRIORITY_CONFIG, calculateSprintProgress } from "@/lib/utils";
import type { Sprint, Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth-store";

const STATUS_STYLE = {
  PLANNING: { label: "Planning", color: "text-navy-400", bg: "bg-navy-500/10", border: "border-navy-500/30", icon: Clock },
  ACTIVE: { label: "Active", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Play },
  COMPLETED: { label: "Completed", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "text-white/40", bg: "bg-white/5", border: "border-white/10", icon: Clock },
};

export default function SprintsPage() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [burndownData, setBurndownData] = useState<unknown[]>([]);
  const [isLoadingBurndown, setIsLoadingBurndown] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();

  const canManageSprints = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SprintInput>({
    resolver: zodResolver(sprintSchema),
    defaultValues: { projectId: "clproject001", capacity: 40 },
  });

  useEffect(() => {
    fetch("/api/sprints?projectId=clproject001")
      .then((r) => r.json())
      .then((d) => setSprints(d.sprints || []))
      .finally(() => setIsLoading(false));
  }, []);

  const loadBurndown = async (sprintId: string) => {
    setIsLoadingBurndown(true);
    try {
      const res = await fetch(`/api/analytics/burndown?sprintId=${sprintId}`);
      const data = await res.json();
      setBurndownData(data.burndown || []);
    } finally {
      setIsLoadingBurndown(false);
    }
  };

  const handleCreateSprint = async (data: SprintInput) => {
    const res = await fetch("/api/sprints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (res.ok) {
      setSprints((prev) => [result.sprint, ...prev]);
      reset();
      setCreateModalOpen(false);
      toast({ title: "Sprint created", description: `${result.sprint.name} is ready` });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    const res = await fetch(`/api/sprints/${sprintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    if (res.ok) {
      const data = await res.json();
      setSprints((prev) => prev.map((s) => s.id === sprintId ? data.sprint : s));
      toast({ title: "Sprint started!", description: "The sprint is now active" });
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    const res = await fetch(`/api/sprints/${sprintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    if (res.ok) {
      const data = await res.json();
      setSprints((prev) => prev.map((s) => s.id === sprintId ? data.sprint : s));
      toast({ title: "Sprint completed!" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sprint Management</h1>
          <p className="text-muted-foreground mt-0.5">Plan, track, and complete sprints</p>
        </div>
        {canManageSprints && (
          <Button onClick={() => setCreateModalOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Sprint
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Sprints", value: sprints.length, icon: Rocket, color: "text-navy-500", bg: "bg-navy-500/10" },
          { label: "Active", value: sprints.filter((s) => s.status === "ACTIVE").length, icon: Play, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Completed", value: sprints.filter((s) => s.status === "COMPLETED").length, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", s.bg)}>
                <s.icon className={cn("h-5 w-5", s.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sprint list */}
      <div className="space-y-4">
        {sprints.map((sprint) => {
          const isExpanded = expandedSprint === sprint.id;
          const style = STATUS_STYLE[sprint.status];
          const StatusIcon = style.icon;
          const tasks = sprint.tasks || [];
          const doneCount = tasks.filter((t) => t.status === "DONE").length;
          const totalPoints = tasks.reduce((sum, t) => sum + ((t as unknown as { storyPoints?: number }).storyPoints || 0), 0);
          const completedPoints = tasks.filter((t) => t.status === "DONE").reduce((sum, t) => sum + ((t as unknown as { storyPoints?: number }).storyPoints || 0), 0);
          const taskProgress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

          return (
            <Card key={sprint.id} className={cn("overflow-hidden transition-all", isExpanded && "shadow-md")}>
              <div
                className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => {
                  setExpandedSprint(isExpanded ? null : sprint.id);
                  if (!isExpanded && sprint.status !== "PLANNING") {
                    loadBurndown(sprint.id);
                    setSelectedSprint(sprint);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("p-2 rounded-lg border", style.bg, style.border)}>
                    <StatusIcon className={cn("h-4 w-4", style.color)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-semibold">{sprint.name}</h3>
                      <Badge className={cn("text-[11px] border-0", style.bg, style.color)}>
                        {style.label}
                      </Badge>
                    </div>

                    {sprint.goal && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{sprint.goal}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
                      </span>
                      <span>{tasks.length} tasks</span>
                      <span>{doneCount}/{tasks.length} done</span>
                      {totalPoints > 0 && <span>{completedPoints}/{totalPoints} pts</span>}
                      <span>Cap: {sprint.capacity}h</span>
                    </div>

                    {tasks.length > 0 && (
                      <div className="mt-3 flex items-center gap-3">
                        <Progress value={taskProgress} className="flex-1 h-1.5" />
                        <span className="text-xs font-medium w-8 text-right">{taskProgress}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {canManageSprints && sprint.status === "PLANNING" && (
                      <Button size="sm" onClick={(e) => { e.stopPropagation(); handleStartSprint(sprint.id); }}>
                        <Play className="h-3.5 w-3.5 mr-1" /> Start
                      </Button>
                    )}
                    {canManageSprints && sprint.status === "ACTIVE" && (
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleCompleteSprint(sprint.id); }}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Complete
                      </Button>
                    )}
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-5 space-y-5">
                      {/* Burndown chart */}
                      {sprint.status !== "PLANNING" && (
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                            <h4 className="text-sm font-medium">Burndown Chart</h4>
                          </div>
                          {isLoadingBurndown ? (
                            <div className="flex items-center justify-center h-40">
                              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                          ) : burndownData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={180}>
                              <LineChart data={burndownData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                                <Tooltip
                                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="ideal" stroke="#6366f1" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Ideal" />
                                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                              </LineChart>
                            </ResponsiveContainer>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No burndown data available</p>
                          )}
                        </div>
                      )}

                      {/* Task list */}
                      {tasks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-3">Tasks ({tasks.length})</h4>
                          <div className="space-y-2">
                            {tasks.slice(0, 8).map((task) => (
                              <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className={cn(
                                  "h-2 w-2 rounded-full shrink-0",
                                  task.status === "DONE" ? "bg-green-500" :
                                    task.status === "IN_PROGRESS" ? "bg-blue-500" :
                                      task.status === "REVIEW" ? "bg-amber-500" :
                                        task.status === "TESTING" ? "bg-cyan-500" : "bg-slate-400"
                                )} />
                                <span className="text-sm flex-1 truncate">{task.title}</span>
                                <span className={cn("text-[11px] px-2 py-0.5 rounded-full", STATUS_CONFIG[task.status]?.bg, STATUS_CONFIG[task.status]?.color)}>
                                  {STATUS_CONFIG[task.status]?.label}
                                </span>
                                <UserAvatar src={(task as unknown as { assignee?: { avatar?: string } }).assignee?.avatar} className="h-5 w-5" />
                                {(task as unknown as { storyPoints?: number }).storyPoints && (
                                  <span className="text-[11px] text-muted-foreground">{(task as unknown as { storyPoints?: number }).storyPoints}pt</span>
                                )}
                              </div>
                            ))}
                            {tasks.length > 8 && (
                              <p className="text-xs text-muted-foreground text-center py-1">
                                +{tasks.length - 8} more tasks
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {tasks.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <Rocket className="h-8 w-8 mx-auto mb-2 opacity-20" />
                          <p className="text-sm">No tasks assigned to this sprint</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}

        {sprints.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Rocket className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <h3 className="font-medium mb-1">No sprints yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Create your first sprint to start organizing work</p>
              {canManageSprints && (
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Create Sprint
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Sprint Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleCreateSprint)} className="space-y-4">
            <div>
              <Label>Sprint Name *</Label>
              <Input {...register("name")} placeholder="Sprint 4 - Feature X" className="mt-1.5" />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label>Sprint Goal</Label>
              <Textarea {...register("goal")} placeholder="What do you want to achieve?" className="mt-1.5" rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date *</Label>
                <Input {...register("startDate")} type="date" className="mt-1.5" />
                {errors.startDate && <p className="text-xs text-destructive mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <Label>End Date *</Label>
                <Input {...register("endDate")} type="date" className="mt-1.5" />
                {errors.endDate && <p className="text-xs text-destructive mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            <div>
              <Label>Team Capacity (hours)</Label>
              <Input {...register("capacity", { valueAsNumber: true })} type="number" min="0" placeholder="40" className="mt-1.5" />
            </div>

            <input type="hidden" {...register("projectId")} />

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                Create Sprint
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
