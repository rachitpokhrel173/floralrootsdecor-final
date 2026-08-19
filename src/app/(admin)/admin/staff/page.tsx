import { StaffCardGrid } from "@/components/admin/staff/staff-card-grid";

export default function StaffPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl">Staff</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage roles, task assignment, and availability across your team.
        </p>
      </div>

      <StaffCardGrid />
    </div>
  );
}
