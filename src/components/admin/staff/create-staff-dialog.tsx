"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Dices, Copy, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createStaffAction } from "@/actions/staff-actions";
import { STAFF_ROLES, ROLE_LABELS, generateTempPassword } from "@/lib/validations/staff";
import type { UserRole } from "@/types/database.types";

const EMPTY = {
  full_name: "",
  email: "",
  phone: "",
  role: "decorator" as UserRole,
  designation: "",
  hourly_rate: "",
  monthly_salary: "",
};

export function CreateStaffDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const [tempPassword, setTempPassword] = useState(() => generateTempPassword());
  const [isPending, startTransition] = useTransition();

  function reset() {
    setForm(EMPTY);
    setTempPassword(generateTempPassword());
  }

  function copyPassword() {
    navigator.clipboard.writeText(tempPassword);
    toast.success("Password copied");
  }

  function handleSubmit() {
    if (!form.full_name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    startTransition(async () => {
      const res = await createStaffAction({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        designation: form.designation,
        hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : undefined,
        monthly_salary: form.monthly_salary ? Number(form.monthly_salary) : undefined,
        temp_password: tempPassword,
      });
      if (res.success) {
        toast.success(`${form.full_name} added — share the temporary password with them`);
        reset();
        onOpenChange(false);
        onCreated?.();
      } else {
        toast.error(res.error ?? "Failed to create staff account");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Add Staff Member
          </DialogTitle>
          <DialogDescription>
            Creates a login for them and a staff profile. Share the temporary password so they can sign in.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label>Full Name</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Sita Sharma"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="sita@floralroots.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="98XXXXXXXX"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
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

          <div className="space-y-1.5">
            <Label>Designation</Label>
            <Input
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              placeholder="Lead Decorator"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Hourly Rate (optional)</Label>
            <Input
              type="number"
              min={0}
              value={form.hourly_rate}
              onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Monthly Salary (optional)</Label>
            <Input
              type="number"
              min={0}
              value={form.monthly_salary}
              onChange={(e) => setForm({ ...form, monthly_salary: e.target.value })}
              placeholder="0"
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <Label>Temporary Password</Label>
            <div className="flex gap-2">
              <Input value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} />
              <Button type="button" variant="outline" size="icon" onClick={() => setTempPassword(generateTempPassword())}>
                <Dices className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={copyPassword}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              They can change this after signing in. At least 8 characters.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
