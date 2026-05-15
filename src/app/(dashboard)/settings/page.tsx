"use client";

import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn, ROLE_CONFIG } from "@/lib/utils";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const roleConfig = user ? ROLE_CONFIG[user.role] : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-0.5">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <UserAvatar src={user?.avatar} className="h-16 w-16" />
            <div>
              <h3 className="text-lg font-semibold">{user?.name}</h3>
              <p className="text-muted-foreground">{user?.email}</p>
              {roleConfig && (
                <Badge className={cn("mt-1 text-xs border-0", roleConfig.bg, roleConfig.color)}>
                  {roleConfig.label}
                </Badge>
              )}
            </div>
          </div>

          {user?.bio && (
            <>
              <Separator className="mb-4" />
              <div>
                <p className="text-sm font-medium mb-1">Bio</p>
                <p className="text-sm text-muted-foreground">{user.bio}</p>
              </div>
            </>
          )}

          {user?.skills && user.skills.length > 0 && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-medium mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Access</CardTitle>
          <CardDescription>Your current permissions based on role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "View dashboard and analytics", allowed: true },
              { label: "Create and edit tasks", allowed: true },
              { label: "Comment on tasks", allowed: true },
              { label: "Manage sprints", allowed: user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER" },
              { label: "Delete tasks", allowed: user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER" },
              { label: "Manage team members", allowed: user?.role === "ADMIN" },
            ].map((permission) => (
              <div key={permission.label} className="flex items-center justify-between">
                <span className="text-sm">{permission.label}</span>
                <span className={cn("text-xs font-medium", permission.allowed ? "text-green-500" : "text-muted-foreground")}>
                  {permission.allowed ? "✓ Allowed" : "✗ Restricted"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
