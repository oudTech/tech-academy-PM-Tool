"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, MoreHorizontal, RefreshCw, ShieldCheck,
  UserX, UserCheck, ChevronDown, Loader2, Search, X,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { cn, ROLE_CONFIG } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ── Types ─────────────────────────────────────────────────────────────────────

type UserStatus = "PENDING" | "ACTIVE" | "DISABLED";
type Role = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "DESIGNER" | "QA_TESTER";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatar: string | null;
  image: string | null;
  isOnline: boolean;
  createdAt: string;
  inviteTokens: { expiresAt: string }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLES: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "PROJECT_MANAGER", label: "Project Manager" },
  { value: "DEVELOPER", label: "Developer" },
  { value: "DESIGNER", label: "Designer" },
  { value: "QA_TESTER", label: "QA Tester" },
];

const STATUS_BADGE: Record<UserStatus, { label: string; className: string }> = {
  ACTIVE:   { label: "Active",   className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  PENDING:  { label: "Pending",  className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  DISABLED: { label: "Disabled", className: "bg-red-500/15 text-red-400 border-red-500/30" },
};

// ── Invite Modal ──────────────────────────────────────────────────────────────

function InviteModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (u: TeamMember) => void }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("DEVELOPER");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/team-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), role }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: "Error", description: data.error, variant: "destructive" }); return; }
      toast({ title: "Invitation sent!", description: `${name.trim()} will receive an email to set their password.` });
      onSuccess(data.user);
      onClose();
    } catch {
      toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-[hsl(var(--popover))] border border-white/10 rounded-2xl p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Invite team member</h2>
            <p className="text-slate-400 text-sm mt-0.5">They&apos;ll receive an email with a link to set their password.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-sm transition-all"
            />
            {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="jane@company.com"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-sm transition-all"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent text-sm transition-all appearance-none cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-[#010c2c]">{r.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-navy-600 hover:bg-navy-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><UserPlus className="h-4 w-4" /> Send invite</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Row Action Menu ───────────────────────────────────────────────────────────

function ActionMenu({
  member,
  onAction,
}: {
  member: TeamMember;
  onAction: (action: "activate" | "disable" | "resend" | "change-role", payload?: Role) => void;
}) {
  const [open, setOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); setRoleOpen(false); }}
        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-1 w-48 bg-[hsl(var(--card))] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden py-1"
            onMouseLeave={() => { setOpen(false); setRoleOpen(false); }}
          >
            {/* Change role */}
            <div className="relative">
              <button
                onClick={() => setRoleOpen(!roleOpen)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Change role
                <ChevronDown className={cn("h-3.5 w-3.5 ml-auto transition-transform", roleOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {roleOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[hsl(var(--background))/50] border-t border-white/5"
                  >
                    {ROLES.filter((r) => r.value !== member.role).map((r) => (
                      <button
                        key={r.value}
                        onClick={() => { onAction("change-role", r.value); setOpen(false); }}
                        className="w-full text-left px-6 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {r.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resend invite (pending only) */}
            {member.status === "PENDING" && (
              <button
                onClick={() => { onAction("resend"); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Resend invite
              </button>
            )}

            <div className="h-px bg-white/10 my-1" />

            {/* Activate / Disable */}
            {member.status !== "ACTIVE" ? (
              <button
                onClick={() => { onAction("activate"); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <UserCheck className="h-3.5 w-3.5" />
                Activate account
              </button>
            ) : (
              <button
                onClick={() => { onAction("disable"); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <UserX className="h-3.5 w-3.5" />
                Disable account
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TeamMembersPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "ALL">("ALL");

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/team-members");
      const data = await res.json();
      setMembers(data.users ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load team members.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleAction = async (
    member: TeamMember,
    action: "activate" | "disable" | "resend" | "change-role",
    rolePayload?: Role,
  ) => {
    if (action === "resend") {
      const res = await fetch(`/api/admin/team-members/${member.id}/resend-invite`, { method: "POST" });
      if (res.ok) toast({ title: "Invite resent", description: `A new invite was sent to ${member.email}.` });
      else toast({ title: "Error", description: "Failed to resend invite.", variant: "destructive" });
      return;
    }

    const body: Record<string, string> = {};
    if (action === "activate") body.status = "ACTIVE";
    if (action === "disable") body.status = "DISABLED";
    if (action === "change-role" && rolePayload) body.role = rolePayload;

    const res = await fetch(`/api/admin/team-members/${member.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) { toast({ title: "Error", description: data.error, variant: "destructive" }); return; }

    setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, ...data.user } : m)));

    const messages: Record<string, string> = {
      activate: `${member.name} has been activated.`,
      disable: `${member.name} has been disabled.`,
      "change-role": `${member.name}'s role updated to ${ROLES.find((r) => r.value === rolePayload)?.label}.`,
    };
    toast({ title: "Updated", description: messages[action] });
  };

  const filtered = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: members.length,
    active: members.filter((m) => m.status === "ACTIVE").length,
    pending: members.filter((m) => m.status === "PENDING").length,
    disabled: members.filter((m) => m.status === "DISABLED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Team Members</h1>
          <p className="text-muted-foreground mt-0.5">Invite and manage who has access to TechAcademy PM.</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-navy-600 hover:bg-navy-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <UserPlus className="h-4 w-4" />
          Invite member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total members", value: counts.total, color: "text-white" },
          { label: "Active", value: counts.active, color: "text-emerald-400" },
          { label: "Pending invite", value: counts.pending, color: "text-amber-400" },
          { label: "Disabled", value: counts.disabled, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">{s.label}</p>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "ACTIVE", "PENDING", "DISABLED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-navy-600 text-white"
                  : "bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10",
              )}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-navy-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            {members.length === 0 ? "No team members yet. Invite someone to get started." : "No results match your filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Member</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((member) => {
                  const roleConfig = ROLE_CONFIG[member.role as keyof typeof ROLE_CONFIG];
                  const statusBadge = STATUS_BADGE[member.status];
                  const avatarSrc = member.image ?? member.avatar ?? "";

                  return (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <UserAvatar src={avatarSrc} className="h-9 w-9" />
                            {member.status === "ACTIVE" && member.isOnline && (
                              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#000103]" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{member.name}</p>
                            <p className="text-xs text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {roleConfig ? (
                          <Badge className={cn("text-xs border-0", roleConfig.bg, roleConfig.color)}>
                            {roleConfig.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">{member.role}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border", statusBadge.className)}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-xs text-slate-400">
                          {new Date(member.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ActionMenu
                          member={member}
                          onAction={(action, rolePayload) => handleAction(member, action, rolePayload)}
                        />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <InviteModal
            onClose={() => setShowInvite(false)}
            onSuccess={(u) => setMembers((prev) => [...prev, u as TeamMember])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
