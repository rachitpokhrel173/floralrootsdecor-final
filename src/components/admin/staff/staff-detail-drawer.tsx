"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Mail, Phone, Trash2, Plus, KeyRound, Loader2, CalendarX2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "./role-badge";
import { useStaffDetail } from "@/hooks/use-staff-detail";
import {
  updateStaffAction,
  setStaffActiveAction,
  resetStaffPasswordAction,
  assignTaskAction,
  updateTaskStatusAction,
  deleteTaskAction,
  setStaffAvailabilityAction,
  deleteStaffAvailabilityAction,
} from "@/actions/staff-actions";
import { STAFF_ROLES, ROLE_LABELS, generateTempPassword } from "@/lib/validations/staff";
import { getInitials, formatDate } from "@/lib/utils";
import type { StaffWithStats } from "@/lib/data/staff";
import type { TaskStatus, UserRole } from "@/types/database.types";

const TASK_STATUSES: TaskStatus[] = ["pending", "in_progress", "completed", "blocked"];
const TASK_STATUS_VARIANT: Record<TaskStatus, "secondary" | "info" | "success" | "destructive"> = {
  pending: "secondary",
  in_progress: "info",
  completed: "success",
  blocked: "destructive",
};

export function StaffDetailDrawer({
  member,
  open,
  onOpenChange,
}: {
  member: StaffWithStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { tasks, tasksLoading, refetchTasks, availability, availabilityLoading, refetchAvailability } =
    useStaffDetail(member?.id ?? null);
  const [isPending, startTransition] = useTransition();

  const [profile, setProfile] = useState({
    full_name: "",
    phone: "",
    role: "decorator" as UserRole,
    designation: "",
    hourly_rate: "",
    monthly_salary: "",
  });

  const [taskDraft, setTaskDraft] = useState({ title: "", description: "", dueDate: "" });
  const [unavailDraft, setUnavailDraft] = useState({ date: "", note: "" });

  useEffect(() => {
    if (!member) return;
    setProfile({
      full_name: member.full_name,
      phone: member.phone ?? "",
      role: member.role,
      designation: member.designation ?? "",
      hourly_rate: member.hourly_rate != null ? String(member.hourly_rate) : "",
      monthly_salary: member.monthly_salary != null ? String(member.monthly_salary) : "",
    });
  }, [member]);

  if (!member) return null;

  function saveProfile() {
    startTransition(async () => {
      const res = await updateStaffAction(member!.id, {
        full_name: profile.full_name,
        phone: profile.phone,
        role: profile.role,
        designation: profile.designation,
        hourly_rate: profile.hourly_rate ? Number(profile.hourly_rate) : null,
        monthly_salary: profile.monthly_salary ? Number(profile.monthly_salary) : null,
      });
      if (res.success) toast.success("Profile updated");
      else toast.error(res.error ?? "Failed to update profile");
    });
  }

  function toggleActive(next: boolean) {
    startTransition(async () => {
      const res = await setStaffActiveAction(member!.id, next);
      if (!res.success) toast.error(res.error ?? "Failed to update status");
      else toast.success(next ? "Reactivated" : "Deactivated");
    });
  }

  function sendPasswordReset() {
    const newPassword = generateTempPassword();
    startTransition(async () => {
      const res = await resetStaffPasswordAction(member!.id, newPassword);
      if (res.success) {
        navigator.clipboard.writeText(newPassword);
        toast.success("New password copied to clipboard", { description: "Share it with them securely." });
      } else {
        toast.error(res.error ?? "Failed to reset password");
      }
    });
  }

  function addTask() {
    if (!taskDraft.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    startTransition(async () => {
      const res = await assignTaskAction({
        title: taskDraft.title,
        description: taskDraft.description || undefined,
        assignedTo: member!.id,
        dueDate: taskDraft.dueDate || undefined,
      });
      if (res.success) {
        setTaskDraft({ title: "", description: "", dueDate: "" });
        refetchTasks();
        toast.success("Task assigned");
      } else {
        toast.error(res.error ?? "Failed to assign task");
      }
    });
  }

  function changeTaskStatus(taskId: string, status: TaskStatus) {
    startTransition(async () => {
      const res = await updateTaskStatusAction(taskId, status);
      if (res.success) refetchTasks();
      else toast.error(res.error ?? "Failed to update task");
    });
  }

  function removeTask(taskId: string) {
    startTransition(async () => {
      const res = await deleteTaskAction(taskId);
      if (res.success) {
        refetchTasks();
        toast.success("Task removed");
      } else {
        toast.error(res.error ?? "Failed to remove task");
      }
    });
  }

  function addUnavailableDate() {
    if (!unavailDraft.date) {
      toast.error("Pick a date");
      return;
    }
    startTransition(async () => {
      const res = await setStaffAvailabilityAction(member!.id, unavailDraft.date, false, unavailDraft.note);
      if (res.success) {
        setUnavailDraft({ date: "", note: "" });
        refetchAvailability();
        toast.success("Marked unavailable");
      } else {
        toast.error(res.error ?? "Failed to save");
      }
    });
  }

  function removeUnavailableDate(id: string) {
    startTransition(async () => {
      const res = await deleteStaffAvailabilityAction(id);
      if (res.success) {
        refetchAvailability();
        toast.success("Removed");
      } else {
        toast.error(res.error ?? "Failed to remove");
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.full_name} />}
              <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>{member.full_name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-0.5">
                <RoleBadge role={member.role} />
                {!member.is_active && <Badge variant="destructive">Inactive</Badge>}
              </SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {member.email}
            </span>
            {member.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {member.phone}
              </span>
            )}
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        <Tabs defaultValue="profile">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Inactive staff can&apos;t sign in or be assigned work.</p>
              </div>
              <Switch checked={member.is_active} onCheckedChange={toggleActive} disabled={isPending} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={profile.role} onValueChange={(v) => setProfile({ ...profile, role: v as UserRole })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Designation</Label>
                <Input
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Hourly Rate</Label>
                <Input
                  type="number"
                  min={0}
                  value={profile.hourly_rate}
                  onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Monthly Salary</Label>
                <Input
                  type="number"
                  min={0}
                  value={profile.monthly_salary}
                  onChange={(e) => setProfile({ ...profile, monthly_salary: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={saveProfile} disabled={isPending} className="flex-1">
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={sendPasswordReset} disabled={isPending}>
                <KeyRound className="h-4 w-4 mr-2" /> Reset Password
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            <div className="rounded-xl border border-border p-3 space-y-2.5">
              <p className="text-sm font-medium">Assign a task</p>
              <Input
                placeholder="Task title"
                value={taskDraft.title}
                onChange={(e) => setTaskDraft({ ...taskDraft, title: e.target.value })}
              />
              <Textarea
                placeholder="Notes (optional)"
                rows={2}
                value={taskDraft.description}
                onChange={(e) => setTaskDraft({ ...taskDraft, description: e.target.value })}
              />
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={taskDraft.dueDate}
                  onChange={(e) => setTaskDraft({ ...taskDraft, dueDate: e.target.value })}
                />
                <Button onClick={addTask} disabled={isPending} className="shrink-0">
                  <Plus className="h-4 w-4 mr-1.5" /> Assign
                </Button>
              </div>
            </div>

            {tasksLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div key={task.id} className="rounded-xl border border-border p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                        )}
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground mt-0.5">Due {formatDate(task.due_date)}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => removeTask(task.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={TASK_STATUS_VARIANT[task.status]}>{task.status.replace("_", " ")}</Badge>
                      <Select
                        value={task.status}
                        onValueChange={(v) => changeTaskStatus(task.id, v as TaskStatus)}
                      >
                        <SelectTrigger className="h-7 text-xs w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="availability" className="space-y-4 mt-4">
            <div className="rounded-xl border border-border p-3 space-y-2.5">
              <p className="text-sm font-medium">Mark a date unavailable</p>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={unavailDraft.date}
                  onChange={(e) => setUnavailDraft({ ...unavailDraft, date: e.target.value })}
                />
                <Button onClick={addUnavailableDate} disabled={isPending} className="shrink-0">
                  <Plus className="h-4 w-4 mr-1.5" /> Add
                </Button>
              </div>
              <Input
                placeholder="Reason (optional)"
                value={unavailDraft.note}
                onChange={(e) => setUnavailDraft({ ...unavailDraft, note: e.target.value })}
              />
            </div>

            {availabilityLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-xl" />
                ))}
              </div>
            ) : availability.filter((a) => !a.is_available).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No unavailable dates on record.</p>
            ) : (
              <div className="space-y-2">
                {availability
                  .filter((a) => !a.is_available)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-xl border border-border p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <CalendarX2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{formatDate(a.date)}</p>
                          {a.note && <p className="text-xs text-muted-foreground">{a.note}</p>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => removeUnavailableDate(a.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
