"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Code2, Palette, TestTube, Briefcase, Globe, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Separator } from "@/components/ui/separator";
import { cn, ROLE_CONFIG } from "@/lib/utils";
import type { Team, User } from "@/types";

const ROLE_ICONS = {
  ADMIN: Shield,
  PROJECT_MANAGER: Briefcase,
  DEVELOPER: Code2,
  DESIGNER: Palette,
  QA_TESTER: TestTube,
};

export default function TeamPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/teams?projectId=clproject001").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([teamsData, usersData]) => {
      setTeams(teamsData.teams || []);
      setAllUsers(usersData.users || []);
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const onlineCount = allUsers.filter((u) => u.isOnline).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground mt-0.5">
            {allUsers.length} members · <span className="text-green-500">{onlineCount} online</span>
          </p>
        </div>
      </div>

      {/* Team overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
          const count = allUsers.filter((u) => u.role === role).length;
          const Icon = ROLE_ICONS[role as keyof typeof ROLE_ICONS];
          return (
            <Card key={role}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", config.bg)}>
                  {Icon && <Icon className={cn("h-4 w-4", config.color)} />}
                </div>
                <div>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}s</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* All team members */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allUsers.map((user, i) => {
            const roleConfig = ROLE_CONFIG[user.role];
            const Icon = ROLE_ICONS[user.role];

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <UserAvatar src={user.avatar} className="h-12 w-12" />
                        {user.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{user.name}</p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={cn("text-[11px] border-0 gap-1", roleConfig?.bg, roleConfig?.color)}>
                            {Icon && <Icon className="h-3 w-3" />}
                            {roleConfig?.label}
                          </Badge>
                          {!user.isOnline && (
                            <span className="text-[11px] text-muted-foreground">Offline</span>
                          )}
                        </div>

                        {user.bio && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>
                        )}

                        {user.skills && user.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {user.skills.slice(0, 3).map((skill) => (
                              <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {skill}
                              </span>
                            ))}
                            {user.skills.length > 3 && (
                              <span className="text-[10px] text-muted-foreground px-1">+{user.skills.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Teams */}
      {teams.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 + 0.3 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: team.color }}>
                        {team.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base">{team.name}</CardTitle>
                        {team.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{team.description}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-1 mb-3">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{team.members?.length || 0} members</span>
                    </div>
                    <div className="flex -space-x-2">
                      {team.members?.slice(0, 6).map((member) => (
                        <UserAvatar key={member.id} src={member.user?.avatar} className="h-8 w-8 border-2 border-background" />
                      ))}
                      {(team.members?.length || 0) > 6 && (
                        <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] text-muted-foreground">
                          +{(team.members?.length || 0) - 6}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
