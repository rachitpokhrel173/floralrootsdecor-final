"use client";

import { useMemo, useState } from "react";
import { Search, UserPlus, ClipboardList, CalendarCheck2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "./role-badge";
import { CreateStaffDialog } from "./create-staff-dialog";
import { StaffDetailDrawer } from "./staff-detail-drawer";
import { useStaff } from "@/hooks/use-staff";
import { getInitials } from "@/lib/utils";
import { STAFF_ROLES, ROLE_LABELS } from "@/lib/validations/staff";
import type { StaffWithStats } from "@/lib/data/staff";
import type { UserRole } from "@/types/database.types";

export function StaffCardGrid() {
  const { data: staff, isLoading, refetch } = useStaff();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<StaffWithStats | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = staff ?? [];
    const term = search.trim().toLowerCase();
    return list.filter((s) => {
      const matchesRole = roleFilter === "all" || s.role === roleFilter;
      const matchesSearch =
        !term ||
        s.full_name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        (s.designation ?? "").toLowerCase().includes(term);
      return matchesRole && matchesSearch;
    });
  }, [staff, search, roleFilter]);

  function openDetail(member: StaffWithStats) {
    setSelected(member);
    setDrawerOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search staff..."
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | "all")}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {STAFF_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" /> Add Staff
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          {staff && staff.length > 0 ? "No staff match your filters." : "No staff members yet — add your first one."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((member) => (
            <button
              key={member.id}
              onClick={() => openDetail(member)}
              className="text-left rounded-2xl border border-border bg-card p-5 space-y-4 transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-11 w-11">
                    {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.full_name} />}
                    <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.designation || ROLE_LABELS[member.role]}
                    </p>
                  </div>
                </div>
                {!member.is_active && (
                  <Badge variant="destructive" className="shrink-0">
                    Inactive
                  </Badge>
                )}
              </div>

              <RoleBadge role={member.role} />

              <div className="flex items-center gap-4 pt-2 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" />
                  {member.activeTasksCount} active task{member.activeTasksCount === 1 ? "" : "s"}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarCheck2 className="h-3.5 w-3.5" />
                  {member.upcomingBookingsCount} upcoming
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <CreateStaffDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={refetch} />
      <StaffDetailDrawer member={selected} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}
